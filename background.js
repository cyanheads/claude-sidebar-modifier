browser.runtime.onInstalled.addListener(() => {
    browser.storage.local.set({ sidebarDisabled: true });
  });
  
  browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete') {
      browser.tabs.sendMessage(tabId, { action: "disableSidebar" });
    }
  });