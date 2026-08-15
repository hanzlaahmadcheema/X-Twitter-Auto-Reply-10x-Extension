const MODELS = {
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
  }
};

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "public, max-age=300");

  return res.status(200).json({
    success: true,
    timestamp: new Date().toISOString(),
    models: MODELS
  });
};
