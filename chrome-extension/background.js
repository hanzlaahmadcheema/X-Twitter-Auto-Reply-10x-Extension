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
        sendResponse({ reply: 'Error: No AI response received.' });
      }
    } else {
      sendResponse({ reply: 'Error: No AI response received.' });
    }
  })
          .catch(error => {
            console.error('Error:', error);
            sendResponse({ reply: 'Error generating AI response.' });
          });
          return; // Ensure the response is sent asynchronously
        } else {
          console.error("Error: Invalid model selected.");
          sendResponse({ reply: "Error: Invalid model selected." });
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

          sendResponse({ reply: reply || "Error: No AI response received." });
        } catch (error) {
          console.error("API Error:", error);
          sendResponse({ reply: "Error generating AI response." });
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
  casual: "Craft a casual and conversational response to the tweet '{text}'. Keep the tone light and natural, ensuring it flows well. Avoid hashtags, emojis, and interjections like 'Wow' or 'Huh'. Use the {lang} language and keep it gender-neutral. Aim for a length of approximately {length}. Use the real-time context of the tweet to generate the response. {customPrompt}",

  straightforward: "Compose a direct and straightforward reply to '{text}'. Use clear language without unnecessary elaboration. Ensure the response is gender-neutral, in {lang}, and avoids hashtags, emojis, and interjections such as 'Wow' or 'Huh'. Use the real-time context of the tweet to generate the response. {customPrompt}",

  professional: "Craft a professional and respectful response to this tweet: '{text}'. Maintain a formal tone. Maintain a professional tone, using structured and articulate language. Write in {lang}, avoid hashtags, emojis, or interjections, and ensure the reply is gender-neutral. Keep it within {length}. Use the real-time context of the tweet to generate the response. {customPrompt}",

  friendly: "Respond warmly and positively to '{text}', making the interaction feel welcoming. Use an approachable tone without hashtags, emojis, or interjections like 'Wow' or 'Huh'. Write in {lang}, keeping it gender-neutral and concise within {length}. Use the real-time context of the tweet to generate the response. {customPrompt}",

  supportive: "Create a supportive and empathetic reply to '{text}'. Show kindness and understanding while avoiding negativity. Use {lang}, and ensure the tone is gender-neutral without hashtags, emojis, or interjections like 'Huh' or 'Wow'. Stay within {length}. Use the real-time context of the tweet to generate the response. {customPrompt}",

  witty: "Compose a clever and witty reply to '{text}'. Use sharp language and wordplay to add humor or intelligence. Ensure the response is relevant, gender-neutral, in {lang}, and avoids hashtags, emojis, or interjections like 'Wow' or 'Huh'. Aim for a length of {length}. Use the real-time context of the tweet to generate the response. {customPrompt}",

  humorous: "Write a funny and engaging response to '{text}'. Incorporate playful humor and puns without being offensive. Use {lang}, and keep the reply gender-neutral. Exclude hashtags, emojis, or interjections such as 'Wow' or 'Huh'. Keep it under {length}. Use the real-time context of the tweet to generate the response. {customPrompt}",

  joking: "Craft a playful and teasing reply to '{text}', ensuring the humor is light and friendly. Use {lang}, maintaining a gender-neutral tone. Avoid hashtags, emojis, or interjections like 'Huh' or 'Wow'. Stay within {length}. Use the real-time context of the tweet to generate the response. {customPrompt}",

  sarcastic: "Develop a sarcastic and humorous response to '{text}'. Keep the sarcasm lighthearted and relevant. Use {lang}, avoiding hashtags, emojis, or interjections like 'Wow' or 'Huh'. Keep the reply gender-neutral and concise within {length}. Use the real-time context of the tweet to generate the response. {customPrompt}",

  quirky: "Write a unique and quirky reply to '{text}'. Use creative language to make the response stand out. Ensure it’s in {lang}, gender-neutral, and free of hashtags, emojis, or interjections like 'Wow' or 'Huh'. Stay within {length}. Use the real-time context of the tweet to generate the response. {customPrompt}",

  encouraging: "Compose an uplifting and motivating reply to '{text}'. Use positive language that inspires confidence and action. Ensure the reply is gender-neutral, in {lang}, and free of hashtags, emojis, or interjections like 'Wow' or 'Huh'. Keep it concise, within {length}. Use the real-time context of the tweet to generate the response. {customPrompt}",

  optimistic: "Write a cheerful and optimistic reply to '{text}'. Focus on positivity and opportunities. Ensure it’s in {lang}, gender-neutral, and free of hashtags, emojis, or interjections like 'Huh' or 'Wow'. Stay within {length}. Use the real-time context of the tweet to generate the response. {customPrompt}",

  grateful: "Express genuine gratitude in response to '{text}'. Use heartfelt language to convey appreciation. Ensure the reply is in {lang}, gender-neutral, and excludes hashtags, emojis, or interjections like 'Huh' or 'Wow'. Aim for a length of {length}. Use the real-time context of the tweet to generate the response. {customPrompt}",

  inspirational: "Develop an inspirational response to '{text}', using empowering and meaningful language. Write in {lang}, keeping it gender-neutral and free of hashtags, emojis, or interjections like 'Wow' or 'Huh'. Stay within {length}. Use the real-time context of the tweet to generate the response. {customPrompt}",

  informative: "Provide a clear and informative reply to '{text}'. Focus on educating or clarifying the topic in {lang}. Avoid hashtags, emojis, or interjections like 'Huh' or 'Wow'. Keep the response gender-neutral and concise within {length}. Use the real-time context of the tweet to generate the response. {customPrompt}",

  insightful: "Offer a thoughtful and insightful reply to '{text}'. Add depth to the conversation with meaningful observations. Use {lang}, and keep the tone gender-neutral without hashtags, emojis, or interjections like 'Huh' or 'Wow'. Stay within {length}. Use the real-time context of the tweet to generate the response. {customPrompt}",

  empathetic: "Show understanding and compassion in your reply to '{text}'. Acknowledge emotions or experiences respectfully. Use {lang}, ensuring the tone is gender-neutral and avoiding hashtags, emojis, or interjections like 'Huh' or 'Wow'. Keep it concise within {length}. Use the real-time context of the tweet to generate the response. {customPrompt}",

  curious: "Ask thoughtful questions in response to '{text}' to encourage elaboration. Use an inquisitive and engaging tone in {lang}, keeping it gender-neutral. Exclude hashtags, emojis, or interjections like 'Huh' or 'Wow'. Aim for {length}. Use the real-time context of the tweet to generate the response. {customPrompt}",

  agreeable: "Craft a reply to '{text}' that expresses agreement or support. Use positive and affirming language in {lang}, ensuring it’s gender-neutral and free of hashtags, emojis, or interjections like 'Wow' or 'Huh'. Keep it within {length}. Use the real-time context of the tweet to generate the response. {customPrompt}",

  critical: "Provide balanced and constructive feedback in response to '{text}'. Maintain a respectful tone in {lang}, avoiding hashtags, emojis, or interjections like 'Huh' or 'Wow'. Ensure the response is gender-neutral and concise within {length}. Use the real-time context of the tweet to generate the response. {customPrompt}",

  neutral: "Compose an unbiased and balanced reply to '{text}'. Avoid strong opinions or emotional language. Use {lang}, ensuring the tone is gender-neutral and free of hashtags, emojis, or interjections like 'Wow' or 'Huh'. Stay within {length}. Use the real-time context of the tweet to generate the response. {customPrompt}",

  polite: "Write a respectful and courteous reply to '{text}'. Maintain a considerate tone in {lang}, excluding hashtags, emojis, or interjections like 'Huh' or 'Wow'. Ensure it’s gender-neutral and concise within {length}. Use the real-time context of the tweet to generate the response. {customPrompt}",

  reflective: "Compose a thoughtful and reflective response to '{text}', sharing meaningful insights. Use {lang}, keeping the tone gender-neutral and free of hashtags, emojis, or interjections like 'Huh' or 'Wow'. Stay within {length}. Use the real-time context of the tweet to generate the response. {customPrompt}",

  engaging: "Encourage interaction with an open-ended question or discussion in reply to '{text}'. Use an inviting tone in {lang}, avoiding hashtags, emojis, or interjections like 'Wow' or 'Huh'. Keep it gender-neutral and concise within {length}. Use the real-time context of the tweet to generate the response. {customPrompt}",

  playful: "Write a fun and imaginative reply to '{text}', incorporating playful energy. Use {lang}, ensuring the tone is gender-neutral and avoiding hashtags, emojis, or interjections like 'Huh' or 'Wow'. Keep it concise, within {length}. Use the real-time context of the tweet to generate the response. {customPrompt}",

  negative: "Craft a response to '{text}' that conveys disagreement or critique in a firm manner. Use {lang} to articulate a clear stance without being rude or inflammatory. Avoid hashtags, emojis, or interjections like 'Huh' or 'Wow'. Ensure the reply is gender-neutral and concise within {length} characters. Use the real-time context of the tweet to generate the response. {customPrompt}",

};