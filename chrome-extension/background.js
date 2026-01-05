let alarmTimeout;
let continuousAlarmInterval;
let currentAlarmType = null; // Track the active alarm type
const DEBUG = false;
function log(...args) {
  if (DEBUG) console.log(...args);
}

const CONFIG = {
  DEFAULT_MODEL: "gemini-2.5-flash",
  OLLAMA_BASE_URL: "http://127.0.0.1:11434",
  API_TIMEOUT: 30000,
  SYSTEM_PROMPT_TEMPLATE: (persona, tone, accountName, lang, length, customPrompt) => `
    You are a human — crafting natural, thoughtful, and human-like replies on X (Twitter).
    
    **Your Identity:** ${persona || "A helpful and engaging Twitter user"}
    **Desired Tone:** ${tone}
    
    **Context:**
    - Replying to: ${accountName || "Unknown User"}
    - Language: ${lang}
    - Length: ${length}
    
    **Strict Guidelines:**
    - NO hashtags, NO emojis, NO "Wow" or "Huh" interjections.
    - NO automated-sounding phrases like "You are correct" or "بلکل درست فرمایا".
    - SOUND human and handwritten. Never mention you are an AI.
    - Base the reply directly on the tweet's real-time context.
    - ${customPrompt ? `Specific Instruction: ${customPrompt}` : ""}
  `,
  TONES: [
    { id: "encouraging", label: "💡 Encouraging" },
    { id: "polite", label: "🤝 Polite" },
    { id: "playful", label: "🎮 Playful" },
    { id: "engaging", label: "💬 Engaging" },
    { id: "curious", label: "❓ Curious" },
    { id: "neutral", label: "⚪ Neutral" },
    { id: "witty", label: "⚡ Witty" },
    { id: "joking", label: "🤣 Joking" },
    { id: "quirky", label: "🌀 Quirky" },
    { id: "humorous", label: "😂 Humorous" },
    { id: "sarcastic", label: "🙄 Sarcastic" },
    { id: "negative", label: "🚫 Negative" },
    { id: "straightforward", label: "🎯 Straight" },
    { id: "professional", label: "💼 Professional" },
    { id: "supportive", label: "❤️ Supportive" },
    { id: "blunt", label: "🔪 Blunt" },
    { id: "AgreeCritic", label: "🔎 AgreeCritic" },
    { id: "DisagreeCritic", label: "🥊 DisagreeCritic" },
    { id: "agreeable", label: "✅ Agreeable" },
    { id: "casual", label: "🏠 Casual" },
    { id: "optimal", label: "✨ Optimal" }
  ],
  LENGTHS: [
    { id: "short", label: "⚡ Short", value: "short but impactful, up to 50 characters" },
    { id: "as_tweet", label: "📏 As Tweet", value: "match the typical tweet length" },
    { id: "lengthy", label: "📜 Lengthy", value: "sufficient for a lengthy message" },
    { id: "range_5_200", label: "💬 5-200 Ch", value: "between 5 and 200 characters" },
    { id: "range_100_400", label: "📝 100-400 Ch", value: "between 100 and 400 characters" }
  ]
};

const tonePrompts = {
  encouraging: "Be supportive, positive, and motivating.",
  polite: "Maintain a respectful, courteous, and professional demeanor.",
  playful: "Be lighthearted, fun, and use subtle wit.",
  engaging: "Ask a follow-up question or invite further conversation.",
  curious: "Express genuine interest and ask for more details.",
  neutral: "Give a balanced, middle-ground response without strong bias.",
  witty: "Use clever, sharp humor and wordplay.",
  joking: "Make a friendly joke or use situational humor.",
  quirky: "Be unconventional, unique, and slightly eccentric.",
  humorous: "Find the funny side and make people smile.",
  sarcastic: "Use light sarcasm or irony to make a point.",
  negative: "Express disagreement or criticism in a firm but civil way.",
  straightforward: "Be direct, clear, and concise without fluff.",
  professional: "Sound like an industry expert or formal authority.",
  supportive: "Offer help, validation, or emotional backing.",
  blunt: "Be very honest and direct, even if it's slightly sharp.",
  AgreeCritic: "Agree with the core point while offering constructive criticism.",
  DisagreeCritic: "Respectfully disagree and point out flaws in reasoning.",
  agreeable: "Strongly agree and reinforce the user's point.",
  casual: "Sound like a close friend talking in a relaxed setting.",
  optimal: "The most balanced and effective response for social engagement."
};

// Helper to generate prompt
function getSystemPrompt(message, customPersona) {
  const toneDesc = tonePrompts[message.tone] || tonePrompts.optimal;
  const lengthObj = CONFIG.LENGTHS.find(l => l.id === message.length) || CONFIG.LENGTHS[1];
  const langReq = message.lang || "The response language should match the tweet";
  const lengthReq = lengthObj.value;

  return CONFIG.SYSTEM_PROMPT_TEMPLATE(
    customPersona,
    toneDesc,
    message.accountName,
    langReq,
    lengthReq,
    message.customPrompt
  );
}


// Streaming Support via Ports
chrome.runtime.onConnect.addListener((port) => {
  if (port.name !== "replyStreaming") return;

  port.onMessage.addListener(async (message) => {
    if (message.action === "generateReply") {
      const systemPrompt = getSystemPrompt(message, customPersona);

      try {
        if (selectedModel === "gemini") {
          const model = geminiModel || CONFIG.DEFAULT_MODEL;
          const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${selectedApiKey}`;

          const response = await fetch(apiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: `${systemPrompt}\n\nPrompt: ${message.text}` }] }]
            })
          });

          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let fullReply = "";

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split("\n");

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                try {
                  const jsonData = JSON.parse(line.substring(6));
                  const text = jsonData?.candidates?.[0]?.content?.parts?.[0]?.text;
                  if (text) {
                    fullReply += text;
                    port.postMessage({ chunk: text, fullReply });
                  }
                } catch (e) { /* partial chunk */ }
              }
            }
          }
          port.postMessage({ done: true, fullReply });

        } else if (selectedModel === "ollama") {
          const model = ollamaModel || "gemma2:9b";
          const baseUrl = ollamaUrl || "http://127.0.0.1:11434";
          const response = await fetch(`${baseUrl}/api/generate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              model: model,
              system: systemPrompt,
              prompt: prompt,
              stream: true
            })
          });

          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let fullReply = "";

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            try {
              const jsonData = JSON.parse(chunk);
              if (jsonData.response) {
                fullReply += jsonData.response;
                port.postMessage({ chunk: jsonData.response, fullReply });
              }
              if (jsonData.done) break;
            } catch (e) { /* partial json */ }
          }
          port.postMessage({ done: true, fullReply });

        } else {
          // Fallback for other models or error
          port.postMessage({ error: "Streaming is currently optimized for Gemini and Ollama. Please use those for best results." });
        }
      } catch (error) {
        port.postMessage({ error: error.message });
      }
    }
  });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "getConfig") {
    sendResponse({ tones: CONFIG.TONES, lengths: CONFIG.LENGTHS });
    return true;
  }

  if (message.action === "testConnection") {
    (async () => {
      try {
        if (message.model === "gemini") {
          const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${message.key}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents: [{ parts: [{ text: "hi" }] }] })
          });
          const data = await response.json();
          if (data.error) throw new Error(data.error.message);
          sendResponse({ success: true });
        } else if (message.model === "ollama") {
          const response = await fetch(`${message.url}/api/tags`);
          if (response.ok) sendResponse({ success: true });
          else throw new Error("Ollama not responding");
        }
      } catch (e) {
        sendResponse({ success: false, error: e.message });
      }
    })();
    return true; // keep channel open
  }

  if (message.action === "generateReply") {
    chrome.storage.sync.get(
      ["selectedApiKey", "selectedModel", "geminiModel", "grokModel", "openaiModel", "ollamaModel", "ollamaUrl", "customPersona"],
      async (data) => {
        const { selectedApiKey, selectedModel, geminiModel, grokModel, openaiModel, ollamaModel, ollamaUrl, customPersona } = data;

        if (!selectedApiKey && selectedModel !== "ollama") {
          sendResponse({ error: "API key not set. Please select an API key." });
          return;
        }

        const systemPrompt = getSystemPrompt(message, customPersona);
        const prompt = message.text;

        let apiUrl, payload, headers;

        if (selectedModel === "gemini") {
          const model = geminiModel || CONFIG.DEFAULT_MODEL;
          apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${selectedApiKey}`;
          payload = {
            contents: [{
              parts: [{ text: `${systemPrompt}\n\nPrompt: ${prompt}` }]
            }]
          };
          headers = { "Content-Type": "application/json" };
        } else if (selectedModel === "grok") {
          const model = grokModel || "grok-beta";
          apiUrl = "https://api.x.ai/v1/chat/completions";
          payload = {
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: prompt },
            ],
            model: model,
            temperature: 0,
          };
          headers = {
            "Content-Type": "application/json",
            Authorization: `Bearer ${selectedApiKey}`,
          };
        } else if (selectedModel === "openai") {
          const model = openaiModel || "openai/gpt-4o";
          apiUrl = 'https://api.edenai.run/v2/text/chat/';
          payload = {
            response_as_dict: true,
            attributes_as_list: false,
            show_base_64: true,
            show_original_response: false,
            temperature: 0,
            max_tokens: 1000,
            providers: [`${model}`],
            text: prompt,
            chatbot_global_action: systemPrompt
          };
          headers = {
            "Content-Type": "application/json",
            Authorization: `Bearer ${selectedApiKey}`,
          };

          fetch(apiUrl, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(payload)
          })
            .then(response => response.json())
            .then(data => {
              const responseData = data[`${model}`];
              const replyText = responseData?.standardized_response?.generated_text || responseData?.generated_text;
              if (replyText) sendResponse({ reply: replyText });
              else sendResponse({ error: 'No AI response received.' });
            })
            .catch(e => sendResponse({ error: e.message }));
          return;
        } else if (selectedModel === "ollama") {
          const model = ollamaModel || "gemma2:9b";
          const baseUrl = ollamaUrl || CONFIG.OLLAMA_BASE_URL;
          apiUrl = `${baseUrl}/api/generate`;
          payload = {
            model: model,
            prompt: prompt,
            system: systemPrompt,
            stream: false
          };
          headers = { "Content-Type": "application/json" };
        } else {
          sendResponse({ error: "Invalid model selected." });
          return;
        }

        try {
          const response = await fetch(apiUrl, {
            method: "POST",
            headers: headers,
            body: JSON.stringify(payload),
          });

          const data = await response.json();
          let reply;
          if (selectedModel === "gemini") reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          else if (selectedModel === "ollama") reply = data?.response;
          else reply = data?.choices?.[0]?.message?.content;

          if (reply) sendResponse({ reply: reply });
          else sendResponse({ error: `${selectedModel} returned an empty response.` });
        } catch (error) {
          sendResponse({ error: error.message });
        }
      }
    );
    return true;
  }

  if (message.action === "startAlarm") {
    const { time, type } = message;
    log(`Starting alarm. Type: ${type} | Time: ${time}ms`);

    // Check if the requested alarm type is already active
    if (currentAlarmType === type) {
      log(`Alarm of type "${type}" is already active. No need to restart.`);
      return;
    }

    // Clear existing alarms or intervals
    clearTimeout(alarmTimeout);
    clearInterval(continuousAlarmInterval);
    log("Cleared previous alarms and intervals.");

    // Set the new alarm type
    currentAlarmType = type;

    if (type === "onGenerate") {
      // One-time notification
      log("Setting a one-time alarm for 'Notify on Generate'.");
      alarmTimeout = setTimeout(() => {
        sendNotification();
        currentAlarmType = null; // Reset the current alarm type after execution
      }, time);
    } else if (type === "interval") {
      // Continuous notifications
      log("Starting a continuous notification alarm.");
      continuousAlarmInterval = setInterval(() => {
        sendNotification();
      }, time);
    }
  } else if (message.action === "stopAlarm") {
    // Stop both one-time and continuous alarms
    log("Stopping all alarms.");
    clearTimeout(alarmTimeout);
    clearInterval(continuousAlarmInterval);
    currentAlarmType = null; // Reset the current alarm type
    console.log("Alarms stopped successfully.");
  }
  if (message.action === "injectHtml2Canvas") {
    chrome.scripting.executeScript(
      {
        target: { tabId: sender.tab.id },
        files: ["libs/html2canvas.min.js"]
      },
      () => {
        if (chrome.runtime.lastError) {
          console.error("❌ Error injecting html2canvas:", chrome.runtime.lastError.message);
          sendResponse({ success: false, error: chrome.runtime.lastError.message });
        } else {
          console.log("✅ html2canvas injected successfully.");
          sendResponse({ success: true });
        }
      }
    );
    return true;
  }
});

// End of file cleanup
function sendNotification() {
  chrome.notifications.create({
    type: "basic",
    iconUrl: "icons/icon-128.png",
    title: "Twitter Engagement",
    message: "It's time to generate another reply!",
    priority: 2
  });
}