document.addEventListener("DOMContentLoaded", () => {
  const apiKeyInput = document.getElementById("apiKey");
  const modelSelect = document.getElementById("modelSelect");
  const saveButton = document.getElementById("saveSettingsBtn");
  const status = document.getElementById("status");

  // Restore saved settings
  chrome.storage.sync.get(["apiKey", "geminiModel"], (data) => {
    if (data.apiKey) apiKeyInput.value = data.apiKey;
    if (data.geminiModel) modelSelect.value = data.geminiModel;
  });

  // Save settings
  saveButton.addEventListener("click", () => {
    const apiKey = apiKeyInput.value;
    const geminiModel = modelSelect.value;

    chrome.storage.sync.set({ apiKey, geminiModel }, () => {
      status.textContent = "Settings saved!";
      setTimeout(() => (status.textContent = ""), 2000);
    });
  });
});
