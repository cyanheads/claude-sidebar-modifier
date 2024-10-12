// sidebar-disable.js
(function() {
    let sidebarWidth = 288;
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

        // Find the Claude title element
        const claudeTitle = sidebar.querySelector('h1, h2, h3, h4, h5, h6');
        if (!claudeTitle) {
            console.error('Claude title not found');
            return;
        }

        // Create settings icon
        const settingsIcon = document.createElement('span');
        settingsIcon.innerHTML = '⚙️';
        settingsIcon.id = 'claudeSidebarSettingsIcon';
        settingsIcon.style.cssText = `
            font-size: 20px;
            cursor: pointer;
            margin-left: 10px;
            vertical-align: middle;
        `;
        claudeTitle.appendChild(settingsIcon);

        // Create settings panel
        settingsPanel = document.createElement('div');
        settingsPanel.id = 'sidebarSettingsPanel';
        settingsPanel.innerHTML = `
            <h3>Sidebar Settings</h3>
            <div class="setting-group">
                <label for="sidebarWidthSlider">Width:</label>
                <input type="range" id="sidebarWidthSlider" min="100" max="500" value="${sidebarWidth}">
                <span id="sidebarWidthValue">${sidebarWidth}px</span>
            </div>
        `;
        sidebar.appendChild(settingsPanel);

        // Toggle settings panel
        settingsIcon.addEventListener('click', (e) => {
            e.stopPropagation();
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

        // Apply initial width
        applySidebarWidth();

        // Add mouse movement detection
        document.addEventListener('mousemove', handleMouseMove);
    }

    function handleMouseMove(event) {
        const threshold = 20; // pixels from the left edge to trigger sidebar
        if (event.clientX <= threshold) {
            if (!isMouseNearSidebar && !isPinned()) {
                isMouseNearSidebar = true;
                showSidebar();
            }
        } else {
            if (isMouseNearSidebar && !isPinned()) {
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
        if (sidebar && !isPinned()) {
            sidebar.style.transform = `translateX(-${sidebarWidth}px)`;
        }
    }

    function isPinned() {
        // Check if the sidebar has a class indicating it's pinned
        // You may need to adjust this based on the actual class used
        return sidebar.classList.contains('pinned');
    }

    function applySidebarWidth() {
        if (!sidebar) return;

        sidebar.style.width = `${sidebarWidth}px`;
        sidebar.style.minWidth = `${sidebarWidth}px`;
        sidebar.style.maxWidth = `${sidebarWidth}px`;
        
        if (!isPinned()) {
            sidebar.style.transform = `translateX(-${sidebarWidth}px)`;
        }

        // Update settings panel if it exists
        if (settingsPanel) {
            const widthSlider = settingsPanel.querySelector('#sidebarWidthSlider');
            const widthValue = settingsPanel.querySelector('#sidebarWidthValue');

            if (widthSlider) widthSlider.value = sidebarWidth;
            if (widthValue) widthValue.textContent = `${sidebarWidth}px`;
        }
    }

    function saveSettings() {
        chrome.runtime.sendMessage({
            action: "saveSettings",
            settings: { sidebarWidth }
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
                console.log('Settings loaded:', { sidebarWidth });
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
            applySidebarWidth();
        }
    });

    // Run initialization
    init();
})();
