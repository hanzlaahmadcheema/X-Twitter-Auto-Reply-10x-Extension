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
    { id: "encouraging", label: "Encouraging", icon: "far fa-lightbulb" },
    { id: "polite", label: "Polite", icon: "far fa-handshake" },
    { id: "playful", label: "Playful", icon: "fas fa-gamepad" },
    { id: "engaging", label: "Engaging", icon: "far fa-comment-dots" },
    { id: "curious", label: "Curious", icon: "fas fa-question" },
    { id: "neutral", label: "Neutral", icon: "fas fa-circle" },
    { id: "witty", label: "Witty", icon: "fas fa-bolt" },
    { id: "joking", label: "Joking", icon: "far fa-laugh-squint" },
    { id: "quirky", label: "Quirky", icon: "fas fa-hurricane" },
    { id: "humorous", label: "Humorous", icon: "far fa-laugh" },
    { id: "sarcastic", label: "Sarcastic", icon: "far fa-face-rolling-eyes" },
    { id: "negative", label: "Negative", icon: "fas fa-ban" },
    { id: "straightforward", label: "Straight", icon: "fas fa-crosshairs" },
    { id: "professional", label: "Professional", icon: "fas fa-briefcase" },
    { id: "supportive", label: "Supportive", icon: "far fa-heart" },
    { id: "blunt", label: "Blunt", icon: "fas fa-shredder" },
    { id: "AgreeCritic", label: "AgreeCritic", icon: "fas fa-magnifying-glass" },
    { id: "DisagreeCritic", label: "DisagreeCritic", icon: "fas fa-hand-fist" },
    { id: "agreeable", label: "Agreeable", icon: "far fa-circle-check" },
    { id: "casual", label: "Casual", icon: "fas fa-house" },
    { id: "optimal", label: "Optimal", icon: "fas fa-star" }
  ],
  LENGTHS: [
    { id: "short", label: "Short", icon: "fas fa-bolt", value: "short but impactful, up to 50 characters" },
    { id: "as_tweet", label: "As Tweet", icon: "fas fa-ruler", value: "match the typical tweet length" },
    { id: "lengthy", label: "Lengthy", icon: "fas fa-scroll", value: "sufficient for a lengthy message" },
    { id: "range_5_200", label: "5-200 Ch", icon: "far fa-comment", value: "between 5 and 200 characters" },
    { id: "range_100_400", label: "100-400 Ch", icon: "far fa-file-lines", value: "between 100 and 400 characters" }
  ]
};

const tonePrompts = {
  casual: "Reply to tweet in a natural and engaging way. Keep it light, relaxed, and conversational—like a real person chatting. No forced jokes, just an easy-flowing response.",

  optimal: "Craft a concise and engaging response to tweet, ensuring it is natural, thoughtful, and relevant. Maintain a professional yet approachable tone, avoiding unnecessary formality or casualness.",

  blunt: "Respond aggressively and without restraint. Confront the tweet directly, dismantle its claims, and call out stupidity, hypocrisy, or intellectual laziness plainly. Do not be polite. Do not soften language. Use sharp, confrontational phrasing that leaves no ambiguity about your disagreement. Prioritize impact, clarity, and dominance in argument—while staying logically sound.",

  AgreeCritic: "Respond to the tweet by siding fully with the author and doubling down on their criticism. Be blunt, unsparing, and unapologetic. Expose the flaws, call out the incompetence or hypocrisy, and amplify the core critique with sharper language and stronger conviction—without parroting their phrasing. The tone should be confident, cutting, and leave zero room for doubt.",

  straightforward: "Respond to tweet with a direct and to-the-point answer. No small talk, no extra fluff—just a clear and effective response. Keep it neutral yet firm.",

  professional: "Craft a professional response to tweet with clarity and respect. Keep it formal yet accessible, avoiding repetition or filler. Add value with insights instead of just agreeing.",

  DisagreeCritic: "Respond by forcefully rejecting the author’s position. Dismantle their argument piece by piece, calling out weak logic, factual gaps, contradictions, and selective framing. Expose what they’re ignoring or getting wrong and make it obvious why their conclusion doesn’t hold up. The tone should be cold, cutting, and authoritative—confident enough that the flaws speak for themselves. No rambling, no softness. Keep it tight, sharp, and intellectually brutal.",

  supportive: "Respond to tweet with kindness and understanding. Offer encouragement or a thoughtful perspective rather than just agreeing. Keep it genuine and uplifting.",

  witty: "Respond with clever wordplay or sharp, intelligent humor that lands naturally. Stay relevant and avoid forced cleverness. Make the reply engaging and memorable while keeping the point clear and intact.",

  humorous: "Write a humorous reply that gently pokes fun at the tweet using wit, irony, or clever understatement. Keep it light and relatable—no forced punchlines or excessive exaggeration. Make sure the joke lands while staying relevant and concise.",

  joking: "Craft a lighthearted, teasing reply to the tweet using friendly, good-natured humor. Keep the tone fun and relaxed, never offensive or mean-spirited. The joke should feel natural and relevant to the tweet, not forced or overly familiar. Stay concise, playful, and easygoing.",

  sarcastic: "Reply to the tweet with light, playful sarcasm. Use wit and irony to make the point without sounding bitter, harsh, or dismissive. Keep the tone fun and clever, not mean-spirited. The sarcasm should feel effortless and relevant, adding humor while staying respectful and concise.",

  quirky: "Respond to tweet with a unique and creative twist. Make the response stand out without being too random. Keep it playful but still relevant.",

  encouraging: "Write a motivating and uplifting reply to tweet, using positive language that inspires confidence. Avoid excessive praise—keep it meaningful.",

  optimistic: "Respond to tweet with a positive and hopeful tone, focusing on opportunities and bright sides. Keep it uplifting without being unrealistic.",

  grateful: "Express sincere appreciation in response to tweet. Keep it heartfelt and genuine rather than generic.",

  inspirational: "Write an inspiring response to tweet, using meaningful language to uplift and empower. Avoid clichés—keep it authentic.",

  informative: "Provide a clear and factual reply to tweet, focusing on educating or clarifying without unnecessary complexity.",

  insightful: "Offer a thoughtful and insightful response to tweet, adding depth to the conversation with meaningful observations. Avoid redundancy.",

  empathetic: "Show understanding and compassion in your reply to tweet, acknowledging emotions or experiences respectfully.",

  curious: "Ask a thoughtful and relevant question in response to tweet, encouraging elaboration. Keep it open-ended and directly related to the tweet.",

  agreeable: "Respond to tweet with a supportive and reinforcing tone. Express agreement in a way that adds value rather than just repeating the original point. Keep it natural and engaging.",

  critical: "Provide a well-reasoned critique of tweet. Be analytical, not aggressive. Keep the feedback balanced, constructive, and insightful—offering a perspective that adds value rather than just disagreeing.",

  neutral: "Reply to tweet with a balanced and objective response. Keep it clear, concise, and neutral without unnecessary elaboration or personal opinions. ",

  polite: "Write a respectful and courteous reply to tweet. Maintain a thoughtful and considerate tone, even in disagreement.",

  reflective: "Compose a deep and introspective response to tweet, adding meaningful insights. Keep it thought-provoking without being overly abstract.",

  engaging: "Encourage interaction with an open-ended question or discussion in reply to tweet. Keep it inviting and natural. Stay focused on the topic without unnecessary diversions.",

  playful: "Reply to tweet with a fun and energetic tone. Keep it lighthearted and engaging without being off-topic. Ensure the response adds to the conversation in a creative way.",

  negative: "Respond to tweet with a clear and reasoned critique. Stay firm but respectful—no emotional language or personal attacks. Ensure the stance is well-articulated and professional.",
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
      chrome.storage.sync.get(
        ["selectedApiKey", "selectedModel", "geminiModel", "grokModel", "openaiModel", "ollamaModel", "ollamaUrl", "customPersona"],
        async (data) => {
          const { selectedApiKey, selectedModel, geminiModel, grokModel, openaiModel, ollamaModel, ollamaUrl, customPersona } = data;
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
                  prompt: message.text,
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
      );
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

  // --- Offscreen Speech Recognition Handling ---
  if (message.action === "start-recording") {
    handleOffscreenRecording("start-recording", message.lang, sender.tab.id);
    return true;
  }

  if (message.action === "stop-recording") {
    handleOffscreenRecording("stop-recording", null, sender.tab.id);
    return true;
  }
});

let creatingOffscreenParams = null; // Prevent double creation

async function handleOffscreenRecording(type, lang, tabId) {
  // Ensure offscreen document exists
  const OFFSCREEN_DOCUMENT_PATH = 'chrome-extension/offscreen.html';

  // Check if offscreen exists
  const existingContexts = await chrome.runtime.getContexts({
    contextTypes: ['OFFSCREEN_DOCUMENT'],
    documentUrls: [chrome.runtime.getURL('offscreen.html')]
  });

  if (existingContexts.length === 0) {
    // Create it
    if (creatingOffscreenParams) {
      await creatingOffscreenParams;
    } else {
      creatingOffscreenParams = chrome.offscreen.createDocument({
        url: 'offscreen.html',
        reasons: ['AUDIO_PLAYBACK'], // 'USER_MEDIA' is the correct reason but sometimes AUDIO_PLAYBACK is safer fallback in older manifest v3 implementations, but AUDIO_PLAYBACK is not for mic.
        // Actually for mic capture we need 'USER_MEDIA' reason from Chrome 116+.
        // Let's use generic or correct one.
        reasons: ['USER_MEDIA'],
        justification: 'Recording user voice for text input'
      });
      await creatingOffscreenParams;
      creatingOffscreenParams = null;
    }
  }

  // Send message to offscreen
  chrome.runtime.sendMessage({
    type: type,
    lang: lang
  });

  // We need to know which tab initiated this to send results back
  // Store acting tab ID loosely or pass it around (simplified here: assume active user flow)
  // Ideally, we'd map offscreen messages back to this tabId.
  // For now, the offscreen script sends messages via runtime.sendMessage, which we can catch here and forward to the tab.
}

// Forward messages from Offscreen -> Content Script
chrome.runtime.onMessage.addListener((message, sender) => {
  if (sender.url.includes('offscreen.html')) {
    // Determine target tab (active tab usually)
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: 'speech-data',
          data: message
        });
      }
    });
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