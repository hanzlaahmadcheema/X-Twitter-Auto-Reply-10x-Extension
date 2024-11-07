const apiUrl = "https://api.edenai.run/v2/text/generation";
const apiKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiYzk3OTQ4MjMtZTQ5OS00YzY2LWE4N2QtNzg4YzVlZWE3Y2RjIiwidHlwZSI6ImFwaV90b2tlbiJ9.ITx3xrctp6Du5gwdldI4fW5uUIVe6LZq63g3LqBO5v8";  // Replace this with your actual API key

const tonePrompts = {
  straightforward: "Respond to this tweet focus on being clear and direct without embellishments or emotional language. Text: '{text}'. Author: {accountName}. No hashtags, emojis, or mentions. Language: {lang}. Length: {length}. Keep it gender-neutral. Don't use Interjections like Wow, Huh, etc.",
  negative: "Respond to this tweet critically,disagreement in a respectful manner. Text: '{text}'. Author: {accountName}. No hashtags, emojis, or mentions. Language: {lang}. Length: {length}. Keep it gender-neutral. Don't use Interjections like Wow, Huh, etc.",
  casual: "Write a short reply to this tweet, casual manner, use a friendly tone and keep your response light-hearted. Start with a simple greeting or comment related to the original tweet, and avoid overly formal language. Message: '{text}'. Author: {accountName}. Exclude hashtags, emojis, and mentions. Language: {lang}. Response length: {length}. Gender-neutral language only. Don't use Interjections like Wow, Huh, Thanks, etc.",
  friendly: "Reply to this tweet in a warm, friendly, and welcoming way. Text: '{text}'. Author: {accountName}. Avoid using hashtags, emojis, and mentions. Language: {lang}. Response length: {length}. Gender-neutral language only. Don't use Interjections like Wow, Huh, etc.",
  professional: "Craft a reply to this tweet in a professional, respectful manners, from my perspective. Text: '{text}'. Author: {accountName}. Exclude hashtags, emojis, and mentions. Language: {lang}. Response length: {length}. Gender-neutral language only. Don't use Interjections like Wow, Huh, etc.",
  humorous: "Reply to this tweet with humorous touch. Text: '{text}'. Author: {accountName}. No hashtags, emojis, or mentions. Language: {lang}. Length: {length}. Keep it gender-neutral. Don't use Interjections like Wow, Huh, etc.",
  supportive: "Respond to this tweet with an encouraging and empathetic tone. Text: '{text}'. Author: {accountName}. Avoid hashtags, emojis, and mentions. Language: {lang}. Length: {length}. Use gender-neutral language. Don't use Interjections like Wow, Huh, etc.",
  curious: "Ask a thoughtful question or show interest in this tweet. Text: '{text}'. Author: {accountName}. No hashtags, emojis, or mentions. Language: {lang}. Response length: {length}. Keep it gender-neutral. Don't use Interjections like Wow, Huh, etc.",
  encouraging: "Write an uplifting reply to this tweet providing positive reinforcement. Text: '{text}'. Author: {accountName}. Exclude hashtags, emojis, and mentions. Language: {lang}. Length: {length}. Use gender-neutral language. Don't use Interjections like Wow, Huh, etc.",
  thoughtful: "Craft a reflective reply to this tweet in a meaningful way. Text: '{text}'. Author: {accountName}. No hashtags, emojis, and mentions. Language: {lang}. Response length: {length}. Gender-neutral only. Don't use Interjections like Wow, Huh, etc.",
  informative: "Provide a concise, factual reply to this tweet. Text: '{text}'. Author: {accountName}. Exclude hashtags, emojis, and mentions. Language: {lang}. Length: {length}. Keep language gender-neutral. Don't use Interjections like Wow, Huh, etc.",
  witty: "Write a clever, concise reply to this tweet, with a bit of humors. Text: '{text}'. Author: {accountName}. No hashtags, emojis, or mentions. Language: {lang}. Length: {length}. Keep it gender-neutral. Don't use Interjections like Wow, Huh, etc.",
};

// Unified onMessage listener for handling different actions
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "generateReply") {
    const { text, tone, lang, length, accountName } = message;
    
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
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        const generatedText = data?.openai?.generated_text || "Error: AI response missing.";
        sendResponse({ reply: generatedText });
      })
      .catch(error => {
        console.error("API request failed:", error);
        sendResponse({ reply: "Error generating AI response." });
      });

    return true; // Keeps the sendResponse channel open for async calls
  }
});
