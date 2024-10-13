// popup.js
document.addEventListener('DOMContentLoaded', function() {
    const widthSlider = document.getElementById('sidebarWidth');
    const widthValue = document.getElementById('widthValue');
    const pinnedCheckbox = document.getElementById('sidebarPinned');
    const disabledCheckbox = document.getElementById('sidebarDisabled');
    const saveButton = document.getElementById('saveSettings');

    // Load current settings
    chrome.runtime.sendMessage({action: "getSettings"}, function(response) {
        if (response) {
            widthSlider.value = response.sidebarWidth;
            widthValue.textContent = response.sidebarWidth;
            pinnedCheckbox.checked = response.sidebarPinned;
            disabledCheckbox.checked = response.sidebarDisabled;
        }
    });

    // Update width value display
    widthSlider.addEventListener('input', function() {
        widthValue.textContent = this.value;
    });

    // Save settings
    saveButton.addEventListener('click', function() {
        const settings = {
            sidebarWidth: parseInt(widthSlider.value),
            sidebarPinned: pinnedCheckbox.checked,
            sidebarDisabled: disabledCheckbox.checked
        };

        chrome.runtime.sendMessage({
            action: "saveSettings",
            settings: settings
        }, function(response) {
            if (response && response.success) {
                alert('Settings saved successfully!');
            } else {
                alert('Error saving settings. Please try again.');
            }
        });
    });
});
