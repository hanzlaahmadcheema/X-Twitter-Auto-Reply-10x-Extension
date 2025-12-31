const ICONS = {
  microphone: '<svg width="22px" height="22px" stroke-width="1.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" color="#ffffff"><rect x="9" y="2" width="6" height="12" rx="3" stroke="#ffffff" stroke-width="1.5" stroke-width="1.5"></rect><path d="M5 10V11C5 14.866 8.13401 18 12 18V18V18C15.866 18 19 14.866 19 11V10" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M12 18V22M12 22H9M12 22H15" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>',
  stop: '<svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 384 512" fill="currentColor"><!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M0 128C0 92.7 28.7 64 64 64H320c35.3 0 64 28.7 64 64V384c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V128z"/></svg>',
  camera: '<svg width="18px" height="18px" stroke-width="1.5" viewBox="0 0 24 24" fill="#1da1f2" xmlns="http://www.w3.org/2000/svg" color="none"><path d="M2 19V9C2 7.89543 2.89543 7 4 7H4.5C5.12951 7 5.72229 6.70361 6.1 6.2L8.32 3.24C8.43331 3.08892 8.61115 3 8.8 3H15.2C15.3889 3 15.5667 3.08892 15.68 3.24L17.9 6.2C18.2777 6.70361 18.8705 7 19.5 7H20C21.1046 7 22 7.89543 22 9V19C22 20.1046 21.1046 21 20 21H4C2.89543 21 2 20.1046 2 19Z" stroke="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M12 17C14.2091 17 16 15.2091 16 13C16 10.7909 14.2091 9 12 9C9.79086 9 8 10.7909 8 13C8 15.2091 9.79086 17 12 17Z" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>',
  check: '<svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 448 512" fill="currentColor"><!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z"/></svg>',
  timesCircle: '<svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512" fill="currentColor"><!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM175 175c9.4-9.4 24.6-9.4 33.9 0l47 47 47-47c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-47 47 47 47c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-47-47-47 47c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l47-47-47-47c-9.4-9.4-9.4-24.6 0-33.9z"/></svg>',
  exclamationCircle: '<svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512" fill="currentColor"><!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zm0-384c13.3 0 24 10.7 24 24V264c0 13.3-10.7 24-24 24s-24-10.7-24-24V152c0-13.3 10.7-24 24-24zM224 352a32 32 0 1 1 64 0 32 32 0 1 1 -64 0z"/></svg>',
  copy: '<svg xmlns="http://www.w3.org/2000/svg" width="18px" height="18px" viewBox="0 0 32 32"><path fill="#1da1f2" d="M8.5 5.25A3.25 3.25 0 0 1 11.75 2h12A3.25 3.25 0 0 1 27 5.25v18a3.25 3.25 0 0 1-3.25 3.25h-12a3.25 3.25 0 0 1-3.25-3.25zM5 8.75c0-1.352.826-2.511 2-3.001v17.75a4.5 4.5 0 0 0 4.5 4.5h11.751a3.25 3.25 0 0 1-3.001 2H11.5A6.5 6.5 0 0 1 5 23.5z"/></svg>' // Using 'file' icon as copy, or standard copy
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
      showSuccessMessage(`${ICONS.microphone} Speech recognition started...`);
    };

    this.recognition.onresult = (event) => {
      let speechResult = event.results[0][0].transcript;
      speechResult = speechResult.replace(DASH_REPLACEMENT_REGEX, "۔");

      if (this.currentConfig && this.currentConfig.onResult) {
        this.currentConfig.onResult(speechResult);
      } else {
        insertReplyText(speechResult);
      }

      showSuccessMessage(`${ICONS.check} Speech recognized`);
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
      
      showSuccessMessage(userMessage);
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

    showSuccessMessage(`${ICONS.stop} Speech recognition stopped.`);
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

// Capture Tweet Screenshot Function
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

// Helper to convert image to Base64 (optimized)
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

async function takeScreenshot(tweetElement) {
  const tweetContainer = tweetElement.closest('article[data-testid="tweet"]');
  if (!tweetContainer) {
    showSuccessMessage('❌ Tweet container not found');
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

    showSuccessMessage(`${ICONS.camera} Screenshot captured!`);
  }).catch(error => {
    console.error("Screenshot error:", error);
    showSuccessMessage(`${ICONS.timesCircle} Screenshot failed: ${error.message}`);
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

  let whatsappObserver = null;
  let buttonAdded = false;

  // Function to add mic button to WhatsApp input field
  function addMicToWhatsApp() {
    // Early return if button already exists
    if (buttonAdded || document.querySelector(".whatsapp-mic-btn")) {
      return;
    }

    // Try multiple selectors for WhatsApp MESSAGE input field (not search box)
    // Target the chat message input area in the footer, not the sidebar search
    const whatsappInput = document.querySelector('footer div[contenteditable="true"][data-tab="10"]') ||
                          document.querySelector('footer div[contenteditable="true"][role="textbox"]') ||
                          document.querySelector('footer p.selectable-text.copyable-text[contenteditable="true"]') ||
                          document.querySelector('div[contenteditable="true"][data-tab="10"]:not([aria-label*="Search"], [aria-label*="search"])') ||
                          document.querySelector('footer div[contenteditable="true"]') ||
                          // Fallback: find contenteditable that's NOT in the sidebar/panel (search area)
                          Array.from(document.querySelectorAll('div[contenteditable="true"]')).find(el => {
                            // Exclude elements that are likely search inputs
                            const ariaLabel = el.getAttribute('aria-label') || '';
                            const parent = el.closest('[data-testid*="search"], [role="search"], [class*="search"]');
                            const isInFooter = el.closest('footer');
                            return !parent && !ariaLabel.toLowerCase().includes('search') && (isInFooter || el.closest('[data-testid*="conversation"]'));
                          });

    if (whatsappInput) {
      // Find the input container - WhatsApp typically has a footer/input area
      let inputContainer = whatsappInput.closest('footer') ||
                          whatsappInput.closest('[role="textbox"]') ||
                          whatsappInput.closest('div[contenteditable="false"]') ||
                          whatsappInput.parentElement?.parentElement ||
                          whatsappInput.parentElement;

      const micButton = document.createElement("button");
      micButton.className = "whatsapp-mic-btn";
      micButton.innerHTML = ICONS.microphone;
      micButton.setAttribute('aria-label', 'Voice input');
      micButton.dataset.state = "idle";

      // Style the button (smaller size, no background to match WhatsApp icons)
      micButton.style.cssText = `
        background-color: #1DA1F2;
        color: #54656f;
        border: none;
        border-radius: 50%;
        width: 26px;
        height: 26px;
        min-width: 26px;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 0;
        margin: 0;
        flex-shrink: 0;
        transition: opacity 0.2s;
      `;

      // Try to insert into input container next to plus icon (leftmost)
      let inserted = false;
      if (inputContainer && inputContainer !== document.body && inputContainer.tagName !== 'BODY') {
        try {
          // Find plus icon (typically the leftmost button, has data-icon="plus" or "attach")
          const plusIcon = inputContainer.querySelector('span[data-icon="plus"]')?.parentElement ||
                          inputContainer.querySelector('span[data-icon="attach"]')?.parentElement ||
                          inputContainer.querySelector('button[aria-label*="Attach"], button[aria-label*="attach"]') ||
                          inputContainer.querySelector('button[aria-label*="Plus"], button[aria-label*="plus"]') ||
                          inputContainer.querySelector('[role="button"][aria-label*="Attach"], [role="button"][aria-label*="attach"]') ||
                          // Fallback: find the first button in the toolbar (usually the plus/attach icon)
                          Array.from(inputContainer.querySelectorAll('[role="button"], button, span[data-icon]')).find(btn => {
                            const icon = btn.querySelector('span[data-icon]');
                            return icon && (icon.getAttribute('data-icon') === 'plus' || icon.getAttribute('data-icon') === 'attach');
                          });
          
          if (plusIcon && plusIcon.parentElement) {
            // Insert the mic button right after the plus icon
            if (plusIcon.nextSibling) {
              plusIcon.parentElement.insertBefore(micButton, plusIcon.nextSibling);
            } else {
              plusIcon.parentElement.appendChild(micButton);
            }
            inserted = true;
            console.log('WhatsApp mic button inserted next to plus icon');
          } else {
            // Fallback: find the first button in the toolbar (leftmost position)
            const buttonRow = inputContainer.querySelector('[role="button"]')?.parentElement ||
                             inputContainer.querySelector('span[data-icon]')?.parentElement?.parentElement ||
                             inputContainer.querySelector('div[role="toolbar"]') ||
                             inputContainer;
            
            if (buttonRow && buttonRow !== whatsappInput) {
              // Find the first button (leftmost - usually plus/attach)
              const firstButton = Array.from(buttonRow.querySelectorAll('[role="button"], button, span[data-icon]?.parentElement')).find(btn => {
                return btn && btn.offsetParent !== null; // Only visible buttons
              });
              
              if (firstButton && firstButton.parentElement) {
                // Insert right after the first button
                if (firstButton.nextSibling) {
                  firstButton.parentElement.insertBefore(micButton, firstButton.nextSibling);
                } else {
                  firstButton.parentElement.appendChild(micButton);
                }
                inserted = true;
              } else {
                // Last resort: prepend to button row (leftmost position)
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

      // Fallback: fixed positioning near input area
      if (!inserted) {
        const rect = whatsappInput.getBoundingClientRect();
        micButton.style.position = 'fixed';
        micButton.style.right = '80px';
        micButton.style.bottom = '20px';
        micButton.style.zIndex = '99999';
        document.body.appendChild(micButton);
        console.log('WhatsApp mic button added as fixed element');
      } else {
        console.log('WhatsApp mic button inserted into input container');
      }

      buttonAdded = true;

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
    whatsappInput.focus();
    const before = whatsappInput.innerText;
    const ok = document.execCommand('insertText', false, text + ' ');
    const after = whatsappInput.innerText;
    // Only run fallback if execCommand failed and value did not change
    if (!ok || before === after) {
      const selection = window.getSelection();
      selection.removeAllRanges();
      const range = document.createRange();
      range.selectNodeContents(whatsappInput);
      range.collapse(false);
      selection.addRange(range);
      whatsappInput.textContent += text + ' ';
      whatsappInput.dispatchEvent(new InputEvent('input', {bubbles: true}));
      whatsappInput.dispatchEvent(new Event('keyup', {bubbles: true}));
    } else {
      // Still always fire input event so the send button appears
      whatsappInput.dispatchEvent(new InputEvent('input', {bubbles: true}));
      whatsappInput.dispatchEvent(new Event('keyup', {bubbles: true}));
    }
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

      // Disconnect observer once button is added
      if (whatsappObserver) {
        whatsappObserver.disconnect();
        whatsappObserver = null;
      }
    } else {
      // Input not found - will retry via observer
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
    if (!buttonAdded && !document.querySelector(".whatsapp-mic-btn")) {
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
    </select>
    <select id="toneSelect">
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
  `;
  toolbar.appendChild(container);

  //#region Mic Setting

  const micButton = container.querySelector(".mic-btn");
  micButton.dataset.state = "idle";

  // Mic button event listener
  micButton.addEventListener("click", () => {
    if (micButton.dataset.state !== "recording") {
      speechManager.start(micButton, {
        lang: "ur-PK",
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

  const replyInput = document.querySelector('[data-testid="tweetTextarea_0"]');
  if (replyInput) {
    replyInput.addEventListener("keydown", (event) => {
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
  const toneSelect = container.querySelector("#toneSelect");
  const lengthSelect = container.querySelector("#lengthSelect");
  const generateButton = container.querySelector(".generate-reply-btn");

  let isGenerating = false;

  // Restore last selected values using cache
  storageCache.waitForInit().then(() => {
    const lastTone = storageCache.get("lastTone");
    const lastLength = storageCache.get("lastLength");
    const selectedColor = storageCache.get("selectedColor", "#1da1f2");

    if (lastTone) toneSelect.value = lastTone;
    if (lastLength) lengthSelect.value = lastLength;
    applyColor(selectedColor);
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

        const defaultColor = storageCache.get("selectedColor", "#1da1f2");
        generateButton.style.backgroundColor = defaultColor;

        if (response?.error) {
          showErrorInButton(response.error);
        } else if (response?.reply) {
          insertReplyText(response.reply);
        }
      }
    );
  });


  function applyColor(color) {
    document.documentElement.style.setProperty("--model-color", color);

    const toolbar = document.querySelector(".tone-selector-container");
    if (toolbar) {
      toolbar.style.borderColor = color;
    }

    const generateButton = document.querySelector(".generate-reply-btn");
    if (generateButton) {
      generateButton.style.backgroundColor = color;
      generateButton.style.color = "#fff";
    }

    const customPromptTextarea = document.querySelector("#customPrompt");
    if (customPromptTextarea) {
      customPromptTextarea.style.borderColor = color;
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
      const defaultColor = storageCache.get("selectedColor", "#1da1f2");
      generateButton.style.backgroundColor = defaultColor;
      generateButton.style.color = "#fff";
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

    if (!parent.querySelector(".copy-tweet-btn") && !parent.querySelector(".screenshot-btn")) {

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

      parent.insertBefore(copyTweetButton, shareButton.nextSibling);
      parent.insertBefore(screenshotButton, shareButton.nextSibling);
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
    log("Tweet text copied to clipboard (fallback):", tweetText);
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

// Debounced observer callbacks
const debouncedAppendToneSelector = debounce(() => {
  const toolbar = document.querySelector('[class="css-175oi2r r-1iusvr4 r-16y2uox r-1777fci r-1h8ys4a r-1bylmt5 r-13tjlyg r-7qyjyx r-1ftll1t"]');
  if (toolbar && !toolbar.querySelector(".tone-selector-container")) {
    appendToneSelector(toolbar);
  }
}, 300);

const debouncedAppendAsidePanel = debounce(() => {
  const toolbar2 = document.querySelector('[role="list"]');
  if (toolbar2 && !toolbar2.querySelector(".aside-panel")) {
    appendAsidepanel(toolbar2);
  }
}, 300);

const debouncedInsertCopyTweetButton = debounce(() => {
  insertCopyTweetButton();
}, 300);

const observer = new MutationObserver(debouncedAppendToneSelector);
const observer2 = new MutationObserver(debouncedAppendAsidePanel);
const observer3 = new MutationObserver(debouncedInsertCopyTweetButton);

observer.observe(document.body, { childList: true, subtree: true });
observer3.observe(document.body, { childList: true, subtree: true });

// Initialize WhatsApp mic button independently (runs on WhatsApp pages)
initializeWhatsAppMicButton();