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
  const grokOptions = document.getElementById("grokOptions");
  const ollamaOptions = document.getElementById("ollamaOptions");
  const ollamaModelSelect = document.getElementById("ollamaModelSelect");
  const ollamaUrlInput = document.getElementById("ollamaUrlInput");
  // const continuousNotificationCheckbox = document.querySelector('input[value="interval"]');
  // const alarmTimeInput = document.getElementById("alarmTime");
  // const startAlarmButton = document.getElementById("startAlarm");
  // const stopAlarmButton = document.getElementById("stopAlarm");
  // const apiKeyInput = document.getElementById("tweetpikApiKey");
  const colorSelect = document.getElementById("colorSelect");
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
    grokModel: "",
    ollamaModel: "gemma2:9b",
    ollamaUrl: "http://127.0.0.1:11434",
    apiKeys: [],
    customPersona: "",
    speechLang: "en-US",
  };

  // Restore saved settings
  chrome.storage.sync.get(
    ["selectedModel", "selectedApiKey", "geminiModel", "openaiModel", "grokModel", "ollamaModel", "ollamaUrl", "apiKeys", "selectedColor", "customPersona", "speechLang"],
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

      if (state.selectedModel === "grok" && state.grokModel) {
        grokModelSelect.value = state.grokModel;
      }

      if (state.selectedModel === "ollama") {
        if (state.ollamaModel) ollamaModelSelect.value = state.ollamaModel;
        if (state.ollamaUrl) ollamaUrlInput.value = state.ollamaUrl;
      }

      // Restore selected color
      if (state.selectedColor) {
        colorSelect.value = state.selectedColor;
        updateColor(state.selectedColor);
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
      const model = prompt("Which model is this API key for? (gemini/grok/openai)").toLowerCase();
      if (model !== "gemini" && model !== "grok" && model !== "openai") {
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

  // chrome.storage.sync.get(["tweetpikApiKey"], (data) => {
  //   if (data.tweetpikApiKey) {
  //     apiKeyInput.value = data.tweetpikApiKey;
  //   }
  // });

  // Save settings
  saveSettingsBtn.addEventListener("click", () => {
    const selectedApiKey = document.querySelector('input[name="apiKey"]:checked')?.value;
    const geminiModel = geminiModelSelect.value;
    const openaiModel = openaiModelSelect.value;
    const grokModel = grokModelSelect.value;
    const ollamaModel = ollamaModelSelect.value;
    const ollamaUrl = ollamaUrlInput.value.trim() || "http://localhost:11434";
    const selectedColor = colorSelect.value;
    const customPersona = customPersonaInput.value.trim();
    const speechLang = speechLangSelect.value;

    chrome.storage.sync.set(
      { selectedApiKey, selectedModel: state.selectedModel, geminiModel, openaiModel, grokModel, ollamaModel, ollamaUrl, selectedColor, customPersona, speechLang },
      () => {
        updateColor(selectedColor);
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
    if (model === "gemini") {
      geminiOptions.style.display = "block";
      grokOptions.style.display = "none";
      openaiOptions.style.display = "none";
    } else if (model === "grok") {
      geminiOptions.style.display = "none";
      grokOptions.style.display = "block";
      openaiOptions.style.display = "none";
    } else if (model === "openai") {
      geminiOptions.style.display = "none";
      grokOptions.style.display = "none";
      openaiOptions.style.display = "block";
      ollamaOptions.style.display = "none";
    } else if (model === "ollama") {
      geminiOptions.style.display = "none";
      grokOptions.style.display = "none";
      openaiOptions.style.display = "none";
      ollamaOptions.style.display = "block";
    }
  }

  // let alarmSettings = {
  //   alarmTime: 5, // Default time in minutes
  //   continuousNotification: false, // Default to notifications disabled
  // };

  // // Restore saved settings
  // chrome.storage.sync.get(["alarmTime", "continuousNotification"], (data) => {
  //   alarmSettings = { ...alarmSettings, ...data };

  //   // Restore alarm time
  //   alarmTimeInput.value = alarmSettings.alarmTime;

  //   // Restore checkbox state
  //   continuousNotificationCheckbox.checked = alarmSettings.continuousNotification;
  //   console.log("Restored alarm settings:", alarmSettings);
  // });

  // // Save and start alarm on clicking "Start Alarm"
  // startAlarmButton.addEventListener("click", () => {
  //   const alarmTime = parseInt(alarmTimeInput.value, 10);
  //   const continuousNotification = continuousNotificationCheckbox.checked;

  //   // Save settings
  //   chrome.storage.sync.set(
  //     {
  //       alarmTime: alarmTime,
  //       continuousNotification: continuousNotification,
  //     },
  //     () => {
  //       console.log("Alarm settings saved:", {
  //         alarmTime,
  //         continuousNotification,
  //       });

  //       if (continuousNotification) {
  //         const timeInMs = alarmTime * 60000; // Convert minutes to milliseconds
  //         chrome.runtime.sendMessage(
  //           {
  //             action: "startAlarm",
  //             time: timeInMs,
  //             type: "interval",
  //           },
  //           () => {
  //             console.log("Continuous alarm started.");
  //           }
  //         );
  //       }
  //     }
  //   );
  // });

  // // Stop alarm on clicking "Stop Alarm"
  // stopAlarmButton.addEventListener("click", () => {
  //   chrome.runtime.sendMessage({ action: "stopAlarm" }, () => {
  //     console.log("All alarms stopped.");
  //   });
  // });

  // // Event listeners for debugging
  // alarmTimeInput.addEventListener("input", () => {
  //   console.log("Alarm time updated to (minutes):", alarmTimeInput.value);
  // });

  // continuousNotificationCheckbox.addEventListener("change", () => {
  //   console.log("Continuous notification enabled:", continuousNotificationCheckbox.checked);
  // });

  // Update color dynamically
  function updateColor(color) {
    document.documentElement.style.setProperty("--model-color", color);
  }
});