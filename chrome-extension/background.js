const apiUrl = "https://api.edenai.run/v2/text/generation";

const tonePrompts = {
  straightforward: "Respond to this tweet focus on being clear and direct without embellishments or emotional language. Text: '{text}'. Author: {accountName}. No hashtags, emojis, or mentions. Language: {lang}. Length: {length}. Keep it gender-neutral. Don't use Interjections like Wow, Huh, etc.",
  negative: "Respond to this tweet critically,disagreement in a respectful manner. Text: '{text}'. Author: {accountName}. No hashtags, emojis, or mentions. Language: {lang}. Length: {length}. Keep it gender-neutral. Don't use Interjections like Wow, Huh, etc.",
  casual: "Write a short reply to this tweet in a casual manner. avoid overly formal language. Message: '{text}'. Author: {accountName}. Exclude hashtags, emojis, and mentions. Language: {lang}. Response length: {length}. Gender-neutral language only without excitement. Don't use word's like WOW, Huh, Thanks, etc.",  
  friendly: "Reply to this tweet in a warm, friendly, and welcoming way. Text: '{text}'. Author: {accountName}. Avoid using hashtags, emojis, and mentions. Language: {lang}. Response length: {length}. Gender-neutral language only. Don't use Interjections like Wow, Huh, etc.",
  professional: "Craft a reply to this tweet in a professional, respectful manners, from my perspective. Text: '{text}'. Author: {accountName}. Exclude hashtags, emojis, and mentions. Language: {lang}. Response length: {length}. Gender-neutral language only. Don't use word's like Wow, Huh, etc.",
  humorous: "Reply to this tweet with humorous touch. Text: '{text}'. Author: {accountName}. No hashtags, emojis, or mentions. Language: {lang}. Length: {length}. Keep it gender-neutral. Don't use Interjections like Wow, Huh, etc.",
  supportive: "Respond to this tweet with an encouraging and empathetic tone. Text: '{text}'. Author: {accountName}. Avoid hashtags, emojis, and mentions. Language: {lang}. Length: {length}. Use gender-neutral language. Don't use Interjections like Wow, Huh, etc.",
  curious: "Ask a thoughtful question or show interest in this tweet. Text: '{text}'. Author: {accountName}. No hashtags, emojis, or mentions. Language: {lang}. Response length: {length}. Keep it gender-neutral. Don't use Interjections like Wow, Huh, etc.",
  encouraging: "Write an uplifting reply to this tweet providing positive reinforcement. Text: '{text}'. Author: {accountName}. Exclude hashtags, emojis, and mentions. Language: {lang}. Length: {length}. Use gender-neutral language. Don't use Interjections like Wow, Huh, etc.",
  thoughtful: "Craft a reflective reply to this tweet in a meaningful way. Text: '{text}'. Author: {accountName}. No hashtags, emojis, and mentions. Language: {lang}. Response length: {length}. Gender-neutral only. Don't use Interjections like Wow, Huh, etc.",
  informative: "Provide a concise, factual reply to this tweet. Text: '{text}'. Author: {accountName}. Exclude hashtags, emojis, and mentions. Language: {lang}. Length: {length}. Keep language gender-neutral. Don't use Interjections like Wow, Huh, etc.",
  witty: "Write a reply to this tweet with a bit of sarcasm and a hint of disrespect. Respond in a way that dismisses the original tweet's importance or pokes fun at the author's opinion without being overtly rude. Text: '{text}'. Author: {accountName}. No hashtags, emojis, or mentions. Language: {lang}. Length: {length}. Keep it gender-neutral. Avoid interjections like 'Wow' or 'Huh'."
};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "generateReply") {
    const { text, tone, lang, length, accountName } = message;

    chrome.storage.sync.get("apiKey", (data) => {
      const apiKey = data.apiKey;

      if (!apiKey) {
        console.error("Error: API key not found.");
        sendResponse({ reply: "Error: API key not set. Please enter your API key in the extension settings in pop-up." });
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
        providers: ["openai"],
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
          const generatedText = data?.openai?.generated_text || "Error: AI response missing.";
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
