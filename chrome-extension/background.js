chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "generateReply") {
    chrome.storage.sync.get(
      ["selectedApiKey", "selectedModel", "geminiModel", "grokModel"],
      async (data) => {
        const { selectedApiKey, selectedModel, geminiModel, grokModel } = data;

        if (!selectedApiKey) {
          sendResponse({ error: "API key not set. Please select an API key." });
          return;
        }
        console.log(selectedApiKey);
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
console.log(prompt);
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

          sendResponse({ reply: reply || "Error: No AI response received." });
        } catch (error) {
          console.error("API Error:", error);
          sendResponse({ error: "Error generating AI response." });
        }
      }
    );

    return true;
  }
});



const tonePrompts = {
  casual: "Craft a casual and conversational response to the tweet '{text}' by {accountName}. Keep the tone light and natural, ensuring it flows well. Avoid hashtags, emojis, and interjections like 'Wow' or 'Huh'. Use the {lang} language and keep it gender-neutral. Aim for a length of approximately {length}. {customPrompt}",
  straightforward: "Compose a direct and straightforward reply to '{text}' from {accountName}. Use clear language without unnecessary elaboration. Ensure the response is gender-neutral, in {lang}, and avoids hashtags, emojis, and interjections such as 'Wow' or 'Huh'. Stick to a length of {length}. {customPrompt}",
  professional: "Develop a polished and formal response to '{text}' by {accountName}. Maintain a professional tone, using structured and articulate language. Write in {lang}, avoid hashtags, emojis, or interjections, and ensure the reply is gender-neutral. Keep it within {length}. {customPrompt}",
  friendly: "Respond warmly and positively to '{text}' by {accountName}, making the interaction feel welcoming. Use an approachable tone without hashtags, emojis, or interjections like 'Wow' or 'Huh'. Write in {lang}, keeping it gender-neutral and concise within {length}. {customPrompt}",
  supportive: "Create a supportive and empathetic reply to '{text}' by {accountName}. Show kindness and understanding while avoiding negativity. Use {lang}, and ensure the tone is gender-neutral without hashtags, emojis, or interjections like 'Huh' or 'Wow'. Stay within {length}. {customPrompt}",
  witty: "Compose a clever and witty reply to '{text}' by {accountName}. Use sharp language and wordplay to add humor or intelligence. Ensure the response is relevant, gender-neutral, in {lang}, and avoids hashtags, emojis, or interjections like 'Wow' or 'Huh'. Aim for a length of {length}. {customPrompt}",
  humorous: "Write a funny and engaging response to '{text}' from {accountName}. Incorporate playful humor and puns without being offensive. Use {lang}, and keep the reply gender-neutral. Exclude hashtags, emojis, or interjections such as 'Wow' or 'Huh'. Keep it under {length}. {customPrompt}",
  joking: "Craft a playful and teasing reply to '{text}' by {accountName}, ensuring the humor is light and friendly. Use {lang}, maintaining a gender-neutral tone. Avoid hashtags, emojis, or interjections like 'Huh' or 'Wow'. Stay within {length}. {customPrompt}",
  sarcastic: "Develop a sarcastic and humorous response to '{text}' by {accountName}. Keep the sarcasm lighthearted and relevant. Use {lang}, avoiding hashtags, emojis, or interjections like 'Wow' or 'Huh'. Keep the reply gender-neutral and concise within {length}. {customPrompt}",
  quirky: "Write a unique and quirky reply to '{text}' by {accountName}. Use creative language to make the response stand out. Ensure it’s in {lang}, gender-neutral, and free of hashtags, emojis, or interjections like 'Wow' or 'Huh'. Stay within {length}. {customPrompt}",
  encouraging: "Compose an uplifting and motivating reply to '{text}' by {accountName}. Use positive language that inspires confidence and action. Ensure the reply is gender-neutral, in {lang}, and free of hashtags, emojis, or interjections like 'Wow' or 'Huh'. Keep it concise, within {length}. {customPrompt}",
  optimistic: "Write a cheerful and optimistic reply to '{text}' by {accountName}. Focus on positivity and opportunities. Ensure it’s in {lang}, gender-neutral, and free of hashtags, emojis, or interjections like 'Huh' or 'Wow'. Stay within {length}. {customPrompt}",
  grateful: "Express genuine gratitude in response to '{text}' by {accountName}. Use heartfelt language to convey appreciation. Ensure the reply is in {lang}, gender-neutral, and excludes hashtags, emojis, or interjections like 'Huh' or 'Wow'. Aim for a length of {length} . {customPrompt}",
  inspirational: "Develop an inspirational response to '{text}' by {accountName}, using empowering and meaningful language. Write in {lang}, keeping it gender-neutral and free of hashtags, emojis, or interjections like 'Wow' or 'Huh'. Stay within {length}. {customPrompt}",
  informative: "Provide a clear and informative reply to '{text}' from {accountName}. Focus on educating or clarifying the topic in {lang}. Avoid hashtags, emojis, or interjections like 'Huh' or 'Wow'. Keep the response gender-neutral and concise within {length}. {customPrompt}",
  insightful: "Offer a thoughtful and insightful reply to '{text}' by {accountName}. Add depth to the conversation with meaningful observations. Use {lang}, and keep the tone gender-neutral without hashtags, emojis, or interjections like 'Huh' or 'Wow'. Stay within {length}. {customPrompt}",
  empathetic: "Show understanding and compassion in your reply to '{text}' by {accountName}. Acknowledge emotions or experiences respectfully. Use {lang}, ensuring the tone is gender-neutral and avoiding hashtags, emojis, or interjections like 'Huh' or 'Wow'. Keep it concise within {length}. {customPrompt}",
  curious: "Ask thoughtful questions in response to '{text}' by {accountName} to encourage elaboration. Use an inquisitive and engaging tone in {lang}, keeping it gender-neutral. Exclude hashtags, emojis, or interjections like 'Huh' or 'Wow'. Aim for {length}. {customPrompt}",
  agreeable: "Craft a reply to '{text}' by {accountName} that expresses agreement or support. Use positive and affirming language in {lang}, ensuring it’s gender-neutral and free of hashtags, emojis, or interjections like 'Wow' or 'Huh'. Keep it within {length}. {customPrompt}",
  critical: "Provide balanced and constructive feedback in response to '{text}' by {accountName}. Maintain a respectful tone in {lang}, avoiding hashtags, emojis, or interjections like 'Huh' or 'Wow'. Ensure the response is gender-neutral and concise within {length}. {customPrompt}",
  neutral: "Compose an unbiased and balanced reply to '{text}' by {accountName}. Avoid strong opinions or emotional language. Use {lang}, ensuring the tone is gender-neutral and free of hashtags, emojis, or interjections like 'Wow' or 'Huh'. Stay within {length}. {customPrompt}",
  polite: "Write a respectful and courteous reply to '{text}' by {accountName}. Maintain a considerate tone in {lang}, excluding hashtags, emojis, or interjections like 'Huh' or 'Wow'. Ensure it’s gender-neutral and concise within {length}. {customPrompt}",
  reflective: "Compose a thoughtful and reflective response to '{text}' by {accountName}, sharing meaningful insights. Use {lang}, keeping the tone gender-neutral and free of hashtags, emojis, or interjections like 'Huh' or 'Wow'. Stay within {length}. {customPrompt}",
  engaging: "Encourage interaction with an open-ended question or discussion in reply to '{text}' by {accountName}. Use an inviting tone in {lang}, avoiding hashtags, emojis, or interjections like 'Wow' or 'Huh'. Keep it gender-neutral and concise within {length}. {customPrompt}",
  playful: "Write a fun and imaginative reply to '{text}' by {accountName}, incorporating playful energy. Use {lang}, ensuring the tone is gender-neutral and avoiding hashtags, emojis, or interjections like 'Huh' or 'Wow'. Keep it concise, within {length}. {customPrompt}",
  negative: "Craft a response to '{text}' by {accountName} that conveys disagreement or critique in a firm manner. Use {lang} to articulate a clear stance without being rude or inflammatory. Avoid hashtags, emojis, or interjections like 'Huh' or 'Wow'. Ensure the reply is gender-neutral and concise within {length} characters. {customPrompt}"
};