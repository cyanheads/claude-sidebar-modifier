// File: popup.js
// This file contains the JavaScript code for the extension's popup interface.
// It interacts with the UI elements and handles user interactions.

document.addEventListener('DOMContentLoaded', function() {
  const slider = document.getElementById('widthSlider');
  const widthValue = document.getElementById('widthValue');
  const pinButton = document.getElementById('pinButton');

  console.log('Popup script loaded');

  // Function to update the UI
  function updateUI(width, pinned) {
    slider.value = width;
    widthValue.textContent = width;
    pinButton.textContent = pinned ? 'Disable Sidebar' : 'Pin Sidebar';
    slider.disabled = !pinned;
  }

  // Function to save settings
  function saveSettings(width, pinned) {
    const settings = { sidebarWidth: width, isPinned: pinned };
    chrome.runtime.sendMessage({action: "saveSettings", settings: settings}, function(response) {
      if (response && response.success) {
        console.log('Settings saved successfully');
        
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
          if (tabs[0]) {
            chrome.tabs.sendMessage(tabs[0].id, { 
              action: "updateSidebar", 
              settings: settings
            });
          }
        });
      } else {
        console.error('Failed to save settings');
      }
    });
  }

  // Get current settings from background script
  chrome.runtime.sendMessage({action: "getSettings"}, function(response) {
    if (response) {
      updateUI(response.sidebarWidth, response.isPinned);
    }
  });

  // Update width value and save settings when slider changes
  let saveTimer;
  slider.addEventListener('input', function() {
    const width = parseFloat(slider.value);
    widthValue.textContent = width;
    
    // Clear the previous timer
    clearTimeout(saveTimer);
    
    // Set a new timer to save settings after a short delay
    saveTimer = setTimeout(() => {
      console.log('Saving slider value:', width);
      saveSettings(width, pinButton.textContent === 'Disable Sidebar');
    }, 300); // 300ms delay
  });

  // Toggle pin state when button is clicked
  pinButton.addEventListener('click', function() {
    const newPinnedState = pinButton.textContent === 'Pin Sidebar';
    saveSettings(parseFloat(slider.value), newPinnedState);
    updateUI(parseFloat(slider.value), newPinnedState);
  });
});