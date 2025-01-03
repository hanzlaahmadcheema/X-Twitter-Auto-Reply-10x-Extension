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
    <button class="generate-reply-btn animate-click" datatestid="generateReplyButton">Generate</button>
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
  chrome.storage.sync.get(["lastTone", "lastLength", "selectedColor"], (data) => {
    if (data.lastTone) toneSelect.value = data.lastTone;
    if (data.lastLength) lengthSelect.value = data.lastLength;
    const defaultColor = data.selectedColor || "#1da1f2";
    applyColor(defaultColor);
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
  function applyColor(color) {
    // Update the CSS variable for the selected color
    document.documentElement.style.setProperty("--model-color", color);
  
    // Apply the color to specific elements in the toolbar
    const toolbar = document.querySelector(".tone-selector-container");
    if (toolbar) {
      toolbar.style.borderColor = color; // Example: Set the border color of the toolbar
    }
  
    const generateButton = document.querySelector(".generate-reply-btn");
    if (generateButton) {
      generateButton.style.backgroundColor = color;
      generateButton.style.color = "#fff"; // Ensure text remains readable
    }
  
    const customPromptTextarea = document.querySelector("#customPrompt");
    if (customPromptTextarea) {
      customPromptTextarea.style.borderColor = color; // Set border color for text area
    }
  }
  
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

function appendAsidepanel(toolbar2) {
  const asidePanel = document.createElement("div");
  asidePanel.className = "aside-panel";
  asidePanel.innerHTML = `
    <li role="listitem" tabindex="0" class="css-175oi2r r-1mmae3n r-3pj75a r-1loqt21 r-o7ynqc r-6416eg r-1ny4l3l" data-testid="UserCell"><div class="css-175oi2r r-18u37iz"><div class="css-175oi2r r-18kxxzh r-1wron08 r-onrtq4 r-1777fci"><div class="css-175oi2r r-1wbh5a2 r-dnmrzs"><div class="css-175oi2r r-bztko3 r-1adg3ll r-13qz1uu" data-testid="UserAvatar-Container-hanzlaahmad164" style="height: 40px;"><div class="r-1adg3ll r-13qz1uu" style="padding-bottom: 100%;"></div><div class="r-1p0dtai r-1pi2tsx r-1d2f490 r-u8s1d r-ipm5af r-13qz1uu"><div class="css-175oi2r r-1adg3ll r-1pi2tsx r-13qz1uu r-45ll9u r-u8s1d r-1v2oles r-176fswd r-bztko3"><div class="r-1adg3ll r-13qz1uu" style="padding-bottom: 100%;"></div><div class="r-1p0dtai r-1pi2tsx r-1d2f490 r-u8s1d r-ipm5af r-13qz1uu"><div class="css-175oi2r r-sdzlij r-1udh08x r-5f1w11 r-u8s1d r-8jfcpp" style="width: calc(100% + 4px); height: calc(100% + 4px);"><a href="/hanzlaahmad164" aria-hidden="true" role="link" tabindex="-1" class="css-175oi2r r-1pi2tsx r-13qz1uu r-o7ynqc r-6416eg r-1ny4l3l r-1loqt21" style="background-color: rgba(0, 0, 0, 0);"><div class="css-175oi2r r-sdzlij r-1udh08x r-633pao r-45ll9u r-u8s1d r-1v2oles r-176fswd" style="width: calc(100% - 4px); height: calc(100% - 4px);"><div class="css-175oi2r r-1pi2tsx r-13qz1uu" style="background-color: rgba(0, 0, 0, 0);"></div></div><div class="css-175oi2r r-sdzlij r-1udh08x r-633pao r-45ll9u r-u8s1d r-1v2oles r-176fswd" style="width: calc(100% - 4px); height: calc(100% - 4px);"><div class="css-175oi2r r-1pi2tsx r-13qz1uu r-kemksi"></div></div><div class="css-175oi2r r-sdzlij r-1udh08x r-633pao r-45ll9u r-u8s1d r-1v2oles r-176fswd" style="background-color: rgb(0, 0, 0); width: calc(100% - 4px); height: calc(100% - 4px);"><div class="css-175oi2r r-1adg3ll r-1udh08x" style=""><div class="r-1adg3ll r-13qz1uu" style="padding-bottom: 100%;"></div><div class="r-1p0dtai r-1pi2tsx r-1d2f490 r-u8s1d r-ipm5af r-13qz1uu"><div class="css-175oi2r r-1mlwlqe r-1udh08x r-417010 r-1p0dtai r-1d2f490 r-u8s1d r-zchlnj r-ipm5af"><div class="css-175oi2r r-1niwhzg r-vvn4in r-u6sd8q r-1p0dtai r-1pi2tsx r-1d2f490 r-u8s1d r-zchlnj r-ipm5af r-13qz1uu r-1wyyakw r-4gszlv" style="background-image: url(&quot;https://pbs.twimg.com/profile_images/1757325040482131968/v5fST_Vf_x96.jpg&quot;);"></div><img alt="" draggable="true" src="https://pbs.twimg.com/profile_images/1757325040482131968/v5fST_Vf_x96.jpg" class="css-9pa8cd"></div></div></div></div><div class="css-175oi2r r-sdzlij r-1udh08x r-45ll9u r-u8s1d r-1v2oles r-176fswd" style="width: calc(100% - 4px); height: calc(100% - 4px);"><div class="css-175oi2r r-172uzmj r-1pi2tsx r-13qz1uu r-o7ynqc r-6416eg r-1ny4l3l"></div></div></a></div></div></div></div></div></div></div><div class="css-175oi2r r-1iusvr4 r-16y2uox r-1777fci"><div class="css-175oi2r r-1awozwy r-18u37iz r-1wtj0ep"><div class="css-175oi2r r-1wbh5a2 r-dnmrzs r-1ny4l3l"><div class="css-175oi2r r-1wbh5a2 r-dnmrzs r-1ny4l3l"><div class="css-175oi2r r-1wbh5a2 r-dnmrzs"><a href="/hanzlaahmad164" role="link" class="css-175oi2r r-1wbh5a2 r-dnmrzs r-1ny4l3l r-1loqt21"><div class="css-175oi2r r-1awozwy r-18u37iz r-dnmrzs"><div dir="ltr" class="css-146c3p1 r-bcqeeo r-1ttztb7 r-qvutc0 r-1qd0xha r-a023e6 r-rjixqe r-b88u0q r-1awozwy r-6koalj r-1udh08x r-3s2u2q" style="text-overflow: unset; color: rgb(231, 233, 234);"><span class="css-1jxf684 r-dnmrzs r-1udh08x r-3s2u2q r-bcqeeo r-1ttztb7 r-qvutc0 r-poiln3" style="text-overflow: unset;"><span class="css-1jxf684 r-bcqeeo r-1ttztb7 r-qvutc0 r-poiln3" style="text-overflow: unset;">Hanzla Ahmad</span><span class="css-1jxf684 r-bcqeeo r-1ttztb7 r-qvutc0 r-poiln3 r-9iso6" style="text-overflow: unset;"></span></span></div><div dir="ltr" class="css-146c3p1 r-bcqeeo r-1ttztb7 r-qvutc0 r-1qd0xha r-a023e6 r-rjixqe r-16dba41 r-xoduu5 r-18u37iz r-1q142lx" style="text-overflow: unset; color: rgb(231, 233, 234);"><span class="css-1jxf684 r-bcqeeo r-1ttztb7 r-qvutc0 r-poiln3 r-1awozwy r-xoduu5" style="text-overflow: unset;"><svg viewBox="0 0 22 22" aria-label="Verified account" role="img" class="r-4qtqp9 r-yyyyoo r-1xvli5t r-bnwqim r-lrvibr r-m6rgpd r-1cvl2hr r-f9ja8p r-og9te1 r-3t4u6i" data-testid="icon-verified"><g><path d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.688-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.634.433 1.218.877 1.688.47.443 1.054.747 1.687.878.633.132 1.29.084 1.897-.136.274.586.705 1.084 1.246 1.439.54.354 1.17.551 1.816.569.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.239 1.266.296 1.903.164.636-.132 1.22-.447 1.68-.907.46-.46.776-1.044.908-1.681s.075-1.299-.165-1.903c.586-.274 1.084-.705 1.439-1.246.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z"></path></g></svg></span></div></div></a></div><div class="css-175oi2r r-1awozwy r-18u37iz r-1wbh5a2"><div class="css-175oi2r r-1wbh5a2 r-dnmrzs"><a href="/hanzlaahmad164" role="link" tabindex="-1" class="css-175oi2r r-1wbh5a2 r-dnmrzs r-1ny4l3l r-1loqt21"><div class="css-175oi2r"><div dir="ltr" class="css-146c3p1 r-dnmrzs r-1udh08x r-3s2u2q r-bcqeeo r-1ttztb7 r-qvutc0 r-1qd0xha r-a023e6 r-rjixqe r-16dba41 r-18u37iz r-1wvb978" style="text-overflow: unset; color: rgb(113, 118, 123);"><span class="css-1jxf684 r-bcqeeo r-1ttztb7 r-qvutc0 r-poiln3" style="text-overflow: unset;">@hanzlaahmad164</span></div></div></a></div></div></div></div><div class="css-175oi2r r-1cwvpvk" style="min-width: 0px;"><a href="/hanzlaahmad164" aria-label="Follow @hanzlaahmad164" class="css-175oi2r r-sdzlij r-1phboty r-rs99b7 r-lrvibr r-15ysp7h r-4wgw6l r-3pj75a r-1loqt21 r-o7ynqc r-6416eg r-1ny4l3l" style="background-color: rgb(239, 243, 244); border-color: rgba(0, 0, 0, 0);"><div dir="ltr" class="css-146c3p1 r-bcqeeo r-qvutc0 r-1qd0xha r-q4m81j r-a023e6 r-rjixqe r-b88u0q r-1awozwy r-6koalj r-18u37iz r-16y2uox r-1777fci" style="text-overflow: unset; color: rgb(15, 20, 25);"><span class="css-1jxf684 r-dnmrzs r-1udh08x r-3s2u2q r-bcqeeo r-1ttztb7 r-qvutc0 r-poiln3 r-1b43r93 r-1cwl3u0" style="text-overflow: unset;"><span class="css-1jxf684 r-bcqeeo r-1ttztb7 r-qvutc0 r-poiln3" style="text-overflow: unset;">Follow</span></span></div></a></div></div></div></div></li>
  `;
  toolbar2.appendChild(asidePanel);
}

const observer = new MutationObserver(() => {
  const toolbar = document.querySelector('[class="css-175oi2r r-1iusvr4 r-16y2uox r-1777fci r-1h8ys4a r-1bylmt5 r-13tjlyg r-7qyjyx r-1ftll1t"]');
  if (toolbar && !toolbar.querySelector(".tone-selector-container")) {
    appendToneSelector(toolbar);
  }
});

const observer2 = new MutationObserver(() => {
 const toolbar2 = document.querySelector('[role="list"]');
 if (toolbar2 && !toolbar2.querySelector(".aside-panel")) {
   appendAsidepanel(toolbar2);
 }
});

observer.observe(document.body, { childList: true, subtree: true });
observer2.observe(document.body, { childList: true, subtree: true });