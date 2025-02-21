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
          const model = geminiModel || "gemini-1.5-flash-latest";
          console.log(`Using Gemini model: ${model}`); // Log Gemini model
          apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${selectedApiKey}`;
          payload = { contents: [{ parts: [{ text: prompt }] }] };
          headers = { "Content-Type": "application/json" };
        } else if (selectedModel === "grok") {
          const model = grokModel || "grok-beta";
          console.log(`Using Grok model: ${model}`); // Log Grok model
          apiUrl = "https://api.x.ai/v1/chat/completions";
          payload = {
            messages: [
              {role: "system", content: "You are Grok, a chatbot for generating concise and contextually relevant replies to tweets in a Twitter extension." },
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
  casual: "Write a relaxed and natural reply to '{text}', making it feel like a real conversation. Keep it engaging without being overly formal. Avoid hashtags, emojis, or interjections like 'Wow' or 'Huh'. Use {lang}, stay gender-neutral, and keep it concise within {length}. Use the real-time context of the tweet. {customPrompt}",

  optimal: "Craft a concise and engaging response to '{text}', ensuring it is natural, thoughtful, and relevant. Maintain a professional yet approachable tone, avoiding unnecessary formality or casualness. Use {lang}, ensure gender neutrality, and exclude hashtags, emojis, or interjections. Keep it within {length}. Use the real-time context of the tweet. {customPrompt}",  
 
  straightforward: "Respond to '{text}' with a direct and clear reply. Keep it professional and to the point without unnecessary elaboration. No casual language or small talk. Use {lang}, ensure gender neutrality, and exclude hashtags, emojis, or interjections. Keep it within {length}. Use the real-time context of the tweet. {customPrompt}",

  professional: "Write a formal and respectful reply to '{text}', adding insight or analysis without repetition. Keep the language structured and articulate. Use {lang}, maintain gender neutrality, and exclude hashtags, emojis, or interjections. Stay within {length}. Use the real-time context of the tweet. {customPrompt}",

  friendly: "Craft a warm and welcoming response to '{text}', making the interaction feel natural and engaging. Avoid generic phrases—keep it personal and authentic. Use {lang}, stay gender-neutral, and exclude hashtags, emojis, or interjections. Keep it concise within {length}. Use the real-time context of the tweet. {customPrompt}",

  supportive: "Write a kind and encouraging response to '{text}', showing empathy and understanding. Offer meaningful encouragement rather than just agreement. Use {lang}, ensure gender neutrality, and avoid hashtags, emojis, or interjections. Keep it within {length}. Use the real-time context of the tweet. {customPrompt}",

  witty: "Create a clever and sharp reply to '{text}', using humor or wordplay to add personality. Keep it relevant and engaging, not forced. Use {lang}, ensure gender neutrality, and exclude hashtags, emojis, or interjections. Stay within {length}. Use the real-time context of the tweet. {customPrompt}",

  humorous: "Write a funny and engaging response to '{text}', using playful humor while keeping it appropriate. Avoid forced jokes or exaggeration. Use {lang}, stay gender-neutral, and exclude hashtags, emojis, or interjections. Keep it under {length}. Use the real-time context of the tweet. {customPrompt}",

  joking: "Craft a lighthearted and teasing reply to '{text}', ensuring the humor is fun and never offensive. Make it feel natural, not overly familiar. Use {lang}, ensure gender neutrality, and avoid hashtags, emojis, or interjections. Keep it within {length}. Use the real-time context of the tweet. {customPrompt}",

  sarcastic: "Write a witty and sarcastic response to '{text}', keeping it playful rather than harsh. Avoid bitterness or excessive negativity. Use {lang}, maintain gender neutrality, and exclude hashtags, emojis, or interjections. Stay within {length}. Use the real-time context of the tweet. {customPrompt}",

  quirky: "Create a unique and creative reply to '{text}', making it stand out without being random or off-topic. Keep it fun yet relevant. Use {lang}, ensure gender neutrality, and avoid hashtags, emojis, or interjections. Stay within {length}. Use the real-time context of the tweet. {customPrompt}",

  encouraging: "Write a motivating and uplifting reply to '{text}', using positive language that inspires confidence. Avoid excessive praise—keep it meaningful. Use {lang}, stay gender-neutral, and exclude hashtags, emojis, or interjections. Keep it within {length}. Use the real-time context of the tweet. {customPrompt}",

  optimistic: "Respond to '{text}' with a positive and hopeful tone, focusing on opportunities and bright sides. Keep it uplifting without being unrealistic. Use {lang}, maintain gender neutrality, and exclude hashtags, emojis, or interjections. Stay within {length}. Use the real-time context of the tweet. {customPrompt}",

  grateful: "Express sincere appreciation in response to '{text}'. Keep it heartfelt and genuine rather than generic. Use {lang}, ensure gender neutrality, and avoid hashtags, emojis, or interjections. Aim for {length}. Use the real-time context of the tweet. {customPrompt}",

  inspirational: "Write an inspiring response to '{text}', using meaningful language to uplift and empower. Avoid clichés—keep it authentic. Use {lang}, stay gender-neutral, and exclude hashtags, emojis, or interjections. Stay within {length}. Use the real-time context of the tweet. {customPrompt}",

  informative: "Provide a clear and factual reply to '{text}', focusing on educating or clarifying without unnecessary complexity. Use {lang}, maintain gender neutrality, and avoid hashtags, emojis, or interjections. Keep it within {length}. Use the real-time context of the tweet. {customPrompt}",

  insightful: "Offer a thoughtful and insightful response to '{text}', adding depth to the conversation with meaningful observations. Avoid redundancy. Use {lang}, ensure gender neutrality, and exclude hashtags, emojis, or interjections. Stay within {length}. Use the real-time context of the tweet. {customPrompt}",

  empathetic: "Show understanding and compassion in your reply to '{text}', acknowledging emotions or experiences respectfully. Use {lang}, maintain gender neutrality, and avoid hashtags, emojis, or interjections. Keep it within {length}. Use the real-time context of the tweet. {customPrompt}",

  curious: "Ask a thoughtful and relevant question in response to '{text}', encouraging elaboration. Keep it open-ended and directly related to the tweet. Use {lang}, ensure gender neutrality, and avoid hashtags, emojis, or interjections. Aim for {length}. Use the real-time context of the tweet. {customPrompt}",

  agreeable: "Write a reply to '{text}' that adds value to the conversation rather than just agreeing. Offer a perspective, insight, or relevant remark. Use {lang}, keep it gender-neutral, and avoid hashtags, emojis, or interjections. Keep it within {length}. Use the real-time context of the tweet. {customPrompt}",

  critical: "Provide a balanced and constructive critique in response to '{text}', maintaining a respectful and logical tone. Avoid hostility or exaggeration. Use {lang}, ensure gender neutrality, and exclude hashtags, emojis, or interjections. Keep it within {length}. Use the real-time context of the tweet. {customPrompt}",

  neutral: "Write an objective and balanced reply to '{text}', avoiding strong opinions or emotions. Keep the tone measured and unbiased. Use {lang}, ensure gender neutrality, and avoid hashtags, emojis, or interjections. Stay within {length}. Use the real-time context of the tweet. {customPrompt}",

  polite: "Respond to '{text}' in a courteous and respectful manner, ensuring the tone is kind and considerate. Avoid unnecessary elaboration. Use {lang}, stay gender-neutral, and exclude hashtags, emojis, or interjections. Keep it within {length}. Use the real-time context of the tweet. {customPrompt}",

  reflective: "Compose a thoughtful and introspective reply to '{text}', sharing meaningful insights while keeping it relevant. Use {lang}, maintain gender neutrality, and avoid hashtags, emojis, or interjections. Stay within {length}. Use the real-time context of the tweet. {customPrompt}",

  engaging: "Encourage interaction with an open-ended reply to '{text}', inviting further discussion while staying relevant. Avoid forced engagement. Use {lang}, keep it gender-neutral, and exclude hashtags, emojis, or interjections. Stay within {length}. Use the real-time context of the tweet. {customPrompt}",

  playful: "Write a fun and energetic reply to '{text}', adding creativity while keeping it relevant. Avoid randomness—make it feel natural. Use {lang}, ensure gender neutrality, and exclude hashtags, emojis, or interjections. Keep it concise within {length}. Use the real-time context of the tweet. {customPrompt}",

  negative: "Craft a firm and reasoned response to '{text}' that conveys disagreement or critique without hostility. Keep it professional and logical, avoiding emotional tones. Use {lang}, ensure gender neutrality, and exclude hashtags, emojis, or interjections. Stay within {length}. Use the real-time context of the tweet. {customPrompt}",  
};
