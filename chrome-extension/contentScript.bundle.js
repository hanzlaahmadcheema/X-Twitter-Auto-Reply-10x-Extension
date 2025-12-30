const ICONS = {
  microphone: '<svg width="22px" height="22px" stroke-width="1.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" color="#ffffff"><rect x="9" y="2" width="6" height="12" rx="3" stroke="#ffffff" stroke-width="1.5" stroke-width="1.5"></rect><path d="M5 10V11C5 14.866 8.13401 18 12 18V18V18C15.866 18 19 14.866 19 11V10" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M12 18V22M12 22H9M12 22H15" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>',
  stop: '<svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 384 512" fill="currentColor"><!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M0 128C0 92.7 28.7 64 64 64H320c35.3 0 64 28.7 64 64V384c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V128z"/></svg>',
  camera: '<svg width="18px" height="18px" stroke-width="1.5" viewBox="0 0 24 24" fill="#1da1f2" xmlns="http://www.w3.org/2000/svg" color="none"><path d="M2 19V9C2 7.89543 2.89543 7 4 7H4.5C5.12951 7 5.72229 6.70361 6.1 6.2L8.32 3.24C8.43331 3.08892 8.61115 3 8.8 3H15.2C15.3889 3 15.5667 3.08892 15.68 3.24L17.9 6.2C18.2777 6.70361 18.8705 7 19.5 7H20C21.1046 7 22 7.89543 22 9V19C22 20.1046 21.1046 21 20 21H4C2.89543 21 2 20.1046 2 19Z" stroke="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M12 17C14.2091 17 16 15.2091 16 13C16 10.7909 14.2091 9 12 9C9.79086 9 8 10.7909 8 13C8 15.2091 9.79086 17 12 17Z" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>',
  check: '<svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 448 512" fill="currentColor"><!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z"/></svg>',
  timesCircle: '<svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512" fill="currentColor"><!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM175 175c9.4-9.4 24.6-9.4 33.9 0l47 47 47-47c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-47 47 47 47c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-47-47-47 47c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l47-47-47-47c-9.4-9.4-9.4-24.6 0-33.9z"/></svg>',
  exclamationCircle: '<svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512" fill="currentColor"><!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zm0-384c13.3 0 24 10.7 24 24V264c0 13.3-10.7 24-24 24s-24-10.7-24-24V152c0-13.3 10.7-24 24-24zM224 352a32 32 0 1 1 64 0 32 32 0 1 1 -64 0z"/></svg>',
  copy: '<svg xmlns="http://www.w3.org/2000/svg" width="18px" height="18px" viewBox="0 0 32 32"><path fill="#1da1f2" d="M8.5 5.25A3.25 3.25 0 0 1 11.75 2h12A3.25 3.25 0 0 1 27 5.25v18a3.25 3.25 0 0 1-3.25 3.25h-12a3.25 3.25 0 0 1-3.25-3.25zM5 8.75c0-1.352.826-2.511 2-3.001v17.75a4.5 4.5 0 0 0 4.5 4.5h11.751a3.25 3.25 0 0 1-3.001 2H11.5A6.5 6.5 0 0 1 5 23.5z"/></svg>' // Using 'file' icon as copy, or standard copy
};


// Inject Font Awesome CSS (Keeping it for now as backup or other usages, but user asked to use SVGs instead of <i>)
const fontAwesomeLink = document.createElement('link');
fontAwesomeLink.rel = 'stylesheet';
fontAwesomeLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css';
document.head.appendChild(fontAwesomeLink);

function getTweetContext() {
  let tweetText = "";
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

  return { accountUserName, accountName };
}

function filterResponse(response) {
  response = response.replace(/[*"]/g, "");
  response = response.replace(/[\u{1F600}-\u{1F6FF}\u{1F300}-\u{1F5FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, "");
  response = response.replace(/#\w+/g, "");
  response = response.replace(/:/g, "");

  const excitementWords = ["wow", "wow,", "wow!", "oh", "oh,", "oh!", "amazing", "awesome", "AI Assistant:", "AI Assistant"];
  const regex = new RegExp(`\\b(${excitementWords.join("|")})\\b`, "gi");
  //also exclude "بلکل" with a comma after it and then a space
  response = response.replace(/بالکل،\s/g, "");
  response = response.replace(/بالکل ٹھیک!\s/g, "");
  response = response.replace(/بالکل جناب،\s/g, "");
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
    dataTransfer.setData("text/plain", filteredText + " ");

    replyInput.dispatchEvent(
      new ClipboardEvent("paste", {
        clipboardData: dataTransfer,
        bubbles: true,
        cancelable: true,
      })
    );

    showSuccessMessage("New text inserted successfully");
  } else {
    showSuccessMessage("Reply input field not found!");
  }
}

function insertCopyText(copyText) {
  const replyInput = document.querySelector('[data-testid="tweetTextarea_0"]');

  if (replyInput) {
    replyInput.focus();

    replyInput.value = "";

    const dataTransfer = new DataTransfer();
    dataTransfer.setData("text/plain", copyText + " ");

    replyInput.dispatchEvent(
      new ClipboardEvent("paste", {
        clipboardData: dataTransfer,
        bubbles: true,
        cancelable: true,
      })
    );

    showSuccessMessage("New text inserted successfully");
  } else {
    showSuccessMessage("Reply input field not found!");
  }
}

function extractTextWithEmojis(element) {
  let text = "";
  if (!element) return text;

  // Handle text nodes
  if (element.nodeType === Node.TEXT_NODE) {
    return element.textContent;
  }

  // Handle images (often used for emojis on Twitter)
  if (element.tagName === "IMG") {
    const alt = element.getAttribute("alt");
    if (alt) {
      return alt;
    }
  }

  // Recursively process child nodes
  for (const child of element.childNodes) {
    text += extractTextWithEmojis(child);
  }

  return text;
}

function getTweetContextFromShareButton(shareButton) {
  let tweetText = "";
  const tweetContainer = shareButton.closest('[data-testid="tweet"]');
  const mainTweetElement = tweetContainer ? tweetContainer.querySelector('[data-testid="tweetText"]') : null;
  if (mainTweetElement) {
    // Use extractTextWithEmojis to preserve emojis from images
    tweetText = extractTextWithEmojis(mainTweetElement).trim();

    // Remove hashtags
    tweetText = tweetText.replace(/#\S+/g, "").trim();
    // Remove extra spaces
    tweetText = tweetText.replace(/\s\s+/g, " ");

    console.log(tweetText);
    return tweetText;
  }
  return "";
}

function waitForHtml2Canvas(callback) {
  if (typeof html2canvas !== "undefined") {
    console.log("✅ html2canvas is available.");
    callback(); // Execute the callback function
  } else {
    console.log("⏳ Waiting for html2canvas...");
    setTimeout(() => waitForHtml2Canvas(callback), 500);
  }
}

// Capture Tweet Screenshot Function
function captureTweetScreenshot(shareButton) {
  const tweetElement = shareButton.closest('[data-testid="tweet"]');
  if (!tweetElement) {
    console.error("❌ Tweet not found!");
    return;
  }

  console.log("Taking screenshot...");
  shareButton.innerHTML = ICONS.check;
  shareButton.style.color = "green";
  setTimeout(() => {
    shareButton.innerHTML = ICONS.camera;
    shareButton.style.color = "";
  }, 4000);
  // Request injection of html2canvas
  chrome.runtime.sendMessage({ action: "injectHtml2Canvas" }, (response) => {
    if (response?.success) {
      console.log("✅ html2canvas injected successfully.");
      waitForHtml2Canvas(() => takeScreenshot(tweetElement));
    } else {
      console.error("❌ Error injecting html2canvas:", response?.error);
    }
  });
}

function takeScreenshot(tweetElement) {
  const tweetContainer = tweetElement.closest('article[data-testid="tweet"]');
  if (!tweetContainer) {
    showSuccessMessage('❌ Tweet container not found');
    return;
  }

  // Manually extract tweet data
  const userName = tweetContainer.querySelector('[data-testid="User-Name"] span')?.textContent || '';
  let userHandle = '';
  const usernameElements = tweetContainer.querySelectorAll('a[href^="/"]');
  for (const element of usernameElements) {
    const href = element.getAttribute('href');
    if (href && href.startsWith('/') && !href.includes('/status/') && element.textContent.startsWith('@')) {
      userHandle = element.textContent;
      break;
    }
  }
  if (!userHandle) {
    const handleElement = tweetContainer.querySelector('[dir="ltr"] span');
    if (handleElement && handleElement.textContent.startsWith('@')) {
      userHandle = handleElement.textContent;
    }
  }

  const tweetTextElement = tweetContainer.querySelector('[data-testid="tweetText"]');
  const tweetText = tweetTextElement ? tweetTextElement.textContent : '';
  const tweetDate = tweetContainer.querySelector('time')?.textContent || '';
  const avatarImg = tweetContainer.querySelector('[data-testid="UserAvatar-Container"] img');
  const originalAvatarSrc = avatarImg ? avatarImg.src : '';

  // Extract tweet images more reliably - handle multiple images
  const tweetImages = [];
  const imageIds = new Set(); // Track unique image IDs to prevent duplicates

  // Function to extract unique image ID from Twitter URL
  function getImageId(url) {
    const match = url.match(/\/media\/([^?&]+)/);
    return match ? match[1] : url;
  }

  // Function to add image if not duplicate
  function addUniqueImage(src) {
    if (!src || !src.includes('pbs.twimg.com/media')) return;

    const imageId = getImageId(src);
    if (!imageIds.has(imageId)) {
      imageIds.add(imageId);
      // Get high quality version
      const highQualitySrc = src.replace(/&name=[^&]*/, '&name=large').replace(/\?format=[^&]*&name=[^&]*/, '?format=jpg&name=large');
      tweetImages.push(highQualitySrc);
    }
  }

  // Try multiple selectors to catch all image patterns
  const imageSelectors = [
    '[data-testid="tweetPhoto"] img',
    'img[src*="pbs.twimg.com/media"]',
    'a[href*="/photo/"] img'
  ];

  imageSelectors.forEach(selector => {
    const images = tweetContainer.querySelectorAll(selector);
    images.forEach(img => {
      if (img.src) {
        addUniqueImage(img.src);
      }
    });
  });

  // Additional fallback: look for background images in divs
  const bgImageDivs = tweetContainer.querySelectorAll('div[style*="background-image"]');
  bgImageDivs.forEach(div => {
    const style = div.getAttribute('style');
    const match = style.match(/background-image:\s*url\(["']?(.*?)["']?\)/);
    if (match && match[1]) {
      addUniqueImage(match[1]);
    }
  });

  console.log(`Found ${tweetImages.length} unique images:`, tweetImages);

  // Use direct avatar source
  const proxiedAvatarSrc = originalAvatarSrc;

  const screenshotContainer = document.createElement('div');
  screenshotContainer.style.cssText = `
    position: fixed;
    top: -9999px; /* Hide off-screen */
    left: 0;
    background: #15202B;
    border: none;
    border-radius: 0;
    padding: 16px;
    width: 600px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    color: #F7F9F9;
  `;

  const renderScreenshot = () => {
    let avatarHTML = '';
    if (proxiedAvatarSrc) {
      avatarHTML = `<div style="width: 48px; height: 48px; border-radius: 50%; margin-right: 12px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 18px;">${userName.charAt(0).toUpperCase()}</div>`;
    }

    // Generate images HTML if there are tweet images
    let imagesHTML = '';
    if (tweetImages.length > 0) {
      if (tweetImages.length === 1) {
        // If there's only one image, display it as a square
        imagesHTML = `
          <div style="width: 100%; aspect-ratio: 1 / 1; margin-top: 12px; border-radius: 8px; overflow: hidden;">
            <img src="${tweetImages[0]}" style="width: 100%; height: 100%; object-fit: cover;">
          </div>
        `;
      } else {
        // If there are multiple images, display them in a grid
        const imageGrid = tweetImages.map(imgSrc => {
          return `
            <div style="flex: 1 1 calc(50% - 4px); margin: 2px; border-radius: 8px; overflow: hidden; height: 200px;">
              <img src="${imgSrc}" style="width: 100%; height: 100%; object-fit: cover; display: block;">
            </div>
          `;
        }).join('');
        imagesHTML = `
          <div style="display: flex; flex-wrap: wrap; margin: 12px -2px 0;">
            ${imageGrid}
          </div>
        `;
      }
    }

    screenshotContainer.innerHTML = `
      <div style="display: flex; align-items: center;">
        ${avatarHTML}
        <div>
          <div style="font-weight: bold;">${userName}</div>
          <div style="color: #8899A6;">${userHandle}</div>
        </div>
      </div>
      <div style="margin-top: 12px; font-size: 20px; line-height: 1.4;">${tweetText}</div>
      ${imagesHTML}
      <div style="margin-top: 12px; color: #8899A6;">${tweetDate}</div>
    `;

    document.body.appendChild(screenshotContainer);

    html2canvas(screenshotContainer, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#15202B',
    }).then(canvas => {
      const image = canvas.toDataURL('image/png');
      const filename = `tweet-${Date.now()}.png`;

      const link = document.createElement('a');
      link.href = image;
      link.download = filename;
      link.click();

      showSuccessMessage(`${ICONS.camera} Screenshot captured!`);
      document.body.removeChild(screenshotContainer);

    }).catch(error => {
      showSuccessMessage(`${ICONS.timesCircle} Screenshot failed: ${error.message}`);
      if (document.body.contains(screenshotContainer)) {
        document.body.removeChild(screenshotContainer);
      }
    });
  };

  renderScreenshot();
}

//#region Get tweet URL
function getTweetUrl(shareButton) {
  const tweetElement = shareButton.closest('[data-testid="tweet"]');
  const tweetLink = tweetElement?.querySelector('a[href*="/status/"]');

  if (tweetLink) {
    return `https://twitter.com${tweetLink.getAttribute("href")}`;

  }
  return null;
}

// Function to show a small success notification
function showSuccessMessage(message) {
  const notification = document.createElement("div");
  notification.innerHTML = message;
  notification.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 40pc;
    background: #1DA1F2;
    color: white;
    padding: 20px 25px;
    border-radius: 5px;
    font-size: 16px;
    z-index: 10000;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
  `;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.remove();
  }, 3000);
}


//#region Tone Prompts
function appendToneSelector(toolbar) {
  const container = document.createElement("div");
  container.className = "tone-selector-container";
  container.innerHTML = `
      <textarea id="customPrompt" placeholder="Custom Prompt"></textarea>
    <select id="lengthSelect">
        <option value="The message length should match the typical tweet length">As Tweet</option>
        <option value="The length should be sufficient for a lengthy message">Lengthy</option>
        <option value="The message length should be between 5 and 200 characters">5-200 Ch</option>
        <option value="The length requirement should be between 100 and 400 characters">100-400 Ch</option>
        <option value="The message length should be short but impactful, up to 50 characters">Short</option>
                <!-- <option value="The message length must align with the tweet's character limit">Tweet Length</option>
        <option value="The character count should be appropriate for a more extensive message">Extensive</option>
        <option value="The length should fall between 5 and 200 characters for conciseness">Concise 5-200</option>
        <option value="The character length should fall between 100 and 400 characters for detailed communication">Detailed 100-400</option>
        <option value="The message length should be ideal for a mid-length message, ranging from 150 to 250 characters">Mid-Length 150-250</option>
        <option value="The length should be sufficiently detailed, spanning between 250 and 350 characters">Detailed 250-350</option>-->
    </select>
    <select id="toneSelect">
      <!--<option value="empathetic">Empath</option>
      <option value="grateful">Grateful</option>
      <option value="inspirational">Inspire</option>
      <option value="insightful">Insightful</option>
      <option value="informative">Informa</option>
      <option value="reflective">Reflect</option>
      <option value="optimistic">Optimistic</option>
      <option value="critical">Critical</option>-->
      <option value="encouraging">Encourag</option>
      <option value="polite">Polite</option>
      <option value="playful">Playful</option>
      <option value="engaging">Engaging</option>
      <option value="curious">Curious</option>
      <option value="neutral">Neutral</option>
      <option value="witty">Witty</option>
      <option value="joking">Joking</option>
      <option value="quirky">Quirky</option>
      <option value="humorous">Humrous</option>
      <option value="sarcastic">Sarcastic</option>
      <option value="negative">Negative</option>
      <option value="straightforward">Straight</option>
      <option value="professional">Profesnl</option>
      <option value="supportive">Suportive</option>
      <option value="blunt">Blunt</option>
      <option value="agreeCritically">agreCriticaly</option>
      <option value="disagree">Disagree</option>
      <option value="agreeable">Agreeable</option>
      <option value="casual">Casual</option>
      <option value="optimal">Optimal</option>
    </select>
    <button class="mic-btn" >${ICONS.microphone}</button>
    <button class="generate-reply-btn animate-click" datatestid="generateReplyButton">Generate</button>
    <!--<button class="stop-btn" style="display: none;">🔴 Stop</button>-->
  `;
  toolbar.appendChild(container);

  //#region Mic Setting

  const micButton = document.querySelector(".mic-btn");
  let recognition = null;
  let spacePressCount = 0;
  let spaceTimeout;

  // Function to start speech recognition
  function startSpeechRecognition() {
    if (!recognition) {
      recognition = new webkitSpeechRecognition(); // Use Chrome's API
      recognition.lang = "ur-PK"; // Set language to Urdu
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        micButton.innerHTML = `<span style="color: red;">${ICONS.stop}</span>`; // Update button UI
        micButton.dataset.state = "recording";
        showSuccessMessage(`${ICONS.microphone} Speech recognition started...`);
      };

      recognition.onresult = (event) => {
        let speechResult = event.results[0][0].transcript;
        speechResult = speechResult.replace(/\bDash\b|ڈیش/g, "۔"); // Replace "Dash" with Urdu punctuation
        insertReplyText(speechResult);
        showSuccessMessage(`${ICONS.check} Speech recognized:`, speechResult);
      };

      recognition.onerror = (event) => {
        showSuccessMessage(`${ICONS.exclamationCircle} Speech recognition error:`, event.error);
        stopSpeechRecognition(); // Stop only on a real error
      };

      recognition.onend = () => {
        stopSpeechRecognition();
      };
    }

    recognition.start();
  }

  // Function to stop speech recognition manually
  function stopSpeechRecognition() {
    if (recognition) {
      recognition.stop();
      micButton.innerHTML = ICONS.microphone; // Reset button UI
      micButton.dataset.state = "idle";
      showSuccessMessage(`${ICONS.stop} Speech recognition stopped.`);
    }
  }

  // Mic button event listener (Manually stop only)
  micButton.addEventListener("click", () => {
    if (micButton.dataset.state !== "recording") {
      startSpeechRecognition();
    } else {
      stopSpeechRecognition();
    }
  });


  document.addEventListener("keydown", (event) => {
    if (event.code === "Space") {
      spacePressCount++;

      if (spacePressCount === 2) {
        event.preventDefault(); // Prevent unwanted scrolling
        micButton.click(); // Simulate mic button click
        spacePressCount = 0; // Reset counter
      }

      clearTimeout(spaceTimeout);
      spaceTimeout = setTimeout(() => {
        spacePressCount = 0; // Reset counter if not pressed twice in quick succession
      }, 300);
    }
  });

  // Function to add mic button to WhatsApp input field
  function addMicToWhatsApp() {
    const whatsappInput = document.querySelector('[contenteditable="true"][data-tab="10"]'); // WhatsApp input field

    if (whatsappInput && !document.querySelector(".whatsapp-mic-btn")) {
      // Create mic button
      const micButton = document.createElement("button");
      micButton.className = "whatsapp-mic-btn";
      micButton.innerHTML = ICONS.microphone; // Mic icon
      micButton.style.cssText = `
      position: fixed;
      right: 20px;
      bottom: 20px;
      background-color: #1DA1F2;
      color: white;
      border: none;
      border-radius: 50%;
      width: 50px;
      height: 50px;
      cursor: pointer;
      z-index: 1000;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
    `;
      micButton.dataset.state = "idle";


      // Append mic button to the body
      document.body.appendChild(micButton);

      // Speech recognition setup
      let recognition = null;

      function startSpeechRecognition() {
        if (!recognition) {
          recognition = new webkitSpeechRecognition(); // Use Chrome's API
          recognition.lang = "ur-PK"; // Set language to Urdu
          recognition.interimResults = false;
          recognition.maxAlternatives = 1;

          recognition.onstart = () => {
            micButton.innerHTML = `<span style="color: red;">${ICONS.stop}</span>`; // Update button UI
            micButton.dataset.state = "recording";
            showSuccessMessage(`${ICONS.microphone} Speech recognition started...`);
          };

          recognition.onresult = (event) => {
            let speechResult = event.results[0][0].transcript;
            speechResult = speechResult.replace(/\bDash\b|ڈیش/g, "۔"); // Replace "Dash" with Urdu punctuation
            insertReplyText(speechResult);
            showSuccessMessage(`${ICONS.check} Speech recognized:`, speechResult);
          };

          recognition.onerror = (event) => {
            showSuccessMessage(`${ICONS.exclamationCircle} Speech recognition error:`, event.error);
            stopSpeechRecognition(); // Stop only on a real error
          };

          recognition.onend = () => {
            stopSpeechRecognition();
          };
        }

        recognition.start();
      }

      function stopSpeechRecognition() {
        if (recognition) {
          recognition.stop();
          micButton.innerHTML = ICONS.microphone; // Reset button UI
          micButton.dataset.state = "idle";
          showSuccessMessage(`${ICONS.stop} Speech recognition stopped.`);
        }
      }

      micButton.addEventListener("click", () => {
        if (micButton.dataset.state !== "recording") {
          startSpeechRecognition();
        } else {
          stopSpeechRecognition();
        }
      });
    }
    if (whatsappInput && !document.querySelector(".whatsapp-mic-btn")) {
      // Create mic button
      const micButton = document.createElement("button");
      micButton.className = "whatsapp-mic-btn";
      micButton.innerHTML = ICONS.microphone; // Mic icon
      micButton.style.cssText = `
      position: absolute;
      right: 10px;
      bottom: 10px;
      background: #25D366;
      color: white;
      border: none;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      cursor: pointer;
      z-index: 1000;
    `;
      micButton.dataset.state = "idle";


      // Append mic button to the parent of the input field
      whatsappInput.parentElement.appendChild(micButton);

      // Speech recognition setup
      let recognition = null;

      function startSpeechRecognition() {
        if (!recognition) {
          recognition = new webkitSpeechRecognition(); // Use Chrome's API
          recognition.lang = "ur-PK"; // Set language to Urdu
          recognition.interimResults = false;
          recognition.maxAlternatives = 1;

          recognition.onstart = () => {
            micButton.innerHTML = `<span style="color: red;">${ICONS.stop}</span>`; // Update button UI
            micButton.dataset.state = "recording";
            showSuccessMessage(`${ICONS.microphone} Speech recognition started...`);
          };

          recognition.onresult = (event) => {
            let speechResult = event.results[0][0].transcript;
            speechResult = speechResult.replace(/\bDash\b|ڈیش/g, "۔"); // Replace "Dash" with Urdu punctuation
            insertReplyText(speechResult);
            showSuccessMessage(`${ICONS.check} Speech recognized:`, speechResult);
          };

          recognition.onerror = (event) => {
            showSuccessMessage(`${ICONS.exclamationCircle} Speech recognition error:`, event.error);
            stopSpeechRecognition(); // Stop only on a real error
          };

          recognition.onend = () => {
            stopSpeechRecognition();
          };
        }

        recognition.start();
      }

      // Function to stop speech recognition manually
      function stopSpeechRecognition() {
        if (recognition) {
          recognition.stop();
          micButton.innerHTML = ICONS.microphone; // Reset button UI
          micButton.dataset.state = "idle";
          showSuccessMessage(`${ICONS.stop} Speech recognition stopped.`);
        }
      }

      // Mic button event listener (Manually stop only)
      micButton.addEventListener("click", () => {
        if (micButton.dataset.state !== "recording") {
          startSpeechRecognition();
        } else {
          stopSpeechRecognition();
        }
      });
    }
  }

  // Observe DOM changes to detect WhatsApp input field
  const whatsappObserver = new MutationObserver(() => {
    addMicToWhatsApp();
  });

  whatsappObserver.observe(document.body, { childList: true, subtree: true });
  const customPromptTextarea = container.querySelector("#customPrompt");
  const toneSelect = container.querySelector("#toneSelect");
  const lengthSelect = container.querySelector("#lengthSelect");
  const generateButton = container.querySelector(".generate-reply-btn");
  // const stopButton = container.querySelector(".stop-btn");

  let isGenerating = false;

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
    generateButton.style.backgroundColor = "red";
    generateButton.disabled = true;
    // stopButton.style.display = "inline-block";
    showSuccessMessage("Generating reply...");

    const tone = toneSelect.value;
    const length = lengthSelect.value;
    const customPrompt = customPromptTextarea.value.trim();
    const tweetContext = getTweetContext();
    const { accountUserName, accountName } = getReplyAccountDetails();


    chrome.runtime.sendMessage(
      {
        action: "generateReply",
        text: tweetContext,
        customPrompt: customPrompt,
        tone: tone,
        lang: "The response language should match the language of the tweet",
        length: length,
        accountName: accountName,
        accountUserName: accountUserName,
      },
      (response) => {
        isGenerating = false;
        generateButton.disabled = false;
        generateButton.textContent = "Generate";
        chrome.storage.sync.get(["selectedColor"], (data) => {
          const defaultColor = data.selectedColor || "#1da1f2";
          generateButton.style.backgroundColor = defaultColor;
        });
        // stopButton.style.display = "none";

        if (response?.error) {
          showErrorInButton(response.error);
        } else if (response?.reply) {
          insertReplyText(response.reply);

          // Trigger the alarm if enabled
          // chrome.storage.sync.get(["alarmType", "alarmEnabled", "alarmTime"], (data) => {
          //   console.log("Alarm settings retrieved from storage:", data);

          //   const { alarmType, alarmEnabled, alarmTime } = data;

          //   if (alarmEnabled) {
          //     const timeInMs = alarmTime * 60000; // Convert minutes to milliseconds
          //     console.log("Alarm enabled. Type:", alarmType, "| Time (ms):", timeInMs);

          //     // Trigger the appropriate alarm based on the selected type
          //     chrome.runtime.sendMessage({
          //       action: "startAlarm",
          //       time: timeInMs,
          //       type: alarmType,
          //     });
          //   } else {
          //     console.log("Alarm is disabled. No notification will be triggered.");
          //   }
          // });
        }
      }
    );
  });


  function applyColor(color) {
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
      chrome.storage.sync.get(["selectedColor"], (data) => {
        const defaultColor = data.selectedColor || "#1da1f2";
        generateButton.style.backgroundColor = defaultColor;
        generateButton.style.color = "#fff";
      });
      generateButton.disabled = false;
    }, 3000);
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

//#region Screenshot
function insertCopyTweetButton() {
  const shareButtons = document.querySelectorAll('[aria-label="Share post"]');

  shareButtons.forEach((shareButton) => {
    const parent = shareButton.parentNode;

    // Avoid duplicate buttons
    if (!parent.querySelector(".copy-tweet-btn") && !parent.querySelector(".screenshot-btn")) {

      // 📋 Copy Tweet Button
      const copyTweetButton = document.createElement("button");
      copyTweetButton.className = "copy-tweet-btn";
      copyTweetButton.innerHTML = ICONS.copy; // Copy Icon
      copyTweetButton.style.cssText = `
        padding: 6px;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        margin-left: 8px;
        font-size: 14px;
      `;
      copyTweetButton.addEventListener("click", () => copyTweetText(copyTweetButton, shareButton));

      // 📸 Screenshot Tweet Button
      const screenshotButton = document.createElement("button");
      screenshotButton.className = "screenshot-btn";
      screenshotButton.innerHTML = ICONS.camera; // Camera Icon
      screenshotButton.style.cssText = `
        padding: 6px;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        margin-left: 8px;
        font-size: 14px;
        background-color: transparent;
      `;
      screenshotButton.addEventListener("click", () => captureTweetScreenshot(screenshotButton));

      // Insert buttons after the Share button
      parent.insertBefore(copyTweetButton, shareButton.nextSibling);
      parent.insertBefore(screenshotButton, shareButton.nextSibling);
    }
  });
}


function copyTweetText(button, shareButton) {
  const tweetText = getTweetContextFromShareButton(shareButton);
  if (tweetText) {
    // Try navigator.clipboard first (modern, secure method)
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(tweetText).then(() => {
        console.log("Tweet text copied to clipboard:", tweetText);
        button.innerHTML = ICONS.check;
        button.style.color = "green";
        showSuccessMessage("Text Copied to clipboard!")
        setTimeout(() => {
          button.innerHTML = ICONS.copy;
          button.style.color = "";
        }, 4000);
      }).catch(err => {
        console.error("Failed with navigator.clipboard, trying fallback:", err);
        copyWithFallback(tweetText, button);
      });
    } else {
      // Use fallback for older browsers
      copyWithFallback(tweetText, button);
    }
  } else {
    console.error("No tweet text found to copy!");
    showSuccessMessage("No tweet text found to copy!");
  }
}

function copyWithFallback(tweetText, button) {
  const textarea = document.createElement("textarea");
  textarea.value = tweetText;
  textarea.style.position = "fixed";
  textarea.style.top = "0";
  textarea.style.left = "0";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();

  try {
    document.execCommand("copy");
    console.log("Tweet text copied to clipboard (fallback):", tweetText);
    button.innerHTML = ICONS.check;
    button.style.color = "green";
    showSuccessMessage("Text Copied to clipboard!")
    setTimeout(() => {
      button.innerHTML = ICONS.copy;
      button.style.color = "";
    }, 4000);
  } catch (err) {
    console.error("Failed to copy tweet text with fallback:", err);
    showSuccessMessage("Failed to copy tweet text")
  } finally {
    document.body.removeChild(textarea);
  }
}

function appendAsidepanel(toolbar2) {
  const asidePanel = document.createElement("div");
  asidePanel.className = "aside-panel";
  asidePanel.innerHTML = `
    <li role="listitem" tabindex="0" class  ="css-175oi2r r-1mmae3n r-3pj75a r-1loqt21 r-o7ynqc r-6416eg r-1ny4l3l" data-testid="UserCell"><div class="css-175oi2r r-18u37iz"><div class="css-175oi2r r-18kxxzh r-1wron08 r-onrtq4 r-1777fci"><div class="css-175oi2r r-1wbh5a2 r-dnmrzs"><div class="css-175oi2r r-bztko3 r-1adg3ll r-13qz1uu" data-testid="UserAvatar-Container-hanzlaahmad164" style="height: 40px;"><div class="r-1adg3ll r-13qz1uu" style="padding-bottom: 100%;"></div><div class="r-1p0dtai r-1pi2tsx r-1d2f490 r-u8s1d r-ipm5af r-13qz1uu"><div class="css-175oi2r r-1adg3ll r-1pi2tsx r-13qz1uu r-45ll9u r-u8s1d r-1v2oles r-176fswd"><div class="r-1adg3ll r-13qz1uu" style="padding-bottom: 100%;"></div><div class="r-1p0dtai r-1pi2tsx r-1d2f490 r-u8s1d r-ipm5af r-13qz1uu"><div class="css-175oi2r r-sdzlij r-1udh08x r-5f1w11 r-u8s1d r-8jfcpp" style="width: calc(100% + 4px); height: calc(100% + 4px);"><a href="/hanzlaahmad164" aria-hidden="true" role="link" tabindex="-1" class="css-175oi2r r-1pi2tsx r-13qz1uu r-o7ynqc r-6416eg r-1ny4l3l" style="background-color: rgba(0, 0, 0, 0);"><div class="css-175oi2r r-sdzlij r-1udh08x r-633pao r-45ll9u r-u8s1d r-1v2oles r-176fswd" style="width: calc(100% - 4px); height: calc(100% - 4px);"><div class="css-175oi2r r-1pi2tsx r-13qz1uu" style="background-color: rgba(0, 0, 0, 0);"></div></div><div class="css-175oi2r r-sdzlij r-1udh08x r-633pao r-45ll9u r-u8s1d r-1v2oles r-176fswd" style="width: calc(100% - 4px); height: calc(100% - 4px);"><div class="css-175oi2r r-1pi2tsx r-13qz1uu r-kemksi"></div></div><div class="css-175oi2r r-sdzlij r-1udh08x r-633pao r-45ll9u r-u8s1d r-1v2oles r-176fswd" style="background-color: rgb(0, 0, 0); width: calc(100% - 4px); height: calc(100% - 4px);"><div class="css-175oi2r r-1adg3ll r-1udh08x" style=""><div class="r-1adg3ll r-13qz1uu" style="padding-bottom: 100%;"></div><div class="r-1p0dtai r-1pi2tsx r-1d2f490 r-u8s1d r-ipm5af r-13qz1uu"><div class="css-175oi2r r-1mlwlqe r-1udh08x r-417010 r-1p0dtai r-1d2f490 r-u8s1d r-zchlnj r-ipm5af"><div class="css-175oi2r r-1niwhzg r-vvn4in r-u6sd8q r-1p0dtai r-1pi2tsx r-1d2f490 r-u8s1d r-zchlnj r-ipm5af r-13qz1uu r-1wyyakw r-4gszlv" style="background-image: url(&quot;https://pbs.twimg.com/profile_images/1757325040482131968/v5fST_Vf_x96.jpg&quot;);"></div><img alt="" draggable="true" src="https://pbs.twimg.com/profile_images/1757325040482131968/v5fST_Vf_x96.jpg" class="css-9pa8cd"></div></div></div></div><div class="css-175oi2r r-sdzlij r-1udh08x r-45ll9u r-u8s1d r-1v2oles r-176fswd" style="width: calc(100% - 4px); height: calc(100% - 4px);"><div class="css-175oi2r r-172uzmj r-1pi2tsx r-13qz1uu r-o7ynqc r-6416eg r-1ny4l3l"></div></div></a></div></div></div></div></div></div></div></div><div class="css-175oi2r r-1iusvr4 r-16y2uox r-1777fci"><div class="css-175oi2r r-1awozwy r-18u37iz r-1wtj0ep"><div class="css-175oi2r r-1wbh5a2 r-dnmrzs r-1ny4l3l"><div class="css-175oi2r r-1wbh5a2 r-dnmrzs r-1ny4l3l"><div class="css-175oi2r r-1wbh5a2 r-dnmrzs"><a href="/hanzlaahmad164" role="link" class="css-175oi2r r-1wbh5a2 r-dnmrzs r-1ny4l3l r-1loqt21"><div class="css-175oi2r r-1awozwy r-18u37iz r-dnmrzs"><div dir="ltr" class="css-146c3p1 r-bcqeeo r-1ttztb7 r-qvutc0 r-1qd0xha r-a023e6 r-rjixqe r-b88u0q r-1awozwy r-6koalj r-1udh08x r-3s2u2q" style="text-overflow: unset; color: rgb(231, 233, 234);"><span class="css-1jxf684 r-dnmrzs r-1udh08x r-3s2u2q r-bcqeeo r-1ttztb7 r-qvutc0 r-poiln3" style="text-overflow: unset;"><span class="css-1jxf684 r-bcqeeo r-1ttztb7 r-qvutc0 r-poiln3" style="text-overflow: unset;">Hanzla Ahmad</span><span class="css-1jxf684 r-bcqeeo r-1ttztb7 r-qvutc0 r-poiln3 r-9iso6" style="text-overflow: unset;"></span></span></div><div dir="ltr" class="css-146c3p1 r-bcqeeo r-1ttztb7 r-qvutc0 r-1qd0xha r-a023e6 r-rjixqe r-16dba41 r-xoduu5 r-18u37iz r-1q142lx" style="text-overflow: unset; color: rgb(231, 233, 234);"><span class="css-1jxf684 r-bcqeeo r-1ttztb7 r-qvutc0 r-poiln3 r-1awozwy r-xoduu5" style="text-overflow: unset;"><svg viewBox="0 0 22 22" aria-label="Verified account" role="img" class="r-4qtqp9 r-yyyyoo r-1xvli5t r-bnwqim r-lrvibr r-m6rgpd r-1cvl2hr r-f9ja8p r-og9te1 r-3t4u6i" data-testid="icon-verified"><g><path d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.688-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.634.433 1.218.877 1.688.47.443 1.054.747 1.687.878.633.132 1.29.084 1.897-.136.274.586.705 1.084 1.246 1.439.54.354 1.17.551 1.816.569.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.239 1.266.296 1.903.164.636-.132 1.22-.447 1.68-.907.46-.46.776-1.044.908-1.681s.075-1.299-.165-1.903c.586-.274 1.084-.705 1.439-1.246.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z"></path></g></svg></span></div></div></a></div><div class="css-175oi2r r-1awozwy r-18u37iz r-1wbh5a2"><div class="css-175oi2r r-1wbh5a2 r-dnmrzs"><a href="/hanzlaahmad164" role="link" tabindex="-1" class="css-175oi2r r-1wbh5a2 r-dnmrzs r-1ny4l3l r-1loqt21"><div class="css-175oi2r"><div dir="ltr" class="css-146c3p1 r-dnmrzs r-1udh08x r-3s2u2q r-bcqeeo r-1ttztb7 r-qvutc0 r-1qd0xha r-a023e6 r-rjixqe r-16dba41 r-18u37iz r-1wvb978" style="text-overflow: unset; color: rgb(113, 118, 123);"><span class="css-1jxf684 r-bcqeeo r-1ttztb7 r-qvutc0 r-poiln3" style="text-overflow: unset;">@hanzlaahmad164</span></div></div></a></div></div></div></div><div class="css-175oi2r r-1cwvpvk" style="min-width: 0px;"><a href="/hanzlaahmad164" aria-label="Follow @hanzlaahmad164" class="css-175oi2r r-sdzlij r-1phboty r-rs99b7 r-lrvibr r-15ysp7h r-4wgw6l r-3pj75a r-1loqt21 r-o7ynqc r-6416eg r-1ny4l3l" style="background-color: rgb(239, 243, 244); border-color: rgba(0, 0, 0, 0);"><div dir="ltr" class="css-146c3p1 r-bcqeeo r-qvutc0 r-1qd0xha r-q4m81j r-a023e6 r-rjixqe r-b88u0q r-1awozwy r-6koalj r-18u37iz r-16y2uox r-1777fci" style="text-overflow: unset; color: rgb(15, 20, 25);"><span class="css-1jxf684 r-dnmrzs r-1udh08x r-3s2u2q r-bcqeeo r-1ttztb7 r-qvutc0 r-poiln3 r-1b43r93 r-1cwl3u0" style="text-overflow: unset;"><span class="css-1jxf684 r-bcqeeo r-1ttztb7 r-qvutc0 r-poiln3" style="text-overflow: unset;">Follow</span></span></div></a></div></div></div></div></li>
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

const observer3 = new MutationObserver(() => {
  insertCopyTweetButton();
});

observer.observe(document.body, { childList: true, subtree: true });
observer3.observe(document.body, { childList: true, subtree: true });