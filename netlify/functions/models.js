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
  },
  openai: {
    name: "OpenAI",
    tier: "PAID",
    keyRequired: true,
    models: [
      "gpt-4o",
      "gpt-4o-mini",
      "gpt-4-turbo",
      "o1",
      "o1-mini"
    ]
  },
  grok: {
    name: "Grok",
    tier: "PAID",
    keyRequired: true,
    models: [
      "grok-2-vision-1212",
      "grok-2-1212",
      "grok-vision-beta",
      "grok-beta"
    ]
  },
  edenai: {
    name: "Eden AI",
    tier: "PAID",
    keyRequired: true,
    models: [
      "openai/gpt-4o",
      "openai/gpt-4o-mini",
      "xai/grok-2",
      "anthropic/claude-3-5-sonnet"
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
