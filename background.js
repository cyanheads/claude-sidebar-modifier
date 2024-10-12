// background.js
let currentSettings = {
  sidebarWidth: 288,
  isPinned: false
};

// Load settings from storage
function loadSettings() {
  chrome.storage.local.get(['sidebarWidth', 'isPinned'], function(data) {
    if (data.sidebarWidth) currentSettings.sidebarWidth = data.sidebarWidth;
    if (data.isPinned !== undefined) currentSettings.isPinned = data.isPinned;
    console.log('Loaded settings:', currentSettings);
  });
}

// Save settings to storage
function saveSettings() {
  chrome.storage.local.set(currentSettings, function() {
    console.log('Settings saved:', currentSettings);
  });
}

// Initialize settings
loadSettings();

// Listen for changes in storage
chrome.storage.onChanged.addListener(function(changes, namespace) {
  if (namespace === 'local') {
    if (changes.sidebarWidth) currentSettings.sidebarWidth = changes.sidebarWidth.newValue;
    if (changes.isPinned !== undefined) currentSettings.isPinned = changes.isPinned.newValue;
    console.log('Settings updated:', currentSettings);
  }
});

// Apply settings when a Claude.ai page is loaded or refreshed
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && tab.url.includes('claude.ai')) {
    chrome.tabs.sendMessage(tabId, {
      action: "updateSidebar",
      settings: currentSettings
    });
  }
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getSettings") {
    sendResponse(currentSettings);
  } else if (request.action === "saveSettings") {
    currentSettings = {...currentSettings, ...request.settings};
    saveSettings();
    sendResponse({success: true});
  }
  return true; // Keeps the message channel open for asynchronous responses
});
