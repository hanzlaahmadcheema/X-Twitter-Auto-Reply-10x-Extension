const { getDb } = require("./db");

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

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "public, max-age=60, must-revalidate");

  let activeModels = DEFAULT_MODELS;

  try {
    const { client } = getDb();
    await client`
      CREATE TABLE IF NOT EXISTS models_config (
        id INT PRIMARY KEY DEFAULT 1,
        data JSONB NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `;

    const rows = await client`
      SELECT data FROM models_config WHERE id = 1 LIMIT 1
    `;

    if (rows && rows.length > 0 && rows[0].data) {
      activeModels = rows[0].data;
    }
  } catch (err) {
    console.error("Failed to fetch dynamic models from DB, using fallback:", err);
  }

  return res.status(200).json({
    success: true,
    timestamp: new Date().toISOString(),
    models: activeModels
  });
};
