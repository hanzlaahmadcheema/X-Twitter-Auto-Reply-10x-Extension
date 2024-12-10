document.addEventListener("DOMContentLoaded", () => {
  const newApiKeyInput = document.getElementById("newApiKey");
  const addApiKeyBtn = document.getElementById("addApiKeyBtn");
  const apiKeysContainer = document.getElementById("apiKeysContainer");
  const modelSelect = document.getElementById("modelSelect");
  const saveSettingsBtn = document.getElementById("saveSettingsBtn");
  const status = document.getElementById("status");

  // Restore saved settings
  chrome.storage.sync.get(["apiKeys", "selectedApiKey", "geminiModel"], (data) => {
    const { apiKeys, selectedApiKey, geminiModel } = data;

    if (apiKeys) renderApiKeys(apiKeys, selectedApiKey);
    if (geminiModel) modelSelect.value = geminiModel;
  });

  // Add new API key
  addApiKeyBtn.addEventListener("click", () => {
    const newApiKey = newApiKeyInput.value.trim();

    if (newApiKey) {
      chrome.storage.sync.get("apiKeys", (data) => {
        const apiKeys = data.apiKeys || [];
        if (apiKeys.includes(newApiKey)) {
          status.textContent = "API key already exists.";
          return;
        }

        apiKeys.push(newApiKey);
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
    const geminiModel = modelSelect.value;

    chrome.storage.sync.set({ selectedApiKey, geminiModel }, () => {
      status.textContent = "Settings saved!";
      setTimeout(() => (status.textContent = ""), 2000);
    });
  });

  // Render API keys
  function renderApiKeys(apiKeys, selectedApiKey) {
    apiKeysContainer.innerHTML = ""; // Clear the container

    apiKeys.forEach((key) => {
      const keyDiv = document.createElement("div");
      keyDiv.className = "api-key-item";
    
      keyDiv.innerHTML = `
        <input type="radio" name="apiKey" value="${key}" ${key === selectedApiKey ? "checked" : ""}>
        <span>${key}</span>
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
          const apiKeys = data.apiKeys.filter((key) => key !== keyToDelete);
          chrome.storage.sync.set({ apiKeys }, () => {
            renderApiKeys(apiKeys, null);
            status.textContent = "API key deleted!";
            setTimeout(() => (status.textContent = ""), 2000);
          });
        });
      });
    });
  }
});
