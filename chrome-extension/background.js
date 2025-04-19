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

        const prompt = tonePrompt
          .replace("{text}", message.text || "No text provided")
          .replace("{length}", message.length || "1-2 lines")
          .replace("{lang}", message.lang || "same language")
          .replace("{accountName}", message.accountName || "User")
          .replace("{customPrompt}", message.customPrompt);
        console.log("Generated Prompt:", prompt);
        let apiUrl, payload, headers;

        if (selectedModel === "gemini") {
          const model = geminiModel || "gemini-2.0-flash-exp";
          console.log(`Using Gemini model: ${model}`); // Log Gemini model

            const systemPrompt = `
            You are a human — that gives natural, thoughtful, and human-like replies to tweets on X (formerly Twitter), based on the user's selected tone and preferences.

      Write responses in a way that feels handwritten by a real person, avoiding patterns typical of AI-generated text. 

      **Avoid using the following phrases:**
      - In English: "You are correct", "You are right"
      - In Urdu: "بلکل درست فرمایا آپ نے", "بلکل بجا فرمایا آپ نے", "بلکل ٹھیک ہے", "بلکل" ,"بلکل درست کہہ رہے ہیں"

      Do not include hashtags, emojis, or interjections such as "Wow" or "Huh".

      Ensure the response is:
      - Gender-neutral  
      - In the same language of the tweet (${message.lang})  
      - Within the character limit defined (${message.length})  
      - Directly relevant to the real-time context of the tweet  

      Make the writing flow naturally, as if a genuine person is reacting spontaneously while staying aligned with the user's chosen tone.
          `;

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
          const model = openaiModel || "openai/gpt-3.5-turbo";
          console.log(`Using OpenAI model: ${model}`); // Log OpenAI model
          apiUrl = 'https://api.edenai.run/v2/text/generation';
          payload = {
            response_as_dict: true,
            attributes_as_list: false,
            show_base_64: true,
            show_original_response: false,
            temperature: 0,
            max_tokens: 1000,
            providers: [`${model}`],
            text: prompt
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
        files: ["libs/html2canvas.min.js"] // Ensure this file exists in your extension directory
      },
      () => {
        if (chrome.runtime.lastError) {
          sendResponse({ success: false, error: chrome.runtime.lastError.message });
        } else {
          sendResponse({ success: true });
        }
      }
    );
    return true; // Keep message channel open
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

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "injectHtml2Canvas") {
    console.log("📜 Injecting html2canvas script...");

    chrome.scripting.executeScript(
      {
        target: { tabId: sender.tab.id },
        files: ["html2canvas.min.js"], // Injecting from extension files
      },
      () => {
        console.log("✅ html2canvas script injected.");
        sendResponse({ success: true });
      }
    );

    return true; // Keep sendResponse async
  }
});


const tonePrompts = {
  casual: "Reply to '{text}' in a natural and engaging way. Keep it light, relaxed, and conversational—like a real person chatting. No forced jokes, just an easy-flowing response. {customPrompt}",

  optimal: "Craft a concise and engaging response to '{text}', ensuring it is natural, thoughtful, and relevant. Maintain a professional yet approachable tone, avoiding unnecessary formality or casualness. {customPrompt}",

  straightforward: "Respond to '{text}' with a direct and to-the-point answer. No small talk, no extra fluff—just a clear and effective response. Keep it neutral yet firm. {customPrompt}",

  professional: "Craft a professional response to '{text}' with clarity and respect. Keep it formal yet accessible, avoiding repetition or filler. Add value with insights instead of just agreeing. {customPrompt}",

  disagree: "Respond to '{text}' with a firm but respectful disagreement. Clearly express a differing perspective without being rude or dismissive. Keep the response logical and well-structured, ensuring it challenges the idea rather than the person. {customPrompt}",

  supportive: "Respond to '{text}' with kindness and understanding. Offer encouragement or a thoughtful perspective rather than just agreeing. Keep it genuine and uplifting. {customPrompt}",

  witty: "Reply to '{text}' with sharp humor or wordplay while staying relevant. Keep it clever but not forced. Make the response engaging without losing its meaning. {customPrompt}",

  humorous: "Write a funny response to '{text}', using playful humor without going overboard. Keep it light and entertaining, but still relevant. No forced jokes or unnecessary exaggeration. {customPrompt}",

  joking: "Craft a lighthearted and teasing reply to '{text}', ensuring the humor is fun and never offensive. Make it feel natural, not overly familiar. {customPrompt}",

  sarcastic: "Reply to '{text}' with a sarcastic but fun response. Keep the humor light, witty, and not overly negative. Avoid sounding harsh or dismissive. {customPrompt}",

  quirky: "Respond to '{text}' with a unique and creative twist. Make the response stand out without being too random. Keep it playful but still relevant. {customPrompt}",

  encouraging: "Write a motivating and uplifting reply to '{text}', using positive language that inspires confidence. Avoid excessive praise—keep it meaningful. {customPrompt}",

  optimistic: "Respond to '{text}' with a positive and hopeful tone, focusing on opportunities and bright sides. Keep it uplifting without being unrealistic. {customPrompt}",

  grateful: "Express sincere appreciation in response to '{text}'. Keep it heartfelt and genuine rather than generic. {customPrompt}",

  inspirational: "Write an inspiring response to '{text}', using meaningful language to uplift and empower. Avoid clichés—keep it authentic. {customPrompt}",

  informative: "Provide a clear and factual reply to '{text}', focusing on educating or clarifying without unnecessary complexity. {customPrompt}",

  insightful: "Offer a thoughtful and insightful response to '{text}', adding depth to the conversation with meaningful observations. Avoid redundancy. {customPrompt}",

  empathetic: "Show understanding and compassion in your reply to '{text}', acknowledging emotions or experiences respectfully. {customPrompt}",

  curious: "Ask a thoughtful and relevant question in response to '{text}', encouraging elaboration. Keep it open-ended and directly related to the tweet. {customPrompt}",

  agreeable: "Respond to '{text}' with a supportive and reinforcing tone. Express agreement in a way that adds value rather than just repeating the original point. Keep it natural and engaging. {customPrompt}",

  critical: "Provide a well-reasoned critique of '{text}'. Be analytical, not aggressive. Keep the feedback balanced, constructive, and insightful—offering a perspective that adds value rather than just disagreeing. {customPrompt}",

  neutral: "Reply to '{text}' with a balanced and objective response. Keep it clear, concise, and neutral without unnecessary elaboration or personal opinions.  {customPrompt}",

  polite: "Write a respectful and courteous reply to '{text}'. Maintain a thoughtful and considerate tone, even in disagreement. {customPrompt}",

  reflective: "Compose a deep and introspective response to '{text}', adding meaningful insights. Keep it thought-provoking without being overly abstract. {customPrompt}",

  engaging: "Encourage interaction with an open-ended question or discussion in reply to '{text}'. Keep it inviting and natural. Stay focused on the topic without unnecessary diversions. {customPrompt}",

  playful: "Reply to '{text}' with a fun and energetic tone. Keep it lighthearted and engaging without being off-topic. Ensure the response adds to the conversation in a creative way. {customPrompt}",

  negative: "Respond to '{text}' with a clear and reasoned critique. Stay firm but respectful—no emotional language or personal attacks. Ensure the stance is well-articulated and professional. {customPrompt}",
};
