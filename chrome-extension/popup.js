document.addEventListener("DOMContentLoaded", () => {
  const saveApiKeyBtn = document.getElementById("saveApiKeyBtn");
  const apiKeyInput = document.getElementById("apiKey");
  const status = document.getElementById("status");

  // Restore the saved API key if available
  chrome.storage.sync.get("apiKey", (data) => {
    if (data.apiKey) {
      apiKeyInput.value = data.apiKey;
    }
  });

  // Save the API key
  saveApiKeyBtn.addEventListener("click", () => {
    const apiKey = apiKeyInput.value.trim();
    if (apiKey) {
      chrome.storage.sync.set({ apiKey }, () => {
        status.textContent = "API Key saved successfully!";
        setTimeout(() => (status.textContent = ""), 2000);
      });
    } else {
      status.textContent = "Please enter a valid API key.";
    }
  });
});