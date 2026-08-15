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

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Allow-Methods": "GET, OPTIONS"
      },
      body: ""
    };
  }

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Cache-Control": "public, max-age=300"
    },
    body: JSON.stringify({
      success: true,
      timestamp: new Date().toISOString(),
      models: MODELS
    })
  };
};
