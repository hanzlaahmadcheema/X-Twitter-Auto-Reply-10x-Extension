document.addEventListener("DOMContentLoaded", () => {
  const newApiKeyInput = document.getElementById("newApiKey");
  const addApiKeyBtn = document.getElementById("addApiKeyBtn");
  const apiKeysContainer = document.getElementById("apiKeysContainer");
  const geminiModelSelect = document.getElementById("geminiModelSelect");
  const grokModelSelect = document.getElementById("grokModelSelect");
  const saveSettingsBtn = document.getElementById("saveSettingsBtn");
  const status = document.getElementById("status");

  // Restore saved settings
  chrome.storage.sync.get(
    ["apiKeys", "selectedApiKey", "selectedModel", "geminiModel", "grokModel"],
    (data) => {
      const { apiKeys, selectedApiKey, selectedModel, geminiModel, grokModel } = data;

      if (apiKeys) renderApiKeys(apiKeys, selectedApiKey);
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
      chrome.storage.sync.get("apiKeys", (data) => {
        const apiKeys = data.apiKeys || [];
        if (apiKeys.find((key) => key.key === newApiKey)) {
          status.textContent = "API key already exists.";
          return;
        }

        const apiKeyName = prompt("Enter a name for this API key:", "My API Key");
        if (!apiKeyName) return;

        apiKeys.push({ key: newApiKey, name: apiKeyName });
        chrome.storage.sync.set({ apiKeys }, () => {
          renderApiKeys(apiKeys, newApiKey);
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
    const selectedModel = document.querySelector('input[name="model"]:checked')?.value;
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
      toggleModelSpecificOptions(e.target.value);
    });
  });

  // Render API keys
  function renderApiKeys(apiKeys, selectedApiKey) {
    apiKeysContainer.innerHTML = ""; // Clear the container

    apiKeys.forEach(({ key, name }) => {
      const keyDiv = document.createElement("div");
      keyDiv.className = "api-key-item";

      keyDiv.innerHTML = `
        <input type="radio" name="apiKey" value="${key}" ${key === selectedApiKey ? "checked" : ""}>
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
            renderApiKeys(apiKeys, null);
            status.textContent = "API key deleted!";
            setTimeout(() => (status.textContent = ""), 2000);
          });
        });
      });
    });
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
  }
});
