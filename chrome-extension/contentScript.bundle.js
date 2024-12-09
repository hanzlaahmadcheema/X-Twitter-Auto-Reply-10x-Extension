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
      <option value="Reply according to the tweet's context."> As Tweet </option>
      <option value="limited to 75-225 characters">75-225 CH</option>
      <option value="restrict to only 1-2 lines">1-2 Lines</option>
      <option value="restrict to just 1-3 lines">1-3 Lines</option>
      <option value="brief">Brief</option>
    </select>
    <select id="toneSelect">
      <option value="casual">Casual</option>
      <option value="straightforward">Straight</option>
      <option value="witty">Witty</option>
      <option value="friendly">Friendly</option>
      <option value="professional">Profesnl</option>
      <option value="humorous">Humrous</option>
      <option value="supportive">Suportive</option>
      <option value="curious">Curious</option>
      <option value="encouraging">Encourag</option> 
      <option value="negative">Negative</option>
    </select>
    <!--<select id="langSelect">
      <option value="reply should be in same language as tweet">Same</option>
      <option value="reply in english">English</option>
      <option value="reply in Urdu language">Urdu</option>
      <option value="reply in roman Urdu">Roman</option>
    </select>-->
    <button class="generate-reply-btn animate-click">Generate</button>
    <button class="stop-btn" style="display: none;">🛑 Stop</button>
  `;
  toolbar.appendChild(container);

  const generateButton = container.querySelector(".generate-reply-btn");
  const stopButton = container.querySelector(".stop-btn");

  let isGenerating = false;
  let controller;

  generateButton.addEventListener("click", async () => {
    if (isGenerating) return;

    isGenerating = true;
    generateButton.textContent = "Generating...";
    generateButton.disabled = true;
    stopButton.style.display = "inline-block";

    const tone = document.getElementById("toneSelect").value;
    const length = document.getElementById("lengthSelect").value;
    
    const tweetContext = getTweetContext();
    const { accountUserName, accountName } = getReplyAccountDetails();

    controller = new AbortController();
    const signal = controller.signal;

    chrome.runtime.sendMessage(
      {
        action: "generateReply",
        text: tweetContext,
        tone: tone,
        lang: "reply should be in same language as tweet",
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
      stopErrorInButton("Generation Stopped.");
      stopButton.style.display = "none";
    }
  });
}


function stopErrorInButton(message) {
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
    }, 700);
  }
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

const observer = new MutationObserver(() => {
  const toolbar = document.querySelector('[class="css-175oi2r r-1iusvr4 r-16y2uox r-1777fci r-1h8ys4a r-1bylmt5 r-13tjlyg r-7qyjyx r-1ftll1t"]');
  if (toolbar && !toolbar.querySelector(".tone-selector-container")) {
    appendToneSelector(toolbar);
  }
});

observer.observe(document.body, { childList: true, subtree: true });
