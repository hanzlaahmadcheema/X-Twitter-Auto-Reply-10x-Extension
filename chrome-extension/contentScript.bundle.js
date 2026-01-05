const ICONS = {
  microphone: '<svg width="22px" height="22px" stroke-width="1.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" color="#ffffff"><rect x="9" y="2" width="6" height="12" rx="3" stroke="#ffffff" stroke-width="1.5" stroke-width="1.5"></rect><path d="M5 10V11C5 14.866 8.13401 18 12 18V18V18C15.866 18 19 14.866 19 11V10" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M12 18V22M12 22H9M12 22H15" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>',
  stop: '<svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 384 512" fill="currentColor"><!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M0 128C0 92.7 28.7 64 64 64H320c35.3 0 64 28.7 64 64V384c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V128z"/></svg>',
  camera: '<svg width="18px" height="18px" stroke-width="1.5" viewBox="0 0 24 24" fill="#1da1f2" xmlns="http://www.w3.org/2000/svg" color="none"><path d="M2 19V9C2 7.89543 2.89543 7 4 7H4.5C5.12951 7 5.72229 6.70361 6.1 6.2L8.32 3.24C8.43331 3.08892 8.61115 3 8.8 3H15.2C15.3889 3 15.5667 3.08892 15.68 3.24L17.9 6.2C18.2777 6.70361 18.8705 7 19.5 7H20C21.1046 7 22 7.89543 22 9V19C22 20.1046 21.1046 21 20 21H4C2.89543 21 2 20.1046 2 19Z" stroke="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M12 17C14.2091 17 16 15.2091 16 13C16 10.7909 14.2091 9 12 9C9.79086 9 8 10.7909 8 13C8 15.2091 9.79086 17 12 17Z" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>',
  check: '<svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 448 512" fill="currentColor"><!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z"/></svg>',
  timesCircle: '<svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512" fill="currentColor"><!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM175 175c9.4-9.4 24.6-9.4 33.9 0l47 47 47-47c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-47 47 47 47c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-47-47-47 47c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l47-47-47-47c-9.4-9.4-9.4-24.6 0-33.9z"/></svg>',
  exclamationCircle: '<svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512" fill="currentColor"><!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zm0-384c13.3 0 24 10.7 24 24V264c0 13.3-10.7 24-24 24s-24-10.7-24-24V152c0-13.3 10.7-24 24-24zM224 352a32 32 0 1 1 64 0 32 32 0 1 1 -64 0z"/></svg>',
  copy: '<svg xmlns="http://www.w3.org/2000/svg" width="18px" height="18px" viewBox="0 0 32 32"><path fill="#1da1f2" d="M8.5 5.25A3.25 3.25 0 0 1 11.75 2h12A3.25 3.25 0 0 1 27 5.25v18a3.25 3.25 0 0 1-3.25 3.25h-12a3.25 3.25 0 0 1-3.25-3.25zM5 8.75c0-1.352.826-2.511 2-3.001v17.75a4.5 4.5 0 0 0 4.5 4.5h11.751a3.25 3.25 0 0 1-3.001 2H11.5A6.5 6.5 0 0 1 5 23.5z"/></svg>', // Using 'file' icon as copy, or standard copy
  generate: ' <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#fff"><path d="M18 3C20.2091 3 22 4.79086 22 7V17C22 19.2091 20.2091 21 18 21H6C3.79086 21 2 19.2091 2 17V7C2 4.79086 3.79086 3 6 3H18ZM6 5C4.89543 5 4 5.89543 4 7V17C4 18.1046 4.89543 19 6 19H18C19.1046 19 20 18.1046 20 17V7C20 5.89543 19.1046 5 18 5H6ZM11.4121 7.39941C11.6327 6.86708 12.3673 6.86706 12.5879 7.39941L12.9043 8.16309C13.4442 9.46657 14.4522 10.5081 15.7188 11.0713L16.6152 11.4697C17.1284 11.6982 17.1285 12.4455 16.6152 12.6738L15.665 13.0957C14.4305 13.6448 13.4409 14.6486 12.8916 15.9092L12.584 16.6162C12.3584 17.1338 11.6416 17.1338 11.416 16.6162L11.1084 15.9092C10.5591 14.6486 9.56954 13.6448 8.33496 13.0957L7.38477 12.6738C6.87153 12.4455 6.87165 11.6982 7.38477 11.4697L8.28125 11.0713C9.54772 10.5081 10.5548 9.46657 11.0947 8.16309L11.4121 7.39941Z"></path></svg>'
};

// Utility: Debounce function
function debounce(fn, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), delay);
  };
}

// Utility: Conditional logging
const DEBUG = false;
function log(...args) {
  if (DEBUG) console.log(...args);
}

// Utility: Find the best input target (Media Caption or Standard Reply)
function getBestInputTarget() {
  const isSearchInput = (el) => {
    const ariaLabel = (el.getAttribute('aria-label') || '').toLowerCase();
    const placeholder = (el.getAttribute('placeholder') || '').toLowerCase();
    const dataTestid = (el.getAttribute('data-testid') || '').toLowerCase();
    const role = (el.getAttribute('role') || '').toLowerCase();

    return ariaLabel.includes('search') ||
      placeholder.includes('search') ||
      dataTestid.includes('search') ||
      role === 'searchbox' ||
      el.closest('[role="search"]') ||
      el.closest('[data-testid="SearchBox_Search_Input"]');
  };

  // 1. Check for Media Caption Input (Dialogs or Specific Test IDs)
  const mediaInput =
    document.querySelector('[data-testid="media-caption-input"] [contenteditable="true"]') ||
    document.querySelector('div[role="dialog"] [contenteditable="true"]') ||
    document.querySelector('[aria-label*="caption"][contenteditable="true"]') ||
    document.querySelector('[placeholder*="caption"][contenteditable="true"]');

  if (mediaInput && !isSearchInput(mediaInput) && (mediaInput.offsetParent !== null || mediaInput.getClientRects().length > 0)) {
    return mediaInput;
  }

  // 2. Fallback to Standard Reply Input
  const standardInput =
    document.querySelector('[data-testid="tweetTextarea_0"]') ||
    document.querySelector('div[contenteditable="true"][role="textbox"]') ||
    document.querySelector('footer [contenteditable="true"]');

  if (standardInput && !isSearchInput(standardInput)) {
    return standardInput;
  }

  // 3. Final Fallback: any visible contenteditable that isn't searching
  return Array.from(document.querySelectorAll('div[contenteditable="true"]'))
    .find(el => !isSearchInput(el) && (el.offsetParent !== null || el.getClientRects().length > 0));
}

// Storage Cache System
class StorageCache {
  constructor() {
    this.cache = {};
    this.initialized = false;
    this.init();
  }

  async init() {
    try {
      this.cache = await chrome.storage.sync.get(null);
      this.initialized = true;

      // Listen for changes
      chrome.storage.onChanged.addListener((changes) => {
        Object.keys(changes).forEach(key => {
          this.cache[key] = changes[key].newValue;
        });
      });
    } catch (error) {
      console.error('StorageCache init error:', error);
    }
  }

  get(key, defaultValue = null) {
    return this.cache[key] !== undefined ? this.cache[key] : defaultValue;
  }

  async waitForInit() {
    if (this.initialized) return;
    return new Promise((resolve) => {
      const check = setInterval(() => {
        if (this.initialized) {
          clearInterval(check);
          resolve();
        }
      }, 50);
    });
  }
}

const storageCache = new StorageCache();

// Regex pattern cached at module level for performance
const DASH_REPLACEMENT_REGEX = /\bDash\b|ڈیش/g;

// Speech Recognition Manager (Singleton)
class SpeechRecognitionManager {
  constructor() {
    this.recognition = null;
    this.isRecording = false;
    this.currentButton = null;
    this.currentConfig = null;
  }

  _setupEventHandlers(config) {
    if (!this.recognition) return;

    this.recognition.onstart = () => {
      this.isRecording = true;
      if (this.currentButton) {
        this.currentButton.classList.remove('mic-idle');
        this.currentButton.classList.add('mic-recording');
        this.currentButton.innerHTML = `<span style="color: red;">${ICONS.stop}</span>`;
        this.currentButton.dataset.state = "recording";
      }
      // showSuccessMessage(`${ICONS.microphone} Speech recognition started...`);
    };

    this.recognition.onresult = (event) => {
      let speechResult = event.results[0][0].transcript;
      speechResult = speechResult.replace(DASH_REPLACEMENT_REGEX, "۔");

      if (this.currentConfig && this.currentConfig.onResult) {
        this.currentConfig.onResult(speechResult);
      } else {
        insertReplyText(speechResult);
      }

      // showSuccessMessage(`${ICONS.check} Speech recognized`);
    };

    this.recognition.onerror = (event) => {
      const errorMsg = event.error;
      let userMessage = `${ICONS.exclamationCircle} Speech recognition error: ${errorMsg}`;

      // Categorize errors for better user feedback
      if (errorMsg === 'no-speech' || errorMsg === 'audio-capture') {
        userMessage = `${ICONS.exclamationCircle} No audio detected. Please check your microphone.`;
      } else if (errorMsg === 'network') {
        userMessage = `${ICONS.exclamationCircle} Network error. Please check your connection.`;
      } else if (errorMsg === 'not-allowed') {
        userMessage = `${ICONS.exclamationCircle} Microphone permission denied.`;
      }

      if (DEBUG) {
        log('Speech recognition error:', errorMsg);
      }

      // showSuccessMessage(userMessage);
      this.stop();
    };

    this.recognition.onend = () => {
      this.stop();
    };
  }

  start(button, config = {}) {
    // Stop any existing recording
    if (this.isRecording) {
      this.stop();
    }

    this.currentButton = button;
    this.currentConfig = config;

    // Clean up existing recognition instance
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {
        // Ignore errors when stopping
      }
      this.recognition = null;
    }

    // Create new recognition instance
    this.recognition = new webkitSpeechRecognition();
    this.recognition.lang = config.lang || "ur-PK";
    this.recognition.interimResults = config.interimResults || false;
    this.recognition.maxAlternatives = config.maxAlternatives || 1;

    // Setup fresh event handlers
    this._setupEventHandlers(config);

    try {
      this.recognition.start();
    } catch (error) {
      if (DEBUG) {
        log('Speech recognition start error:', error);
      }
      console.error('Speech recognition start error:', error);
      this.stop();
    }
  }

  stop() {
    if (this.recognition && this.isRecording) {
      try {
        this.recognition.stop();
      } catch (error) {
        if (DEBUG) {
          log('Speech recognition stop error:', error);
        }
        console.error('Speech recognition stop error:', error);
      }
    }

    this.isRecording = false;

    if (this.currentButton) {
      this.currentButton.classList.remove('mic-recording');
      this.currentButton.classList.add('mic-idle');
      this.currentButton.innerHTML = ICONS.microphone;
      this.currentButton.dataset.state = "idle";
    }

    // Dispose of recognition object
    if (this.recognition) {
      // Remove event handlers before disposing
      this.recognition.onstart = null;
      this.recognition.onresult = null;
      this.recognition.onerror = null;
      this.recognition.onend = null;
      this.recognition = null;
    }

    this.currentConfig = null;

    // showSuccessMessage(`${ICONS.stop} Speech recognition stopped.`);
  }

  cleanup() {
    this.stop();
    this.currentButton = null;
  }
}

const speechManager = new SpeechRecognitionManager();

// Cleanup on page unload/navigation to prevent memory leaks
window.addEventListener('beforeunload', () => {
  speechManager.cleanup();
});

window.addEventListener('pagehide', () => {
  speechManager.cleanup();
});

function getTweetContext() {
  let tweetText = "";
  const mainTweetElement =
    document.querySelector('[data-testid="tweetText"]') ||
    document.querySelector('[data-testid="tweet"]');
  if (mainTweetElement) {
    tweetText = mainTweetElement.innerText.trim();
    log(tweetText);
    return tweetText;
  }
  return "";
}

function getTweetThreadContext() {
  const threadTexts = [];
  // Get main tweet
  const mainTweet = getTweetContext();
  if (mainTweet) threadTexts.push(`Current Post: ${mainTweet}`);

  // Try to get parent tweets (X usually shows them in a conversation thread)
  const conversation = document.querySelectorAll('[data-testid="tweetText"]');
  conversation.forEach((el, index) => {
    const text = el.innerText.trim();
    if (text && !threadTexts.includes(`Context ${index}: ${text}`)) {
      // Only add if it's not the main tweet (approximate check)
      if (text !== mainTweet) {
        threadTexts.unshift(`Parent Post ${index}: ${text}`);
      }
    }
  });

  return threadTexts.slice(-3).join("\n\n"); // Last 3 posts for context
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
  const targetInput = getBestInputTarget();

  if (targetInput) {
    targetInput.focus();
    // targetInput.value = ""; // Don't clear for speech if we want to append, but for AI generation we usually replace.
    // However, this function is primarily used by voice recognition's final result.

    const dataTransfer = new DataTransfer();
    dataTransfer.setData("text/plain", filteredText + " ");

    targetInput.dispatchEvent(
      new ClipboardEvent("paste", {
        clipboardData: dataTransfer,
        bubbles: true,
        cancelable: true,
      })
    );
  }
}



function extractTextWithEmojis(element) {
  let text = "";

  element.childNodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      text += node.textContent;
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      if (node.tagName === "IMG" && node.alt) {
        text += node.alt;
      } else if (node.tagName === "BR") {
        text += "\n";
      } else {
        text += extractTextWithEmojis(node);
      }
    }
  });

  return text;
}

function getTweetContextFromShareButton(shareButton) {
  const tweetElement = shareButton.closest('[data-testid="tweet"]');
  if (!tweetElement) {
    console.error("Tweet element not found!");
    return "";
  }

  const mainTweetElement = tweetElement.querySelector('[data-testid="tweetText"]');
  if (!mainTweetElement) {
    console.error("Tweet text element not found!");
    return "";
  }

  let tweetText = extractTextWithEmojis(mainTweetElement);

  tweetText = tweetText.replace(/#\S+/g, "").trim();

  log(tweetText);
  return tweetText;
}

// html2canvas loading optimization
/*
let html2canvasLoaded = false;

function waitForHtml2Canvas(callback) {
  if (typeof html2canvas !== "undefined") {
    log("✅ html2canvas is available.");
    html2canvasLoaded = true;
    callback();
  } else {
    log("⏳ Waiting for html2canvas...");
    setTimeout(() => waitForHtml2Canvas(callback), 500);
  }
}
*/

// Capture Tweet Screenshot Function
/*
function captureTweetScreenshot(shareButton) {
  const tweetElement = shareButton.closest('[data-testid="tweet"]');
  if (!tweetElement) {
    console.error("❌ Tweet not found!");
    return;
  }

  log("Taking screenshot...");
  shareButton.innerHTML = ICONS.check;
  shareButton.style.color = "green";
  setTimeout(() => {
    shareButton.innerHTML = ICONS.camera;
    shareButton.style.color = "";
  }, 4000);

  // Only inject if not already loaded
  if (!html2canvasLoaded) {
    chrome.runtime.sendMessage({ action: "injectHtml2Canvas" }, (response) => {
      if (response?.success) {
        log("✅ html2canvas injected successfully.");
        waitForHtml2Canvas(() => takeScreenshot(tweetElement));
      } else {
        console.error("❌ Error injecting html2canvas:", response?.error);
      }
    });
  } else {
    takeScreenshot(tweetElement);
  }
}
*/

// Helper to convert image to Base64 (optimized)
/*
async function imageToBase64(url) {
  try {
    const response = await fetch(url);
    const blob = await response.blob();

    // Use createImageBitmap for better performance
    const bitmap = await createImageBitmap(blob);
    const canvas = document.createElement('canvas');
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(bitmap, 0, 0);

    return canvas.toDataURL('image/png');
  } catch (err) {
    console.error("Error converting image to base64:", err);
    return null;
  }
}
*/

/*
async function takeScreenshot(tweetElement) {
  const tweetContainer = tweetElement.closest('article[data-testid="tweet"]');
  if (!tweetContainer) {
    // showSuccessMessage('❌ Tweet container not found');
    return;
  }

  // Hide our injected buttons before screenshot (using visibility instead of display)
  const copyBtn = tweetContainer.querySelector('.copy-tweet-btn');
  const shotBtn = tweetContainer.querySelector('.screenshot-btn');
  if (copyBtn) copyBtn.style.visibility = 'hidden';
  if (shotBtn) shotBtn.style.visibility = 'hidden';

  // Determine the correct background color by traversing up the DOM
  let currentElement = tweetContainer;
  let backgroundColor = 'transparent';

  while (currentElement) {
    const style = getComputedStyle(currentElement);
    const color = style.backgroundColor;
    if (color && color !== 'rgba(0, 0, 0, 0)' && color !== 'transparent') {
      backgroundColor = color;
      break;
    }
    currentElement = currentElement.parentElement;
  }

  if (backgroundColor === 'transparent' || backgroundColor === 'rgba(0, 0, 0, 0)') {
    backgroundColor = getComputedStyle(document.body).backgroundColor;
  }

  // Elements to hide
  const selectorsToHide = [
    '[role="group"]',
    'a[href*="/analytics"]',
    'div[data-testid="caret"]',
    'button[aria-label*="Follow"]',
    'button[data-testid*="grok"]',
    '[aria-label="Grok"]',
    'span[data-testid="socialContext"]',
  ];

  const hiddenElements = [];

  selectorsToHide.forEach(selector => {
    const elements = tweetContainer.querySelectorAll(selector);
    elements.forEach(el => {
      hiddenElements.push({ element: el, originalVisibility: el.style.visibility });
      el.style.visibility = 'hidden';
    });
  });

  // Hide "Translate post" link/button
  const allButtons = tweetContainer.querySelectorAll('button, span');
  allButtons.forEach(el => {
    if (el.innerText === 'Translate post' || el.innerText === 'Show translation') {
      const target = el.closest('[role="button"]') || el;
      hiddenElements.push({ element: target, originalVisibility: target.style.visibility });
      target.style.visibility = 'hidden';
    }
  });

  // Handle Profile Picture - Convert to Base64
  const avatarImg = tweetContainer.querySelector('[data-testid="UserAvatar-Container"] img');
  let originalAvatarSrc = '';
  if (avatarImg) {
    originalAvatarSrc = avatarImg.src;
    const base64 = await imageToBase64(originalAvatarSrc);
    if (base64) {
      avatarImg.src = base64;
    }
  }

  // Use html2canvas directly on the tweet container
  html2canvas(tweetContainer, {
    useCORS: true,
    allowTaint: true,
    backgroundColor: backgroundColor,
  }).then(canvas => {
    const image = canvas.toDataURL('image/png');
    const filename = `tweet-${Date.now()}.png`;

    const link = document.createElement('a');
    link.href = image;
    link.download = filename;
    link.click();

    // showSuccessMessage(`${ICONS.camera} Screenshot captured!`);
  }).catch(error => {
    console.error("Screenshot error:", error);
    // showSuccessMessage(`${ICONS.timesCircle} Screenshot failed: ${error.message}`);
  }).finally(() => {
    // Restore buttons
    if (copyBtn) copyBtn.style.visibility = 'visible';
    if (shotBtn) shotBtn.style.visibility = 'visible';

    // Restore other hidden elements
    hiddenElements.forEach(({ element, originalVisibility }) => {
      element.style.visibility = originalVisibility;
    });

    // Restore Avatar
    if (avatarImg && originalAvatarSrc) {
      avatarImg.src = originalAvatarSrc;
    }
  });
}
*/

//#region Get tweet URL


// Notification element singleton for reuse
let notificationElement = null;
let notificationTimeout = null;

// Function to show a small success notification (optimized with element reuse)
function showSuccessMessage(message) {
  // Create notification element if it doesn't exist
  if (!notificationElement) {
    notificationElement = document.createElement("div");
    notificationElement.className = "speech-extension-notification";
    notificationElement.style.cssText = `
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
      opacity: 0;
      transition: opacity 0.3s ease-in-out;
      pointer-events: none;
    `;
    document.body.appendChild(notificationElement);
  }

  // Clear existing timeout
  if (notificationTimeout) {
    clearTimeout(notificationTimeout);
  }

  // Update message and show
  notificationElement.innerHTML = message;
  notificationElement.style.opacity = "1";
  notificationElement.style.pointerEvents = "auto";

  // Hide after 2000ms (reduced from 3000ms for faster feedback)
  notificationTimeout = setTimeout(() => {
    if (notificationElement) {
      notificationElement.style.opacity = "0";
      notificationElement.style.pointerEvents = "none";
    }
  }, 2000);
}


//#region WhatsApp Mic Button
// Initialize WhatsApp mic button independently (runs on WhatsApp pages)
function initializeWhatsAppMicButton() {
  // Only run on WhatsApp pages (web.whatsapp.com or whatsapp.com)
  if (!window.location.hostname.includes('whatsapp.com')) {
    return;
  }

  // Add confirmation dialog when reloading/navigating away from WhatsApp Web
  window.addEventListener('beforeunload', (e) => {
    // Modern browsers require returnValue to be set for the dialog to show
    e.preventDefault();
    e.returnValue = ''; // Chrome requires returnValue to be set
    return ''; // Some browsers also require a return value
  });

  let whatsappObserver = null;
  let mainButtonAdded = false;
  let mediaButtonAdded = false;

  // Function to add mic button to WhatsApp input field
  function addMicToWhatsApp() {
    // Add to main message input
    // if (!mainButtonAdded && !document.querySelector(".whatsapp-mic-btn-main")) {
    //   addMicToInput('main');
    // }

    // Add to media caption input
    if (!mediaButtonAdded && !document.querySelector(".whatsapp-mic-btn-media")) {
      addMicToInput('media');
    }
  }

  function addMicToInput(type) {
    let whatsappInput = null;
    let buttonClass = '';
    let selectors = [];

    if (type === 'main') {
      buttonClass = 'whatsapp-mic-btn-main';
      selectors = [
        'footer div[contenteditable="true"][data-tab="10"]',
        'footer div[contenteditable="true"][role="textbox"]',
        'footer p.selectable-text.copyable-text[contenteditable="true"]',
        'div[contenteditable="true"][data-tab="10"]:not([aria-label*="Search"], [aria-label*="search"])',
        'footer div[contenteditable="true"]'
      ];
      // Fallback: find contenteditable that's NOT in the sidebar/panel (search area)
      whatsappInput = selectors.map(sel => document.querySelector(sel)).find(el => el) ||
        Array.from(document.querySelectorAll('div[contenteditable="true"]')).find(el => {
          // Exclude elements that are likely search inputs
          const ariaLabel = el.getAttribute('aria-label') || '';
          const parent = el.closest('[data-testid*="search"], [role="search"], [class*="search"]');
          const isInFooter = el.closest('footer');
          return !parent && !ariaLabel.toLowerCase().includes('search') && (isInFooter || el.closest('[data-testid*="conversation"]'));
        });
    } else if (type === 'media') {
      buttonClass = 'whatsapp-mic-btn-media';
      // Universal finder logic for "Right Popup" button
      // It should prioritize Media Caption, then fallback to Main Message, NEVER Search.
      const findTarget = () => {
        // 1. Media Caption Input (Standard)
        // 2. Any contenteditable in a dialog (Media View is usually a dialog)
        // 3. Caption input specifically by aria-label
        const media = document.querySelector('div[data-testid="media-caption-input"] div[contenteditable="true"]') ||
          document.querySelector('div[role="dialog"] div[contenteditable="true"]') ||
          document.querySelector('div[contenteditable="true"][aria-label*="caption"]') ||
          document.querySelector('div[contenteditable="true"][placeholder*="caption"]');

        if (media && media.offsetParent !== null) return media;

        // 2. Main (Footer) - Strict check to avoid search
        const main = Array.from(document.querySelectorAll('footer div[contenteditable="true"], div[contenteditable="true"][data-tab="10"]'))
          .find(el => {
            const inSide = el.closest('[id="side"]'); // Sidebar contains search
            const isSearch = el.closest('[role="search"]') || el.getAttribute('aria-label')?.toLowerCase().includes('search');
            return !inSide && !isSearch && el.offsetParent !== null;
          });
        return main;
      };

      whatsappInput = findTarget();
    }

    if (whatsappInput) {
      // Find the input container
      let inputContainer = whatsappInput.closest('footer') ||
        whatsappInput.closest('[role="textbox"]') ||
        whatsappInput.closest('div[contenteditable="false"]') ||
        whatsappInput.parentElement?.parentElement ||
        whatsappInput.parentElement;

      const micButton = document.createElement("button");
      micButton.className = buttonClass;
      micButton.innerHTML = ICONS.microphone;
      micButton.setAttribute('aria-label', 'Voice input');
      micButton.dataset.state = "idle";

      // Style the button
      micButton.style.cssText = `
        background-color: #1DA1F2;
        color: #54656f;
        border: none;
        border-radius: 50%;
        width: 36px;
        height: 36px;
        min-width: 36px;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 0;
        margin: 0;
        flex-shrink: 0;
        transition: opacity 0.2s;
      `;

      // Try to insert into input container
      let inserted = false;

      // Force fixed positioning for media button as per user request
      if (type === 'media') {
        inserted = false; // Force fallback logic
      } else if (inputContainer && inputContainer !== document.body && inputContainer.tagName !== 'BODY') {
        // ... existing insertion logic for main button ...
        // But since main button is currently disabled, this part might not be reached for main.
        // However, we should preserve the logic structure for safety.

        // Start of original insertion logic
        try {
          // For main input, insert next to plus icon
          const plusIcon = inputContainer.querySelector('span[data-icon="plus"]')?.parentElement ||
            inputContainer.querySelector('span[data-icon="attach"]')?.parentElement ||
            inputContainer.querySelector('button[aria-label*="Attach"], button[aria-label*="attach"]') ||
            inputContainer.querySelector('button[aria-label*="Plus"], button[aria-label*="plus"]') ||
            inputContainer.querySelector('[role="button"][aria-label*="Attach"], [role="button"][aria-label*="attach"]') ||
            Array.from(inputContainer.querySelectorAll('[role="button"], button, span[data-icon]')).find(btn => {
              const icon = btn.querySelector('span[data-icon]');
              return icon && (icon.getAttribute('data-icon') === 'plus' || icon.getAttribute('data-icon') === 'attach');
            });

          if (plusIcon && plusIcon.parentElement) {
            if (plusIcon.nextSibling) {
              plusIcon.parentElement.insertBefore(micButton, plusIcon.nextSibling);
            } else {
              plusIcon.parentElement.appendChild(micButton);
            }
            inserted = true;
          } else {
            const buttonRow = inputContainer.querySelector('[role="button"]')?.parentElement ||
              inputContainer.querySelector('span[data-icon]')?.parentElement?.parentElement ||
              inputContainer.querySelector('div[role="toolbar"]') ||
              inputContainer;

            if (buttonRow && buttonRow !== whatsappInput) {
              const firstButton = Array.from(buttonRow.querySelectorAll('[role="button"], button, span[data-icon]?.parentElement')).find(btn => {
                return btn && btn.offsetParent !== null;
              });

              if (firstButton && firstButton.parentElement) {
                if (firstButton.nextSibling) {
                  firstButton.parentElement.insertBefore(micButton, firstButton.nextSibling);
                } else {
                  firstButton.parentElement.appendChild(micButton);
                }
                inserted = true;
              } else {
                if (buttonRow.firstChild) {
                  buttonRow.insertBefore(micButton, buttonRow.firstChild);
                } else {
                  buttonRow.appendChild(micButton);
                }
                inserted = true;
              }
            }
          }
        } catch (e) {
          console.log('Error inserting button into container:', e);
        }
      }

      // Fallback: fixed positioning
      if (!inserted) {
        const rect = whatsappInput.getBoundingClientRect();
        micButton.style.position = 'fixed';
        micButton.style.right = '20px';
        micButton.style.bottom = type === 'media' ? '120px' : '20px';
        micButton.style.zIndex = '99999';
        document.body.appendChild(micButton);
      }

      if (type === 'main') {
        mainButtonAdded = true;
      } else {
        mediaButtonAdded = true;
      }

      // Add click handler
      micButton.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (micButton.dataset.state !== "recording") {
          speechManager.start(micButton, {
            lang: "ur-PK",
            interimResults: false,
            maxAlternatives: 1,
            onResult: (text) => {
              try {
                // Get all potential inputs
                const allInputs = Array.from(document.querySelectorAll('div[contenteditable="true"]'));

                // Helper to check if an element is a search box
                const isSearchInput = (el) => {
                  const ariaLabel = (el.getAttribute('aria-label') || '').toLowerCase();
                  return el.closest('[role="search"]') ||
                    el.closest('[id="side"]') ||
                    ariaLabel.includes('search');
                };

                // Find Media Caption Input (Strict & Lexical-aware)
                const mediaInput = allInputs.find(el => {
                  if (isSearchInput(el)) return false;
                  if (el.closest('footer')) return false;

                  const ariaLabel = (el.getAttribute('aria-label') || '').toLowerCase();
                  const placeholder = (el.getAttribute('placeholder') || '').toLowerCase();
                  const dataTestid = (el.getAttribute('data-testid') || '').toLowerCase();
                  const isLexical = el.getAttribute('data-lexical-editor') === 'true';

                  const hasCaptionKeywords = ariaLabel.includes('caption') ||
                    placeholder.includes('caption') ||
                    dataTestid.includes('caption');

                  const isDialog = el.closest('[role="dialog"]');
                  const isMediaContainer = el.closest('[data-testid="media-caption-input"]') ||
                    el.closest('[class*="media"]');

                  // High confidence check: visible, non-footer, Lexical editor in a dialog or with caption keywords
                  return (isLexical || hasCaptionKeywords || isDialog || isMediaContainer) &&
                    (el.offsetParent !== null || el.getClientRects().length > 0);
                });

                // Find Main Chat Input
                const mainInput = allInputs.find(el => {
                  if (isSearchInput(el)) return false;
                  return el.closest('footer') && el.offsetParent !== null;
                });

                // Decide target based on button type
                let target = getBestInputTarget();

                if (!target) {
                  console.error('No valid input target found for speech');
                  return;
                }

                target.focus();

                // Use DataTransfer and paste event which is more reliable for Lexical/complex editors
                const dataTransfer = new DataTransfer();
                dataTransfer.setData("text/plain", text + " ");
                const pasteEvent = new ClipboardEvent("paste", {
                  clipboardData: dataTransfer,
                  bubbles: true,
                  cancelable: true,
                });

                target.dispatchEvent(pasteEvent);

                // Trigger input events as backup
                target.dispatchEvent(new InputEvent('input', { bubbles: true }));
                target.dispatchEvent(new Event('keyup', { bubbles: true }));

                console.log('Speech text inserted in WhatsApp input:', text);
              } catch (err) {
                console.error('Error inserting text for WhatsApp:', err);
              }
            }
          });
        } else {
          speechManager.stop();
        }
      });

      console.log(`WhatsApp ${type} mic button added`);
    }
  }

  // Try to add button immediately (with small delay to ensure DOM is ready)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(addMicToWhatsApp, 500);
    });
  } else {
    setTimeout(addMicToWhatsApp, 500);
  }

  // Set up observer to retry if button wasn't added
  const debouncedAddMic = debounce(() => {
    if ((!mediaButtonAdded && !document.querySelector(".whatsapp-mic-btn-media"))) {
      addMicToWhatsApp();
    }
  }, 500);

  // Observe the entire document for changes (WhatsApp is very dynamic)
  whatsappObserver = new MutationObserver(debouncedAddMic);
  whatsappObserver.observe(document.body, {
    childList: true,
    subtree: true,
    attributeOldValue: false,
    characterDataOldValue: false
  });
}
//#endregion

//#region Tone Prompts
async function appendToneSelector(toolbar) {
  const container = document.createElement("div");
  container.className = "tone-selector-container";

  // Fetch config from background
  const config = await new Promise(resolve => {
    chrome.runtime.sendMessage({ action: "getConfig" }, resolve);
  });

  const createDropdown = (id, options, type) => {
    const wrapper = document.createElement("div");
    wrapper.className = "premium-dropdown-wrapper";
    wrapper.id = `${id}Wrapper`;

    const current = document.createElement("div");
    current.className = "premium-dropdown-current";
    current.innerHTML = `<span class="label">Select ${type}</span>`;

    const list = document.createElement("div");
    list.className = "premium-dropdown-list hidden";

    options.forEach(opt => {
      const item = document.createElement("div");
      item.className = "premium-dropdown-item";
      item.dataset.value = opt.id;
      item.innerHTML = `${opt.label}`;
      item.addEventListener("click", (e) => {
        e.stopPropagation();
        selectItem(opt);
        list.classList.add("hidden");
        wrapper.classList.remove("open");
      });
      list.appendChild(item);
    });

    const selectItem = (opt) => {
      current.innerHTML = `<span class="label">${opt.label}</span>`;
      wrapper.dataset.value = opt.id;
      // Trigger change event for storage save
      const event = new CustomEvent("change", { detail: opt.id });
      wrapper.dispatchEvent(event);
    };

    current.addEventListener("click", (e) => {
      e.stopPropagation();
      const isOpen = !list.classList.contains("hidden");
      document.querySelectorAll(".premium-dropdown-list").forEach(l => l.classList.add("hidden"));
      document.querySelectorAll(".premium-dropdown-wrapper").forEach(w => w.classList.remove("open"));
      if (!isOpen) {
        list.classList.remove("hidden");
        wrapper.classList.add("open");
      }
    });

    wrapper.appendChild(current);
    wrapper.appendChild(list);

    // Add a hidden value getter to mimic select
    Object.defineProperty(wrapper, 'value', {
      get: function () { return this.dataset.value; },
      set: function (val) {
        const opt = options.find(o => o.id === val);
        if (opt) selectItem(opt);
      }
    });

    return wrapper;
  };

  const toneDrop = createDropdown("toneSelect", config.tones, "Tone");
  const lengthDrop = createDropdown("lengthSelect", config.lengths, "Length");

  container.innerHTML = `
    <textarea id="customPrompt" style="padding: 10px;" placeholder="What's on your mind? (Optional custom prompt)"></textarea>
    <div class="controls-row">
      <button class="generate-reply-btn animate-click" datatestid="generateReplyButton">
        ${ICONS.generate} Generate
      </button>
    </div>
  `;

  const row = container.querySelector(".controls-row");
  row.prepend(toneDrop);
  row.prepend(lengthDrop);

  const micButtonEl = document.createElement("button");
  micButtonEl.className = "mic-btn";
  micButtonEl.title = "Voice Input";
  micButtonEl.innerHTML = ICONS.microphone;

  const controlsRow = container.querySelector(".controls-row");
  const generateBtn = container.querySelector(".generate-reply-btn");

  controlsRow.insertBefore(micButtonEl, generateBtn);
  controlsRow.insertBefore(toneDrop, micButtonEl);
  controlsRow.insertBefore(lengthDrop, toneDrop);
  toolbar.appendChild(container);

  // Close dropdowns on outside click
  document.addEventListener("click", () => {
    document.querySelectorAll(".premium-dropdown-list").forEach(l => l.classList.add("hidden"));
    document.querySelectorAll(".premium-dropdown-wrapper").forEach(w => w.classList.remove("open"));
  });

  //#region Mic Setting

  const micButton = container.querySelector(".mic-btn");
  micButton.dataset.state = "idle";

  // Mic button event listener
  micButton.addEventListener("click", () => {
    if (micButton.dataset.state !== "recording") {
      const selectedLang = storageCache.get("speechLang", "ur-PK");
      speechManager.start(micButton, {
        lang: selectedLang,
        interimResults: false,
        maxAlternatives: 1
      });
    } else {
      speechManager.stop();
    }
  });

  // Double-space shortcut (optimized - only when focused on input)
  let spacePressCount = 0;
  let spaceTimeout;

  const targetInput = getBestInputTarget();
  if (targetInput) {
    targetInput.addEventListener("keydown", (event) => {
      if (event.code === "Space") {
        spacePressCount++;

        if (spacePressCount === 2) {
          event.preventDefault();
          micButton.click();
          spacePressCount = 0;
        }

        clearTimeout(spaceTimeout);
        spaceTimeout = setTimeout(() => {
          spacePressCount = 0;
        }, 300);
      }
    });
  }

  const customPromptTextarea = container.querySelector("#customPrompt");
  const toneSelect = toneDrop;
  const lengthSelect = lengthDrop;
  const generateButton = container.querySelector(".generate-reply-btn");

  let isGenerating = false;

  // Restore last selected values using cache
  storageCache.waitForInit().then(() => {
    const lastTone = storageCache.get("lastTone");
    const lastLength = storageCache.get("lastLength");
    const selectedColor = storageCache.get("selectedColor", "#1da1f2");

    if (lastTone && config.tones.some(o => o.id === lastTone)) {
      toneSelect.value = lastTone;
    } else if (config.tones.length > 0) {
      toneSelect.value = config.tones[config.tones.length - 1].id; // Default to Optimal
    }

    if (lastLength && config.lengths.some(o => o.id === lastLength)) {
      lengthSelect.value = lastLength;
    } else if (config.lengths.length > 0) {
      lengthSelect.value = config.lengths[1].id; // Default to As Tweet
    }
    applyColor(selectedColor);
  });

  // Save selections on change
  toneSelect.addEventListener("change", (e) => {
    chrome.storage.sync.set({ lastTone: e.detail });
  });

  lengthSelect.addEventListener("change", (e) => {
    chrome.storage.sync.set({ lastLength: e.detail });
  });

  generateButton.addEventListener("click", async () => {
    if (isGenerating) return;

    isGenerating = true;
    generateButton.innerHTML = `Thinking...`;
    generateButton.disabled = true;

    const tone = toneSelect.value;
    const length = lengthSelect.value;
    const customPrompt = customPromptTextarea.value.trim();
    const threadContext = getTweetThreadContext();
    const { accountUserName, accountName } = getReplyAccountDetails();

    const replyInput = document.querySelector('[data-testid="tweetTextarea_0"]');
    if (replyInput) {
      replyInput.focus();
      // Clear previous if user wants, or keep it. Let's clear for a fresh start.
      // replyInput.innerText = ""; 
    }

    const port = chrome.runtime.connect({ name: "replyStreaming" });

    port.onMessage.addListener((response) => {
      if (response.error) {
        isGenerating = false;
        generateButton.disabled = false;
        generateButton.textContent = "Generate";
        showErrorInButton(response.error);
        port.disconnect();
      } else if (response.chunk) {
        // Word-by-word injection logic
        insertStreamingChunk(response.chunk, response.fullReply);
      } else if (response.done) {
        isGenerating = false;
        generateButton.disabled = false;
        generateButton.innerHTML = `<i class="fas fa-magic"></i> Generate`;
        const defaultColor = storageCache.get("selectedColor", "#1da1f2");
        generateButton.style.backgroundColor = defaultColor;
        port.disconnect();
      }
    });

    port.postMessage({
      action: "generateReply",
      text: threadContext,
      customPrompt: customPrompt,
      tone: tone,
      lang: "The response language should match the language of the tweet",
      length: length,
      accountName: accountName,
      accountUserName: accountUserName,
    });
  });

  function insertStreamingChunk(chunk, fullReply) {
    const filteredFull = filterResponse(fullReply);
    const targetInput = getBestInputTarget();
    if (targetInput) {
      const dataTransfer = new DataTransfer();
      dataTransfer.setData("text/plain", filteredFull);
      targetInput.dispatchEvent(new ClipboardEvent("paste", {
        clipboardData: dataTransfer,
        bubbles: true,
        cancelable: true
      }));
    }
  }


  function applyColor(color) {
    document.documentElement.style.setProperty("--model-color", color);
    const toolbar = document.querySelector(".tone-selector-container");
    if (toolbar) toolbar.style.borderColor = color;
    const generateButton = document.querySelector(".generate-reply-btn");
    if (generateButton) {
      generateButton.style.backgroundColor = color;
      generateButton.style.color = "#fff";
    }
  }
}

//#region Screenshot
function insertCopyTweetButton() {
  const shareButtons = document.querySelectorAll('[aria-label="Share post"]');

  shareButtons.forEach((shareButton) => {
    const parent = shareButton.parentNode;

    if (!parent.querySelector(".copy-tweet-btn")) {

      const copyTweetButton = document.createElement("button");
      copyTweetButton.className = "copy-tweet-btn";
      copyTweetButton.innerHTML = ICONS.copy;
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

      /*
      const screenshotButton = document.createElement("button");
      screenshotButton.className = "screenshot-btn";
      screenshotButton.innerHTML = ICONS.camera;
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
      */

      parent.insertBefore(copyTweetButton, shareButton.nextSibling);
      // parent.insertBefore(screenshotButton, shareButton.nextSibling);
    }
  });
}


function copyTweetText(button, shareButton) {
  const tweetText = getTweetContextFromShareButton(shareButton);
  if (tweetText) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(tweetText).then(() => {
        log("Tweet text copied to clipboard:", tweetText);
        button.innerHTML = ICONS.check;
        button.style.color = "green";
        // showSuccessMessage("Text Copied to clipboard!")
        setTimeout(() => {
          button.innerHTML = ICONS.copy;
          button.style.color = "";
        }, 4000);
      }).catch(err => {
        console.error("Failed with navigator.clipboard, trying fallback:", err);
        copyWithFallback(tweetText, button);
      });
    } else {
      copyWithFallback(tweetText, button);
    }
  } else {
    console.error("No tweet text found to copy!");
    // showSuccessMessage("No tweet text found to copy!");
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
    log("Tweet text copied to clipboard (fallback):", tweetText);
    button.innerHTML = ICONS.check;
    button.style.color = "green";
    // showSuccessMessage("Text Copied to clipboard!")
    setTimeout(() => {
      button.innerHTML = ICONS.copy;
      button.style.color = "";
    }, 4000);
  } catch (err) {
    console.error("Failed to copy tweet text with fallback:", err);
    // showSuccessMessage("Failed to copy tweet text")
  } finally {
    document.body.removeChild(textarea);
  }
}

// Observers and Initialization
const debouncedAppendToneSelector = debounce(() => {
  const toolbars = document.querySelectorAll('[class="css-175oi2r r-1iusvr4 r-16y2uox r-1777fci r-1h8ys4a r-1bylmt5 r-13tjlyg r-7qyjyx r-1ftll1t"]');
  toolbars.forEach(toolbar => {
    if (!toolbar.querySelector(".tone-selector-container") && !toolbar.querySelector(".mic-btn")) {
      appendToneSelector(toolbar);
      syncTheme();
    }
  });
}, 300);

const debouncedInsertCopyTweetButton = debounce(() => {
  insertCopyTweetButton();
}, 300);

const observer = new MutationObserver(debouncedAppendToneSelector);
const observer3 = new MutationObserver(debouncedInsertCopyTweetButton);

observer.observe(document.body, { childList: true, subtree: true });
observer3.observe(document.body, { childList: true, subtree: true });

// Initialize WhatsApp mic button independently (runs on WhatsApp pages)
initializeWhatsAppMicButton();

// Theme Sync Logic
function syncTheme() {
  const container = document.querySelector(".tone-selector-container");
  if (!container) return;

  const isDark = getComputedStyle(document.body).backgroundColor !== "rgb(255, 255, 255)";

  if (isDark) {
    container.style.background = "rgba(255, 255, 255, 0.03)";
    container.style.borderColor = "rgba(255, 255, 255, 0.08)";
    container.style.color = "white";
    container.querySelectorAll("select").forEach(s => {
      s.style.backgroundColor = "rgba(255, 255, 255, 0.05)";
      s.style.color = "white";
      s.style.backgroundImage = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`;
    });
  } else {
    container.style.background = "rgba(0, 0, 0, 0.03)";
    container.style.borderColor = "rgba(0, 0, 0, 0.08)";
    container.style.color = "#0f1419";
    container.querySelectorAll("select").forEach(s => {
      s.style.backgroundColor = "rgba(0, 0, 0, 0.05)";
      s.style.color = "#0f1419";
      s.style.backgroundImage = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%230f1419'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`;
    });
  }
}

// Watch for theme changes
const themeObserver = new MutationObserver(syncTheme);
themeObserver.observe(document.body, { attributes: true, attributeFilter: ["style", "class"] });