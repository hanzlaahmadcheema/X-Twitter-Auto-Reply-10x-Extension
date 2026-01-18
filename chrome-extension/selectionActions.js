(function () {
  let actionButton = null;
  let actionMenu = null;
  let resultPopup = null;
  let currentSelection = "";
  let lastSelectionRange = null;
  let isEditable = false;
  let activeElement = null;

  const ICONS = {
    main: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>',
    copy: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>',
    improve: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>',
    translate: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 8l6 6"></path><path d="M4 14l6-6L4 2l6 6 6-6"></path></svg>',
    replace: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3L21 7L17 11"></path><path d="M3 13V11C3 7.68629 5.68629 5 9 5H21"></path><polyline points="7 21 3 17 7 13"></polyline><path d="M21 11V13C21 16.3137 18.3137 19 15 19H3"></path></svg>',
    close: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>',
    check: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>'
  };

  const STYLES = `
    #selection-action-container {
      position: absolute;
      z-index: 2147483647;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      display: none;
      background: white;
      border-radius: 9999px;
      padding: 4px 8px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.2);
      border: 1px solid #e1e8ed;
      align-items: center;
      gap: 4px;
      flex-direction: row;
    }
    [data-theme="dark"] #selection-action-container {
      background: #000000;
      border-color: #333639;
      color: #eff3f4;
    }
    
    .action-item {
      padding: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      border-radius: 50%;
      transition: all 0.2s;
      position: relative;
    }
    .action-item:hover { background: rgba(29, 161, 242, 0.1); }
    .action-item svg { color: #1da1f2; stroke-width: 2.5; }
    
    /* Tooltip */
    .action-item::after {
      content: attr(data-label);
      position: absolute;
      bottom: 100%;
      left: 50%;
      transform: translateX(-50%) translateY(-8px);
      background: #333;
      color: white;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 11px;
      white-space: nowrap;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.2s;
      margin-bottom: 4px;
    }
    .action-item:hover::after { opacity: 1; }
    [data-theme="dark"] .action-item::after { background: #eff3f4; color: #000; }

    .result-popup {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      border-radius: 16px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.2);
      width: 450px;
      max-width: 90vw;
      z-index: 2147483647;
      display: none;
      flex-direction: column;
      border: 1px solid #e1e8ed;
      color: #0f1419;
    }
    [data-theme="dark"] .result-popup {
      background: #000000;
      border-color: #333639;
      color: #eff3f4;
    }
    .popup-header {
      padding: 12px 16px;
      border-bottom: 1px solid #e1e8ed;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-weight: 800;
      font-size: 16px;
    }
    [data-theme="dark"] .popup-header { border-color: #333639; }
    .popup-content {
      padding: 20px;
      max-height: 400px;
      overflow-y: auto;
      font-size: 15px;
      line-height: 1.6;
      white-space: pre-wrap;
    }
    .popup-footer {
      padding: 12px 16px;
      border-top: 1px solid #e1e8ed;
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    }
    [data-theme="dark"] .popup-footer { border-color: #333639; }
    .popup-btn {
      padding: 10px 20px;
      border-radius: 9999px;
      border: 1px solid #cfd9de;
      background: white;
      color: #0f1419;
      cursor: pointer;
      font-size: 14px;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: all 0.2s;
    }
    [data-theme="dark"] .popup-btn {
      background: transparent;
      border-color: #536471;
      color: #eff3f4;
    }
    .popup-btn.primary {
      background: #1da1f2;
      color: white;
      border: none;
    }
    .popup-btn.primary:hover { background: #1a8cd8; }
    .popup-btn:not(.primary):hover { background: rgba(15, 20, 25, 0.1); }
    [data-theme="dark"] .popup-btn:not(.primary):hover { background: rgba(239, 243, 244, 0.1); }
    
    .loading-spinner {
      display: inline-block;
      width: 24px;
      height: 24px;
      border: 3px solid rgba(29, 161, 242, 0.2);
      border-top-color: #1da1f2;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  `;

  function injectStyles() {
    const styleEl = document.createElement('style');
    styleEl.textContent = STYLES;
    document.head.appendChild(styleEl);
  }

  function createUI() {
    const container = document.createElement('div');
    container.id = 'selection-action-container';

    const actions = [
      { id: 'copy', label: 'Copy', icon: ICONS.copy },
      { id: 'improve', label: 'Improve Writing', icon: ICONS.improve },
      { id: 'translate', label: 'Translate to Urdu', icon: ICONS.translate }
    ];

    actions.forEach(act => {
      const item = document.createElement('div');
      item.className = 'action-item';
      item.setAttribute('data-label', act.label);
      item.innerHTML = act.icon;
      item.onclick = (e) => {
        e.stopPropagation();
        handleAction(act.id);
      };
      container.appendChild(item);
    });

    document.body.appendChild(container);

    // Result Popup
    resultPopup = document.createElement('div');
    resultPopup.className = 'result-popup';
    document.body.appendChild(resultPopup);
  }

  async function handleAction(actionId) {
    hideAll();

    if (actionId === 'copy') {
      copyToClipboard(currentSelection);
      hideAll();
      return;
    }

    showResultPopup('Processing...', true);

    chrome.runtime.sendMessage({
      action: 'generateReply',
      selectionAction: actionId === 'improve' ? 'improve' : 'translate_urdu',
      text: currentSelection
    }, (response) => {
      if (response && response.reply) {
        showResultPopup(response.reply, false, actionId);
        copyToClipboard(response.reply, false); // Auto-copy as per requirements
      } else {
        showResultPopup('Error: ' + (response?.error || 'Failed to generate response'), false);
      }
    });
  }

  function showResultPopup(content, isLoading, actionType) {
    const isWriting = isEditable;
    let footerHtml = '';

    if (!isLoading) {
      footerHtml = `
        <button class="popup-btn" id="popup-copy-btn">${ICONS.copy} Copy</button>
        ${isWriting ? `<button class="popup-btn primary" id="popup-replace-btn">${ICONS.replace} Replace</button>` : ''}
        <button class="popup-btn" id="popup-close-btn">Close</button>
      `;
    }

    resultPopup.innerHTML = `
      <div class="popup-header">
        <span>${isLoading ? 'Thinking...' : (actionType === 'improve' ? 'Improved Writing' : 'Urdu Translation')}</span>
        <div id="popup-header-close" style="cursor:pointer">${ICONS.close}</div>
      </div>
      <div class="popup-content">
        ${isLoading ? '<div style="text-align:center; padding: 20px;"><div class="loading-spinner"></div></div>' : content}
      </div>
      <div class="popup-footer">
        ${footerHtml}
      </div>
    `;

    resultPopup.style.display = 'flex';

    // Header close button should always work
    document.getElementById('popup-header-close').onclick = () => resultPopup.style.display = 'none';

    if (!isLoading) {
      document.getElementById('popup-copy-btn').onclick = () => copyToClipboard(content);
      document.getElementById('popup-close-btn').onclick = () => resultPopup.style.display = 'none';

      if (isWriting) {
        document.getElementById('popup-replace-btn').onclick = () => {
          replaceSelection(content);
          resultPopup.style.display = 'none';
          hideAll();
        };
      }
    }
  }

  async function copyToClipboard(text, showMsg = true) {
    try {
      await navigator.clipboard.writeText(text);
      if (showMsg) {
        const copyBtn = document.getElementById('popup-copy-btn');
        if (copyBtn) {
          const original = copyBtn.innerHTML;
          copyBtn.innerHTML = `${ICONS.check} Copied!`;
          setTimeout(() => copyBtn.innerHTML = original, 2000);
        }
      }
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  }

  function replaceSelection(newText) {
    if (!lastSelectionRange && !activeElement) return;

    if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
      const start = activeElement.selectionStart;
      const end = activeElement.selectionEnd;
      const oldVal = activeElement.value;
      activeElement.value = oldVal.slice(0, start) + newText + oldVal.slice(end);
      activeElement.selectionStart = activeElement.selectionEnd = start + newText.length;
      activeElement.dispatchEvent(new Event('input', { bubbles: true }));
      activeElement.focus();
    } else if (lastSelectionRange) {
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(lastSelectionRange);
      document.execCommand('insertText', false, newText);
    }
  }

  function handleSelectionChange() {
    const selection = window.getSelection();
    const text = selection.toString().trim();

    if (!text || text.length < 2) {
      hideAll();
      return;
    }

    currentSelection = text;
    activeElement = document.activeElement;
    isEditable = activeElement && (
      activeElement.isContentEditable ||
      activeElement.tagName === 'INPUT' ||
      activeElement.tagName === 'TEXTAREA'
    );

    const range = selection.getRangeAt(0);
    lastSelectionRange = range.cloneRange();
    const rect = range.getBoundingClientRect();

    const container = document.getElementById('selection-action-container');
    container.style.display = 'block';

    const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;

    // Position above selection or below if no space
    container.style.display = 'flex';
    container.style.left = `${rect.left + scrollX + (rect.width / 2)}px`;
    container.style.top = `${rect.top + scrollY - 45}px`;
    container.style.transform = 'translateX(-50%)';

    // Adjust if above screen
    if (rect.top < 50) {
      container.style.top = `${rect.bottom + scrollY + 10}px`;
    }

    // Ensure on screen horizontally
    const contRect = container.getBoundingClientRect();
    if (contRect.left < 10) {
      container.style.left = `${scrollX + (contRect.width / 2) + 10}px`;
    } else if (contRect.right > window.innerWidth - 10) {
      container.style.left = `${window.innerWidth - (contRect.width / 2) - 10 + scrollX}px`;
    }
  }

  function hideAll() {
    const container = document.getElementById('selection-action-container');
    if (container) {
      container.style.display = 'none';
    }
  }

  // Detect dark mode from existing page
  function detectTheme() {
    const isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const xDark = document.body.style.backgroundColor === 'rgb(0, 0, 0)' ||
      document.body.style.backgroundColor === 'rgb(21, 32, 43)' ||
      document.documentElement.getAttribute('data-tw-theme') === 'dark';

    if (isDark || xDark) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }

  // Initialization
  injectStyles();
  createUI();
  detectTheme();

  document.addEventListener('mouseup', () => {
    setTimeout(handleSelectionChange, 10);
  });

  document.addEventListener('mousedown', (e) => {
    const container = document.getElementById('selection-action-container');
    if (container && !container.contains(e.target) && resultPopup && !resultPopup.contains(e.target)) {
      hideAll();
    }
  });

})();
  });

}) ();
