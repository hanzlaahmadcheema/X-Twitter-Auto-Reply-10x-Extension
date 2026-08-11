document.addEventListener("DOMContentLoaded", () => {
  const newApiKeyInput = document.getElementById("newApiKey");
  const addApiKeyBtn = document.getElementById("addApiKeyBtn");
  const apiKeysContainer = document.getElementById("apiKeysContainer");
  const geminiModelSelect = document.getElementById("geminiModelSelect");
  const openaiModelSelect = document.getElementById("openaiModelSelect");
  const grokModelSelect = document.getElementById("grokModelSelect");
  const saveSettingsBtn = document.getElementById("saveSettingsBtn");
  const geminiOptions = document.getElementById("geminiOptions");
  const openaiOptions = document.getElementById("openaiOptions");
  const edenaiOptions = document.getElementById("edenaiOptions");
  const edenaiModelSelect = document.getElementById("edenaiModelSelect");
  const grokOptions = document.getElementById("grokOptions");
  const ollamaOptions = document.getElementById("ollamaOptions");
  const ollamaModelSelect = document.getElementById("ollamaModelSelect");
  const ollamaUrlInput = document.getElementById("ollamaUrlInput");
  const groqOptions = document.getElementById("groqOptions");
  const groqModelSelect = document.getElementById("groqModelSelect");
  const activateBtn = document.getElementById("activateBtn");
  const activationOverlay = document.getElementById("activationOverlay");
  const activationStatus = document.getElementById("activationStatus");
  const customPersonaInput = document.getElementById("customPersona");
  const speechLangSelect = document.getElementById("speechLang");
  const testKeyBtn = document.getElementById("testKeyBtn");
  const testOllamaBtn = document.getElementById("testOllamaBtn");
  const exportSettingsBtn = document.getElementById("exportSettingsBtn");
  const importSettingsBtn = document.getElementById("importSettingsBtn");
  const importFileInput = document.getElementById("importFileInput");
  const status = document.getElementById("status");

  let state = {
    selectedModel: "gemini", // Default model
    selectedApiKey: "",
    geminiModel: "",
    openaiModel: "",
    edenaiModel: "",
    grokModel: "",
    ollamaModel: "gemma2:9b",
    ollamaUrl: "http://127.0.0.1:11434",
    groqModel: "llama-3.3-70b-versatile",
    apiKeys: [],
    customPersona: "",
    speechLang: "en-US",
  };

  chrome.storage.local.get(["activationToken"], (data) => {
    if (!data.activationToken) {
      activationOverlay.classList.remove("hidden");
    } else {
      activationOverlay.classList.add("hidden");
    }
  });

  activateBtn.addEventListener("click", () => {
    const originalContent = activateBtn.innerHTML;
    activateBtn.innerHTML = '<i class="fas fa-circle-notch fa-spin text-lg"></i> Activating...';
    activateBtn.disabled = true;
    activateBtn.classList.add("opacity-70", "cursor-not-allowed");

    // Replace with your actual deployed netlify URL
    const authUrl = "https://x-reply-auth-backend.netlify.app/.netlify/functions/auth?prompt=select_account&redirect_uri=" + encodeURIComponent(chrome.identity.getRedirectURL());
    chrome.identity.launchWebAuthFlow(
      { url: authUrl, interactive: true },
      (redirectUrl) => {
        activateBtn.innerHTML = originalContent;
        activateBtn.disabled = false;
        activateBtn.classList.remove("opacity-70", "cursor-not-allowed");

        if (chrome.runtime.lastError || !redirectUrl) {
          activationStatus.textContent = "Activation failed. Try again.";
          activationStatus.style.color = "#e0245e";
          return;
        }
        
        const url = new URL(redirectUrl);
        const token = url.searchParams.get("token");
        const error = url.searchParams.get("error");
        
        if (error) {
          activationStatus.textContent = "Unauthorized email.";
          activationStatus.style.color = "#e0245e";
        } else if (token) {
          chrome.storage.local.set({ activationToken: token }, () => {
            activationStatus.textContent = "Activated successfully!";
            activationStatus.style.color = "#17bf63";
            setTimeout(() => activationOverlay.classList.add("hidden"), 1500);
          });
        }
      }
    );
  });

  // Logout logic
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      chrome.storage.local.remove(["activationToken"], () => {
        activationOverlay.classList.remove("hidden");
        activationStatus.textContent = "";
      });
    });
  }

  // Setup WhatsApp Support Link dynamically
  const parseJwt = (token) => {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
      return null;
    }
  };

  const setWaLink = (name, email) => {
    const msg = `Hey Hanzla!\n\nContacting you regarding the X-Reply Agent extension. I would appreciate your help setting it up!\n\nMy Name: ${name}\nMy Email: ${email}\nAnyDesk Address: [Optional: write your address]`;
    const encodedMsg = encodeURIComponent(msg);
    const url = `https://wa.me/923266900001?text=${encodedMsg}`;
    
    const waLink = document.getElementById("whatsappLink");
    const waQr = document.getElementById("whatsappQrCode");
    
    if (waLink) waLink.href = url;
    if (waQr) waQr.src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(url)}`;
  };

  const setupWhatsAppLink = () => {
    chrome.storage.local.get(["activationToken"], (data) => {
      let email = "[Write your email]";
      let name = "[Write your name]"; 
      
      if (data.activationToken) {
        const payload = parseJwt(data.activationToken);
        if (payload) {
          if (payload.email) email = payload.email;
          if (payload.name) name = payload.name;
        }
      }

      if (email === "[Write your email]") {
        chrome.identity.getProfileUserInfo({ accountStatus: "ANY" }, (userInfo) => {
          if (userInfo && userInfo.email) email = userInfo.email;
          setWaLink(name, email);
        });
      } else {
        setWaLink(name, email);
      }
    });
  };
  setupWhatsAppLink();

  // Restore saved settings
  chrome.storage.sync.get(
    ["selectedModel", "selectedApiKey", "geminiModel", "openaiModel", "edenaiModel", "grokModel", "ollamaModel", "ollamaUrl", "groqModel", "apiKeys", "customPersona", "speechLang"],
    (data) => {
      state = { ...state, ...data };

      // Restore selected model
      document.querySelector(`input[name="model"][value="${state.selectedModel}"]`).checked = true;
      toggleModelSpecificOptions(state.selectedModel);

      // Render API keys for selected model
      renderApiKeys(state.apiKeys, state.selectedApiKey, state.selectedModel);

      // Restore model-specific selections
      if (state.selectedModel === "gemini" && state.geminiModel) {
        geminiModelSelect.value = state.geminiModel;
      }

      if (state.selectedModel === "openai" && state.openaiModel) {
        openaiModelSelect.value = state.openaiModel;
      }

      if (state.selectedModel === "edenai" && state.edenaiModel) {
        edenaiModelSelect.value = state.edenaiModel;
      }

      if (state.selectedModel === "grok" && state.grokModel) {
        grokModelSelect.value = state.grokModel;
      }

      if (state.selectedModel === "ollama") {
        if (state.ollamaModel) ollamaModelSelect.value = state.ollamaModel;
        if (state.ollamaUrl) ollamaUrlInput.value = state.ollamaUrl;
      }

      if (state.selectedModel === "groq" && state.groqModel) {
        groqModelSelect.value = state.groqModel;
      }

      // Restore persona and language
      if (state.customPersona) customPersonaInput.value = state.customPersona;
      if (state.speechLang) speechLangSelect.value = state.speechLang;
    }
  );

  // Add new API key
  addApiKeyBtn.addEventListener("click", () => {
    const newApiKey = newApiKeyInput.value.trim();

    if (newApiKey) {
      const model = prompt("Which model is this API key for? (gemini/grok/openai/groq/edenai)").toLowerCase();
      if (!["gemini", "grok", "openai", "groq", "edenai"].includes(model)) {
        status.textContent = "Invalid model selected.";
        return;
      }

      chrome.storage.sync.get("apiKeys", (data) => {
        const apiKeys = data.apiKeys || [];
        if (apiKeys.some((key) => key.key === newApiKey && key.model === model)) {
          status.textContent = "API key already exists for this model.";
          return;
        }

        const apiKeyName = prompt("Enter a name for this API key:", "My API Key");
        if (!apiKeyName) return;

        apiKeys.push({ key: newApiKey, name: apiKeyName, model: model });
        chrome.storage.sync.set({ apiKeys }, () => {
          renderApiKeys(apiKeys, newApiKey, model);
          status.textContent = "API key added!";
          setTimeout(() => (status.textContent = ""), 2000);
        });
      });
    }

    newApiKeyInput.value = "";
  });



  // Save settings
  saveSettingsBtn.addEventListener("click", () => {
    const selectedApiKey = document.querySelector('input[name="apiKey"]:checked')?.value;
    const geminiModel = geminiModelSelect.value;
    const openaiModel = openaiModelSelect.value;
    const edenaiModel = edenaiModelSelect.value;
    const grokModel = grokModelSelect.value;
    const ollamaModel = ollamaModelSelect.value;
    const ollamaUrl = ollamaUrlInput.value.trim() || "http://localhost:11434";
    const groqModel = groqModelSelect.value;
    const customPersona = customPersonaInput.value.trim();
    const speechLang = speechLangSelect.value;

    chrome.storage.sync.set(
      { selectedApiKey, selectedModel: state.selectedModel, geminiModel, openaiModel, edenaiModel, grokModel, ollamaModel, ollamaUrl, groqModel, customPersona, speechLang },
      () => {
        status.textContent = "Settings saved!";
        setTimeout(() => (status.textContent = ""), 2000);
      }
    );
    if (window.location.href === "https://x.com" || window.location.href === "https://twitter.com") {
      window.location.reload();
    }
  });

  testKeyBtn.addEventListener("click", () => {
    const selectedApiKey = document.querySelector('input[name="apiKey"]:checked')?.value;
    if (!selectedApiKey) {
      showStatus("Please select an API key first", "#f45d22");
      return;
    }
    showStatus("Testing key...", "#1da1f2");
    chrome.runtime.sendMessage({
      action: "testConnection",
      model: state.selectedModel,
      key: selectedApiKey
    }, (response) => {
      if (response?.success) showStatus("✅ Key is valid!", "#17bf63");
      else showStatus("❌ Error: " + (response?.error || "Unknown"), "#e0245e");
    });
  });

  testOllamaBtn.addEventListener("click", () => {
    const url = ollamaUrlInput.value.trim() || "http://127.0.0.1:11434";
    showStatus("Testing Ollama...", "#1da1f2");
    chrome.runtime.sendMessage({
      action: "testConnection",
      model: "ollama",
      url: url
    }, (response) => {
      if (response?.success) showStatus("✅ Ollama is online!", "#17bf63");
      else showStatus("❌ Error: " + (response?.error || "Connection failed"), "#e0245e");
    });
  });

  function showStatus(text, color) {
    status.textContent = text;
    status.style.color = color;
    setTimeout(() => {
      status.textContent = "";
    }, 4000);
  }

  // Backup & Restore Logic
  exportSettingsBtn.addEventListener("click", () => {
    chrome.storage.sync.get(null, (data) => {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `twitter_reply_settings_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showStatus("✅ Backup downloaded!", "#17bf63");
    });
  });

  importSettingsBtn.addEventListener("click", () => importFileInput.click());

  importFileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        chrome.storage.sync.clear(() => {
          chrome.storage.sync.set(data, () => {
            showStatus("✅ Settings restored! Reloading...", "#17bf63");
            setTimeout(() => window.location.reload(), 1500);
          });
        });
      } catch (err) {
        showStatus("❌ Invalid backup file", "#e0245e");
      }
    };
    reader.readAsText(file);
  });

  // Handle model selection changes
  document.querySelectorAll('input[name="model"]').forEach((radio) => {
    radio.addEventListener("change", (e) => {
      state.selectedModel = e.target.value;
      chrome.storage.sync.set({ selectedModel: state.selectedModel }, () => {
        toggleModelSpecificOptions(state.selectedModel);
        renderApiKeysForSelectedModel(state.selectedModel);
      });
    });
  });

  // Save model selections
  geminiModelSelect.addEventListener("change", () => {
    state.geminiModel = geminiModelSelect.value;
    chrome.storage.sync.set({ geminiModel: state.geminiModel });
  });

  openaiModelSelect.addEventListener("change", () => {
    state.openaiModel = openaiModelSelect.value;
    chrome.storage.sync.set({ openaiModel: state.openaiModel });
  });

  edenaiModelSelect.addEventListener("change", () => {
    state.edenaiModel = edenaiModelSelect.value;
    chrome.storage.sync.set({ edenaiModel: state.edenaiModel });
  });

  grokModelSelect.addEventListener("change", () => {
    state.grokModel = grokModelSelect.value;
    chrome.storage.sync.set({ grokModel: state.grokModel });
  });

  ollamaModelSelect.addEventListener("change", () => {
    state.ollamaModel = ollamaModelSelect.value;
    chrome.storage.sync.set({ ollamaModel: state.ollamaModel });
  });

  ollamaUrlInput.addEventListener("input", () => {
    state.ollamaUrl = ollamaUrlInput.value.trim();
    chrome.storage.sync.set({ ollamaUrl: state.ollamaUrl });
  });

  groqModelSelect.addEventListener("change", () => {
    state.groqModel = groqModelSelect.value;
    chrome.storage.sync.set({ groqModel: state.groqModel });
  });

  // Render API keys for selected model
  function renderApiKeysForSelectedModel(model) {
    chrome.storage.sync.get("apiKeys", (data) => {
      renderApiKeys(data.apiKeys || [], state.selectedApiKey, model);
    });
  }

  // Render API keys
  function renderApiKeys(apiKeys, selectedApiKey, model) {
    apiKeysContainer.innerHTML = ""; // Clear container

    const filteredKeys = apiKeys.filter((key) => key.model === model);
    if (filteredKeys.length > 0) {
      filteredKeys.forEach(({ key, name }) => {
        const keyDiv = document.createElement("div");
        keyDiv.className = "api-key-item";

        // Mask the key: show first 6 and last 4 chars
        const maskedKey = key.length > 10
          ? `${key.substring(0, 6)}...${key.substring(key.length - 4)}`
          : "********";

        keyDiv.innerHTML = `
          <input type="radio" name="apiKey" value="${key}" ${key === selectedApiKey ? "checked" : ""
          }>
          <div class="flex flex-col flex-1 truncate ml-2">
            <span class="text-sm font-bold text-twitter-text truncate">${name}</span>
            <span class="text-[10px] text-twitter-text-secondary font-mono">${maskedKey}</span>
          </div>
          <div class="flex gap-1 ml-auto">
            <button class="edit-api-key-btn p-2 hover:bg-white/10 rounded-lg transition-all" data-key="${key}" data-name="${name}">
              <i class="fas fa-edit text-twitter-text-secondary text-xs"></i>
            </button>
            <button class="delete-api-key-btn p-2 hover:bg-white/10 rounded-lg transition-all" data-key="${key}">
              <i class="fas fa-trash-alt text-twitter-text-secondary text-xs"></i>
            </button>
          </div>
        `;

        apiKeysContainer.appendChild(keyDiv);
      });

      apiKeysContainer.querySelectorAll(".edit-api-key-btn").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          const keyToEdit = e.target.closest("button").dataset.key;
          const nameToEdit = e.target.closest("button").dataset.name;

          const newKey = prompt("Edit API Key:", keyToEdit);
          const newName = prompt("Edit API Key Name:", nameToEdit);

          if (newKey && newName) {
            chrome.storage.sync.get("apiKeys", (data) => {
              const apiKeys = data.apiKeys.map((api) =>
                api.key === keyToEdit ? { key: newKey, name: newName, model: model } : api
              );

              chrome.storage.sync.set({ apiKeys }, () => {
                renderApiKeys(apiKeys, selectedApiKey, model);
                status.textContent = "API key updated!";
                setTimeout(() => (status.textContent = ""), 2000);
              });
            });
          }
        });
      });


      apiKeysContainer.querySelectorAll(".delete-api-key-btn").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          const keyToDelete = e.target.dataset.key;
          chrome.storage.sync.get("apiKeys", (data) => {
            const apiKeys = data.apiKeys.filter((api) => api.key !== keyToDelete);
            chrome.storage.sync.set({ apiKeys }, () => {
              renderApiKeys(apiKeys, null, model);
              status.textContent = "API key deleted!";
              setTimeout(() => (status.textContent = ""), 2000);
            });
          });
        });
      });
    } else {
      apiKeysContainer.innerHTML = "<p>No API keys available for this model.</p>";
    }
  }

  // Toggle options based on selected model
  function toggleModelSpecificOptions(model) {
    geminiOptions.style.display = model === "gemini" ? "block" : "none";
    grokOptions.style.display = model === "grok" ? "block" : "none";
    openaiOptions.style.display = model === "openai" ? "block" : "none";
    edenaiOptions.style.display = model === "edenai" ? "block" : "none";
    ollamaOptions.style.display = model === "ollama" ? "block" : "none";
    groqOptions.style.display = model === "groq" ? "block" : "none";
  }



});