const apiUrl = "https://api.edenai.run/v2/text/generation";

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
      const apiKey = data.apiKey;

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
        providers: ["google"], 
        fallback_providers: ['amazon'],
        text: prompt,
        response_as_dict: true,
        temperature: 0,
        max_tokens: 1000
      };

      fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
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
          const generatedText = data?.google?.generated_text || "Error: AI response missing. Check your API key and connection.";
          sendResponse({ reply: generatedText });
        })
        .catch((error) => {
          console.error("API request failed:", error);
          sendResponse({ reply: "Error generating AI response. Please check your API key and connection." });
        });
    });

    return true; 
  }
});
