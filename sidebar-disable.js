(function() {
    let sidebarWidth = 288;
    let sidebarDisabled = false;
    let sidebar;
    let settingsPanel;
    let activationTimer;

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
                .sidebar-activation-zone {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 10px;
                    height: 100%;
                    z-index: 1001;
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

    function findSidebar() {
        return document.querySelector('.fixed.bottom-0.left-0.top-0.z-20') || 
               document.querySelector('[class*="ConversationSidebar_sidebar"]');
    }

    function findSidebarTitle(sidebarElement) {
        return sidebarElement.querySelector('h1, h2, h3, h4, h5, h6') ||
               sidebarElement.querySelector('[class*="ConversationSidebar_title"]');
    }

    function createSettingsIcon(titleElement) {
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
            titleElement.appendChild(settingsIcon);
        }
        // Always attach the event listener, even if the icon already exists
        settingsIcon.removeEventListener('click', toggleSettingsPanel);
        settingsIcon.addEventListener('click', toggleSettingsPanel);
        return settingsIcon;
    }

    function modifySidebar() {
        sidebar = findSidebar();
        if (!sidebar) return;

        const claudeTitle = findSidebarTitle(sidebar);
        if (!claudeTitle) return;

        createSettingsIcon(claudeTitle);
        createSettingsPanel();
        applySidebarSettings();
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
                <div class="setting-group">
                    <label for="sidebarDisabledToggle">
                        <input type="checkbox" id="sidebarDisabledToggle" ${sidebarDisabled ? 'checked' : ''}>
                        Disable Sidebar
                    </label>
                </div>
                <button id="saveSettingsButton">Save</button>
            `;
            sidebar.appendChild(settingsPanel);

            const widthSlider = document.getElementById('sidebarWidthSlider');
            const widthValue = document.getElementById('sidebarWidthValue');
            widthSlider.addEventListener('input', () => {
                sidebarWidth = parseInt(widthSlider.value);
                widthValue.textContent = `${sidebarWidth}px`;
                applySidebarSettings();
            });

            const disabledToggle = document.getElementById('sidebarDisabledToggle');
            disabledToggle.addEventListener('change', () => {
                sidebarDisabled = disabledToggle.checked;
                applySidebarSettings();
            });

            const saveButton = document.getElementById('saveSettingsButton');
            saveButton.addEventListener('click', () => {
                saveSettings();
                settingsPanel.style.display = 'none';
            });
        }
    }

    function applySidebarSettings() {
        if (sidebar) {
            sidebar.style.width = `${sidebarWidth}px`;
            sidebar.style.minWidth = `${sidebarWidth}px`;
            sidebar.style.maxWidth = `${sidebarWidth}px`;

            if (sidebarDisabled) {
                sidebar.style.transform = 'translateX(-100%)';
                createActivationZone();
            } else {
                sidebar.style.transform = 'translateX(0)';
                removeActivationZone();
            }
        }
    }

    function createActivationZone() {
        let activationZone = document.querySelector('.sidebar-activation-zone');
        if (!activationZone) {
            activationZone = document.createElement('div');
            activationZone.className = 'sidebar-activation-zone';
            document.body.appendChild(activationZone);

            activationZone.addEventListener('mouseenter', () => {
                activationTimer = setTimeout(() => {
                    sidebarDisabled = false;
                    applySidebarSettings();
                    saveSettings();
                }, 10000); // 10 seconds
            });

            activationZone.addEventListener('mouseleave', () => {
                clearTimeout(activationTimer);
            });
        }
    }

    function removeActivationZone() {
        const activationZone = document.querySelector('.sidebar-activation-zone');
        if (activationZone) {
            activationZone.remove();
        }
    }

    function saveSettings() {
        localStorage.setItem('claudeSidebarWidth', sidebarWidth);
        localStorage.setItem('claudeSidebarDisabled', sidebarDisabled);
        chrome.runtime.sendMessage({
            action: "saveSettings",
            settings: { sidebarWidth, sidebarDisabled }
        });
    }

    function loadSettings() {
        const savedWidth = localStorage.getItem('claudeSidebarWidth');
        const savedDisabled = localStorage.getItem('claudeSidebarDisabled');
        
        if (savedWidth) sidebarWidth = parseInt(savedWidth);
        if (savedDisabled !== null) sidebarDisabled = savedDisabled === 'true';

        chrome.runtime.sendMessage({ action: "getSettings" }, function(response) {
            if (response) {
                if (response.sidebarWidth) sidebarWidth = response.sidebarWidth;
                if (response.sidebarDisabled !== undefined) sidebarDisabled = response.sidebarDisabled;
                applySidebarSettings();
            }
        });
    }

    function observeSidebar() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList' || mutation.type === 'subtree') {
                    const sidebar = findSidebar();
                    if (sidebar) {
                        const title = findSidebarTitle(sidebar);
                        if (title) {
                            createSettingsIcon(title);
                        }
                    }
                }
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    function init() {
        applyStyles();
        loadSettings();
        debouncedModifySidebar();
        observeSidebar();
    }

    // Run initialization immediately
    init();

    // Ensure the script runs even if the page is loaded from cache
    document.addEventListener('DOMContentLoaded', init);
    window.addEventListener('load', init);

    // Listen for messages from the background script
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === "updateSidebar") {
            sidebarWidth = request.settings.sidebarWidth;
            sidebarDisabled = request.settings.sidebarDisabled;
            applySidebarSettings();
            sendResponse({success: true});
        }
    });
})();