function getTweetContext() {
  let tweetText = "";
  const modalTweetElement = document.querySelector('[aria-labelledby="modal-header"] [data-testid="tweetText"]') || document.querySelector('[data-testid="tweet"]');
  if (modalTweetElement) {
    tweetText = modalTweetElement.innerText.trim();
    return tweetText;
  }
  const mainTweetElement = document.querySelector('[data-testid="tweetText"]') || document.querySelector('[data-testid="tweet"]');
  if (mainTweetElement) {
    tweetText = mainTweetElement.innerText.trim();
    return tweetText;
  }
  return "";
}

function getReplyAccountDetails() {
  const tweetContainer = document.querySelector('[data-testid="tweet"]') || document.querySelector('[role="article"]');
  const usernameElement = tweetContainer ? tweetContainer.querySelector('[class="css-146c3p1 r-dnmrzs r-1udh08x r-3s2u2q r-bcqeeo r-1ttztb7 r-qvutc0 r-1qd0xha r-a023e6 r-rjixqe r-16dba41 r-18u37iz r-1wvb978"]') : null;
  const displayNameElement = tweetContainer ? tweetContainer.querySelector('[data-testid="User-Name"] span') : null;

  let accountUserName = usernameElement ? usernameElement.innerText.trim() : "Unknown User";
  accountUserName = accountUserName.startsWith('@') ? accountUserName.slice(1) : accountUserName;

  const accountName = displayNameElement ? displayNameElement.innerText.trim() : "Unknown User";

  console.log("Account Name:", accountName);
  console.log("Account Username:", accountUserName);

  return { accountUserName, accountName };
}

function filterResponse(response) {
  response = response.replace(/['"]/g, '');
  response = response.replace(/[\u{1F600}-\u{1F6FF}\u{1F300}-\u{1F5FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '');
  response = response.replace(/#\w+/g, '');
  response = response.trim();
  return response;
}

function insertReplyText(replyText) {
  const filteredText = filterResponse(replyText);
  const replyInput = document.querySelector('[data-testid="tweetTextarea_0"]');
  if (replyInput) {
    const dataTransfer = new DataTransfer();
    dataTransfer.setData("text/plain", filteredText);
    replyInput.dispatchEvent(new ClipboardEvent("paste", { clipboardData: dataTransfer, bubbles: true, cancelable: true }));
  }
}

function injectCSS() {
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.type = "text/css";
  link.href = chrome.runtime.getURL("style.css");
  document.head.appendChild(link);
}

injectCSS();

const MAX_RETRIES = 10; // Increased retry attempts to handle delayed loads
let retryCount = 0;

function applyUserSettings() {
  try {
    chrome.storage.sync.get(["toneDropdown", "lengthDropdown", "langDropdown", "dropdownOrder", "toneOptions", "lengthOptions", "langOptions"], (settings) => {
      if (chrome.runtime.lastError) {
        console.error("Error retrieving settings:", chrome.runtime.lastError.message);
        return;
      }

      // Attempt to find the toolbar with primary and fallback selectors
      let toolbar = document.querySelector('[data-testid="toolBar"]') ||
                    document.querySelector('[class="css-175oi2r r-1awozwy r-kemksi r-18u37iz r-1wtj0ep r-13qz1uu r-184en5c"]'); // Try fallback class selector

      if (!toolbar) {
        console.warn("Toolbar not found. Unable to apply user settings.");
        if (retryCount < MAX_RETRIES) {
          retryCount++;
          setTimeout(applyUserSettings, 500); // Retry after 500ms
        }
        return;
      }

      // Reset retry count after successful toolbar detection
      retryCount = 0;
      toolbar.innerHTML = ""; // Clear existing toolbar contents

      const order = settings.dropdownOrder ?? "toneFirst";
      const toneOptions = settings.toneOptions ?? [{ value: "casual", displayText: "Casual" }, { value: "professional", displayText: "Professional" }];
      const lengthOptions = settings.lengthOptions ?? [{ value: "1-2 lines", displayText: "1-2 Lines" }, { value: "100-175 characters", displayText: "100-175 Characters" }];
      const langOptions = settings.langOptions ?? [{ value: "same", displayText: "Same as Tweet" }, { value: "english", displayText: "English" }];

      if (order.includes("tone") && settings.toneDropdown !== false) createDropdown(toolbar, toneOptions, "toneSelect");
      if (order.includes("length") && settings.lengthDropdown !== false) createDropdown(toolbar, lengthOptions, "lengthSelect");
      if (order.includes("lang") && settings.langDropdown !== false) createDropdown(toolbar, langOptions, "langSelect");

      createGenerateButton(toolbar);
    });
  } catch (error) {
    if (error.message === "Extension context invalidated") {
      console.error("Error applying user settings: Extension context invalidated. Reloading may be necessary.");
      return;
    }
    console.error("Error applying user settings:", error.message);
  }
}


function createDropdown(toolbar, options, selectId) {
  const selectElem = document.createElement("select");
  selectElem.id = selectId;
  options.forEach(({ value, displayText }) => {
    const optionElem = document.createElement("option");
    optionElem.value = value;
    optionElem.textContent = displayText;
    selectElem.appendChild(optionElem);
  });
  toolbar.appendChild(selectElem);
}


function createGenerateButton(toolbar) {
  const generateButton = document.createElement("button");
  generateButton.className = "generate-reply-btn animate-click";
  generateButton.textContent = "Generate";
  generateButton.addEventListener("click", () => {
    const tone = document.getElementById("toneSelect")?.value;
    const length = document.getElementById("lengthSelect")?.value;
    const lang = document.getElementById("langSelect")?.value;
    const tweetContext = getTweetContext();
    const { accountName } = getReplyAccountDetails();

    chrome.runtime.sendMessage({
      action: "generateReply",
      text: tweetContext,
      tone: tone,
      lang: lang,
      length: length,
      accountName: accountName
    }, (response) => {
      if (response && response.reply) {
        insertReplyText(response.reply);
      }
    });
  });
  toolbar.appendChild(generateButton);
}

// Apply user settings on load
applyUserSettings();

const observer = new MutationObserver(() => {
  try {
    const toolbar = document.querySelector('[data-testid="toolBar"]');
    if (toolbar && !toolbar.querySelector(".tone-selector-container")) {
      applyUserSettings();
    }
  } catch (error) {
    console.error("Error applying user settings:", error.message);
  }
});

observer.observe(document.body, { childList: true, subtree: true });
