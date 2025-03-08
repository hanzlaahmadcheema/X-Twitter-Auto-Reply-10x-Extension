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

  console.log("Account Name:", accountName);
  console.log("Account Username:", accountUserName);

  return { accountUserName, accountName };
}

function filterResponse(response) {
  response = response.replace(/[*"]/g, "");
  response = response.replace(/[\u{1F600}-\u{1F6FF}\u{1F300}-\u{1F5FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, "");
  response = response.replace(/#\w+/g, "");
  response = response.replace(/:/g, "");

  const excitementWords = ["wow", "wow,", "wow!", "oh", "oh,", "oh!", "amazing", "awesome", "AI Assistant:", "AI Assistant"];
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
    dataTransfer.setData("text/plain", filteredText + " ");

    replyInput.dispatchEvent(
      new ClipboardEvent("paste", {
        clipboardData: dataTransfer,
        bubbles: true,
        cancelable: true,
      })
    );

    showSuccessMessage("New text inserted successfully:", filteredText);
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

    showSuccessMessage("New text inserted successfully:", copyText);
  } else {
    showSuccessMessage("Reply input field not found!");
  }
}

function getTweetContextFromShareButton(shareButton) {
  let tweetText = "";
  const tweetContainer = shareButton.closest('[data-testid="tweet"]');
  const mainTweetElement = tweetContainer ? tweetContainer.querySelector('[data-testid="tweetText"]') : null;
  if (mainTweetElement) {
    tweetText = mainTweetElement.innerText.trim();
    console.log(tweetText);
    return tweetText;
  }
  return "";
}

function captureTweetScreenshot(shareButton) {
  const tweetElement = shareButton.closest('[data-testid="tweet"]');
  if (!tweetElement) {
    showSuccessMessage("Tweet not found!");
    return;
  }

  showSuccessMessage("Capturing screenshot...");

  // Send message to background.js to inject html2canvas
  chrome.runtime.sendMessage({ action: "injectHtml2Canvas" }, (response) => {
    if (response?.success) {
      console.log("html2canvas injected successfully.");
      takeScreenshot(tweetElement);
    } else {
      console.error("Error injecting html2canvas:", response?.error);
    }
  });
}

// Function to take a screenshot with improved styling
function takeScreenshot(tweetElement) {
  setTimeout(() => {
    if (typeof html2canvas === "undefined") {
      console.error("html2canvas is still undefined!");
      return;
    }

    // Apply temporary styles for better formatting
    const tempStyles = document.createElement("style");
    tempStyles.innerHTML = `
      /* Hide browser UI elements */
      [role="banner"], nav, .css-1dbjc4n.r-14lw9ot { display: none !important; } 

      /* Set background color for readability */
      body, html { background: white !important; } 

      /* Ensure images are fully visible */
      img, video { 
        filter: none !important; 
        opacity: 1 !important; 
        visibility: visible !important; 
      } 

      /* Improve text readability */
      [data-testid="tweetText"] { 
        color: black !important; 
        font-size: 16px !important; 
        line-height: 1.5 !important; 
      } 

      /* Add padding and margin for better layout */
      [data-testid="tweet"] {
        padding: 20px !important; 
        margin-bottom: 15px !important; 
        border-radius: 10px !important; 
        background: white !important;
      }

      /* Add padding between username and tweet text */
      [data-testid="User-Name"] {
        margin-bottom: 10px !important;
      }
      
      .css-175oi2r button {
        display: none !important;
      }

      [aria-label="Media Harvest"] {
      display: none !important;
      }

      [role="group"] {
      display: none !important;
      }

      a {
      color: black !important;
      }
      span {
      color: black !important;
      }
    `;
    document.head.appendChild(tempStyles);

    // Capture the tweet element
    html2canvas(tweetElement, {
      scale: 3, // Higher scale for better quality
      useCORS: true, // Ensure cross-origin images load
      logging: true, // Debugging
      backgroundColor: null // Transparent background
    }).then((canvas) => {
      document.head.removeChild(tempStyles); // Remove temporary styles

      const image = canvas.toDataURL("image/png");

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const filename = `tweet-${timestamp}.png`;

      // Create a download link
      const link = document.createElement("a");
      link.href = image;
      link.download = filename;
      link.click();

      console.log(`Screenshot saved: ${filename}`);

      // Show a success message to the user
      showSuccessMessage("Screenshot saved successfully!");
    });
  }, 500);
}

// Function to show a small success notification
function showSuccessMessage(message) {
  const notification = document.createElement("div");
  notification.textContent = message;
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
      <option value="length according to the tweet's length">As Tweet</option>
      <option value="5-100 characters">5-100 CH</option>
      <option value="5-200 characters">5-200 CH</option>
      <option value="5-250 characters">5-250 CH</option>
      <option value="5-325 characters">5-325 CH</option>
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
      <option value="disagree">Disagree</option>
      <option value="agreeable">Agreeable</option>
      <option value="casual">Casual</option>
      <option value="optimal">Optimal</option>
    </select>
    <button class="mic-btn" >▶</button>
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
      micButton.textContent = "🔴"; // Update button UI
      showSuccessMessage("🎤 Speech recognition started...");
    };

    recognition.onresult = (event) => {
      let speechResult = event.results[0][0].transcript;
      speechResult = speechResult.replace(/\bDash\b|ڈیش/g, "۔"); // Replace "Dash" with Urdu punctuation
      insertReplyText(speechResult);
      showSuccessMessage("✅ Speech recognized:", speechResult);
    };

    recognition.onerror = (event) => {
      showSuccessMessage("❌ Speech recognition error:", event.error);
      stopSpeechRecognition(); // Stop only on a real error
    };

    recognition.onend = () => {
      showSuccessMessage("⚠️ Speech recognition stopped automatically. Restarting...");
      if (micButton.textContent === "🔴") {
        recognition.start(); // Restart recognition if still active
      }
    };
  }

  recognition.start();
}

// Function to stop speech recognition manually
function stopSpeechRecognition() {
  if (recognition) {
    recognition.stop();
    micButton.textContent = "▶"; // Reset button UI
    showSuccessMessage("🛑 Speech recognition manually stopped.");
  }
}

// Mic button event listener (Manually stop only)
micButton.addEventListener("click", () => {
  if (micButton.textContent === "▶") {
    startSpeechRecognition();
  } else if (micButton.textContent === "🔴") {
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
        lang: "should be in same language as tweet",
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

function insertCopyTweetButton() {
  const shareButtons = document.querySelectorAll('[aria-label="Share post"]');

  shareButtons.forEach((shareButton) => {
    const parent = shareButton.parentNode;

    // Avoid duplicate buttons
    if (!parent.querySelector(".copy-tweet-btn") && !parent.querySelector(".screenshot-btn")) {
      
      // 📋 Copy Tweet Button
      const copyTweetButton = document.createElement("button");
      copyTweetButton.className = "copy-tweet-btn";
      copyTweetButton.textContent = "📋"; // Copy Icon
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
      screenshotButton.textContent = "📸"; // Camera Icon
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
      screenshotButton.addEventListener("click", () => captureTweetScreenshot(shareButton));

      // Insert buttons after the Share button
      parent.insertBefore(copyTweetButton, shareButton.nextSibling);
      parent.insertBefore(screenshotButton, shareButton.nextSibling);
    }
  });
}

function copyTweetText(button, shareButton) {
  const tweetText = getTweetContextFromShareButton(shareButton);
  if (tweetText) {
    navigator.clipboard.writeText(tweetText).then(() => {
      console.log("Tweet text copied to clipboard:", tweetText);
      button.textContent = "✔";
      button.style.color = "green";
      showSuccessMessage("Text Copied to clipboard!")
      setTimeout(() => {
        button.textContent = "📋";
        button.style.color = "";
      }, 4000);
    }).catch(err => {
      console.error("Failed to copy tweet text:", err);
      showSuccessMessage("Failed to copy tweet text:", err)
    });
  } else {
    console.error("No tweet text found to copy!");
    showSuccessMessage("No tweet text found to copy!");
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