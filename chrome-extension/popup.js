document.addEventListener("DOMContentLoaded", () => {
  const newApiKeyInput = document.getElementById("newApiKey");
  const addApiKeyBtn = document.getElementById("addApiKeyBtn");
  const apiKeysContainer = document.getElementById("apiKeysContainer");
  const geminiModelSelect = document.getElementById("geminiModelSelect");
  const grokModelSelect = document.getElementById("grokModelSelect");
  const saveSettingsBtn = document.getElementById("saveSettingsBtn");
  const geminiRadio = document.getElementById("geminiRadio");
  const grokRadio = document.getElementById("grokRadio");
  const geminiOptions = document.getElementById("geminiOptions");
  const grokOptions = document.getElementById("grokOptions");
  const alarmTypeRadios = document.querySelectorAll('input[name="alarmType"]');
  const alarmTimeInput = document.getElementById("alarmTime");
  const enableAlarmCheckbox = document.getElementById("enableAlarm");
  const stopAlarmButton = document.getElementById("stopAlarm");
  const colorSelect = document.getElementById("colorSelect");
  const status = document.getElementById("status");

  let state = {
    selectedModel: "gemini", // Default model
    selectedApiKey: "",
    geminiModel: "",
    grokModel: "",
    apiKeys: [],
  };

  // Restore saved settings
  chrome.storage.sync.get(
    ["selectedModel", "selectedApiKey", "geminiModel", "grokModel", "apiKeys", "selectedColor"],
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
      if (state.selectedModel === "grok" && state.grokModel) {
        grokModelSelect.value = state.grokModel;
      }

      // Restore selected color
      if (state.selectedColor) {
        colorSelect.value = state.selectedColor;
        updateColor(state.selectedColor);
      }
    }
  );

  // Add new API key
  addApiKeyBtn.addEventListener("click", () => {
    const newApiKey = newApiKeyInput.value.trim();

    if (newApiKey) {
      const model = prompt("Which model is this API key for? (gemini/grok)").toLowerCase();
      if (model !== "gemini" && model !== "grok") {
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
    const grokModel = grokModelSelect.value;
    const selectedColor = colorSelect.value;

    chrome.storage.sync.set(
      { selectedApiKey, selectedModel: state.selectedModel, geminiModel, grokModel, selectedColor },
      () => {
        updateColor(selectedColor);
        status.textContent = "Settings saved!";
        setTimeout(() => (status.textContent = ""), 2000);
      }
    );
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

  grokModelSelect.addEventListener("change", () => {
    state.grokModel = grokModelSelect.value;
    chrome.storage.sync.set({ grokModel: state.grokModel });
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

        keyDiv.innerHTML = `
          <input type="radio" name="apiKey" value="${key}" ${
          key === selectedApiKey ? "checked" : ""
        }>
          <span class="api-key-name">${name}</span>
          <button class="edit-api-key-btn" data-key="${key}" data-name="${name}">
            <i class="fas fa-edit"></i>
          </button>
          <button class="delete-api-key-btn" data-key="${key}">
            <i class="fas fa-trash-alt"></i>
          </button>
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
    } else if (model === "grok") {
      geminiOptions.style.display = "none";
      grokOptions.style.display = "block";
    }
  }

  let alarmSettings = {
    alarmType: "onGenerate", // Default to "Notify on Generate"
    alarmTime: 5, // Default time in minutes
    alarmEnabled: false, // Default alarm disabled
  };

  // Restore saved settings
  chrome.storage.sync.get(["alarmType", "alarmTime", "alarmEnabled"], (data) => {
    alarmSettings = { ...alarmSettings, ...data };

    // Restore alarm type
    document.querySelector(`input[name="alarmType"][value="${alarmSettings.alarmType}"]`).checked = true;

    // Restore alarm time
    alarmTimeInput.value = alarmSettings.alarmTime;

    // Restore enable alarm checkbox
    enableAlarmCheckbox.checked = alarmSettings.alarmEnabled;

    console.log("Restored alarm settings:", alarmSettings);
  });

  // Save settings
  saveSettingsBtn.addEventListener("click", () => {
    const selectedAlarmType = document.querySelector('input[name="alarmType"]:checked').value;
    const alarmTime = parseInt(alarmTimeInput.value, 10);
    const alarmEnabled = enableAlarmCheckbox.checked;

    // Update settings
    chrome.storage.sync.set(
      {
        alarmType: selectedAlarmType,
        alarmTime: alarmTime,
        alarmEnabled: alarmEnabled,
      },
      () => {
        status.textContent = "Alarm settings saved!";
        setTimeout(() => (status.textContent = ""), 2000);

        console.log("Alarm settings saved:", {
          alarmType: selectedAlarmType,
          alarmTime,
          alarmEnabled,
        });
      }
    );
  });

  // Handle "Stop Alarm" button click
  stopAlarmButton.addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: "stopAlarm" }, () => {
      status.textContent = "Alarm stopped!";
      setTimeout(() => (status.textContent = ""), 2000);

      console.log("Stop alarm request sent to background script.");
    });
  });

  // Debugging logs for user interactions
  enableAlarmCheckbox.addEventListener("change", () => {
    console.log("Alarm enabled status changed:", enableAlarmCheckbox.checked);
  });

  alarmTimeInput.addEventListener("input", () => {
    console.log("Alarm time updated to (minutes):", alarmTimeInput.value);
  });

  alarmTypeRadios.forEach((radio) => {
    radio.addEventListener("change", () => {
      console.log("Alarm type selected:", radio.value);
    });
  });

  // Update color dynamically
  function updateColor(color) {
    document.documentElement.style.setProperty("--model-color", color);
  }
});
