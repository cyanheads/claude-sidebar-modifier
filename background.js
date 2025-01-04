let currentSettings = {
  sidebarWidth: 160,
  sidebarDisabled: false
};

function loadSettings() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['sidebarWidth', 'sidebarDisabled'], function(data) {
      if (data.sidebarWidth) currentSettings.sidebarWidth = data.sidebarWidth;
      if (data.sidebarDisabled !== undefined) currentSettings.sidebarDisabled = data.sidebarDisabled;
      console.log('Loaded settings:', currentSettings);
      resolve(currentSettings);
    });
  });
}

function saveSettings() {
  return new Promise((resolve) => {
    chrome.storage.local.set(currentSettings, function() {
      console.log('Settings saved:', currentSettings);
      resolve(currentSettings);
    });
  });
}

function injectContentScript(tabId) {
  chrome.tabs.executeScript(tabId, { file: 'sidebar-disable.js' }, function() {
    if (chrome.runtime.lastError) {
      console.error('Error injecting content script:', chrome.runtime.lastError);
    } else {
      console.log('Content script injected successfully');
      applySettingsToTab(tabId);
    }
  });
}

function applySettingsToTab(tabId) {
  chrome.tabs.sendMessage(tabId, {
    action: "updateSidebar",
    settings: currentSettings
  }, function(response) {
    if (chrome.runtime.lastError) {
      console.log("Error sending message to tab:", chrome.runtime.lastError);
      // If there's an error, try injecting the content script again
      injectContentScript(tabId);
    } else {
      console.log("Settings applied to tab:", response);
    }
  });
}

// Monitor for Claude.ai page loads
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && tab.url.includes('claude.ai')) {
    injectContentScript(tabId);
  }
});

// Handle messages from popup and content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getSettings") {
    loadSettings().then(settings => sendResponse(settings));
    return true;
  } else if (request.action === "saveSettings") {
    currentSettings = {...currentSettings, ...request.settings};
    saveSettings().then(() => {
      chrome.tabs.query({url: "*://*.claude.ai/*"}, function(tabs) {
        tabs.forEach(tab => applySettingsToTab(tab.id));
      });
      sendResponse({success: true});
    });
    return true;
  }
});

// Initialize settings on startup
loadSettings();
