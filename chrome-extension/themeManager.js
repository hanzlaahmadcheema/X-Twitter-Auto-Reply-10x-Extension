/* themeManager.js - Manages the Dim theme state on the page */
(function () {
    function updateDimTheme(enabled) {
        if (enabled) {
            document.documentElement.classList.add('x-dim-active');
        } else {
            document.documentElement.classList.remove('x-dim-active');
        }
    }

    // Initialize from storage (sync)
    chrome.storage.sync.get(['reviveDim'], (result) => {
        updateDimTheme(result.reviveDim !== false); // Default to true
    });

    // Listen for changes from the popup (sync)
    chrome.storage.onChanged.addListener((changes, area) => {
        if (area === 'sync' && changes.reviveDim) {
            updateDimTheme(changes.reviveDim.newValue);
        }
    });

    // Watch for Twitter's dynamic theme changes (e.g. if user switches to Light/Dark)
    // and ensure our class stays if Dim is enabled.
    const observer = new MutationObserver((mutations) => {
        chrome.storage.sync.get(['reviveDim'], (result) => {
            if (result.reviveDim !== false && !document.documentElement.classList.contains('x-dim-active')) {
                document.documentElement.classList.add('x-dim-active');
            }
        });
    });

    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
})();
