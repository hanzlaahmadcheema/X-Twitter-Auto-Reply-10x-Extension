let alarmTimeout;
let continuousAlarmInterval;
let currentAlarmType = null; // Track the active alarm type
const DEBUG = false;
function log(...args) {
  if (DEBUG) console.log(...args);
}

const CONFIG = {
  DEFAULT_MODEL: "gemini-3.7-flash",
  GEMINI_BASE_URL: "https://generativelanguage.googleapis.com/v1beta/models/",
  GROK_BASE_URL: "https://api.x.ai/v1/chat/completions",
  EDENAI_BASE_URL: "https://api.edenai.run/v2/text/chat/",
  OPENAI_BASE_URL: "https://api.openai.com/v1/chat/completions",
  OLLAMA_BASE_URL: "http://127.0.0.1:11434",
  API_TIMEOUT: 30000,
  SYSTEM_PROMPT_TEMPLATE: (persona, tone, accountName, lang, length, customPrompt, personalityProfile) => `
    You are a human — crafting natural, thoughtful, and human-like replies on X (Twitter).
    
    **Your Identity:** ${persona || "A helpful and engaging Twitter user"}
    **Desired Tone:** ${tone}
    
    ${personalityProfile ? `**User's Authentic X Personality Profile (DO NOT DEVIATE):**\n${personalityProfile}\n` : ""}

    **Context:**
    - Replying to: ${accountName || "Unknown User"}
    - Language: ${lang}
    - Length: ${length}
    
    **Strict Guidelines:**
    - NO hashtags, NO emojis, NO "Wow" or "Huh" interjections.
    - NO automated-sounding phrases like "You are correct" or "بلکل درست فرمایا".
    - SOUND human and handwritten. Never mention you are an AI.
    - Base the reply directly on the tweet's real-time context.
    - ${customPrompt ? `Specific Instruction: ${customPrompt}` : ""}
  `,
  TONES: [
    { id: "encouraging", label: "Encouraging", icon: "far fa-lightbulb" },
    { id: "polite", label: "Polite", icon: "far fa-handshake" },
    { id: "playful", label: "Playful", icon: "fas fa-gamepad" },
    { id: "engaging", label: "Engaging", icon: "far fa-comment-dots" },
    { id: "curious", label: "Curious", icon: "fas fa-question" },
    { id: "neutral", label: "Neutral", icon: "fas fa-circle" },
    { id: "witty", label: "Witty", icon: "fas fa-bolt" },
    { id: "joking", label: "Joking", icon: "far fa-laugh-squint" },
    { id: "quirky", label: "Quirky", icon: "fas fa-hurricane" },
    { id: "humorous", label: "Humorous", icon: "far fa-laugh" },
    { id: "sarcastic", label: "Sarcastic", icon: "far fa-face-rolling-eyes" },
    { id: "negative", label: "Negative", icon: "fas fa-ban" },
    { id: "straightforward", label: "Straight", icon: "fas fa-crosshairs" },
    { id: "professional", label: "Professional", icon: "fas fa-briefcase" },
    { id: "supportive", label: "Supportive", icon: "far fa-heart" },
    { id: "blunt", label: "Blunt", icon: "fas fa-shredder" },
    { id: "AgreeCritic", label: "AgreeCritic", icon: "fas fa-magnifying-glass" },
    { id: "DisagreeCritic", label: "DisagreeCritic", icon: "fas fa-hand-fist" },
    { id: "agreeable", label: "Agreeable", icon: "far fa-circle-check" },
    { id: "casual", label: "Casual", icon: "fas fa-house" },
    { id: "optimal", label: "Optimal", icon: "fas fa-star" }
  ],
  LENGTHS: [
    { id: "short", label: "Short", icon: "fas fa-bolt", value: "short but impactful, up to 50 characters" },
    { id: "as_tweet", label: "As Tweet", icon: "fas fa-ruler", value: "match the typical tweet length" },
    { id: "lengthy", label: "Lengthy", icon: "fas fa-scroll", value: "sufficient for a lengthy message" },
    { id: "range_5_200", label: "5-200 Ch", icon: "far fa-comment", value: "between 5 and 200 characters" },
    { id: "range_100_400", label: "100-400 Ch", icon: "far fa-file-lines", value: "between 100 and 400 characters" }
  ]
};

const tonePrompts = {
  casual: "Reply to tweet in a natural and engaging way. Keep it light, relaxed, and conversational—like a real person chatting. No forced jokes, just an easy-flowing response.",

  optimal: "Craft a concise and engaging response to tweet, ensuring it is natural, thoughtful, and relevant. Maintain a professional yet approachable tone, avoiding unnecessary formality or casualness.",

  blunt: "Respond aggressively and without restraint. Confront the tweet directly, dismantle its claims, and call out stupidity, hypocrisy, or intellectual laziness plainly. Do not be polite. Do not soften language. Use sharp, confrontational phrasing that leaves no ambiguity about your disagreement. Prioritize impact, clarity, and dominance in argument—while staying logically sound.",

  AgreeCritic: "Respond to the tweet by siding fully with the author and doubling down on their criticism. Be blunt, unsparing, and unapologetic. Expose the flaws, call out the incompetence or hypocrisy, and amplify the core critique with sharper language and stronger conviction—without parroting their phrasing. The tone should be confident, cutting, and leave zero room for doubt.",

  straightforward: "Respond to tweet with a direct and to-the-point answer. No small talk, no extra fluff—just a clear and effective response. Keep it neutral yet firm.",

  professional: "Craft a professional response to tweet with clarity and respect. Keep it formal yet accessible, avoiding repetition or filler. Add value with insights instead of just agreeing.",

  DisagreeCritic: "Respond by forcefully rejecting the author’s position. Dismantle their argument piece by piece, calling out weak logic, factual gaps, contradictions, and selective framing. Expose what they’re ignoring or getting wrong and make it obvious why their conclusion doesn’t hold up. The tone should be cold, cutting, and authoritative—confident enough that the flaws speak for themselves. No rambling, no softness. Keep it tight, sharp, and intellectually brutal.",

  supportive: "Respond to tweet with kindness and understanding. Offer encouragement or a thoughtful perspective rather than just agreeing. Keep it genuine and uplifting.",

  witty: "Respond with clever wordplay or sharp, intelligent humor that lands naturally. Stay relevant and avoid forced cleverness. Make the reply engaging and memorable while keeping the point clear and intact.",

  humorous: "Write a humorous reply that gently pokes fun at the tweet using wit, irony, or clever understatement. Keep it light and relatable—no forced punchlines or excessive exaggeration. Make sure the joke lands while staying relevant and concise.",

  joking: "Craft a lighthearted, teasing reply to the tweet using friendly, good-natured humor. Keep the tone fun and relaxed, never offensive or mean-spirited. The joke should feel natural and relevant to the tweet, not forced or overly familiar. Stay concise, playful, and easygoing.",

  sarcastic: "Reply to the tweet with light, playful sarcasm. Use wit and irony to make the point without sounding bitter, harsh, or dismissive. Keep the tone fun and clever, not mean-spirited. The sarcasm should feel effortless and relevant, adding humor while staying respectful and concise.",

  quirky: "Respond to tweet with a unique and creative twist. Make the response stand out without being too random. Keep it playful but still relevant.",

  encouraging: "Write a motivating and uplifting reply to tweet, using positive language that inspires confidence. Avoid excessive praise—keep it meaningful.",

  optimistic: "Respond to tweet with a positive and hopeful tone, focusing on opportunities and bright sides. Keep it uplifting without being unrealistic.",

  grateful: "Express sincere appreciation in response to tweet. Keep it heartfelt and genuine rather than generic.",

  inspirational: "Write an inspiring response to tweet, using meaningful language to uplift and empower. Avoid clichés—keep it authentic.",

  informative: "Provide a clear and factual reply to tweet, focusing on educating or clarifying without unnecessary complexity.",

  insightful: "Offer a thoughtful and insightful response to tweet, adding depth to the conversation with meaningful observations. Avoid redundancy.",

  empathetic: "Show understanding and compassion in your reply to tweet, acknowledging emotions or experiences respectfully.",

  curious: "Ask a thoughtful and relevant question in response to tweet, encouraging elaboration. Keep it open-ended and directly related to the tweet.",

  agreeable: "Respond to tweet with a supportive and reinforcing tone. Express agreement in a way that adds value rather than just repeating the original point. Keep it natural and engaging.",

  critical: "Provide a well-reasoned critique of tweet. Be analytical, not aggressive. Keep the feedback balanced, constructive, and insightful—offering a perspective that adds value rather than just disagreeing.",

  neutral: "Reply to tweet with a balanced and objective response. Keep it clear, concise, and neutral without unnecessary elaboration or personal opinions. ",

  polite: "Write a respectful and courteous reply to tweet. Maintain a thoughtful and considerate tone, even in disagreement.",

  reflective: "Compose a deep and introspective response to tweet, adding meaningful insights. Keep it thought-provoking without being overly abstract.",

  engaging: "Encourage interaction with an open-ended question or discussion in reply to tweet. Keep it inviting and natural. Stay focused on the topic without unnecessary diversions.",

  playful: "Reply to tweet with a fun and energetic tone. Keep it lighthearted and engaging without being off-topic. Ensure the response adds to the conversation in a creative way.",

  negative: "Respond to tweet with a clear and reasoned critique. Stay firm but respectful—no emotional language or personal attacks. Ensure the stance is well-articulated and professional.",
};

const ACTION_PROMPTS = {
  improve: `
    You are an expert editor. Rewrite the provided text to be clearer, more fluent, and more natural/human-like.
    - Preserve the original meaning exactly.
    - Preserve the language of the selected text.
    - Keep the original tone as much as possible.
    - DO NOT add emojis, hashtags, or unnecessary embellishments.
    - Output ONLY the improved text.
  `,
  translate_urdu: `
    You are a professional translator. Translate the provided text into natural, conversational Urdu.
    - Use human-like phrasing, avoid robotic or literal translations.
    - Respect cultural and linguistic nuances.
    - Keep the meaning intact without being mechanical.
    - DO NOT add emojis, hashtags, or commentary.
    - Output ONLY the translated Urdu text.
  `
};

let remoteConfigCache = {
  features: { extensionEnabled: true, enableVoiceInput: true, enableSelectionMenu: true, enableScreenshot: true, maxDailyRepliesPerUser: 100 },
  tones: null,
  lengths: null,
  systemPrompt: null
};

async function syncFullConfigFromRemote() {
  try {
    const res = await fetch("https://x-twitter-auto-reply-10x-extension.vercel.app/api/config");
    if (res.ok) {
      const data = await res.json();
      if (data && data.config) {
        remoteConfigCache = data.config;
        chrome.storage.local.set({ remoteConfig: data.config });

        if (Array.isArray(data.config.tones) && data.config.tones.length > 0) {
          CONFIG.TONES = data.config.tones;
          data.config.tones.forEach(t => {
            if (t.id && t.prompt) tonePrompts[t.id] = t.prompt;
          });
        }
        if (Array.isArray(data.config.lengths) && data.config.lengths.length > 0) {
          CONFIG.LENGTHS = data.config.lengths;
        }
      }
    }
  } catch (err) {
    console.error("Failed to sync remote config:", err);
  }
}

// Initial remote config sync
syncFullConfigFromRemote();

// Helper to generate prompt
function getSystemPrompt(message, customPersona, personalityProfile) {
  if (message.selectionAction && ACTION_PROMPTS[message.selectionAction]) {
    return ACTION_PROMPTS[message.selectionAction];
  }

  const toneObj = (CONFIG.TONES || []).find(t => t.id === message.tone);
  const toneDesc = (toneObj && toneObj.prompt) || tonePrompts[message.tone] || tonePrompts.optimal || "Write in a natural tone.";
  const lengthObj = (CONFIG.LENGTHS || []).find(l => l.id === message.length) || CONFIG.LENGTHS[1];
  const langReq = message.lang || "The response language should match the tweet";
  const lengthReq = lengthObj ? lengthObj.value : "match typical tweet length";

  if (remoteConfigCache.systemPrompt) {
    let prompt = remoteConfigCache.systemPrompt;
    prompt = prompt.replace(/\{\{persona\}\}/g, customPersona || "A helpful and engaging Twitter user");
    prompt = prompt.replace(/\{\{tone\}\}/g, toneDesc);
    prompt = prompt.replace(/\{\{accountName\}\}/g, message.accountName || "Unknown User");
    prompt = prompt.replace(/\{\{lang\}\}/g, langReq);
    prompt = prompt.replace(/\{\{length\}\}/g, lengthReq);
    prompt = prompt.replace(/\{\{customPrompt\}\}/g, message.customPrompt ? `Specific Instruction: ${message.customPrompt}` : "");
    prompt = prompt.replace(/\{\{personalityProfile\}\}/g, personalityProfile ? `**User's Authentic X Personality Profile (DO NOT DEVIATE):**\n${personalityProfile}\n` : "");
    return prompt;
  }

  return CONFIG.SYSTEM_PROMPT_TEMPLATE(
    customPersona,
    toneDesc,
    message.accountName,
    langReq,
    lengthReq,
    message.customPrompt,
    personalityProfile
  );
}

// JWT Verification
async function verifyJWT(token) {
  try {
    const PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAs1jfwO+1U6khaDV+se3j
YvRQZ2RMkN1A8wLROiqdBUlR+qvrpzP5kBMUrEZE6Qhwi1/JCY4Oh1HTCUGHdduB
kSbhGOYBbQPo/8Fex9oX6LwrcNonydoA6B2o6eXfobsK8ufBzQ9lph+SsXGdmJAT
u9I2ElEzBNCA8LynxRHOZIALiczWEcn7XxOzZO12eRFcdMZyHf7LgwQV+yvoMeH5
95jyH6MS4apTjSPsbjdDDwarGVCJN4dG2qEnydPmmPwcZGY92BeWMMNoIjZLxea8
bBCc2NeWQwPPCf6dQwgeBdLj9Nr9QOIAeUHGSJrqb3b3QLlbplVg6/4G9agNPNzd
HQIDAQAB
-----END PUBLIC KEY-----`;

    const parts = token.split('.');
    if (parts.length !== 3) return false;

    const header = JSON.parse(atob(parts[0]));
    const payload = JSON.parse(atob(parts[1]));
    if (header.alg !== 'RS256') return false;

    const signature = Uint8Array.from(atob(parts[2].replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));
    const data = new TextEncoder().encode(parts[0] + '.' + parts[1]);

    const pemContents = PUBLIC_KEY.replace("-----BEGIN PUBLIC KEY-----", "").replace("-----END PUBLIC KEY-----", "").replace(/\s/g, "");
    const binaryDer = Uint8Array.from(atob(pemContents), c => c.charCodeAt(0));

    const key = await crypto.subtle.importKey(
      "spki",
      binaryDer,
      { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
      false,
      ["verify"]
    );

    const isValid = await crypto.subtle.verify("RSASSA-PKCS1-v1_5", key, signature, data);
    if (!isValid) return false;

    // Real-time verification check against Postgres backend
    try {
      const res = await fetch("https://x-twitter-auto-reply-10x-extension.vercel.app/api/status", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const statusData = await res.json();
        return statusData.verified === true;
      }
    } catch (netErr) {
      // Offline fallback: check JWT payload boolean
    }

    return payload.verified === true || payload.isActivated === true;
  } catch (e) {
    return false;
  }
}

// Streaming Support via Ports
chrome.runtime.onConnect.addListener((port) => {
  if (port.name !== "replyStreaming") return;

  port.onMessage.addListener(async (message) => {
    if (message.action === "generateReply") {
      if (remoteConfigCache.features && remoteConfigCache.features.extensionEnabled === false) {
        port.postMessage({ error: "Auto-reply generation is temporarily disabled by administrator." });
        return;
      }
      chrome.storage.local.get(["activationToken"], async (localData) => {
        if (!localData.activationToken || !(await verifyJWT(localData.activationToken))) {
          port.postMessage({ chunk: "\n\n[License Not Activated. Please activate via the extension popup.]", fullReply: "", done: true });
          return;
        }
        chrome.storage.sync.get(
          ["selectedApiKey", "selectedModel", "geminiModel", "grokModel", "openaiModel", "edenaiModel", "ollamaModel", "ollamaUrl", "groqModel", "customPersona", "personalityProfile"],
          async (data) => {
            const { selectedApiKey, selectedModel, geminiModel, grokModel, openaiModel, edenaiModel, ollamaModel, ollamaUrl, groqModel, customPersona, personalityProfile } = data;
            const systemPrompt = getSystemPrompt(message, customPersona, personalityProfile);

          try {
            if (selectedModel === "gemini") {
              const model = geminiModel || CONFIG.DEFAULT_MODEL;
              const apiUrl = `https://generativelanguage.googleapis.com/v1beta/interactions`;

              const response = await fetch(apiUrl, {
                method: "POST",
                headers: { 
                  "Content-Type": "application/json",
                  "x-goog-api-key": selectedApiKey
                },
                body: JSON.stringify({
                  model: model,
                  input: `${systemPrompt}\n\nPrompt: ${message.text}`,
                  stream: true
                })
              });

              if (!response.ok) {
                const errText = await response.text();
                console.error("[generateReply Stream] API Error:", errText);
                port.postMessage({ error: formatCleanError(errText || `API Error: ${response.status}`) });
                return;
              }

              const reader = response.body.getReader();
              const decoder = new TextDecoder();
              let fullReply = "";
              let streamBuffer = "";

              while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                streamBuffer += chunk;
                const lines = streamBuffer.split("\n");
                streamBuffer = lines.pop(); // Keep the last incomplete line in the buffer

                for (const line of lines) {
                  if (line.startsWith("data: ")) {
                    try {
                      const dataStr = line.substring(6).trim();
                      if (dataStr === "[DONE]") continue;
                      const jsonData = JSON.parse(dataStr);
                      if (jsonData.event_type === "step.delta" && jsonData.delta?.type === "text" && jsonData.delta.text) {
                        const text = jsonData.delta.text;
                        fullReply += text;
                        port.postMessage({ chunk: text, fullReply });
                      }
                    } catch (e) {
                      console.error("[generateReply Stream] JSON Parse Error on chunk line:", line, e);
                    }
                  } else if (line.trim() !== "" && !line.startsWith("event:")) {
                    console.log("[generateReply Stream] Non-data line:", line);
                  }
                }
              }
              console.log("[generateReply Stream] Finished. Full Reply:", fullReply);
              port.postMessage({ done: true, fullReply });


            } else if (selectedModel === "ollama") {
              const model = ollamaModel || "gemma2:9b";
              const baseUrl = ollamaUrl || "http://127.0.0.1:11434";
              const response = await fetch(`${baseUrl}/api/generate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  model: model,
                  system: systemPrompt,
                  prompt: message.text,
                  stream: true
                })
              });

              if (!response.ok) {
                const errText = await response.text();
                console.error("[generateReply Stream] Ollama Error:", errText);
                port.postMessage({ error: formatCleanError(errText || `Ollama Error: ${response.status}`) });
                return;
              }

              const reader = response.body.getReader();
              const decoder = new TextDecoder();
              let fullReply = "";

              while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                try {
                  const jsonData = JSON.parse(chunk);
                  if (jsonData.response) {
                    fullReply += jsonData.response;
                    port.postMessage({ chunk: jsonData.response, fullReply });
                  }
                  if (jsonData.done) break;
                } catch (e) { /* partial json */ }
              }
              port.postMessage({ done: true, fullReply });

            } else if (["groq", "openai", "grok"].includes(selectedModel)) {
              let apiUrl, model;
              if (selectedModel === "groq") {
                model = groqModel || "openai/gpt-oss-120b";
                apiUrl = "https://api.groq.com/openai/v1/chat/completions";
              } else if (selectedModel === "openai") {
                model = openaiModel || "gpt-4o";
                apiUrl = CONFIG.OPENAI_BASE_URL;
              } else if (selectedModel === "grok") {
                model = grokModel || "grok-beta";
                apiUrl = CONFIG.GROK_BASE_URL;
              }

              const response = await fetch(apiUrl, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${selectedApiKey}`,
                },
                body: JSON.stringify({
                  model: model,
                  messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: message.text },
                  ],
                  stream: true
                })
              });

              if (!response.ok) {
                const errText = await response.text();
                console.error(`[generateReply Stream] ${selectedModel} Error:`, errText);
                port.postMessage({ error: formatCleanError(errText || `${selectedModel} Error: ${response.status}`) });
                return;
              }

              const reader = response.body.getReader();
              const decoder = new TextDecoder();
              let fullReply = "";
              let streamBuffer = "";

              while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                streamBuffer += chunk;
                const lines = streamBuffer.split("\n");
                streamBuffer = lines.pop(); // Keep incomplete line

                for (const line of lines) {
                  if (line.startsWith("data: ")) {
                    const dataStr = line.substring(6).trim();
                    if (dataStr === "[DONE]") continue;
                    try {
                      const jsonData = JSON.parse(dataStr);
                      const textChunk = jsonData.choices?.[0]?.delta?.content;
                      if (textChunk) {
                        fullReply += textChunk;
                        port.postMessage({ chunk: textChunk, fullReply });
                      }
                    } catch (e) {
                      console.error(`[generateReply Stream] ${selectedModel} JSON Parse Error:`, line, e);
                    }
                  }
                }
              }
              port.postMessage({ done: true, fullReply });

            } else {
              // Fallback for other models or error
              port.postMessage({ error: "Streaming is currently not supported for this model." });
            }
          } catch (error) {
            port.postMessage({ error: error.message });
          }
        });
      });
    }
  });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "getConfig") {
    sendResponse({ tones: CONFIG.TONES, lengths: CONFIG.LENGTHS });
    return true;
  }

  if (message.action === "testConnection") {
    (async () => {
      try {
        if (message.model === "gemini") {
          const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/interactions`, {
            method: "POST",
            headers: { 
              "Content-Type": "application/json",
              "x-goog-api-key": message.key
            },
            body: JSON.stringify({ model: "gemini-3.7-flash", input: "hi" })
          });
          const data = await response.json();
          if (data.error) throw new Error(data.error.message);
          sendResponse({ success: true });
        } else if (message.model === "ollama") {
          const response = await fetch(`${message.url}/api/tags`);
          if (response.ok) sendResponse({ success: true });
          else throw new Error("Ollama not responding");
        } else if (message.model === "groq") {
          const response = await fetch("https://api.groq.com/openai/v1/models", {
            headers: { Authorization: `Bearer ${message.key}` }
          });
          const data = await response.json();
          if (data.error) throw new Error(data.error.message);
          sendResponse({ success: true });
        }
      } catch (e) {
        sendResponse({ success: false, error: e.message });
      }
    })();
    return true; // keep channel open
  }

  if (message.action === "generateReply") {
    chrome.storage.local.get(["activationToken"], async (localData) => {
      if (!localData.activationToken || !(await verifyJWT(localData.activationToken))) {
        sendResponse({ error: "License Not Activated. Please activate via the extension popup." });
        return;
      }
      chrome.storage.sync.get(
        ["selectedApiKey", "selectedModel", "geminiModel", "grokModel", "openaiModel", "edenaiModel", "ollamaModel", "ollamaUrl", "groqModel", "customPersona", "personalityProfile"],
        async (data) => {
          const { selectedApiKey, selectedModel, geminiModel, grokModel, openaiModel, edenaiModel, ollamaModel, ollamaUrl, groqModel, customPersona, personalityProfile } = data;

        if (!selectedApiKey && selectedModel !== "ollama") {
          sendResponse({ error: "API key not set. Please select an API key." });
          return;
        }

        const systemPrompt = getSystemPrompt(message, customPersona, personalityProfile);
        const prompt = message.text;

        let apiUrl, payload, headers;

        if (selectedModel === "gemini") {
          const model = geminiModel || CONFIG.DEFAULT_MODEL;
          apiUrl = `https://generativelanguage.googleapis.com/v1beta/interactions`;
          payload = {
            model: model,
            input: `${systemPrompt}\n\nPrompt: ${prompt}`
          };
          headers = { 
            "Content-Type": "application/json",
            "x-goog-api-key": selectedApiKey
          };
        } else if (selectedModel === "grok") {
          const model = grokModel || "grok-beta";
          apiUrl = "https://api.x.ai/v1/chat/completions";
          payload = {
            messages: [
              { role: "system", content: systemPrompt },
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
          const model = openaiModel || "gpt-4o";
          apiUrl = CONFIG.OPENAI_BASE_URL;
          payload = {
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: prompt },
            ],
            model: model,
            temperature: 0,
          };
          headers = {
            "Content-Type": "application/json",
            Authorization: `Bearer ${selectedApiKey}`,
          };
        } else if (selectedModel === "edenai") {
          const model = edenaiModel || "openai/gpt-4o";
          apiUrl = 'https://api.edenai.run/v2/text/chat/';
          payload = {
            response_as_dict: true,
            attributes_as_list: false,
            show_base_64: true,
            show_original_response: false,
            temperature: 0,
            max_tokens: 1000,
            providers: [`${model}`],
            text: prompt,
            chatbot_global_action: systemPrompt
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
              const responseData = data[`${model}`];
              const replyText = responseData?.standardized_response?.generated_text || responseData?.generated_text;
              if (replyText) sendResponse({ reply: replyText });
              else sendResponse({ error: 'No AI response received.' });
            })
            .catch(e => sendResponse({ error: e.message }));
          return;
        } else if (selectedModel === "ollama") {
          const model = ollamaModel || "gemma2:9b";
          const baseUrl = ollamaUrl || CONFIG.OLLAMA_BASE_URL;
          apiUrl = `${baseUrl}/api/generate`;
          payload = {
            model: model,
            prompt: prompt,
            system: systemPrompt,
            stream: false
          };
          headers = { "Content-Type": "application/json" };
        } else if (selectedModel === "groq") {
          const model = groqModel || "openai/gpt-oss-120b";
          apiUrl = "https://api.groq.com/openai/v1/chat/completions";
          payload = {
            messages: [
              { role: "system", content: systemPrompt },
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
          sendResponse({ error: "Invalid model selected." });
          return;
        }

        try {
          console.log(`[generateReply] Calling API for ${selectedModel}`);
          console.log(`[generateReply] API URL: ${apiUrl}`);
          console.log(`[generateReply] Headers:`, headers);
          console.log(`[generateReply] Payload:`, payload);

          const response = await fetch(apiUrl, {
            method: "POST",
            headers: headers,
            body: JSON.stringify(payload),
          });

          console.log(`[generateReply] API HTTP Status: ${response.status}`);
          
          const text = await response.text();
          console.log(`[generateReply] Raw Response:`, text);

          let data;
          try {
            data = JSON.parse(text);
          } catch (e) {
            console.error(`[generateReply] JSON Parse Error:`, e);
            sendResponse({ error: formatCleanError(text || `Failed to parse response`) });
            return;
          }

          if (!response.ok) {
            console.error(`[generateReply] API Error:`, data);
            const rawErr = data.error?.message || data.error || `HTTP ${response.status}`;
            sendResponse({ error: formatCleanError(rawErr) });
            return;
          }

          let reply;
          if (selectedModel === "gemini") {
            if (data?.steps) {
              const outputStep = data.steps.find(s => s.type === "model_output");
              if (outputStep?.content) {
                reply = outputStep.content.map(c => c.text || "").join("");
              }
            }
            if (!reply) {
              reply = data?.interaction?.output_text || data?.interaction?.outputText || data?.output_text || data?.outputText || (data?.candidates && data?.candidates?.[0]?.content?.parts?.[0]?.text);
            }
          } else if (selectedModel === "ollama") reply = data?.response;
          else reply = data?.choices?.[0]?.message?.content;

          console.log(`[generateReply] Extracted Reply:`, reply);

          if (reply) sendResponse({ reply: reply });
          else sendResponse({ error: formatCleanError(`${selectedModel} returned an empty response.`) });
        } catch (error) {
          console.error(`[generateReply] Caught Exception:`, error);
          sendResponse({ error: formatCleanError(error) });
        }
      });
    });
    return true; // keep channel open
  }

  if (message.action === "startAlarm") {
    const { time, type } = message;
    log(`Starting alarm. Type: ${type} | Time: ${time}ms`);

    // Check if the requested alarm type is already active
    if (currentAlarmType === type) {
      log(`Alarm of type "${type}" is already active. No need to restart.`);
      return;
    }

    // Clear existing alarms or intervals
    clearTimeout(alarmTimeout);
    clearInterval(continuousAlarmInterval);
    log("Cleared previous alarms and intervals.");

    // Set the new alarm type
    currentAlarmType = type;

    if (type === "onGenerate") {
      // One-time notification
      log("Setting a one-time alarm for 'Notify on Generate'.");
      alarmTimeout = setTimeout(() => {
        sendNotification();
        currentAlarmType = null; // Reset the current alarm type after execution
      }, time);
    } else if (type === "interval") {
      // Continuous notifications
      log("Starting a continuous notification alarm.");
      continuousAlarmInterval = setInterval(() => {
        sendNotification();
      }, time);
    }
  } else if (message.action === "stopAlarm") {
    // Stop both one-time and continuous alarms
    log("Stopping all alarms.");
    clearTimeout(alarmTimeout);
    clearInterval(continuousAlarmInterval);
    currentAlarmType = null; // Reset the current alarm type
    console.log("Alarms stopped successfully.");
  }
  if (message.action === "injectHtml2Canvas") {
    chrome.scripting.executeScript(
      {
        target: { tabId: sender.tab.id },
        files: ["libs/html2canvas.min.js"]
      },
      () => {
        if (chrome.runtime.lastError) {
          console.error("❌ Error injecting html2canvas:", chrome.runtime.lastError.message);
          sendResponse({ success: false, error: chrome.runtime.lastError.message });
        } else {
          console.log("✅ html2canvas injected successfully.");
          sendResponse({ success: true });
        }
      }
    );
    return true;
  }

  // --- Offscreen Speech Recognition Handling ---
  if (message.action === "start-recording") {
    handleOffscreenRecording("start-recording", message.lang, sender.tab.id);
    return true;
  }

  if (message.action === "stop-recording") {
    handleOffscreenRecording("stop-recording", null, sender.tab.id);
    return true;
  }
});

let creatingOffscreenParams = null; // Prevent double creation

async function handleOffscreenRecording(type, lang, tabId) {
  // Ensure offscreen document exists
  const OFFSCREEN_DOCUMENT_PATH = 'chrome-extension/offscreen.html';

  // Check if offscreen exists
  const existingContexts = await chrome.runtime.getContexts({
    contextTypes: ['OFFSCREEN_DOCUMENT'],
    documentUrls: [chrome.runtime.getURL('offscreen.html')]
  });

  if (existingContexts.length === 0) {
    // Create it
    if (creatingOffscreenParams) {
      await creatingOffscreenParams;
    } else {
      creatingOffscreenParams = chrome.offscreen.createDocument({
        url: 'offscreen.html',
        reasons: ['AUDIO_PLAYBACK'], // 'USER_MEDIA' is the correct reason but sometimes AUDIO_PLAYBACK is safer fallback in older manifest v3 implementations, but AUDIO_PLAYBACK is not for mic.
        // Actually for mic capture we need 'USER_MEDIA' reason from Chrome 116+.
        // Let's use generic or correct one.
        reasons: ['USER_MEDIA'],
        justification: 'Recording user voice for text input'
      });
      await creatingOffscreenParams;
      creatingOffscreenParams = null;
    }
  }

  // Send message to offscreen
  chrome.runtime.sendMessage({
    type: type,
    lang: lang
  });

  // We need to know which tab initiated this to send results back
  // Store acting tab ID loosely or pass it around (simplified here: assume active user flow)
  // Ideally, we'd map offscreen messages back to this tabId.
  // For now, the offscreen script sends messages via runtime.sendMessage, which we can catch here and forward to the tab.
}

// Forward messages from Offscreen -> Content Script
chrome.runtime.onMessage.addListener((message, sender) => {
  if (sender.url.includes('offscreen.html')) {
    // Determine target tab (active tab usually)
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: 'speech-data',
          data: message
        });
      }
    });
  }
});

// End of file cleanup
function sendNotification() {
  chrome.notifications.create({
    type: "basic",
    iconUrl: "icons/icon-128.png",
    title: "Twitter Engagement",
    message: "It's time to generate another reply!",
    priority: 2
  });
}

// Helper: Format technical API/Provider errors into clean, user-friendly messages
function formatCleanError(error) {
  if (!error) return "An unexpected error occurred. Please try again.";
  let message = typeof error === "string" ? error : (error.message || JSON.stringify(error));

  if (message.includes("{") && message.includes("}")) {
    try {
      const jsonStart = message.indexOf("{");
      const jsonEnd = message.lastIndexOf("}") + 1;
      const parsed = JSON.parse(message.substring(jsonStart, jsonEnd));
      if (parsed.error?.message) message = parsed.error.message;
      else if (parsed.error) message = typeof parsed.error === "string" ? parsed.error : JSON.stringify(parsed.error);
    } catch (e) {}
  }

  const lower = message.toLowerCase();

  if (lower.includes("license not activated") || lower.includes("not activated")) {
    return "License not activated. Please open the extension popup to activate.";
  }
  if (lower.includes("api key not set") || lower.includes("select an api key")) {
    return "API Key missing. Please set your API key in the extension popup.";
  }
  if (lower.includes("invalid_api_key") || lower.includes("incorrect api key") || lower.includes("401")) {
    return "Invalid API Key. Please check your key in extension settings.";
  }
  if (lower.includes("429") || lower.includes("rate_limit") || lower.includes("quota exceeded") || lower.includes("resource_exhausted")) {
    return "Rate limit or quota exceeded. Please try again in a moment.";
  }
  if (lower.includes("500") || lower.includes("502") || lower.includes("503") || lower.includes("504")) {
    return "AI Service temporarily unavailable. Please try again shortly or switch providers.";
  }
  if (lower.includes("failed to fetch") || lower.includes("networkerror") || lower.includes("net::err")) {
    return "Network error. Please check your internet connection.";
  }
  if (lower.includes("ollama error") || lower.includes("ollama not responding") || lower.includes("connection refused")) {
    return "Unable to connect to Ollama. Make sure Ollama is running locally.";
  }

  message = message.replace(/^(\w+\s*Error:\s*\d*\s*-\s*)+/i, "");
  message = message.replace(/^API Error:\s*/i, "");
  message = message.replace(/^HTTP \d+:\s*/i, "");
  message = message.trim();

  return message || "Failed to generate reply. Please try again.";
}

if (chrome.sidePanel && chrome.sidePanel.setPanelBehavior) {
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch((error) => {
    // Suppress the harmless "Error: No SW" that Chrome throws during dev mode reloads
    if (!error.message.includes("No SW")) {
      console.error(error);
    }
  });
}