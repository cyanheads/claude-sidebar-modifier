// sidebar-disable.js
(function() {
    let sidebarWidth = 288;
    let isPinned = false;
    let sidebar;
    let settingsPanel;
    let isMouseNearSidebar = false;

    function modifySidebar() {
        sidebar = document.querySelector('.fixed.bottom-0.left-0.top-0.z-20');
        if (!sidebar) {
            console.error('Existing sidebar not found');
            setTimeout(modifySidebar, 500); // Retry after 500ms
            return;
        }

        // Create settings icon
        const settingsIcon = document.createElement('div');
        settingsIcon.innerHTML = '⚙️';
        settingsIcon.style.cssText = `
            position: absolute;
            top: 10px;
            right: 10px;
            font-size: 20px;
            cursor: pointer;
            z-index: 1000;
        `;
        sidebar.appendChild(settingsIcon);

        // Create settings panel
        settingsPanel = document.createElement('div');
        settingsPanel.style.cssText = `
            position: absolute;
            top: 40px;
            right: 10px;
            background-color: white;
            border: 1px solid #ccc;
            padding: 10px;
            border-radius: 5px;
            display: none;
            z-index: 1000;
        `;
        settingsPanel.innerHTML = `
            <h3>Sidebar Settings</h3>
            <label>
                Width: <input type="range" id="sidebarWidthSlider" min="100" max="500" value="${sidebarWidth}">
                <span id="sidebarWidthValue">${sidebarWidth}px</span>
            </label><br>
            <label>
                <input type="checkbox" id="sidebarPinCheckbox" ${isPinned ? 'checked' : ''}>
                Pin Sidebar
            </label>
        `;
        sidebar.appendChild(settingsPanel);

        // Toggle settings panel
        settingsIcon.addEventListener('click', () => {
            settingsPanel.style.display = settingsPanel.style.display === 'none' ? 'block' : 'none';
        });

        // Width slider functionality
        const widthSlider = document.getElementById('sidebarWidthSlider');
        const widthValue = document.getElementById('sidebarWidthValue');
        widthSlider.addEventListener('input', () => {
            sidebarWidth = parseInt(widthSlider.value);
            widthValue.textContent = `${sidebarWidth}px`;
            applySidebarWidth();
            saveSettings();
        });

        // Pin checkbox functionality
        const pinCheckbox = document.getElementById('sidebarPinCheckbox');
        pinCheckbox.addEventListener('change', () => {
            isPinned = pinCheckbox.checked;
            applySidebarWidth();
            saveSettings();
        });

        // Apply initial width
        applySidebarWidth();

        // Add mouse movement detection
        document.addEventListener('mousemove', handleMouseMove);
    }

    function handleMouseMove(event) {
        const threshold = 20; // pixels from the left edge to trigger sidebar
        if (event.clientX <= threshold) {
            if (!isMouseNearSidebar && !isPinned) {
                isMouseNearSidebar = true;
                showSidebar();
            }
        } else {
            if (isMouseNearSidebar && !isPinned) {
                isMouseNearSidebar = false;
                hideSidebar();
            }
        }
    }

    function showSidebar() {
        if (sidebar) {
            sidebar.style.transform = 'translateX(0)';
        }
    }

    function hideSidebar() {
        if (sidebar && !isPinned) {
            sidebar.style.transform = `translateX(-${sidebarWidth}px)`;
        }
    }

    function applySidebarWidth() {
        if (!sidebar) return;

        sidebar.style.width = `${sidebarWidth}px`;
        sidebar.style.minWidth = `${sidebarWidth}px`;
        sidebar.style.maxWidth = `${sidebarWidth}px`;
        sidebar.style.transform = isPinned ? 'none' : `translateX(-${sidebarWidth}px)`;
        sidebar.style.transition = 'transform 0.3s ease-in-out, width 0.3s ease-in-out';

        // Adjust main content
        const mainContent = document.querySelector('div.flex.min-h-screen.w-full > div:not(.z-20)');
        if (mainContent) {
            mainContent.style.marginLeft = isPinned ? `${sidebarWidth}px` : '0';
            mainContent.style.width = isPinned ? `calc(100% - ${sidebarWidth}px)` : '100%';
            mainContent.style.transition = 'margin-left 0.3s ease-in-out, width 0.3s ease-in-out';
        }

        // Update settings panel if it exists
        if (settingsPanel) {
            const widthSlider = settingsPanel.querySelector('#sidebarWidthSlider');
            const widthValue = settingsPanel.querySelector('#sidebarWidthValue');
            const pinCheckbox = settingsPanel.querySelector('#sidebarPinCheckbox');

            if (widthSlider) widthSlider.value = sidebarWidth;
            if (widthValue) widthValue.textContent = `${sidebarWidth}px`;
            if (pinCheckbox) pinCheckbox.checked = isPinned;
        }

        // Ensure the sidebar is visible when pinned
        if (isPinned) {
            showSidebar();
        } else {
            hideSidebar();
        }
    }

    function saveSettings() {
        chrome.runtime.sendMessage({
            action: "saveSettings",
            settings: { sidebarWidth, isPinned }
        }, function(response) {
            if (response && response.success) {
                console.log('Settings saved successfully');
            } else {
                console.error('Failed to save settings');
            }
        });
    }

    function loadSettings(callback) {
        chrome.runtime.sendMessage({ action: "getSettings" }, function(response) {
            if (response) {
                sidebarWidth = response.sidebarWidth || sidebarWidth;
                isPinned = response.isPinned || isPinned;
                console.log('Settings loaded:', { sidebarWidth, isPinned });
                callback();
            } else {
                console.error('Failed to load settings');
                callback();
            }
        });
    }

    function init() {
        loadSettings(() => {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', modifySidebar);
            } else {
                modifySidebar();
            }
        });
    }

    // Listen for messages from background script
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === "updateSidebar") {
            sidebarWidth = request.settings.sidebarWidth;
            isPinned = request.settings.isPinned;
            applySidebarWidth();
        }
    });

    // Run initialization
    init();
})();
