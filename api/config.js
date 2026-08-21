const { getDb } = require("./db");

const DEFAULT_FEATURES = {
  extensionEnabled: true,
  enableVoiceInput: true,
  enableSelectionMenu: true,
  enableScreenshot: true,
  maxDailyRepliesPerUser: 100
};

const DEFAULT_MODELS = {
  gemini: {
    name: "Google Gemini",
    tier: "FREE",
    keyRequired: true,
    models: [
      "gemini-3.7-flash",
      "gemini-3.6-flash",
      "gemini-3.5-flash",
      "gemini-3.5-flash-lite",
      "gemini-3.1-flash-lite"
    ]
  },
  groq: {
    name: "Groq",
    tier: "FREE",
    keyRequired: true,
    models: [
      "openai/gpt-oss-120b",
      "qwen/qwen-3.6-27b"
    ]
  },
  ollama: {
    name: "Ollama",
    tier: "FREE",
    keyRequired: false,
    models: [
      "gemma2:9b",
      "llama3",
      "mistral",
      "phi3"
    ]
  },
  grok: {
    name: "xAI Grok",
    tier: "PAID",
    keyRequired: true,
    models: [
      "grok-2-1212",
      "grok-beta"
    ]
  },
  openai: {
    name: "OpenAI",
    tier: "PAID",
    keyRequired: true,
    models: [
      "gpt-4o",
      "gpt-4o-mini"
    ]
  }
};

const DEFAULT_TONES = [
  { id: "encouraging", label: "Encouraging", icon: "far fa-lightbulb", prompt: "Write a motivating and uplifting reply to tweet, using positive language that inspires confidence. Avoid excessive praise—keep it meaningful." },
  { id: "polite", label: "Polite", icon: "far fa-handshake", prompt: "Write a respectful and courteous reply to tweet. Maintain a thoughtful and considerate tone, even in disagreement." },
  { id: "playful", label: "Playful", icon: "fas fa-gamepad", prompt: "Reply to tweet with a fun and energetic tone. Keep it lighthearted and engaging without being off-topic. Ensure the response adds to the conversation in a creative way." },
  { id: "engaging", label: "Engaging", icon: "far fa-comment-dots", prompt: "Encourage interaction with an open-ended question or discussion in reply to tweet. Keep it inviting and natural. Stay focused on the topic without unnecessary diversions." },
  { id: "curious", label: "Curious", icon: "fas fa-question", prompt: "Ask a thoughtful and relevant question in response to tweet, encouraging elaboration. Keep it open-ended and directly related to the tweet." },
  { id: "neutral", label: "Neutral", icon: "fas fa-circle", prompt: "Reply to tweet with a balanced and objective response. Keep it clear, concise, and neutral without unnecessary elaboration or personal opinions." },
  { id: "witty", label: "Witty", icon: "fas fa-bolt", prompt: "Respond with clever wordplay or sharp, intelligent humor that lands naturally. Stay relevant and avoid forced cleverness. Make the reply engaging and memorable while keeping the point clear and intact." },
  { id: "joking", label: "Joking", icon: "far fa-laugh-squint", prompt: "Craft a lighthearted, teasing reply to the tweet using friendly, good-natured humor. Keep the tone fun and relaxed, never offensive or mean-spirited. The joke should feel natural and relevant to the tweet, not forced or overly familiar. Stay concise, playful, and easygoing." },
  { id: "quirky", label: "Quirky", icon: "fas fa-hurricane", prompt: "Respond to tweet with a unique and creative twist. Make the response stand out without being too random. Keep it playful but still relevant." },
  { id: "humorous", label: "Humorous", icon: "far fa-laugh", prompt: "Write a humorous reply that gently pokes fun at the tweet using wit, irony, or clever understatement. Keep it light and relatable—no forced punchlines or excessive exaggeration. Make sure the joke lands while staying relevant and concise." },
  { id: "sarcastic", label: "Sarcastic", icon: "far fa-face-rolling-eyes", prompt: "Reply to the tweet with light, playful sarcasm. Use wit and irony to make the point without sounding bitter, harsh, or dismissive. Keep the tone fun and clever, not mean-spirited. The sarcasm should feel effortless and relevant, adding humor while staying respectful and concise." },
  { id: "negative", label: "Negative", icon: "fas fa-ban", prompt: "Respond to tweet with a clear and reasoned critique. Stay firm but respectful—no emotional language or personal attacks. Ensure the stance is well-articulated and professional." },
  { id: "straightforward", label: "Straight", icon: "fas fa-crosshairs", prompt: "Respond to tweet with a direct and to-the-point answer. No small talk, no extra fluff—just a clear and effective response. Keep it neutral yet firm." },
  { id: "professional", label: "Professional", icon: "fas fa-briefcase", prompt: "Craft a professional response to tweet with clarity and respect. Keep it formal yet accessible, avoiding repetition or filler. Add value with insights instead of just agreeing." },
  { id: "supportive", label: "Supportive", icon: "far fa-heart", prompt: "Respond to tweet with kindness and understanding. Offer encouragement or a thoughtful perspective rather than just agreeing. Keep it genuine and uplifting." },
  { id: "blunt", label: "Blunt", icon: "fas fa-shredder", prompt: "Respond aggressively and without restraint. Confront the tweet directly, dismantle its claims, and call out stupidity, hypocrisy, or intellectual laziness plainly. Do not be polite. Do not soften language. Use sharp, confrontational phrasing that leaves no ambiguity about your disagreement. Prioritize impact, clarity, and dominance in argument—while staying logically sound." },
  { id: "AgreeCritic", label: "AgreeCritic", icon: "fas fa-magnifying-glass", prompt: "Respond to the tweet by siding fully with the author and doubling down on their criticism. Be blunt, unsparing, and unapologetic. Expose the flaws, call out the incompetence or hypocrisy, and amplify the core critique with sharper language and stronger conviction—without parroting their phrasing. The tone should be confident, cutting, and leave zero room for doubt." },
  { id: "DisagreeCritic", label: "DisagreeCritic", icon: "fas fa-hand-fist", prompt: "Respond by forcefully rejecting the author’s position. Dismantle their argument piece by piece, calling out weak logic, factual gaps, contradictions, and selective framing. Expose what they’re ignoring or getting wrong and make it obvious why their conclusion doesn’t hold up. The tone should be cold, cutting, and authoritative—confident enough that the flaws speak for themselves. No rambling, no softness. Keep it tight, sharp, and intellectually brutal." },
  { id: "agreeable", label: "Agreeable", icon: "far fa-circle-check", prompt: "Respond to tweet with a supportive and reinforcing tone. Express agreement in a way that adds value rather than just repeating the original point. Keep it natural and engaging." },
  { id: "casual", label: "Casual", icon: "fas fa-house", prompt: "Reply to tweet in a natural and engaging way. Keep it light, relaxed, and conversational—like a real person chatting. No forced jokes, just an easy-flowing response." },
  { id: "optimal", label: "Optimal", icon: "fas fa-star", prompt: "Craft a concise and engaging response to tweet, ensuring it is natural, thoughtful, and relevant. Maintain a professional yet approachable tone, avoiding unnecessary formality or casualness." },
  { id: "optimistic", label: "Optimistic", icon: "fas fa-sun", prompt: "Respond to tweet with a positive and hopeful tone, focusing on opportunities and bright sides. Keep it uplifting without being unrealistic." },
  { id: "grateful", label: "Grateful", icon: "fas fa-hands-clasping", prompt: "Express sincere appreciation in response to tweet. Keep it heartfelt and genuine rather than generic." },
  { id: "inspirational", label: "Inspirational", icon: "fas fa-feather", prompt: "Write an inspiring response to tweet, using meaningful language to uplift and empower. Avoid clichés—keep it authentic." },
  { id: "informative", label: "Informative", icon: "fas fa-info-circle", prompt: "Provide a clear and factual reply to tweet, focusing on educating or clarifying without unnecessary complexity." },
  { id: "insightful", label: "Insightful", icon: "fas fa-brain", prompt: "Offer a thoughtful and insightful response to tweet, adding depth to the conversation with meaningful observations. Avoid redundancy." },
  { id: "empathetic", label: "Empathetic", icon: "fas fa-hand-holding-heart", prompt: "Show understanding and compassion in your reply to tweet, acknowledging emotions or experiences respectfully." }
];

const DEFAULT_LENGTHS = [
  { id: "short", label: "Short", icon: "fas fa-bolt", value: "short but impactful, up to 50 characters" },
  { id: "as_tweet", label: "As Tweet", icon: "fas fa-ruler", value: "match the typical tweet length" },
  { id: "lengthy", label: "Lengthy", icon: "fas fa-scroll", value: "sufficient for a lengthy message" },
  { id: "range_5_200", label: "5-200 Ch", icon: "far fa-comment", value: "between 5 and 200 characters" },
  { id: "range_100_400", label: "100-400 Ch", icon: "far fa-file-lines", value: "between 100 and 400 characters" }
];

const DEFAULT_LANGUAGES = [
  { id: "auto", label: "Auto-Detect Tweet Language", code: "auto", prompt: "The response language should strictly match the language of the tweet." },
  { id: "en-US", label: "English (US)", code: "en-US", prompt: "Respond in clear, natural English." },
  { id: "ur-PK", label: "Urdu (Pakistan)", code: "ur-PK", prompt: "Respond in natural, conversational Urdu (اردو)." },
  { id: "hi-IN", label: "Hindi (India)", code: "hi-IN", prompt: "Respond in natural, conversational Hindi (हिंदी)." },
  { id: "es-ES", label: "Spanish", code: "es-ES", prompt: "Respond in clear, natural Spanish (Español)." },
  { id: "fr-FR", label: "French", code: "fr-FR", prompt: "Respond in clear, natural French (Français)." },
  { id: "ar-SA", label: "Arabic", code: "ar-SA", prompt: "Respond in clear, natural Arabic (العربية)." },
  { id: "de-DE", label: "German", code: "de-DE", prompt: "Respond in clear, natural German (Deutsch)." }
];

const DEFAULT_SYSTEM_PROMPT = `You are a human — crafting natural, thoughtful, and human-like replies on X (Twitter).

**Your Identity:** {{persona}}
**Desired Tone:** {{tone}}

{{personalityProfile}}

**Context:**
- Replying to: {{accountName}}
- Language: {{lang}}
- Length: {{length}}

**Strict Guidelines:**
- NO hashtags, NO emojis, NO "Wow" or "Huh" interjections.
- NO automated-sounding phrases like "You are correct" or "بلکل درست فرمایا".
- SOUND human and handwritten. Never mention you are an AI.
- Base the reply directly on the tweet's real-time context.
{{customPrompt}}`;

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "public, max-age=60, must-revalidate");

  const config = {
    features: DEFAULT_FEATURES,
    models: DEFAULT_MODELS,
    tones: DEFAULT_TONES,
    lengths: DEFAULT_LENGTHS,
    languages: DEFAULT_LANGUAGES,
    systemPrompt: DEFAULT_SYSTEM_PROMPT,
    notice: null
  };

  try {
    const { client } = getDb();

    // Ensure app_config table exists
    await client`
      CREATE TABLE IF NOT EXISTS app_config (
        key VARCHAR(255) PRIMARY KEY,
        data JSONB NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `;

    // Fetch all stored configs
    const rows = await client`SELECT key, data FROM app_config`;
    if (rows && rows.length > 0) {
      rows.forEach(r => {
        if (r.key && r.data) {
          config[r.key] = r.data;
        }
      });
    }

    // Also fetch notice
    const noticeRows = await client`
      SELECT id, title, description, button_text as "buttonText", button_url as "buttonUrl", enabled, updated_at as "updatedAt"
      FROM notices
      WHERE id = 1
      LIMIT 1
    `;
    if (noticeRows && noticeRows.length > 0) {
      config.notice = noticeRows[0];
    }
  } catch (err) {
    console.error("Failed to fetch full remote config from DB, using defaults:", err);
  }

  return res.status(200).json({
    success: true,
    timestamp: new Date().toISOString(),
    config
  });
};
