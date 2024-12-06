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
  response = response.replace(/[*"]/g, '');

  response = response.replace(/[\u{1F600}-\u{1F6FF}\u{1F300}-\u{1F5FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '');
  
  response = response.replace(/#\w+/g, '');
  
  const excitementWords = ["wow", "wow,", "wow!", "oh", "oh,", "oh!", "amazing", "awesome"];
  const regex = new RegExp(`\\b(${excitementWords.join("|")})\\b`, "gi");
  response = response.replace(regex, '').replace(/,+/g, ''); 
  
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
    const dataTransfer = new DataTransfer();
    dataTransfer.setData("text/plain", filteredText);
    replyInput.dispatchEvent(new ClipboardEvent("paste", { clipboardData: dataTransfer, bubbles: true, cancelable: true }));
  }
}

function injectCSS() {
  fetch(chrome.runtime.getURL("style.css"))
    .then(response => response.text())
    .then(css => {
      const style = document.createElement("style");
      style.textContent = css;
      document.head.appendChild(style);
    });
}

injectCSS();

function appendToneSelector(toolbar) {
  const container = document.createElement("div");
  container.className = "tone-selector-container";
  container.innerHTML = `
    <select id="lengthSelect">
      <option value="limited to only 1.5 line. should be shortest reply">1 Line</option>
      <option value="limited to 100-175 characters">100-175 Char</option>
      <option value="restrict to only 1-2 lines">1-2 Lines</option>
      <option value="restrict to just 1-3 lines">1-3 Lines</option>
      <option value="brief">Brief</option>
    </select>
    <select id="toneSelect">
      <option value="casual">Casual</option>
      <option value="straightforward">Straightforward</option>
      <option value="witty">Witty</option>
      <option value="friendly">Friendly</option>
      <option value="professional">Professional</option>
      <option value="humorous">Humorous</option>
      <option value="supportive">Supportive</option>
      <option value="curious">Curious</option>
      <option value="encouraging">Encouraging</option> 
      <option value="negative">negative</option>
    </select>
    <button class="generate-reply-btn animate-click">Generate</button>
  `;
  toolbar.appendChild(container);

  container.querySelector(".generate-reply-btn").addEventListener("click", async () => {
    const tone = document.getElementById("toneSelect").value;
    const length = document.getElementById("lengthSelect").value;
    const tweetContext = getTweetContext();
    const { accountUserName, accountName } = getReplyAccountDetails();

    chrome.runtime.sendMessage({
      action: "generateReply",
      text: tweetContext,
      tone: tone,
      lang: "same as tweet",
      length: length,
      accountName: accountName
    }, (response) => {
      if (response && response.reply) {
        insertReplyText(response.reply);
      }
    });
  });
}

const observer = new MutationObserver(() => {
  const toolbar = document.querySelector('[class="css-175oi2r r-1iusvr4 r-16y2uox r-1777fci r-1h8ys4a r-1bylmt5 r-13tjlyg r-7qyjyx r-1ftll1t"]');
  if (toolbar && !toolbar.querySelector(".tone-selector-container")) {
    appendToneSelector(toolbar);
  }
});

observer.observe(document.body, { childList: true, subtree: true });