function getTweetContext() {
  let tweetText = "";
  const modalTweetElement =
    document.querySelector('[aria-labelledby="modal-header"] [data-testid="tweetText"]') ||
    document.querySelector('[data-testid="tweet"]');
  if (modalTweetElement) {
    tweetText = modalTweetElement.innerText.trim();
    console.log(tweetText);
    return tweetText;
  }
  const mainTweetElement =
    document.querySelector('[data-testid="tweetText"]') ||
    document.querySelector('[data-testid="tweet"]');
  if (mainTweetElement) {
    tweetText = mainTweetElement.innerText.trim();
    console.log(tweetText);
    return tweetText;
  }
  return "";
}

function getReplyAccountDetails() {
  const tweetContainer =
    document.querySelector('[data-testid="tweet"]') ||
    document.querySelector('[role="article"]');
  const usernameElement = tweetContainer
    ? tweetContainer.querySelector('[class="css-146c3p1 r-dnmrzs r-1udh08x r-3s2u2q r-bcqeeo r-1ttztb7 r-qvutc0 r-1qd0xha r-a023e6 r-rjixqe r-16dba41 r-18u37iz r-1ftll1t"]')
    : null;
  const displayNameElement = tweetContainer
    ? tweetContainer.querySelector('[data-testid="User-Name"] span')
    : null;

  let accountUserName = usernameElement ? usernameElement.innerText.trim() : "Unknown User";
  accountUserName = accountUserName.startsWith("@") ? accountUserName.slice(1) : accountUserName;

  const accountName = displayNameElement ? displayNameElement.innerText.trim() : "Unknown User";

  console.log("Account Name:", accountName);
  console.log("Account Username:", accountUserName);

  return { accountUserName, accountName };
}

function filterResponse(response) {
  response = response.replace(/[*"]/g, "");
  response = response.replace(/[\u{1F600}-\u{1F6FF}\u{1F300}-\u{1F5FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, "");
  response = response.replace(/#\w+/g, "");

  const excitementWords = ["wow", "wow,", "wow!", "oh", "oh,", "oh!", "amazing", "awesome"];
  const regex = new RegExp(`\\b(${excitementWords.join("|")})\\b`, "gi");
  response = response.replace(regex, "").replace(/,+/g, "");

  response = response.trim();
  if (response.length > 0) {
    response = response[0].toUpperCase() + response.slice(1);
  }
  return response;
}

function insertReplyText(replyText) {
  const filteredText = filterResponse(replyText);
  const replyInput = document.querySelector('[data-testid="tweetTextarea_0"]');

  if (replyInput) {
    replyInput.focus();

    replyInput.value = "";

    const dataTransfer = new DataTransfer();
    dataTransfer.setData("text/plain", filteredText);

    replyInput.dispatchEvent(
      new ClipboardEvent("paste", {
        clipboardData: dataTransfer,
        bubbles: true,
        cancelable: true,
      })
    );

    console.log("New text inserted successfully:", filteredText);
  } else {
    console.error("Reply input field not found!");
  }
}


function appendToneSelector(toolbar) {
  const container = document.createElement("div");
  container.className = "tone-selector-container";
  container.innerHTML = `
    <select id="lengthSelect">
      <option value="length according to the tweet's length">As Tweet</option>
      <option value="5-150 characters">5-150 CH</option>
      <option value="5-200 characters">5-200 CH</option>
      <option value="5-250 characters">5-250 CH</option>
      <option value="brief">Brief</option>
    </select>
    <select id="toneSelect">
      <option value="playful">Playful</option>
      <option value="engaging">Engaging</option>
      <option value="critical">Critical</option>
      <option value="curious">Curious</option>
      <option value="supportive">Suportive</option>
      <option value="neutral">Neutral</option>
      <option value="humorous">Humrous</option>
      <option value="professional">Profesnl</option>
      <option value="friendly">Friendly</option>
      <option value="witty">Witty</option>
      <option value="straightforward">Straight</option>
      <option value="sarcastic">Sarcastic</option>
      <option value="negative">Negative</option>
      <option value="joking">Joking</option>
      <option value="quirky">Quirky</option>
      <option value="casual">Casual</option>
      <!--<option value="empathetic">Empathetic</option>
      <option value="agreeable">Agreeable</option>
      <option value="grateful">Grateful</option>
      <option value="inspirational">Inspirational</option>
      <option value="insightful">Insightful</option>
      <option value="informative">Informative</option>
      <option value="encouraging">Encourag</option>
      <option value="reflective">Reflective</option>
      <option value="optimistic">Optimistic</option>
      <option value="polite">Polite</option>-->
    </select>
    <textarea id="customPrompt" placeholder="Custom Prompt"></textarea>
    <button class="generate-reply-btn animate-click">Generate</button>
    <button class="stop-btn" style="display: none;">🛑 Stop</button>
  `;
  toolbar.appendChild(container);

  const toneSelect = container.querySelector("#toneSelect");
  const lengthSelect = container.querySelector("#lengthSelect");
  const customPromptTextarea = container.querySelector("#customPrompt");
  const generateButton = container.querySelector(".generate-reply-btn");
  const stopButton = container.querySelector(".stop-btn");

  let isGenerating = false;
  let controller;

  // Restore last selected values
  chrome.storage.sync.get(["lastTone", "lastLength"], (data) => {
    if (data.lastTone) toneSelect.value = data.lastTone;
    if (data.lastLength) lengthSelect.value = data.lastLength;
  });

  // Save selections on change
  toneSelect.addEventListener("change", () => {
    chrome.storage.sync.set({ lastTone: toneSelect.value });
  });

  lengthSelect.addEventListener("change", () => {
    chrome.storage.sync.set({ lastLength: lengthSelect.value });
  });

  generateButton.addEventListener("click", async () => {
    if (isGenerating) return;

    isGenerating = true;
    generateButton.textContent = "Generating...";
    generateButton.disabled = true;
    stopButton.style.display = "inline-block";

    const tone = toneSelect.value;
    const length = lengthSelect.value;
    const customPrompt = customPromptTextarea.value.trim();
    const tweetContext = getTweetContext();
    const { accountUserName, accountName } = getReplyAccountDetails();

    controller = new AbortController();
    const signal = controller.signal;

    chrome.runtime.sendMessage(
      {
        action: "generateReply",
        text: tweetContext,
        customPrompt: customPrompt,
        tone: tone,
        lang: "should be in same language as tweet",
        length: length,
        accountName: accountName,
        accountUserName: accountUserName,
      },
      (response) => {
        isGenerating = false;
        generateButton.disabled = false;
        generateButton.textContent = "Generate";
        stopButton.style.display = "none";

        if (response?.error) {
          showErrorInButton(response.error);
        } else if (response?.reply) {
          insertReplyText(response.reply);
        }
      }
    );
  });

  stopButton.addEventListener("click", () => {
    if (controller) {
      controller.abort();
      showErrorInButton("Generation Stopped.");
      stopButton.style.display = "none";
    }
  });
}

function showErrorInButton(message) {
  const generateButton = document.querySelector(".generate-reply-btn");
  if (generateButton) {
    generateButton.textContent = message;
    generateButton.style.backgroundColor = "red";
    generateButton.style.color = "#fff";
    generateButton.disabled = true;

    setTimeout(() => {
      generateButton.textContent = "Generate";
      generateButton.style.backgroundColor = "#000";
      generateButton.style.color = "#1da1f2";
      generateButton.disabled = false;
    }, 5000);
  }
}

function stopErrorInButton(message) {
  const generateButton = document.querySelector(".generate-reply-btn");
  if (generateButton) {
    generateButton.textContent = message;
    generateButton.style.backgroundColor = "orange";
    generateButton.style.color = "#fff";
    generateButton.disabled = true;

    setTimeout(() => {
      generateButton.textContent = "Generate";
      generateButton.style.backgroundColor = "#000";
      generateButton.style.color = "#1da1f2";
      generateButton.disabled = false;
    }, 2000);
  }
}

const observer = new MutationObserver(() => {
  const toolbar = document.querySelector('[class="css-175oi2r r-1iusvr4 r-16y2uox r-1777fci r-1h8ys4a r-1bylmt5 r-13tjlyg r-7qyjyx r-1ftll1t"]');
  if (toolbar && !toolbar.querySelector(".tone-selector-container")) {
    appendToneSelector(toolbar);
  }
});

observer.observe(document.body, { childList: true, subtree: true });