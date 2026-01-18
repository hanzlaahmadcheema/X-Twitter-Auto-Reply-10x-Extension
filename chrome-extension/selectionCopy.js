(function() {
  let copyButton = null;
  let currentSelection = "";

  const ICONS = {
    copy: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>',
    check: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>'
  };

  function createButton() {
    copyButton = document.createElement('div');
    copyButton.id = 'smart-selection-copy-btn';
    copyButton.innerHTML = ICONS.copy;
    copyButton.style.cssText = `
      position: absolute;
      z-index: 2147483647;
      background: #1da1f2;
      color: white;
      border-radius: 4px;
      padding: 6px;
      cursor: pointer;
      display: none;
      box-shadow: 0 2px 5px rgba(0,0,0,0.2);
      transition: transform 0.1s ease;
      align-items: center;
      justify-content: center;
      pointer-events: auto;
      user-select: none;
    `;

    copyButton.addEventListener('mousedown', (e) => {
      e.preventDefault();
      e.stopPropagation();
    });

    copyButton.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      if (currentSelection) {
        try {
          await navigator.clipboard.writeText(currentSelection);
          showFeedback();
        } catch (err) {
          console.error('Failed to copy text: ', err);
        }
      }
    });

    document.body.appendChild(copyButton);
  }

  function showFeedback() {
    copyButton.innerHTML = ICONS.check;
    copyButton.style.background = '#17bf63'; // X success green
    
    setTimeout(() => {
      hideButton();
      // Reset button state for next time
      setTimeout(() => {
        copyButton.innerHTML = ICONS.copy;
        copyButton.style.background = '#1da1f2';
      }, 200);
    }, 800);
  }

  function hideButton() {
    if (copyButton) {
      copyButton.style.display = 'none';
    }
  }

  function handleSelection() {
    const selection = window.getSelection();
    const text = selection.toString().trim();

    if (!text) {
      hideButton();
      return;
    }

    currentSelection = text;
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    if (!copyButton) createButton();

    // Position the button slightly below the selection
    const scrollX = window.scrollX || window.pageXOffset;
    const scrollY = window.scrollY || window.pageYOffset;

    copyButton.style.display = 'flex';
    copyButton.style.left = `${rect.right + scrollX}px`;
    copyButton.style.top = `${rect.bottom + scrollY + 5}px`;
    
    // Adjust if it goes off screen
    const btnRect = copyButton.getBoundingClientRect();
    if (btnRect.right > window.innerWidth) {
        copyButton.style.left = `${window.innerWidth - btnRect.width - 10 + scrollX}px`;
    }
  }

  // Listen for selection changes
  document.addEventListener('mouseup', (e) => {
    // Small delay to let the selection settle
    setTimeout(handleSelection, 10);
  });

  // Hide button on click anywhere else
  document.addEventListener('mousedown', (e) => {
    if (copyButton && !copyButton.contains(e.target)) {
      hideButton();
    }
  });

  // Theme awareness - adjust on specific sites if needed
  function checkTheme() {
    const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    // For X specifically, they often have data-night-mode or similar, but system preference or body bg is a good hint.
    const bodyBg = window.getComputedStyle(document.body).backgroundColor;
    // We can stick to the iconic brand blue for the button as it works on both.
  }

})();
