document.getElementById("saveSettings").addEventListener("click", () => {
    // Get values from input fields
    const apiKey = document.getElementById("apiKey").value;
    const language = document.getElementById("language").value;
    const responseLength = document.getElementById("responseLength").value;
    const customInstruction = document.getElementById("customInstruction").value;
  
    // Save the settings to chrome.storage
    chrome.storage.sync.set({
      apiKey,
      language,
      responseLength,
      customInstruction
    }, () => {
      console.log("Settings saved");
      alert("Settings have been saved.");
    });
  });
  
  // Load saved settings when the popup opens
  document.addEventListener("DOMContentLoaded", () => {
    chrome.storage.sync.get(["apiKey", "language", "responseLength", "customInstruction"], (settings) => {
      document.getElementById("apiKey").value = settings.apiKey || "";
      document.getElementById("language").value = settings.language || "en";
      document.getElementById("responseLength").value = settings.responseLength || "medium";
      document.getElementById("customInstruction").value = settings.customInstruction || "";
    });
  });
  