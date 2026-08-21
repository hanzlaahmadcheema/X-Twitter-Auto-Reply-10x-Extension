// Generate QR from WhatsApp link
function parseJwt(token) {
    try { return JSON.parse(atob(token.split('.')[1])); } catch (e) { return null; }
}

function updateWhatsAppLinks() {
    let email = "[Write your email]";
    let name = "[Write your name]";

    chrome.storage.local.get(["activationToken", "userEmail", "userName"], (data) => {
        if (data.userEmail) email = data.userEmail;
        if (data.userName) name = data.userName;
        if (data.activationToken) {
            const p = parseJwt(data.activationToken);
            if (p) {
                if (p.email) email = p.email;
                if (p.name) name = p.name;
                else if (p.given_name) name = p.given_name + (p.family_name ? " " + p.family_name : "");
            }
        }

        const applyUrl = (e, n) => {
            const msg = `Hey Hanzla Ahmad!\n\nContacting you regarding the X-Reply Agent extension. I would appreciate your help setting it up!\n\nMy Name: ${n}\nMy Email: ${e}\nAnyDesk Address: [Optional: write your address]`;
            const waUrl = `https://wa.me/923266900001?text=${encodeURIComponent(msg)}`;
            const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(waUrl)}`;
            
            document.querySelectorAll('.wa-link').forEach(a => a.href = waUrl);
            document.querySelectorAll('#qrList, #qrDetail, #modalHelpQr').forEach(img => img.src = qrSrc);
        };

        if ((email === "[Write your email]" || name === "[Write your name]") && typeof chrome !== "undefined" && chrome.identity && chrome.identity.getProfileUserInfo) {
            try {
                chrome.identity.getProfileUserInfo({ accountStatus: 'ANY' }, (info) => {
                    if (info && info.email) {
                        if (email === "[Write your email]") email = info.email;
                        if (name === "[Write your name]" && info.email.includes("@")) {
                            name = info.email.split("@")[0];
                        }
                    }
                    applyUrl(email, name);
                });
            } catch (err) {
                applyUrl(email, name);
            }
        } else {
            applyUrl(email, name);
        }
    });
}

updateWhatsAppLinks();

// Fullscreen QR Modal Handler in Help Page
const helpQrModal = document.getElementById("helpQrModal");
const closeHelpQrModalBtn = document.getElementById("closeHelpQrModalBtn");

const openHelpQr = (e) => {
    if (e) e.preventDefault();
    if (helpQrModal) helpQrModal.style.display = "flex";
};

const closeHelpQr = (e) => {
    if (e) e.preventDefault();
    if (helpQrModal) helpQrModal.style.display = "none";
};

document.querySelectorAll('.open-qr-modal-btn, .qr-wrap, #qrList, #qrDetail').forEach(el => {
    el.addEventListener('click', openHelpQr);
});

if (closeHelpQrModalBtn) closeHelpQrModalBtn.addEventListener('click', closeHelpQr);
if (helpQrModal) {
    helpQrModal.addEventListener('click', (e) => {
        if (e.target === helpQrModal) closeHelpQr();
    });
}
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeHelpQr();
});

const GUIDES = {
    gemini: {
        title: "Google Gemini (FREE)",
        sub: "Free tier available — best starting point",
        iconHtml: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#1da1f2" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
        iconBg: "rgba(29,161,242,0.15)",
        consoleUrl: "https://aistudio.google.com/apikey",
        consoleTxt: "Open Google AI Studio",
        docsUrl: "https://ai.google.dev/gemini-api/docs/api-key",
        docsTxt: "Read the docs",
        steps: [
            { title: "Go to Google AI Studio", desc: "Click the button below — sign in with your Google account." },
            { title: 'Click "Create API key"', desc: "Hit the blue <strong>Create API key</strong> button. Choose any project (or create a new one)." },
            { title: "Copy and paste", desc: "Copy the key that appears and paste it into the extension." }
        ]
    },
    groq: {
        title: "Groq (FREE)",
        sub: "Free tier · Ultra-fast inference",
        iconHtml: `<i class="fas fa-rocket" style="color:#e7e9ea;font-size:18px"></i>`,
        iconBg: "rgba(255,255,255,0.08)",
        consoleUrl: "https://console.groq.com/keys",
        consoleTxt: "Open Groq Console",
        docsUrl: "https://console.groq.com/docs/openai",
        docsTxt: "Read the docs",
        steps: [
            { title: "Go to Groq Console", desc: "Click below and sign up or log in. It's free." },
            { title: 'Click "Create API Key"', desc: "Give it a name (anything), then click <strong>Submit</strong>." },
            { title: "Copy and paste", desc: "Copy the key and paste it into the extension." }
        ]
    },
    openai: {
        title: "OpenAI (PAID)",
        sub: "ChatGPT models · Billing required",
        iconHtml: `<i class="fas fa-comment-dots" style="color:#e7e9ea;font-size:18px"></i>`,
        iconBg: "rgba(255,255,255,0.08)",
        consoleUrl: "https://platform.openai.com/api-keys",
        consoleTxt: "Open OpenAI Platform",
        docsUrl: "https://platform.openai.com/docs/quickstart",
        docsTxt: "Read the docs",
        steps: [
            { title: "Go to OpenAI Platform", desc: "Log in with your OpenAI account (the same one you use for ChatGPT)." },
            { title: 'Click "Create new secret key"', desc: "Name it anything and set permissions to <strong>All</strong>." },
            { title: "Copy immediately", desc: "You can only see the key once. Copy it and paste it into the extension." }
        ]
    },
    grok: {
        title: "Grok (PAID)",
        sub: "By xAI — Subscription/Credits required",
        iconHtml: `<i class="fas fa-brain" style="color:#e7e9ea;font-size:18px"></i>`,
        iconBg: "rgba(255,255,255,0.08)",
        consoleUrl: "https://console.x.ai/",
        consoleTxt: "Open xAI Console",
        docsUrl: "https://docs.x.ai/docs/overview",
        docsTxt: "Read the docs",
        steps: [
            { title: "Go to xAI Console", desc: "Sign in with your X (Twitter) account." },
            { title: "Navigate to API Keys", desc: "In the left sidebar, click <strong>API Keys</strong> and then <strong>Create API Key</strong>." },
            { title: "Copy and paste", desc: "Copy the key and paste it into the extension." }
        ]
    },
    edenai: {
        title: "Eden AI (PAID)",
        sub: "One key, many AI providers",
        iconHtml: `<i class="fas fa-layer-group" style="color:#e7e9ea;font-size:18px"></i>`,
        iconBg: "rgba(255,255,255,0.08)",
        consoleUrl: "https://app.edenai.run/",
        consoleTxt: "Open Eden AI Dashboard",
        docsUrl: "https://docs.edenai.co/reference/start-your-ai-journey-with-edenai",
        docsTxt: "Read the docs",
        steps: [
            { title: "Create an account", desc: "Go to Eden AI and sign up. A free tier is available." },
            { title: "Find your API key", desc: "Go to <strong>Settings → API Keys</strong> in your dashboard." },
            { title: "Copy and paste", desc: "Copy the key and paste it into the extension." }
        ]
    },
    ollama: {
        title: "Ollama (FREE)",
        sub: "Local AI — no API key needed",
        iconHtml: `<i class="fas fa-terminal" style="color:#e7e9ea;font-size:18px"></i>`,
        iconBg: "rgba(255,255,255,0.08)",
        consoleUrl: "https://ollama.com/download",
        consoleTxt: "Download Ollama",
        docsUrl: "https://github.com/ollama/ollama",
        docsTxt: "View on GitHub",
        steps: [
            { title: "Install Ollama", desc: "Download and install Ollama on your computer from the link below. It runs in the background." },
            { title: "Pull a model", desc: "Open your Terminal and run: <code>ollama pull gemma2:9b</code><br>Wait for it to download (a few minutes)." },
            { title: "Connect in the extension", desc: "In the extension, select Ollama and use the default URL <code>http://127.0.0.1:11434</code>. Hit <strong>Test & Add Ollama</strong>." }
        ]
    }
};

const viewList   = document.getElementById('view-list');
const viewDetail = document.getElementById('view-detail');
const backBtn    = document.getElementById('backBtn');
const pageTitle  = document.getElementById('pageTitle');

function showDetail(provider) {
    const g = GUIDES[provider];
    if (!g) return;

    document.getElementById('detailIcon').innerHTML  = g.iconHtml;
    document.getElementById('detailIcon').style.background = g.iconBg;
    document.getElementById('detailTitle').textContent = g.title;
    document.getElementById('detailSub').textContent   = g.sub;

    document.getElementById('detailSteps').innerHTML = g.steps.map((s, i) => `
        <div class="step">
            <div class="step-num">${i + 1}</div>
            <div class="step-body">
                <p class="step-title">${s.title}</p>
                <p class="step-desc">${s.desc}</p>
            </div>
        </div>
    `).join('');

    document.getElementById('detailActions').innerHTML = `
        <a href="${g.consoleUrl}" target="_blank" class="btn-console">
            <i class="fas fa-external-link-alt" style="font-size:12px"></i> ${g.consoleTxt}
        </a>
        <a href="${g.docsUrl}" target="_blank" class="btn-docs">
            <i class="fas fa-book" style="font-size:11px"></i> ${g.docsTxt}
        </a>
    `;

    viewList.style.display   = 'none';
    viewDetail.classList.add('active');
    pageTitle.textContent = g.title + " Setup";
    location.hash = provider;
}

function showList() {
    viewDetail.classList.remove('active');
    viewList.style.display = '';
    pageTitle.textContent  = 'How do I get an API key?';
    history.replaceState(null, '', location.pathname);
}

// Clicking provider rows
document.querySelectorAll('.provider-row').forEach(row => {
    row.addEventListener('click', () => showDetail(row.dataset.provider));
});

// Back button — context aware
backBtn.addEventListener('click', () => {
    if (viewDetail.classList.contains('active')) {
        showList();
    } else {
        // On list view: close tab or go back in history
        if (window.history.length > 1) {
            window.history.back();
        } else {
            window.close();
        }
    }
});

// Deep-link via URL hash e.g. help.html#gemini
const hash = location.hash.replace('#', '');
if (GUIDES[hash]) showDetail(hash);
