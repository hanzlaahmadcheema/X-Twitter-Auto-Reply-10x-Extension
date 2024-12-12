chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "generateReply") {
    const {
      text,
      tone,
      lang,
      length,
      accountName
    } = message;

    chrome.storage.sync.get(["apiKeys", "selectedApiKey", "geminiModel"], (data) => {
      const { selectedApiKey, geminiModel } = data;
      const apiKey = selectedApiKey;


      if (!apiKey) {
        console.error("Error: API key not found.");
        sendResponse({ error: "Error: API key not set. Please enter your API key in the extension settings in the popup." });
        return;
      }

      if (!geminiModel) {
        console.error("Error: Model not selected.");
        sendResponse({ error: "Error: Model not set. Please select model in the extension settings in the popup." });
        return;
      }

      const promptTemplate = tonePrompts[tone];
      if (!promptTemplate) {
        sendResponse({
          error: "Error: Invalid tone selected."
        });
        return;
      }

      const prompt = promptTemplate
        .replace("{text}", text || "No text provided")
        .replace("{length}", length || "1-2 lines")
        .replace("{lang}", lang || "same language")
        .replace("{accountName}", accountName || "User");

      const payload = {
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      };

      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${apiKey}`;

      fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          console.log("Full API Response:", data);

          if (!data?.candidates || data.candidates.length === 0 || !data.candidates[0]?.content?.parts[0]?.text) {
            const errorMessage = "Error: AI response missing.";
            console.error(errorMessage);
            sendResponse({
              error: errorMessage
            });
            return;
          }

          const generatedText = data.candidates[0].content.parts[0].text;
          console.log("Generated Text:", generatedText);

          sendResponse({
            reply: generatedText
          });
        })
        .catch((error) => {
          console.error("API request failed:", error);
          sendResponse({
            error: "Error generating AI response. Please check your API key and connection."
          });
        });
    });

    return true;
  }
});

const tonePrompts = {
  casual: "Craft a casual and conversational response to the tweet '{text}' by {accountName}. Keep the tone light and natural, ensuring it flows well. Avoid hashtags, emojis, and interjections like 'Wow' or 'Huh'. Use the {lang} language and keep it gender-neutral. Aim for a length of approximately {length}.",
  straightforward: "Compose a direct and concise reply to '{text}' from {accountName}. Use clear language without unnecessary elaboration. Ensure the response is gender-neutral, in {lang}, and avoids hashtags, emojis, and interjections such as 'Wow' or 'Huh'. Stick to a length of {length}.",
  professional: "Develop a polished and formal response to '{text}' by {accountName}. Maintain a professional tone, using structured and articulate language. Write in {lang}, avoid hashtags, emojis, or interjections, and ensure the reply is gender-neutral. Keep it within {length}.",
  friendly: "Respond warmly and positively to '{text}' by {accountName}, making the interaction feel welcoming. Use an approachable tone without hashtags, emojis, or interjections like 'Wow' or 'Huh'. Write in {lang}, keeping it gender-neutral and concise within {length}.",
  supportive: "Create a supportive and empathetic reply to '{text}' by {accountName}. Show kindness and understanding while avoiding negativity. Use {lang}, and ensure the tone is gender-neutral without hashtags, emojis, or interjections like 'Huh' or 'Wow'. Stay within {length}.",
  witty: "Compose a clever and witty reply to '{text}' by {accountName}. Use sharp language and wordplay to add humor or intelligence. Ensure the response is relevant, gender-neutral, in {lang}, and avoids hashtags, emojis, or interjections like 'Wow' or 'Huh'. Aim for a length of {length}.",
  humorous: "Write a funny and engaging response to '{text}' from {accountName}. Incorporate playful humor and puns without being offensive. Use {lang}, and keep the reply gender-neutral. Exclude hashtags, emojis, or interjections such as 'Wow' or 'Huh'. Keep it under {length}.",
  joking: "Craft a playful and teasing reply to '{text}' by {accountName}, ensuring the humor is light and friendly. Use {lang}, maintaining a gender-neutral tone. Avoid hashtags, emojis, or interjections like 'Huh' or 'Wow'. Stay within {length}.",
  sarcastic: "Develop a sarcastic and humorous response to '{text}' by {accountName}. Keep the sarcasm lighthearted and relevant. Use {lang}, avoiding hashtags, emojis, or interjections like 'Wow' or 'Huh'. Keep the reply gender-neutral and concise within {length}.",
  quirky: "Write a unique and quirky reply to '{text}' by {accountName}. Use creative language to make the response stand out. Ensure it’s in {lang}, gender-neutral, and free of hashtags, emojis, or interjections like 'Wow' or 'Huh'. Stay within {length}.",
  encouraging: "Compose an uplifting and motivating reply to '{text}' by {accountName}. Use positive language that inspires confidence and action. Ensure the reply is gender-neutral, in {lang}, and free of hashtags, emojis, or interjections like 'Wow' or 'Huh'. Keep it concise, within {length}.",
  optimistic: "Write a cheerful and optimistic reply to '{text}' by {accountName}. Focus on positivity and opportunities. Ensure it’s in {lang}, gender-neutral, and free of hashtags, emojis, or interjections like 'Huh' or 'Wow'. Stay within {length}.",
  grateful: "Express genuine gratitude in response to '{text}' by {accountName}. Use heartfelt language to convey appreciation. Ensure the reply is in {lang}, gender-neutral, and excludes hashtags, emojis, or interjections like 'Huh' or 'Wow'. Aim for a length of {length} .",
  inspirational: "Develop an inspirational response to '{text}' by {accountName}, using empowering and meaningful language. Write in {lang}, keeping it gender-neutral and free of hashtags, emojis, or interjections like 'Wow' or 'Huh'. Stay within {length}.",
  informative: "Provide a clear and informative reply to '{text}' from {accountName}. Focus on educating or clarifying the topic in {lang}. Avoid hashtags, emojis, or interjections like 'Huh' or 'Wow'. Keep the response gender-neutral and concise within {length}.",
  insightful: "Offer a thoughtful and insightful reply to '{text}' by {accountName}. Add depth to the conversation with meaningful observations. Use {lang}, and keep the tone gender-neutral without hashtags, emojis, or interjections like 'Huh' or 'Wow'. Stay within {length}.",
  empathetic: "Show understanding and compassion in your reply to '{text}' by {accountName}. Acknowledge emotions or experiences respectfully. Use {lang}, ensuring the tone is gender-neutral and avoiding hashtags, emojis, or interjections like 'Huh' or 'Wow'. Keep it concise within {length}.",
  curious: "Ask thoughtful questions in response to '{text}' by {accountName} to encourage elaboration. Use an inquisitive and engaging tone in {lang}, keeping it gender-neutral. Exclude hashtags, emojis, or interjections like 'Huh' or 'Wow'. Aim for {length}.",
  agreeable: "Craft a reply to '{text}' by {accountName} that expresses agreement or support. Use positive and affirming language in {lang}, ensuring it’s gender-neutral and free of hashtags, emojis, or interjections like 'Wow' or 'Huh'. Keep it within {length}.",
  critical: "Provide balanced and constructive feedback in response to '{text}' by {accountName}. Maintain a respectful tone in {lang}, avoiding hashtags, emojis, or interjections like 'Huh' or 'Wow'. Ensure the response is gender-neutral and concise within {length}.",
  neutral: "Compose an unbiased and balanced reply to '{text}' by {accountName}. Avoid strong opinions or emotional language. Use {lang}, ensuring the tone is gender-neutral and free of hashtags, emojis, or interjections like 'Wow' or 'Huh'. Stay within {length}.",
  polite: "Write a respectful and courteous reply to '{text}' by {accountName}. Maintain a considerate tone in {lang}, excluding hashtags, emojis, or interjections like 'Huh' or 'Wow'. Ensure it’s gender-neutral and concise within {length}.",
  reflective: "Compose a thoughtful and reflective response to '{text}' by {accountName}, sharing meaningful insights. Use {lang}, keeping the tone gender-neutral and free of hashtags, emojis, or interjections like 'Huh' or 'Wow'. Stay within {length}.",
  engaging: "Encourage interaction with an open-ended question or discussion in reply to '{text}' by {accountName}. Use an inviting tone in {lang}, avoiding hashtags, emojis, or interjections like 'Wow' or 'Huh'. Keep it gender-neutral and concise within {length}.",
  playful: "Write a fun and imaginative reply to '{text}' by {accountName}, incorporating playful energy. Use {lang}, ensuring the tone is gender-neutral and avoiding hashtags, emojis, or interjections like 'Huh' or 'Wow'. Keep it concise, within {length}."
};