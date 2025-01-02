document.addEventListener("DOMContentLoaded", () => {
  const newApiKeyInput = document.getElementById("newApiKey");
  const addApiKeyBtn = document.getElementById("addApiKeyBtn");
  const apiKeysContainer = document.getElementById("apiKeysContainer");
  const geminiModelSelect = document.getElementById("geminiModelSelect");
  const grokModelSelect = document.getElementById("grokModelSelect");
  const saveSettingsBtn = document.getElementById("saveSettingsBtn");
  const status = document.getElementById("status");

  let selectedModel = "gemini"; // Default to Gemini

  // Restore saved settings
  chrome.storage.sync.get(
    ["apiKeys", "selectedApiKey", "selectedModel", "geminiModel", "grokModel"],
    (data) => {
      const { apiKeys, selectedApiKey, selectedModel: storedModel, geminiModel, grokModel } = data;

      if (apiKeys) renderApiKeys(apiKeys, selectedApiKey, storedModel || "gemini");

      if (storedModel) {
        selectedModel = storedModel; // Update local variable
        document.querySelector(`input[name="model"][value="${selectedModel}"]`).checked = true;
        toggleModelSpecificOptions(selectedModel); // Display correct dropdown
      }

      // Restore Gemini and Grok model selections
      if (geminiModel) geminiModelSelect.value = geminiModel;
      if (grokModel) grokModelSelect.value = grokModel;
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

    chrome.storage.sync.set(
      { selectedApiKey, selectedModel, geminiModel, grokModel },
      () => {
        status.textContent = "Settings saved!";
        setTimeout(() => (status.textContent = ""), 2000);
      }
    );
  });

  // Handle model selection changes
  document.querySelectorAll('input[name="model"]').forEach((radio) => {
    radio.addEventListener("change", (e) => {
      selectedModel = e.target.value;
      chrome.storage.sync.set({ selectedModel }, () => {
        toggleModelSpecificOptions(selectedModel);
        renderApiKeysForSelectedModel(selectedModel);
      });
    });
  });

  // Save Gemini model selection
  geminiModelSelect.addEventListener("change", () => {
    chrome.storage.sync.set({ geminiModel: geminiModelSelect.value });
  });

  // Save Grok model selection
  grokModelSelect.addEventListener("change", () => {
    chrome.storage.sync.set({ grokModel: grokModelSelect.value });
  });

  // Render API keys for selected model
  function renderApiKeysForSelectedModel(model) {
    chrome.storage.sync.get("apiKeys", (data) => {
      const apiKeys = data.apiKeys || [];
      const filteredKeys = apiKeys.filter((key) => key.model === model);
      renderApiKeys(filteredKeys, null, model);
    });
  }

  // Render API keys
  function renderApiKeys(apiKeys, selectedApiKey, model) {
    apiKeysContainer.innerHTML = ""; // Clear the container
  
    if (apiKeys.length > 0) {
      apiKeys.forEach(({ key, name }) => {
        const keyDiv = document.createElement("div");
        keyDiv.className = "api-key-item";
  
        keyDiv.innerHTML = `
          <input type="radio" name="apiKey" value="${key}" ${key === selectedApiKey ? "checked" : ""}>
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
  
      // Ensure the currently selected API key is highlighted
      const selectedRadio = apiKeysContainer.querySelector(`input[value="${selectedApiKey}"]`);
      if (selectedRadio) {
        selectedRadio.checked = true;
      }
  
      // Add event listener for editing API keys
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
  
      // Add event listener for deleting API keys
      apiKeysContainer.querySelectorAll(".delete-api-key-btn").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          const keyToDelete = e.target.closest("button").dataset.key;
  
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
  
      // Add event listener to update selected API key
      apiKeysContainer.querySelectorAll('input[name="apiKey"]').forEach((radio) => {
        radio.addEventListener("change", (e) => {
          const selectedApiKey = e.target.value;
          chrome.storage.sync.set({ selectedApiKey }, () => {
            status.textContent = "API key selection updated!";
            setTimeout(() => (status.textContent = ""), 2000);
          });
        });
      });
    } else {
      apiKeysContainer.innerHTML = "<p>No API keys available for this model.</p>";
    }
  }
  
  // Toggle model-specific options
  function toggleModelSpecificOptions(model) {
    const geminiOptions = document.getElementById("geminiOptions");
    const grokOptions = document.getElementById("grokOptions");

    if (model === "gemini") {
      geminiOptions.style.display = "block";
      grokOptions.style.display = "none";
    } else if (model === "grok") {
      geminiOptions.style.display = "none";
      grokOptions.style.display = "block";
    }

    renderApiKeysForSelectedModel(model); // Refresh API keys
  }
});
