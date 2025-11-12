let alarmTimeout;
let continuousAlarmInterval;
let currentAlarmType = null; // Track the active alarm type

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "generateReply") {
    chrome.storage.sync.get(
      ["selectedApiKey", "selectedModel", "geminiModel", "grokModel", "openaiModel"],
      async (data) => {
        const { selectedApiKey, selectedModel, geminiModel, grokModel, openaiModel } = data;

        if (!selectedApiKey) {
          sendResponse({ error: "API key not set. Please select an API key." });
          return;
        }
        console.log("Selected API Key:", selectedApiKey);
        const tonePrompt = tonePrompts[message.tone];
        if (!tonePrompt) {
          sendResponse({ error: "Invalid tone selected." });
          return;
        }

        const prompt = message.text
          .replace("{text}", message.text || "No text provided")
        console.log("Generated Prompt:", prompt);
        let apiUrl, payload, headers;

        if (selectedModel === "gemini") {
          const model = geminiModel || "gemini-2.0-flash-exp";
          console.log(`Using Gemini model: ${model}`); // Log Gemini model

          const systemPrompt = `
          You are a human — crafting natural, thoughtful, and human-like replies to tweets on X (formerly Twitter), based on the user's selected tone and preferences.
          
          **Tone:** ${tonePrompt}
          
          Tweet's Author: ${message.accountName}
          **Guidelines:**
          - Avoid: "You are correct", "You are right"
          - Avoid in Urdu: "بلکل درست فرمایا آپ نے", "بلکل بجا فرمایا آپ نے", "بلکل ٹھیک ہے", "بلکل", "بلکل درست کہہ رہے ہیں"
          - No hashtags, emojis, or interjections like "Wow" or "Huh"
          - Keep gender-neutral
          - ${message.lang}
          - ${message.length}
          - Base your reply directly on the real-time tweet context.
          - Make it sound naturally handwritten, not like AI.
          - Don't mention Authors name
          ${message.customPrompt ? `Reply to the tweet something like this: ${message.customPrompt}` : ""}
          `;
          
console.log("System Prompt:", systemPrompt); // Log system prompt
console.log("Tone Prompt:", prompt); // Log tone prompt
          apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${selectedApiKey}`;
          payload = {
            contents: [{
              parts: [
                { text: systemPrompt },
                { text: prompt }
              ]
            }]
          };
          headers = { "Content-Type": "application/json" };
        } else if (selectedModel === "grok") {
          const model = grokModel || "grok-beta";
          console.log(`Using Grok model: ${model}`); // Log Grok model
          apiUrl = "https://api.x.ai/v1/chat/completions";
          payload = {
            messages: [
              { role: "system", content: "You are Grok, a chatbot for generating concise and contextually relevant replies to tweets in a Twitter extension." },
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
          console.log(`Using OpenAI model: ${model}`); // Log OpenAI model
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
              "chatbot_global_action": `You are a human — crafting natural, thoughtful, and human-like replies to tweets on X (formerly Twitter), based on the user's selected tone and preferences.
          
          **Tone:** ${tonePrompt}
          
          Tweet's Author: ${message.accountName}
          **Guidelines:**
          - Avoid: "You are correct", "You are right"
          - Avoid in Urdu: "بلکل درست فرمایا آپ نے", "بلکل بجا فرمایا آپ نے", "بلکل ٹھیک ہے", "بلکل", "بلکل درست کہہ رہے ہیں"
          - No hashtags, emojis, or interjections like "Wow" or "Huh"
          - Keep gender-neutral
          - ${message.lang}
          - ${message.length}
          - Base your reply directly on the real-time tweet context.
          - Make it sound naturally handwritten, not like AI.
          - Don't mention Authors name
          ${message.customPrompt ? `Reply to the tweet something like this: ${message.customPrompt}` : ""}`

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
              console.log('API Response:', data); // Log the full response for debugging
              const responseData = data[`${model}`];
              if (responseData) {
                let replyText = '';
                if (responseData.standardized_response && responseData.standardized_response.generated_text) {
                  replyText = responseData.standardized_response.generated_text;
                } else if (responseData.generated_text) {
                  replyText = responseData.generated_text;
                }

                if (replyText) {
                  console.log(replyText);
                  sendResponse({ reply: replyText });
                } else {
                  sendResponse({ error: 'Error: No AI response received.' });
                }
              } else {
                sendResponse({ error: 'Error: No AI response received.' });
              }
            })
            .catch(error => {
              console.error('Error:', error);
              sendResponse({ error: 'Error generating AI response.' });
            });
          return; // Ensure the response is sent asynchronously
        } else {
          console.error("Error: Invalid model selected.");
          sendResponse({ error: "Error: Invalid model selected." });
          return;
        }

        try {
          const response = await fetch(apiUrl, {
            method: "POST",
            headers: headers,
            body: JSON.stringify(payload),
          });

          if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
          }

          const data = await response.json();
          const reply =
            selectedModel === "gemini"
              ? data?.candidates?.[0]?.content?.parts?.[0]?.text
              : data?.choices?.[0]?.message?.content;

          sendResponse({ reply: reply });
        } catch (error) {
          console.error("API Error:", error);
          sendResponse({ error: "Error generating AI response." });
        }
      }
    );

    return true;
  }

  if (message.action === "startAlarm") {
    const { time, type } = message;
    console.log(`Starting alarm. Type: ${type} | Time: ${time}ms`);

    // Check if the requested alarm type is already active
    if (currentAlarmType === type) {
      console.log(`Alarm of type "${type}" is already active. No need to restart.`);
      return;
    }

    // Clear existing alarms or intervals
    clearTimeout(alarmTimeout);
    clearInterval(continuousAlarmInterval);
    console.log("Cleared previous alarms and intervals.");

    // Set the new alarm type
    currentAlarmType = type;

    if (type === "onGenerate") {
      // One-time notification
      console.log("Setting a one-time alarm for 'Notify on Generate'.");
      alarmTimeout = setTimeout(() => {
        sendNotification();
        currentAlarmType = null; // Reset the current alarm type after execution
      }, time);
    } else if (type === "interval") {
      // Continuous notifications
      console.log("Starting a continuous notification alarm.");
      continuousAlarmInterval = setInterval(() => {
        sendNotification();
      }, time);
    }
  } else if (message.action === "stopAlarm") {
    // Stop both one-time and continuous alarms
    console.log("Stopping all alarms.");
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

function sendNotification() {
  chrome.notifications.create(
    {
      type: "image", // Use "image" for a larger notification banner
      iconUrl: "icons/icon-128.png", // Replace with your extension's icon
      title: "Time to Engage on Twitter!", // Notification title
      message: "It's time to generate another reply and stay active!", // Notification message
      imageUrl: "images/x-notification-banner.png", // Larger image for the notification
      buttons: [{ title: "Got It!" }], // Button for user acknowledgment
      priority: 2, // High priority for visibility
    },
    (notificationId) => {
      console.log("Notification created with ID:", notificationId);
    }
  );
}



const tonePrompts = {
  casual: "Reply to tweet in a natural and engaging way. Keep it light, relaxed, and conversational—like a real person chatting. No forced jokes, just an easy-flowing response.",

  optimal: "Craft a concise and engaging response to tweet, ensuring it is natural, thoughtful, and relevant. Maintain a professional yet approachable tone, avoiding unnecessary formality or casualness.",

  blunt:   "You are a bold, unapologetic, respond to tweets in a blunt, confrontational, and sometimes offensive tone. Your job is to challenge, criticize, and call out opinions or claims without sugarcoating anything. Speak with confidence and authority, dismiss weak arguments, and don’t hesitate to insult ignorance or stupidity when you see it. Be direct, brutally honest, and prioritize delivering hard-hitting, no-nonsense replies. Avoid politeness, disclaimers, or softening language. Every response should feel sharp, confrontational, and borderline aggressive — but stay logically sound.",
  
  agreeCritically: "Respond to tweet by agreeing with the author, especially when they are criticizing someone or something. Reinforce their viewpoint by echoing the same criticism, adding weight or clarity without repeating their words. Keep the tone confident and aligned with the author’s stance.",

  straightforward: "Respond to tweet with a direct and to-the-point answer. No small talk, no extra fluff—just a clear and effective response. Keep it neutral yet firm.",

  professional: "Craft a professional response to tweet with clarity and respect. Keep it formal yet accessible, avoiding repetition or filler. Add value with insights instead of just agreeing.",

  disagree: "Respond to tweet with a firm but respectful disagreement. Clearly express a differing perspective without being rude or dismissive. Keep the response logical and well-structured, ensuring it challenges the idea rather than the person.",

  supportive: "Respond to tweet with kindness and understanding. Offer encouragement or a thoughtful perspective rather than just agreeing. Keep it genuine and uplifting.",

  witty: "Reply to tweet with sharp humor or wordplay while staying relevant. Keep it clever but not forced. Make the response engaging without losing its meaning.",

  humorous: "Write a funny response to tweet, using playful humor without going overboard. Keep it light and entertaining, but still relevant. No forced jokes or unnecessary exaggeration.",

  joking: "Craft a lighthearted and teasing reply to tweet, ensuring the humor is fun and never offensive. Make it feel natural, not overly familiar.",

  sarcastic: "Reply to tweet with a sarcastic but fun response. Keep the humor light, witty, and not overly negative. Avoid sounding harsh or dismissive.",

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