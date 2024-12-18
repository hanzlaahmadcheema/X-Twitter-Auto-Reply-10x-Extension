document.addEventListener("DOMContentLoaded", () => {
  const newApiKeyInput = document.getElementById("newApiKey");
  const addApiKeyBtn = document.getElementById("addApiKeyBtn");
  const apiKeysContainer = document.getElementById("apiKeysContainer");
  const geminiModelSelect = document.getElementById("geminiModelSelect");
  const grokModelSelect = document.getElementById("grokModelSelect");
  const saveSettingsBtn = document.getElementById("saveSettingsBtn");
  const status = document.getElementById("status");

  let selectedModel = "gemini"; // Declare as 'let' to allow reassignment

  // Restore saved settings
  chrome.storage.sync.get(
    ["apiKeys", "selectedApiKey", "selectedModel", "geminiModel", "grokModel"],
    (data) => {
      const { apiKeys, selectedApiKey, selectedModel, geminiModel, grokModel } = data;

      if (apiKeys) renderApiKeys(apiKeys, selectedApiKey, selectedModel);
      if (selectedModel) {
        document.querySelector(`input[name="model"][value="${selectedModel}"]`).checked = true;
        toggleModelSpecificOptions(selectedModel);
      }
      if (geminiModel) geminiModelSelect.value = geminiModel;
      if (grokModel) grokModelSelect.value = grokModel;
    }
  );

  // Add new API key
  addApiKeyBtn.addEventListener("click", () => {
    const newApiKey = newApiKeyInput.value.trim();

    if (newApiKey) {
      // Prompt user to select which model the API key is for
      const model = prompt("Which model is this API key for? (gemini/grok)").toLowerCase();
      if (model !== "gemini" && model !== "grok") {
        status.textContent = "Invalid model selected.";
        return;
      }

      chrome.storage.sync.get("apiKeys", (data) => {
        const apiKeys = data.apiKeys || [];
        if (apiKeys.find((key) => key.key === newApiKey && key.model === model)) {
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

  // Toggle model-specific options
  document.querySelectorAll('input[name="model"]').forEach((radio) => {
    radio.addEventListener("change", (e) => {
      selectedModel = e.target.value;
      toggleModelSpecificOptions(selectedModel);
      renderApiKeysForSelectedModel(selectedModel);
    });
  });

  // Render API keys for selected model
  function renderApiKeysForSelectedModel(model) {
    chrome.storage.sync.get("apiKeys", (data) => {
      const apiKeys = data.apiKeys || [];
      const filteredKeys = apiKeys.filter((key) => key.model === model);
      renderApiKeys(filteredKeys, null, model);
    });
  }

  // Render API keys based on selected model
  function renderApiKeys(apiKeys, selectedApiKey, model) {
    apiKeysContainer.innerHTML = ""; // Clear the container

    if (apiKeys.length > 0) {
      // Automatically select the first API key of the selected model
      const firstKey = apiKeys[0].key;
      apiKeys.forEach(({ key, name }) => {
        const keyDiv = document.createElement("div");
        keyDiv.className = "api-key-item";

        keyDiv.innerHTML = `
          <input type="radio" name="apiKey" value="${key}" ${key === selectedApiKey || key === firstKey ? "checked" : ""}>
          <span>${name}</span>
          <button class="delete-api-key-btn" data-key="${key}">
            <i class="fas fa-trash-alt"></i>
          </button>
        `;

        apiKeysContainer.appendChild(keyDiv);
      });

      // Add delete functionality
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

    renderApiKeysForSelectedModel(model); // Re-render API keys when switching models
  }
});
