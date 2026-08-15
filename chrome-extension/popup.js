document.addEventListener("DOMContentLoaded", () => {
  // ── Global: open all external links in a new browser tab, not inside the side panel ──
  document.addEventListener("click", e => {
    const link = e.target.closest("a[href]");
    if (!link) return;
    const href = link.getAttribute("href");
    if (!href || href === "#") return;
    // Open external URLs and extension pages (help.html) in a real tab
    if (link.target === "_blank" || link.hasAttribute("data-ext-link") || href.startsWith("http")) {
      e.preventDefault();
      // For extension-relative pages (help.html), build full extension URL
      const url = href.startsWith("http") ? href : chrome.runtime.getURL(href);
      chrome.tabs.create({ url });
    }
  });

  // Elements
  const views = {
    auth: document.getElementById("view-auth"),
    wizWelcome: document.getElementById("view-wizard-welcome"),
    wizKeys: document.getElementById("view-wizard-keys"),
    wizProvider: document.getElementById("view-wizard-provider"),
    wizKey: document.getElementById("view-wizard-key"),
    main: document.getElementById("view-main")
  };
  const mainHeader = document.getElementById("mainHeader");

  // Auth View
  const activateBtn = document.getElementById("activateBtn");
  const activationStatus = document.getElementById("activationStatus");
  const authWhatsappLink = document.getElementById("authWhatsappLink");
  
  // Wizard Welcome
  const wizStartBtn = document.getElementById("wizStartBtn");
  
  // Wizard Provider
  const wizProviderNextBtn = document.getElementById("wizProviderNextBtn");
  
  // Wizard Key
  const wizKeyBackBtn = document.getElementById("wizKeyBackBtn");
  const wizKeyTitle = document.getElementById("wizKeyTitle");
  const wizKeySubtitle = document.getElementById("wizKeySubtitle");
  const wizKeyInputSection = document.getElementById("wizKeyInputSection");
  const wizApiKeyInput = document.getElementById("wizApiKeyInput");
  const wizTestBtn = document.getElementById("wizTestBtn");
  const wizTestStatus = document.getElementById("wizTestStatus");
  const wizOllamaSection = document.getElementById("wizOllamaSection");
  const wizOllamaUrlInput = document.getElementById("wizOllamaUrlInput");
  const wizOllamaTestBtn = document.getElementById("wizOllamaTestBtn");
  const wizOllamaTestStatus = document.getElementById("wizOllamaTestStatus");
  const wizKeyNextBtn = document.getElementById("wizKeyNextBtn");
  
  // Main Settings
  const logoutBtn = document.getElementById("logoutBtn");
  const mainAccountEmail = document.getElementById("mainAccountEmail");
  const mainChangeAiBtn = document.getElementById("mainChangeAiBtn");
  const mainSummaryProvider = document.getElementById("mainSummaryProvider");
  const mainSummaryModel = document.getElementById("mainSummaryModel");
  const mainSummaryKey = document.getElementById("mainSummaryKey");
  const mainSummaryKeyLabel = document.getElementById("mainSummaryKeyLabel");
  const customPersonaInput = document.getElementById("customPersona");
  const speechLangSelect = document.getElementById("speechLang");
  const advToggleBtn = document.getElementById("advToggleBtn");
  const advToggleIcon = document.getElementById("advToggleIcon");
  const advContent = document.getElementById("advContent");
  const advModelSelect = document.getElementById("advModelSelect");
  const exportSettingsBtn = document.getElementById("exportSettingsBtn");
  const importSettingsBtn = document.getElementById("importSettingsBtn");
  const importFileInput = document.getElementById("importFileInput");
  const saveSettingsBtn = document.getElementById("saveSettingsBtn");
  const mainStatus = document.getElementById("mainStatus");

  let state = {
    selectedModel: "gemini",
    selectedApiKey: "",
    geminiModel: "gemini-3.7-flash",
    openaiModel: "gpt-4o",
    edenaiModel: "openai/gpt-4o",
    grokModel: "grok-2-1212",
    ollamaModel: "gemma2:9b",
    ollamaUrl: "http://127.0.0.1:11434",
    groqModel: "openai/gpt-oss-120b",
    // apiKeys: array of { key, label, model, isPrimary, isFallback }
    apiKeys: [],
    customPersona: "",
    personalityProfile: "",
    personalityLastUpdated: "",
    speechLang: "en-US",
    setupComplete: false
  };

  const MODELS = {
    gemini: { name: "Google Gemini", tier: "FREE", keyRequired: true, models: ["gemini-3.7-flash", "gemini-3.6-flash", "gemini-3.5-flash", "gemini-3.5-flash-lite", "gemini-3.1-flash-lite"] },
    groq: { name: "Groq", tier: "FREE", keyRequired: true, models: ["openai/gpt-oss-120b", "qwen/qwen-3.6-27b"] },
    ollama: { name: "Ollama", tier: "FREE", keyRequired: false, models: ["gemma2:9b", "llama3", "mistral", "phi3"] }
  };

  function showView(viewId) {
    Object.values(views).forEach(v => v.classList.add("hidden"));
    if (viewId === "view-main") {
      mainHeader.classList.remove("hidden");
    } else {
      mainHeader.classList.add("hidden");
    }
    document.getElementById(viewId).classList.remove("hidden");
  }

  const NETLIFY_MODELS_URL = "https://x-reply-auth-backend.netlify.app/.netlify/functions/models";

  async function syncModelsFromNetlify() {
    try {
      chrome.storage.local.get(["remoteModels"], (stored) => {
        if (stored && stored.remoteModels) {
          Object.assign(MODELS, stored.remoteModels);
          if (typeof renderKeysList === "function") renderKeysList();
        }
      });

      const response = await fetch(NETLIFY_MODELS_URL);
      if (response.ok) {
        const data = await response.json();
        if (data && data.success && data.models) {
          Object.assign(MODELS, data.models);
          chrome.storage.local.set({ remoteModels: data.models });
          if (typeof renderKeysList === "function") renderKeysList();
          const activeView = document.querySelector('[id^="view-"]:not(.hidden)')?.id;
          if (activeView === "view-main" && typeof initMainView === "function") {
            initMainView();
          }
        }
      }
    } catch (e) {
      console.warn("Using offline / fallback model list:", e);
    }
  }

  syncModelsFromNetlify();

  // Auth Flow & Real-time Verification Check
  setupWhatsAppLink();
  chrome.storage.local.get(["activationToken"], (data) => {
    if (!data.activationToken) {
      showView("view-auth");
    } else {
      // Check real-time verification status from PostgreSQL database
      fetch("https://x-reply-auth-backend.netlify.app/.netlify/functions/status", {
        headers: { "Authorization": `Bearer ${data.activationToken}` }
      })
        .then(res => res.json())
        .then(statusData => {
          if (statusData.verified === false) {
            activationStatus.textContent = "Your account is registered, but access hasn't been activated yet. Contact support to activate.";
            activationStatus.style.color = "#f45d22";
            showView("view-auth");
          } else {
            chrome.storage.sync.get(["setupComplete"], (syncData) => {
              if (syncData.setupComplete) {
                initMainView();
                showView("view-main");
              } else {
                showView("view-wizard-welcome");
              }
            });
          }
        })
        .catch(() => {
          // Offline / fallback: check local token payload
          const payload = parseJwt(data.activationToken);
          if (payload && (payload.verified === false || payload.isActivated === false)) {
            activationStatus.textContent = "Your account is registered, but access hasn't been activated yet. Contact support to activate.";
            activationStatus.style.color = "#f45d22";
            showView("view-auth");
          } else {
            chrome.storage.sync.get(["setupComplete"], (syncData) => {
              if (syncData.setupComplete) {
                initMainView();
                showView("view-main");
              } else {
                showView("view-wizard-welcome");
              }
            });
          }
        });
    }
  });

  activateBtn.addEventListener("click", () => {
    const originalContent = activateBtn.innerHTML;
    activateBtn.innerHTML = '<i class="fas fa-circle-notch fa-spin text-lg"></i> Activating...';
    activateBtn.disabled = true;
    activateBtn.classList.add("opacity-70", "cursor-not-allowed");

    const authUrl = "https://x-reply-auth-backend.netlify.app/.netlify/functions/auth?prompt=select_account&redirect_uri=" + encodeURIComponent(chrome.identity.getRedirectURL());
    chrome.identity.launchWebAuthFlow({ url: authUrl, interactive: true }, (redirectUrl) => {
      activateBtn.innerHTML = originalContent;
      activateBtn.disabled = false;
      activateBtn.classList.remove("opacity-70", "cursor-not-allowed");

      if (chrome.runtime.lastError || !redirectUrl) {
        activationStatus.textContent = "Activation failed. Try again.";
        activationStatus.style.color = "#e0245e";
        return;
      }
      
      const url = new URL(redirectUrl);
      const token = url.searchParams.get("token");
      const isVerifiedParam = url.searchParams.get("verified");
      const paramEmail = url.searchParams.get("email");
      const paramName = url.searchParams.get("name");

      if (token) {
        const payload = parseJwt(token);
        const userEmail = paramEmail || (payload && payload.email) || "";
        const userName = paramName || (payload && (payload.name || payload.given_name)) || "";
        const isVerified = isVerifiedParam === "true" || (payload && (payload.verified === true || payload.isActivated === true));

        chrome.storage.local.set({ activationToken: token, userEmail, userName }, () => {
          setupWhatsAppLink();
          if (!isVerified) {
            activationStatus.textContent = "Your account is registered! Access hasn't been activated yet. Contact support and we'll activate your account.";
            activationStatus.style.color = "#f45d22";
            showView("view-auth");
          } else {
            activationStatus.textContent = "Activated successfully!";
            activationStatus.style.color = "#17bf63";
            setTimeout(() => showView("view-wizard-welcome"), 1000);
          }
        });
      } else if (url.searchParams.get("error")) {
        activationStatus.textContent = "Sign in error. Contact support for assistance.";
        activationStatus.style.color = "#e0245e";
      }
    });
  });

  logoutBtn.addEventListener("click", () => {
    chrome.storage.local.remove(["activationToken", "userEmail", "userName"], () => {
      activationStatus.textContent = "";
      showView("view-auth");
    });
  });

  function parseJwt(token) {
    try { return JSON.parse(atob(token.split('.')[1])); } catch (e) { return null; }
  }

  function setupWhatsAppLink() {
    chrome.storage.local.get(["activationToken", "userEmail", "userName"], (data) => {
      let email = data.userEmail || "[Write your email]";
      let name = data.userName || "[Write your name]";

      if (data.activationToken) {
        const p = parseJwt(data.activationToken);
        if (p) {
          if (p.email) email = p.email;
          if (p.name) name = p.name;
          else if (p.given_name) name = p.given_name + (p.family_name ? " " + p.family_name : "");
        }
      }

      const buildUrl = (e, n) => {
        const msg = `Hey Hanzla Ahmad!\n\nContacting you regarding the X-Reply Agent extension. I would appreciate your help setting it up!\n\nMy Name: ${n}\nMy Email: ${e}\nAnyDesk Address: [Optional: write your address]`;
        const url = `https://wa.me/923266900001?text=${encodeURIComponent(msg)}`;
        if (authWhatsappLink) authWhatsappLink.href = url;
        if (mainAccountEmail) mainAccountEmail.textContent = e;

        const waQr = document.getElementById("whatsappQrCode");
        if (waQr) waQr.src = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(url)}`;
      };

      if ((email === "[Write your email]" || name === "[Write your name]") && chrome.identity && chrome.identity.getProfileUserInfo) {
        try {
          chrome.identity.getProfileUserInfo({ accountStatus: 'ANY' }, (info) => {
            if (info && info.email) {
              if (email === "[Write your email]") email = info.email;
              if (name === "[Write your name]" && info.email.includes("@")) {
                name = info.email.split("@")[0];
              }
            }
            buildUrl(email, name);
          });
        } catch (err) {
          buildUrl(email, name);
        }
      } else {
        buildUrl(email, name);
      }
    });
  }

  // ── Wizard: unified multi-provider key screen ──────────────────
  wizStartBtn.addEventListener("click", () => {
    showView("view-wizard-keys");
    renderKeysList();
    updateFinishBtn();
  });

  // Back buttons
  const wizWelcomeBackBtn = document.getElementById("wizWelcomeBackBtn");
  const wizKeysBackBtn    = document.getElementById("wizKeysBackBtn");
  if (wizWelcomeBackBtn) wizWelcomeBackBtn.addEventListener("click", () => showView("view-auth"));
  if (wizKeysBackBtn)    wizKeysBackBtn.addEventListener("click",    () => showView("view-wizard-welcome"));

  // refs
  const providerPills     = document.getElementById("providerPills");
  const wizCloudInputRow  = document.getElementById("wizCloudInputRow");
  const wizOllamaInputRow = document.getElementById("wizOllamaInputRow");
  const wizApiHelpLink    = document.getElementById("wizApiHelpLink");
  const keysListHeader    = document.getElementById("keysListHeader");
  const wizKeysList       = document.getElementById("wizKeysList");

  const HELP_URLS = {
    gemini: "https://aistudio.google.com/apikey",
    groq:   "https://console.groq.com/keys",
    openai: "https://platform.openai.com/api-keys",
    grok:   "https://console.x.ai/",
    edenai: "https://app.edenai.run/",
    ollama: "https://ollama.com"
  };

  let activeProvider = "gemini";

  // pill switching
  if (providerPills) {
    providerPills.addEventListener("click", e => {
      const pill = e.target.closest("[data-provider]");
      if (!pill) return;
      activeProvider = pill.dataset.provider;
      providerPills.querySelectorAll(".provider-pill").forEach(p => p.classList.remove("active"));
      pill.classList.add("active");

      const isOllama = activeProvider === "ollama";
      if (wizCloudInputRow)  wizCloudInputRow.style.display  = isOllama ? "none" : "flex";
      if (wizOllamaInputRow) wizOllamaInputRow.style.display = isOllama ? "flex" : "none";
      if (wizApiHelpLink) {
        wizApiHelpLink.href        = isOllama ? "https://ollama.com/download" : `help.html#${activeProvider}`;
        wizApiHelpLink.textContent = isOllama ? "Install Ollama →" : "Where do I get an API key?";
      }
      wizTestStatus.textContent = "";
    });
  }

  // ── render all keys (cross-provider) ────────────────────────────
  function renderKeysList() {
    if (!wizKeysList) return;
    wizKeysList.innerHTML = "";
    if (keysListHeader) keysListHeader.style.display = state.apiKeys.length > 0 ? "block" : "none";

    state.apiKeys.forEach((entry, idx) => {
      const masked = (entry.key && entry.key.length > 10)
        ? entry.key.substring(0, 6) + "…" + entry.key.slice(-4)
        : (entry.url || entry.key || "local");
      const providerInfo = MODELS[entry.model];
      const providerName = providerInfo?.name || entry.model;
      const tier = providerInfo?.tier || "FREE";
      const tierBadgeStyle = tier === "FREE" 
        ? "background:rgba(23,191,99,0.15);color:#17bf63;border:1px solid rgba(23,191,99,0.3)" 
        : "background:rgba(244,93,34,0.15);color:#f45d22;border:1px solid rgba(244,93,34,0.3)";

      const row = document.createElement("div");
      row.className = "key-row" + (entry.isPrimary ? " is-primary" : "");
      row.innerHTML = `
        <div style="display:flex;align-items:center;gap:6px;flex:1;min-width:0">
          <span style="font-size:9px;font-weight:800;padding:2px 6px;border-radius:4px;background:rgba(255,255,255,0.07);color:#71767b;white-space:nowrap;text-transform:uppercase;letter-spacing:0.04em">${providerName}</span>
          <span style="font-size:8px;font-weight:900;padding:1px 5px;border-radius:3px;${tierBadgeStyle};white-space:nowrap;text-transform:uppercase">${tier}</span>
          <span class="key-row-label">${masked}</span>
        </div>
        <div class="key-row-badges">
          ${entry.isPrimary ? '<span class="badge-primary">Primary</span>' : ''}
          ${(entry.isFallback && !entry.isPrimary) ? '<span class="badge-fallback">Fallback</span>' : ''}
        </div>
        <div class="key-row-actions">
          ${!entry.isPrimary ? `<button class="key-action-btn" title="Set as primary" data-action="primary" data-idx="${idx}">&#9733;</button>` : ''}
          <button class="key-action-btn" title="Toggle fallback" data-action="fallback" data-idx="${idx}" style="${(entry.isFallback && !entry.isPrimary) ? 'color:#17bf63' : ''}">&#8635;</button>
          <button class="key-action-btn del" title="Remove" data-action="delete" data-idx="${idx}">&times;</button>
        </div>
      `;
      wizKeysList.appendChild(row);
    });

    wizKeysList.querySelectorAll("[data-action]").forEach(btn => {
      btn.addEventListener("click", () => {
        const i   = parseInt(btn.dataset.idx);
        const act = btn.dataset.action;
        if (act === "primary") {
          state.apiKeys.forEach(k => k.isPrimary = false);
          state.apiKeys[i].isPrimary    = true;
          state.selectedModel    = state.apiKeys[i].model;
          state.selectedApiKey   = state.apiKeys[i].key || "";
        } else if (act === "fallback") {
          if (!state.apiKeys[i].isPrimary) state.apiKeys[i].isFallback = !state.apiKeys[i].isFallback;
        } else if (act === "delete") {
          const wasPrimary = state.apiKeys[i].isPrimary;
          state.apiKeys.splice(i, 1);
          if (wasPrimary && state.apiKeys.length > 0) {
            state.apiKeys[0].isPrimary   = true;
            state.selectedModel   = state.apiKeys[0].model;
            state.selectedApiKey  = state.apiKeys[0].key || "";
          }
        }
        renderKeysList();
        updateFinishBtn();
      });
    });
  }

  function updateFinishBtn() {
    if (wizKeyNextBtn) wizKeyNextBtn.disabled = state.apiKeys.length === 0;
  }

  // ── add cloud key ────────────────────────────────────────────────
  if (wizTestBtn) {
    wizTestBtn.addEventListener("click", () => {
      const key = wizApiKeyInput ? wizApiKeyInput.value.trim() : "";
      if (!key) {
        wizTestStatus.textContent = "Paste an API key first";
        wizTestStatus.style.color = "#f45d22";
        return;
      }
      if (state.apiKeys.some(k => k.key === key && k.model === activeProvider)) {
        wizTestStatus.textContent = "This key is already added";
        wizTestStatus.style.color = "#f45d22";
        return;
      }
      wizTestBtn.innerHTML  = '<i class="fas fa-circle-notch fa-spin"></i>';
      wizTestBtn.disabled   = true;
      wizTestStatus.textContent = "Validating…";
      wizTestStatus.style.color = "#1da1f2";

      chrome.runtime.sendMessage({ action: "testConnection", model: activeProvider, key }, res => {
        wizTestBtn.innerHTML = '<i class="fas fa-plus"></i> Add';
        wizTestBtn.disabled  = false;
        if (res?.success) {
          const isFirst = state.apiKeys.length === 0;
          state.apiKeys.push({ key, model: activeProvider, isPrimary: isFirst, isFallback: !isFirst });
          if (isFirst) { state.selectedModel = activeProvider; state.selectedApiKey = key; }
          wizTestStatus.textContent = "✓ Key added";
          wizTestStatus.style.color = "#17bf63";
          if (wizApiKeyInput) wizApiKeyInput.value = "";
          renderKeysList();
          updateFinishBtn();
        } else {
          wizTestStatus.textContent = "❌ Invalid key: " + (res?.error || "Unknown");
          wizTestStatus.style.color = "#e0245e";
        }
      });
    });
  }

  // ── add ollama ───────────────────────────────────────────────────
  if (wizOllamaTestBtn) {
    wizOllamaTestBtn.addEventListener("click", () => {
      const url = wizOllamaUrlInput ? wizOllamaUrlInput.value.trim() : "http://127.0.0.1:11434";
      wizTestStatus.textContent = "Testing Ollama…";
      wizTestStatus.style.color = "#1da1f2";
      chrome.runtime.sendMessage({ action: "testConnection", model: "ollama", url }, res => {
        if (res?.success) {
          const existIdx = state.apiKeys.findIndex(k => k.model === "ollama");
          if (existIdx >= 0) state.apiKeys.splice(existIdx, 1);
          const isFirst = state.apiKeys.length === 0;
          state.apiKeys.push({ key: "", url, model: "ollama", isPrimary: isFirst, isFallback: !isFirst });
          state.ollamaUrl = url;
          if (isFirst) state.selectedModel = "ollama";
          wizTestStatus.textContent = "✓ Ollama connected";
          wizTestStatus.style.color = "#17bf63";
          renderKeysList();
          updateFinishBtn();
        } else {
          wizTestStatus.textContent = "❌ Could not connect to Ollama";
          wizTestStatus.style.color = "#e0245e";
        }
      });
    });
  }

  // ── finish ───────────────────────────────────────────────────────
  wizKeyNextBtn.addEventListener("click", () => {
    state.setupComplete = true;
    chrome.storage.sync.set(state, () => {
      initMainView();
      showView("view-main");
    });
  });

  // stubs for old refs (dummy elements in HTML)
  wizKeyBackBtn.addEventListener("click", () => showView("view-wizard-keys"));
  wizProviderNextBtn.addEventListener("click", () => {});



  // Main View Logic
  function initMainView() {
    chrome.storage.sync.get(null, (data) => {
      state = { ...state, ...data };
      
      const pData = MODELS[state.selectedModel];
      mainSummaryProvider.textContent = pData.name;
      
      // Determine active model version
      const activeModelKey = state.selectedModel + "Model";
      const activeModelVal = state[activeModelKey];
      mainSummaryModel.textContent = activeModelVal;
      
      if (pData.keyRequired) {
        mainSummaryKeyLabel.textContent = "API Key";
        if(state.selectedApiKey) {
          mainSummaryKey.textContent = state.selectedApiKey.length > 10 ? 
            state.selectedApiKey.substring(0, 6) + "..." + state.selectedApiKey.substring(state.selectedApiKey.length - 4) : 
            "********";
        } else {
          mainSummaryKey.textContent = "Not set";
        }
      } else {
        mainSummaryKeyLabel.textContent = "Ollama URL";
        mainSummaryKey.textContent = state.ollamaUrl;
      }
      
      customPersonaInput.value = state.customPersona || "";
      speechLangSelect.value = state.speechLang || "en-US";
      
      const personalityProfileInput = document.getElementById("personalityProfile");
      const personalityLastUpdatedEl = document.getElementById("personalityLastUpdated");
      const xUsernameInput = document.getElementById("xUsernameInput");

      if (personalityProfileInput) personalityProfileInput.value = state.personalityProfile || "";
      if (personalityLastUpdatedEl) {
        personalityLastUpdatedEl.textContent = state.personalityLastUpdated 
          ? `Last updated: ${state.personalityLastUpdated}` 
          : "Not imported yet";
      }

      // Check auto-detected X Username handle from local storage
      chrome.storage.local.get(["xUsername"], (localData) => {
        if (xUsernameInput && localData.xUsername) {
          xUsernameInput.value = localData.xUsername.startsWith("@") ? localData.xUsername : `@${localData.xUsername}`;
        }
      });

      // Populate Adv Model Select
      advModelSelect.innerHTML = "";
      pData.models.forEach(m => {
        const opt = document.createElement("option");
        opt.value = m;
        opt.textContent = m;
        if(m === activeModelVal) opt.selected = true;
        advModelSelect.appendChild(opt);
      });
    });
  }

  // ── Import Your X Personality & Grok Prompt Logic ─────────────────────────────
  const grokModal = document.getElementById("grokModal");
  const openGrokModalBtn = document.getElementById("openGrokModalBtn");
  const closeGrokModalBtn = document.getElementById("closeGrokModalBtn");
  const copyGrokPromptBtn = document.getElementById("copyGrokPromptBtn");
  const savePersonalityBtn = document.getElementById("savePersonalityBtn");
  const grokPromptPreview = document.getElementById("grokPromptPreview");

  function buildGrokPrompt(username) {
    const cleanHandle = username ? username.trim().replace(/^@/, '') : '';
    const target = cleanHandle ? `@${cleanHandle}` : 'my';
    return `Analyze the public X (Twitter) profile, recent posts, replies, and overall activity of ${target} to generate a structured, compact AI Personality Profile that an AI assistant can use to emulate their authentic writing style and worldview when drafting replies on X.

Do NOT write generic praise or fluffy prose. Produce a compact, structured profile (500–1,500 words) using the exact sections below. Distinguish observed empirical behavior from inferred preferences, and assign a confidence rating (High / Medium / Low) to each section.

### 1. COMMUNICATION & WRITING STYLE
- **Observed Behavior:** [e.g., Short direct sentences, lowercase style, specific punctuation patterns, emoji usage]
- **Inferred Preference:** [e.g., Prefers high-signal concise writing over long formal explanations]
- **Confidence:** [High / Medium / Low]

### 2. TONE, HUMOR & FORMALITY
- **Observed Behavior:** [e.g., Casual tone, dry/sarcastic wit, no corporate jargon]
- **Inferred Preference:** [e.g., Values authenticity and sharp directness over excessive politeness]
- **Confidence:** [High / Medium / Low]

### 3. DOMAIN INTERESTS & TYPICAL OPINIONS
- **Observed Behavior:** [e.g., Frequently posts about AI development, tech startup building, UI design, indie hacking]
- **Inferred Preference:** [e.g., Pro-builder mindset, skeptical of unproven hype]
- **Confidence:** [High / Medium / Low]

### 4. ENGAGEMENT PATTERNS & DISAGREEMENT STYLE
- **Observed Behavior:** [e.g., Disagrees with cold logic and counter-examples rather than insults]
- **Inferred Preference:** [e.g., Focuses on dismantling weak premises directly]
- **Confidence:** [High / Medium / Low]

### 5. TOPICS TO EMBRACE VS. TOPICS TO AVOID
- **Topics to Embrace:** [e.g., Tech, coding, product building, AI tools]
- **Topics to Avoid / Expressions to Exclude:** [e.g., Fluffy buzzwords, generic agreement ("Great post!"), political debates]
- **Confidence:** [High / Medium / Low]

### 6. INSTRUCTIONS FOR AI GENERATING REPLIES
- [Direct directives telling the AI how to write as this user on X]`;
  }

  if (openGrokModalBtn) openGrokModalBtn.addEventListener("click", () => grokModal?.classList.remove("hidden"));
  if (closeGrokModalBtn) closeGrokModalBtn.addEventListener("click", () => grokModal?.classList.add("hidden"));

  if (copyGrokPromptBtn) {
    copyGrokPromptBtn.addEventListener("click", () => {
      const xUsernameInput = document.getElementById("xUsernameInput");
      const userHandle = xUsernameInput ? xUsernameInput.value.trim() : "";
      const promptToUse = buildGrokPrompt(userHandle);

      if (userHandle) {
        chrome.storage.local.set({ xUsername: userHandle.replace(/^@/, "") });
      }

      chrome.storage.local.set({ autoFillGrokPrompt: promptToUse }, () => {
        try {
          navigator.clipboard.writeText(promptToUse);
        } catch (e) {}

        copyGrokPromptBtn.innerHTML = '<i class="fas fa-arrow-right"></i> Opening Grok...';
        copyGrokPromptBtn.style.background = "#17bf63";

        if (chrome.tabs && chrome.tabs.create) {
          chrome.tabs.create({ url: "https://x.com/i/grok" });
        } else {
          window.open("https://x.com/i/grok", "_blank");
        }

        setTimeout(() => {
          copyGrokPromptBtn.innerHTML = '<i class="far fa-copy"></i> Copy Prompt & Open Grok →';
          copyGrokPromptBtn.style.background = "";
          grokModal?.classList.add("hidden");
        }, 1200);
      });
    });
  }

  if (savePersonalityBtn) {
    savePersonalityBtn.addEventListener("click", () => {
      const personalityProfileInput = document.getElementById("personalityProfile");
      const personalityLastUpdatedEl = document.getElementById("personalityLastUpdated");
      const val = personalityProfileInput ? personalityProfileInput.value.trim() : "";
      const dateStr = val ? new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "";

      state.personalityProfile = val;
      state.personalityLastUpdated = dateStr;

      chrome.storage.sync.set({ personalityProfile: val, personalityLastUpdated: dateStr }, () => {
        if (personalityLastUpdatedEl) {
          personalityLastUpdatedEl.textContent = dateStr ? `Last updated: ${dateStr}` : "Not imported yet";
        }
        savePersonalityBtn.innerHTML = '<i class="fas fa-check"></i> Saved!';
        setTimeout(() => {
          savePersonalityBtn.innerHTML = '<i class="fas fa-check"></i> Save Profile';
        }, 1500);
      });
    });
  }

  mainChangeAiBtn.addEventListener("click", () => {
    wizTestStatus.textContent = "";
    renderKeysList();
    updateFinishBtn();
    showView("view-wizard-keys");
  });

  advToggleBtn.addEventListener("click", () => {
    advContent.classList.toggle("hidden");
    advToggleIcon.classList.toggle("rotate-90");
  });

  advModelSelect.addEventListener("change", () => {
    const activeModelKey = state.selectedModel + "Model";
    state[activeModelKey] = advModelSelect.value;
    mainSummaryModel.textContent = advModelSelect.value;
  });

  saveSettingsBtn.addEventListener("click", () => {
    state.customPersona = customPersonaInput.value.trim();
    state.speechLang = speechLangSelect.value;
    
    chrome.storage.sync.set(state, () => {
      mainStatus.textContent = "Settings saved!";
      mainStatus.style.color = "#17bf63";
      setTimeout(() => {
        mainStatus.textContent = "";
      }, 1500);
    });
  });

  exportSettingsBtn.addEventListener("click", () => {
    chrome.storage.sync.get(null, (data) => {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `x_reply_backup_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    });
  });

  importSettingsBtn.addEventListener("click", () => importFileInput.click());
  importFileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        chrome.storage.sync.set(data, () => {
          mainStatus.textContent = "Settings restored! Reloading...";
          setTimeout(() => window.location.reload(), 1500);
        });
      } catch (err) {
        mainStatus.textContent = "Invalid backup file";
        mainStatus.style.color = "#e0245e";
      }
    };
    reader.readAsText(file);
  });
});