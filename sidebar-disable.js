(function() {
    let sidebarWidth = 160;
    let sidebarDisabled = false;
    let sidebar = null;
    let settingsPanel = null;
    let activationTimer = null;
    const ACTIVATION_DELAY = 3000;

    const CSS_CLASSES = {
        SIDEBAR: 'nav[data-testid="menu-sidebar"]',
        SIDEBAR_INNER: '.fixed.bottom-0.left-0.top-0',
        ACTIVATION_ZONE: 'sidebar-activation-zone'
    };

    function applyStyles() {
        if (!document.getElementById('claude-sidebar-styles')) {
            const style = document.createElement('style');
            style.id = 'claude-sidebar-styles';
            document.head.appendChild(style);
        }
    }

    const debounce = (func, wait) => {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    };

    const findSidebar = () => 
        document.querySelector(CSS_CLASSES.SIDEBAR);

    const findSidebarTitle = (sidebarElement) => {
        // Look for the Claude logo/link which is near the title area
        const logoLink = sidebarElement.querySelector('a[href="/new"] svg[aria-label="Claude"]');
        if (logoLink) {
            return logoLink.closest('div.flex');
        }
        return null;
    };

    function createSettingsIcon(titleElement) {
        let settingsIcon = document.getElementById('claudeSidebarSettingsIcon');
        if (!settingsIcon) {
            settingsIcon = document.createElement('span');
            settingsIcon.id = 'claudeSidebarSettingsIcon';
            settingsIcon.innerHTML = '⚙️';
            titleElement.appendChild(settingsIcon);
        }
        settingsIcon.removeEventListener('click', toggleSettingsPanel);
        settingsIcon.addEventListener('click', toggleSettingsPanel);
        return settingsIcon;
    }

    const modifySidebar = debounce(() => {
        sidebar = findSidebar();
        if (!sidebar) return;

        const title = findSidebarTitle(sidebar);
        if (!title) return;

        createSettingsIcon(title);
        createSettingsPanel();
        applySidebarSettings();
    }, 250);

    function toggleSettingsPanel() {
        if (settingsPanel) {
            settingsPanel.style.display = settingsPanel.style.display === 'none' ? 'block' : 'none';
        }
    }

    function createSettingsPanel() {
        if (settingsPanel) return;

        settingsPanel = document.createElement('div');
        settingsPanel.id = 'sidebarSettingsPanel';

        const title = document.createElement('h3');
        title.textContent = 'Sidebar Settings';
        settingsPanel.appendChild(title);

        // Width setting
        const widthGroup = document.createElement('div');
        widthGroup.className = 'setting-group';

        const widthLabel = document.createElement('label');
        widthLabel.htmlFor = 'sidebarWidthSlider';
        widthLabel.textContent = 'Width:';
        widthGroup.appendChild(widthLabel);

        const widthSlider = document.createElement('input');
        widthSlider.type = 'range';
        widthSlider.id = 'sidebarWidthSlider';
        widthSlider.min = '100';
        widthSlider.max = '500';
        widthSlider.value = sidebarWidth;
        widthGroup.appendChild(widthSlider);

        const widthValue = document.createElement('span');
        widthValue.id = 'sidebarWidthValue';
        widthValue.textContent = `${sidebarWidth}px`;
        widthGroup.appendChild(widthValue);

        settingsPanel.appendChild(widthGroup);

        // Disable setting
        const disableGroup = document.createElement('div');
        disableGroup.className = 'setting-group';

        const disableLabel = document.createElement('label');
        const disableToggle = document.createElement('input');
        disableToggle.type = 'checkbox';
        disableToggle.id = 'sidebarDisabledToggle';
        disableToggle.checked = sidebarDisabled;
        disableLabel.appendChild(disableToggle);
        disableLabel.appendChild(document.createTextNode(' Disable Sidebar'));

        disableGroup.appendChild(disableLabel);
        settingsPanel.appendChild(disableGroup);

        // Save button
        const saveButton = document.createElement('button');
        saveButton.id = 'saveSettingsButton';
        saveButton.textContent = 'Save';
        settingsPanel.appendChild(saveButton);

        sidebar.appendChild(settingsPanel);

        // Event listeners
        widthSlider.addEventListener('input', () => {
            sidebarWidth = parseInt(widthSlider.value);
            widthValue.textContent = `${sidebarWidth}px`;
            applySidebarSettings();
        });

        disableToggle.addEventListener('change', () => {
            sidebarDisabled = disableToggle.checked;
            applySidebarSettings();
        });

        saveButton.addEventListener('click', () => {
            saveSettings();
            settingsPanel.style.display = 'none';
        });
    }

    function applySidebarSettings() {
        if (!sidebar) return;

        // Find the inner fixed div that needs width adjustment
        const innerSidebar = sidebar.querySelector(CSS_CLASSES.SIDEBAR_INNER);
        if (!innerSidebar) return;

        const elements = [sidebar, innerSidebar, innerSidebar.firstElementChild];
        elements.forEach(el => {
            if (el) {
                el.style.width = `${sidebarWidth}px`;
                el.style.minWidth = `${sidebarWidth}px`;
                el.style.maxWidth = `${sidebarWidth}px`;
            }
        });

        if (sidebarDisabled) {
            sidebar.style.transform = 'translateX(-100%)';
            createActivationZone();
        } else {
            sidebar.style.transform = 'translateX(0)';
            removeActivationZone();
        }
    }

    function createActivationZone() {
        let activationZone = document.querySelector(`.${CSS_CLASSES.ACTIVATION_ZONE}`);
        if (!activationZone) {
            activationZone = document.createElement('div');
            activationZone.className = CSS_CLASSES.ACTIVATION_ZONE;
            document.body.appendChild(activationZone);

            activationZone.addEventListener('mouseenter', () => {
                activationTimer = setTimeout(() => {
                    sidebarDisabled = false;
                    applySidebarSettings();
                    saveSettings();
                }, ACTIVATION_DELAY);
            });

            activationZone.addEventListener('mouseleave', () => {
                clearTimeout(activationTimer);
            });
        }
    }

    function removeActivationZone() {
        const activationZone = document.querySelector(`.${CSS_CLASSES.ACTIVATION_ZONE}`);
        if (activationZone) {
            activationZone.remove();
        }
    }

    async function saveSettings() {
        localStorage.setItem('claudeSidebarWidth', sidebarWidth);
        localStorage.setItem('claudeSidebarDisabled', sidebarDisabled);
        try {
            await chrome.runtime.sendMessage({
                action: "saveSettings",
                settings: { sidebarWidth, sidebarDisabled }
            });
        } catch (error) {
            console.error('Error saving settings:', error);
        }
    }

    async function loadSettings() {
        const savedWidth = localStorage.getItem('claudeSidebarWidth');
        const savedDisabled = localStorage.getItem('claudeSidebarDisabled');
        
        if (savedWidth) sidebarWidth = parseInt(savedWidth);
        if (savedDisabled !== null) sidebarDisabled = savedDisabled === 'true';

        try {
            const response = await chrome.runtime.sendMessage({ action: "getSettings" });
            if (response) {
                if (response.sidebarWidth) sidebarWidth = response.sidebarWidth;
                if (response.sidebarDisabled !== undefined) sidebarDisabled = response.sidebarDisabled;
                applySidebarSettings();
            }
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    }

    function observeSidebar() {
        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (mutation.type === 'childList' || mutation.type === 'subtree') {
                    const sidebar = findSidebar();
                    if (sidebar) {
                        const title = findSidebarTitle(sidebar);
                        if (title) {
                            createSettingsIcon(title);
                            break;
                        }
                    }
                }
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    function init() {
        applyStyles();
        loadSettings();
        modifySidebar();
        observeSidebar();
    }

    // Initialize on page load and cache load
    init();
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
