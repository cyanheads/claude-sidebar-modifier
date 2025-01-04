document.addEventListener('DOMContentLoaded', function() {
    const widthSlider = document.getElementById('sidebarWidth');
    const widthValue = document.getElementById('widthValue');
    const disabledCheckbox = document.getElementById('sidebarDisabled');
    const saveButton = document.getElementById('saveSettings');
    const successMessage = document.getElementById('successMessage');
    let saveTimeout;

    function showSuccessMessage() {
        successMessage.classList.add('show');
        if (saveTimeout) {
            clearTimeout(saveTimeout);
        }
        saveTimeout = setTimeout(() => {
            successMessage.classList.remove('show');
        }, 2000);
    }

    function handleError(error) {
        console.error('Error:', error);
        successMessage.textContent = 'Error saving settings';
        successMessage.style.backgroundColor = '#EF4444';
        successMessage.classList.add('show');
        setTimeout(() => {
            successMessage.classList.remove('show');
            successMessage.textContent = 'Settings saved!';
            successMessage.style.backgroundColor = '#10B981';
        }, 3000);
    }

    // Load current settings
    chrome.runtime.sendMessage({action: "getSettings"}, function(response) {
        if (chrome.runtime.lastError) {
            console.error('Error loading settings:', chrome.runtime.lastError);
            return;
        }
        
        if (response) {
            widthSlider.value = response.sidebarWidth;
            widthValue.textContent = response.sidebarWidth;
            disabledCheckbox.checked = response.sidebarDisabled;
        }
    });

    // Update width value display with a smooth animation
    let updateValueTimeout;
    widthSlider.addEventListener('input', function() {
        if (updateValueTimeout) {
            clearTimeout(updateValueTimeout);
        }
        updateValueTimeout = setTimeout(() => {
            widthValue.textContent = this.value;
        }, 10);
    });

    // Save settings with improved error handling and feedback
    saveButton.addEventListener('click', function() {
        saveButton.disabled = true;
        saveButton.textContent = 'Saving...';

        const settings = {
            sidebarWidth: parseInt(widthSlider.value),
            sidebarDisabled: disabledCheckbox.checked
        };

        chrome.runtime.sendMessage({
            action: "saveSettings",
            settings: settings
        }, function(response) {
            saveButton.disabled = false;
            saveButton.textContent = 'Save Settings';

            if (chrome.runtime.lastError) {
                handleError(chrome.runtime.lastError);
                return;
            }

            if (response && response.success) {
                showSuccessMessage();
            } else {
                handleError(new Error('Failed to save settings'));
            }
        });
    });

    // Add keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Save on Ctrl/Cmd + S
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            if (!saveButton.disabled) {
                saveButton.click();
            }
        }
        // Close popup on Escape
        else if (e.key === 'Escape') {
            window.close();
        }
    });

    // Prevent form submission
    document.addEventListener('submit', function(e) {
        e.preventDefault();
    });
});
