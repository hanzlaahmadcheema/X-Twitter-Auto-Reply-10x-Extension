const tonePrompts = {
  straightforward: "Be direct and clear. Respond to this tweet with no embellishments or emotional language. Text: '{text}'. Author: {accountName}. No hashtags, emojis, or mentions. Language: {lang}. Length: {length}. Keep it gender-neutral. Avoid interjections like 'Wow' or 'Huh'.",

  negative: "Critically respond to this tweet with respectful disagreement. Text: '{text}'. Author: {accountName}. No hashtags, emojis, or mentions. Language: {lang}. Length: {length}. Keep it gender-neutral. Avoid interjections like 'Wow' or 'Huh'.",

  casual: "Write a casual reply to this tweet in a friendly and light-hearted tone. Avoid overly formal language. Text: '{text}'. Author: {accountName}. Exclude hashtags, emojis, and mentions. Language: {lang}. Response length: {length}. Keep it gender-neutral and avoid excitement words like 'Wow' or 'Awesome'.",

  friendly: "Respond warmly and positively to this tweet. Make your reply welcoming and approachable. Text: '{text}'. Author: {accountName}. Avoid hashtags, emojis, or mentions. Language: {lang}. Response length: {length}. Keep it gender-neutral. Avoid interjections like 'Wow' or 'Huh'.",

  professional: "Craft a professional and respectful response to this tweet. Maintain a formal and concise tone. Text: '{text}'. Author: {accountName}. Exclude hashtags, emojis, or mentions. Language: {lang}. Response length: {length}. Keep it gender-neutral. Avoid interjections like 'Wow' or 'Huh'.",

  humorous: "Add a touch of humor in your response to this tweet. Keep it witty but respectful. Text: '{text}'. Author: {accountName}. No hashtags, emojis, or mentions. Language: {lang}. Length: {length}. Keep it gender-neutral. Avoid interjections like 'Wow' or 'Huh'.",

  supportive: "Reply to this tweet with empathy and encouragement. Text: '{text}'. Author: {accountName}. Avoid hashtags, emojis, or mentions. Language: {lang}. Length: {length}. Use gender-neutral language. Avoid interjections like 'Wow' or 'Huh'.",

  curious: "Show curiosity or interest in this tweet by asking a thoughtful question or making an engaging comment. Text: '{text}'. Author: {accountName}. No hashtags, emojis, or mentions. Language: {lang}. Response length: {length}. Keep it gender-neutral. Avoid interjections like 'Wow' or 'Huh'.",

  encouraging: "Respond to this tweet with uplifting and motivational words. Provide positive reinforcement. Text: '{text}'. Author: {accountName}. Exclude hashtags, emojis, or mentions. Language: {lang}. Length: {length}. Use gender-neutral language. Avoid interjections like 'Wow' or 'Huh'.",

  thoughtful: "Craft a meaningful and reflective reply to this tweet. Text: '{text}'. Author: {accountName}. No hashtags, emojis, or mentions. Language: {lang}. Response length: {length}. Keep it gender-neutral. Avoid interjections like 'Wow' or 'Huh'.",

  informative: "Provide a concise and factual reply to this tweet. Share relevant information or insights. Text: '{text}'. Author: {accountName}. Exclude hashtags, emojis, or mentions. Language: {lang}. Length: {length}. Keep it gender-neutral. Avoid interjections like 'Wow' or 'Huh'.",

  witty: "Respond to this tweet with a clever and sarcastic tone. Make it dismissive or subtly mocking without being overtly rude. Text: '{text}'. Author: {accountName}. No hashtags, emojis, or mentions. Language: {lang}. Length: {length}. Keep it gender-neutral. Avoid interjections like 'Wow' or 'Huh'."
};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "generateReply") {
    const { text, tone, lang, length, accountName } = message;

    chrome.storage.sync.get("apiKey", (data) => {
      const apiKey = data.apiKey || "YOUR_API_KEY"; // Replace with your actual API key for testing

      if (!apiKey) {
        console.error("Error: API key not found.");
        sendResponse({ reply: "Error: API key not set. Please enter your API key in the extension settings in the popup." });
        return;
      }

      const promptTemplate = tonePrompts[tone];
      if (!promptTemplate) {
        sendResponse({ reply: "Error: Invalid tone selected." });
        return;
      }

      const prompt = promptTemplate
        .replace("{text}", text || "No text provided")
        .replace("{length}", length || "1-2 lines")
        .replace("{lang}", lang || "same language")
        .replace("{accountName}", accountName || "User");

      const payload = {
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ]
      };

      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;

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

          if (!data?.candidates || data.candidates.length === 0) {
            console.error("Invalid or empty candidates field:", data);
            sendResponse({ reply: "Error: No AI response generated. Please try again." });
            return;
          }

          const generatedText = data.candidates[0]?.content?.parts[0]?.text || "Error: AI response missing.";
          console.log("Generated Text:", generatedText);

          sendResponse({ reply: generatedText });
        })
        .catch((error) => {
          console.error("API request failed:", error);
          sendResponse({ reply: "Error generating AI response. Please check your API key and connection." });
        });
    });

    return true; // Keeps the sendResponse channel open for async calls
  }
});