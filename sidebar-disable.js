// sidebar-disable.js
(function() {
    let sidebarWidth = 288;
    let sidebar;
    let settingsPanel;

    function applyStyles() {
        if (!document.getElementById('claude-sidebar-styles')) {
            const style = document.createElement('style');
            style.id = 'claude-sidebar-styles';
            style.textContent = `
                .fixed.bottom-0.left-0.top-0.z-20 {
                    transition: transform 0.3s ease-in-out, width 0.3s ease-in-out !important;
                    overflow-x: hidden;
                }
                #sidebarSettingsPanel {
                    position: absolute;
                    top: 60px;
                    right: 10px;
                    background-color: #fff;
                    border: 1px solid #ccc;
                    padding: 10px;
                    z-index: 1000;
                    display: none;
                }
            `;
            document.head.appendChild(style);
        }
    }

    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    const debouncedModifySidebar = debounce(modifySidebar, 250);

    function modifySidebar() {
        sidebar = document.querySelector('.fixed.bottom-0.left-0.top-0.z-20');
        if (!sidebar) return;

        const claudeTitle = sidebar.querySelector('h1, h2, h3, h4, h5, h6');
        if (!claudeTitle) return;

        let settingsIcon = document.getElementById('claudeSidebarSettingsIcon');
        if (!settingsIcon) {
            settingsIcon = document.createElement('span');
            settingsIcon.innerHTML = '⚙️';
            settingsIcon.id = 'claudeSidebarSettingsIcon';
            settingsIcon.style.cssText = `
                font-size: 20px;
                cursor: pointer;
                margin-left: 10px;
                vertical-align: middle;
            `;
            claudeTitle.appendChild(settingsIcon);
            settingsIcon.addEventListener('click', toggleSettingsPanel);
        }

        createSettingsPanel();
        applySidebarWidth();
    }

    function toggleSettingsPanel() {
        if (settingsPanel) {
            settingsPanel.style.display = settingsPanel.style.display === 'none' ? 'block' : 'none';
        }
    }

    function createSettingsPanel() {
        if (!settingsPanel) {
            settingsPanel = document.createElement('div');
            settingsPanel.id = 'sidebarSettingsPanel';
            settingsPanel.innerHTML = `
                <h3>Sidebar Settings</h3>
                <div class="setting-group">
                    <label for="sidebarWidthSlider">Width:</label>
                    <input type="range" id="sidebarWidthSlider" min="100" max="500" value="${sidebarWidth}">
                    <span id="sidebarWidthValue">${sidebarWidth}px</span>
                </div>
                <button id="saveSettingsButton">Save</button>
            `;
            sidebar.appendChild(settingsPanel);

            const widthSlider = document.getElementById('sidebarWidthSlider');
            const widthValue = document.getElementById('sidebarWidthValue');
            widthSlider.addEventListener('input', () => {
                sidebarWidth = parseInt(widthSlider.value);
                widthValue.textContent = `${sidebarWidth}px`;
                applySidebarWidth();
            });

            const saveButton = document.getElementById('saveSettingsButton');
            saveButton.addEventListener('click', () => {
                saveSettings();
                settingsPanel.style.display = 'none';
            });
        }
    }

    function applySidebarWidth() {
        if (sidebar) {
            sidebar.style.width = `${sidebarWidth}px`;
            sidebar.style.minWidth = `${sidebarWidth}px`;
            sidebar.style.maxWidth = `${sidebarWidth}px`;
        }
    }

    function saveSettings() {
        localStorage.setItem('claudeSidebarWidth', sidebarWidth);
        chrome.runtime.sendMessage({
            action: "saveSettings",
            settings: { sidebarWidth }
        });
    }

    function loadSettings() {
        const savedWidth = localStorage.getItem('claudeSidebarWidth');
        if (savedWidth) {
            sidebarWidth = parseInt(savedWidth);
        }
        chrome.runtime.sendMessage({ action: "getSettings" }, function(response) {
            if (response && response.sidebarWidth) {
                sidebarWidth = response.sidebarWidth;
                applySidebarWidth();
            }
        });
    }

    function init() {
        applyStyles();
        loadSettings();
        debouncedModifySidebar();
    }

    // Run initialization immediately
    init();

    // Set up a MutationObserver to check for sidebar changes
    const observer = new MutationObserver((mutations) => {
        for (let mutation of mutations) {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                for (let node of mutation.addedNodes) {
                    if (node.classList && node.classList.contains('fixed') && node.classList.contains('bottom-0') && node.classList.contains('left-0') && node.classList.contains('top-0') && node.classList.contains('z-20')) {
                        debouncedModifySidebar();
                        return;
                    }
                }
            }
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // Ensure the script runs even if the page is loaded from cache
    document.addEventListener('DOMContentLoaded', init);
    window.addEventListener('load', init);

    // Listen for messages from the background script
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === "updateSidebar") {
            sidebarWidth = request.settings.sidebarWidth;
            applySidebarWidth();
            sendResponse({success: true});
        }
    });
})();
