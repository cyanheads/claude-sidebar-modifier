let currentSettings = {
  sidebarWidth: 18,
  isPinned: false
};

// Load settings from storage
chrome.storage.sync.get(['sidebarWidth', 'isPinned'], function(data) {
  if (data.sidebarWidth) currentSettings.sidebarWidth = data.sidebarWidth;
  if (data.isPinned !== undefined) currentSettings.isPinned = data.isPinned;
  console.log('Loaded settings:', currentSettings);
});

// Listen for changes in storage
chrome.storage.onChanged.addListener(function(changes, namespace) {
  if (namespace === 'sync') {
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

// Listen for messages from content script or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getSettings") {
    sendResponse(currentSettings);
  } else if (request.action === "saveSettings") {
    chrome.storage.sync.set(request.settings, function() {
      console.log('Settings saved:', request.settings);
      currentSettings = {...currentSettings, ...request.settings};
      sendResponse({success: true});
    });
    return true; // Indicates that the response is sent asynchronously
  }
});