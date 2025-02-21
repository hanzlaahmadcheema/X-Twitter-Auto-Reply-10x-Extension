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
  casual: "Craft a casual reply to '{text}'. Keep it light, engaging, and natural. Use {lang}, gender-neutral, and {length}. {customPrompt}",
  straightforward: "Craft a direct reply to '{text}'. Keep it concise and professional. Use {lang}, gender-neutral, and {length}. {customPrompt}",
  professional: "Craft a professional reply to '{text}'. Use formal and articulate language. Use {lang}, gender-neutral, and {length}. {customPrompt}",
  friendly: "Respond warmly to '{text}'. Keep it conversational and engaging. Use {lang}, gender-neutral, and {length}. {customPrompt}",
  supportive: "Create a supportive reply to '{text}'. Show kindness and understanding. Use {lang}, gender-neutral, and {length}. {customPrompt}",
  witty: "Compose a witty reply to '{text}'. Use sharp language and humor. Use {lang}, gender-neutral, and {length}. {customPrompt}",
  humorous: "Write a funny reply to '{text}'. Use playful humor and puns. Use {lang}, gender-neutral, and {length}. {customPrompt}",
  joking: "Craft a playful reply to '{text}'. Keep the humor lighthearted. Use {lang}, gender-neutral, and {length}. {customPrompt}",
  sarcastic: "Develop a sarcastic reply to '{text}'. Keep it witty and relevant. Use {lang}, gender-neutral, and {length}. {customPrompt}",
  quirky: "Write a quirky reply to '{text}'. Use creative and unexpected language. Use {lang}, gender-neutral, and {length}. {customPrompt}",
  encouraging: "Compose an encouraging reply to '{text}'. Use positive language. Use {lang}, gender-neutral, and {length}. {customPrompt}",
  optimistic: "Write an optimistic reply to '{text}'. Focus on positivity. Use {lang}, gender-neutral, and {length}. {customPrompt}",
  grateful: "Express gratitude in reply to '{text}'. Use heartfelt language. Use {lang}, gender-neutral, and {length}. {customPrompt}",
  inspirational: "Develop an inspirational reply to '{text}'. Use empowering language. Use {lang}, gender-neutral, and {length}. {customPrompt}",
  informative: "Provide an informative reply to '{text}'. Focus on educating. Use {lang}, gender-neutral, and {length}. {customPrompt}",
  insightful: "Offer an insightful reply to '{text}'. Add meaningful observations. Use {lang}, gender-neutral, and {length}. {customPrompt}",
  empathetic: "Show empathy in reply to '{text}'. Acknowledge emotions respectfully. Use {lang}, gender-neutral, and {length}. {customPrompt}",
  curious: "Ask a thoughtful question in reply to '{text}'. Encourage elaboration. Use {lang}, gender-neutral, and {length}. {customPrompt}",
  agreeable: "Craft an agreeable reply to '{text}'. Add perspective or ask a question. Use {lang}, gender-neutral, and {length}. {customPrompt}",
  critical: "Provide constructive feedback in reply to '{text}'. Maintain a respectful tone. Use {lang}, gender-neutral, and {length}. {customPrompt}",
  neutral: "Compose a neutral reply to '{text}'. Avoid strong opinions. Use {lang}, gender-neutral, and {length}. {customPrompt}",
  polite: "Write a polite reply to '{text}'. Maintain a courteous tone. Use {lang}, gender-neutral, and {length}. {customPrompt}",
  reflective: "Compose a reflective reply to '{text}'. Share meaningful insights. Use {lang}, gender-neutral, and {length}. {customPrompt}",
  engaging: "Encourage interaction in reply to '{text}'. Ask an open-ended question. Use {lang}, gender-neutral, and {length}. {customPrompt}",
  playful: "Write a playful reply to '{text}'. Use lighthearted energy. Use {lang}, gender-neutral, and {length}. {customPrompt}",
  negative: "Craft a negative reply to '{text}'. Convey disagreement professionally. Use {lang}, gender-neutral, and {length}. {customPrompt}",
};
