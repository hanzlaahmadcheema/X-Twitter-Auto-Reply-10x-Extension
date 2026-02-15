/* themeManager.js - Manages the Dim theme state and accent colors on the page */
(function () {
    const isWhatsApp = window.location.hostname.includes('whatsapp.com');
    const storageKey = isWhatsApp ? 'reviveDimWA' : 'reviveDim';
    const activeClass = isWhatsApp ? 'wa-dim-active' : 'x-dim-active';

    function updateDimTheme(enabled) {
        if (enabled) {
            document.documentElement.classList.add(activeClass);
        } else {
            document.documentElement.classList.remove(activeClass);
        }
    }

    function updateAccentColor(color) {
        if (color) {
            document.documentElement.style.setProperty('--accent-color', color);
            // Also update the native Twitter/WA primary color if possible via variable injection
            document.documentElement.style.setProperty('--color-primary', color);
        }
    }

    // Initialize from storage (sync)
    chrome.storage.sync.get([storageKey, 'selectedColor'], (result) => {
        updateDimTheme(result[storageKey] !== false); // Default to true
        updateAccentColor(result.selectedColor || '#1d9bf0'); // Default to Twitter Blue
    });

    // Listen for changes from the popup (sync)
    chrome.storage.onChanged.addListener((changes, area) => {
        if (area === 'sync') {
            if (changes[storageKey]) {
                updateDimTheme(changes[storageKey].newValue);
            }
            if (changes.selectedColor) {
                updateAccentColor(changes.selectedColor.newValue);
            }
        }
    });

    // Watch for dynamic theme changes or class removals
    const observer = new MutationObserver(() => {
        chrome.storage.sync.get([storageKey, 'selectedColor'], (result) => {
            if (result[storageKey] !== false && !document.documentElement.classList.contains(activeClass)) {
                document.documentElement.classList.add(activeClass);
            }
            // Ensure accent color persists
            if (result.selectedColor) {
                updateAccentColor(result.selectedColor);
            }
        });
    });

    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'style'] });
})();
