(function() {
  let sidebarWidth = 18; // Default width in rem
  let isPinned = false;

  console.log('Content script loaded');

  function updateSidebar() {
    console.log('Updating sidebar with width:', sidebarWidth, 'isPinned:', isPinned);

    const sidebarNav = document.querySelector('nav.z-20.h-screen');
    
    if (sidebarNav) {
      const widthToApply = isPinned ? Math.max(sidebarWidth, 4.5) : 4.5;
      
      try {
        // Update sidebar
        sidebarNav.style.setProperty('width', `${widthToApply}rem`, 'important');
        sidebarNav.style.setProperty('min-width', `${widthToApply}rem`, 'important');
        sidebarNav.style.setProperty('max-width', `${widthToApply}rem`, 'important');

        // Update sidebar children
        const sidebarChildren = sidebarNav.querySelectorAll('div');
        sidebarChildren.forEach(child => {
          child.style.setProperty('width', `${widthToApply}rem`, 'important');
          child.style.setProperty('min-width', `${widthToApply}rem`, 'important');
          child.style.setProperty('max-width', `${widthToApply}rem`, 'important');
        });

        console.log('Applied width to sidebar:', sidebarNav.style.width);

        // Adjust visibility of sidebar content based on pin state
        if (!isPinned) {
          sidebarNav.classList.add('collapsed');
        } else {
          sidebarNav.classList.remove('collapsed');
        }

        // Update main content
        const mainContent = document.querySelector('div.flex.min-h-screen.w-full > div:not(.z-20)');
        if (mainContent) {
          mainContent.style.setProperty('margin-left', `${widthToApply}rem`, 'important');
          mainContent.style.setProperty('width', `calc(100% - ${widthToApply}rem)`, 'important');
          console.log('Adjusted main content:', mainContent.style.marginLeft, mainContent.style.width);
        } else {
          console.warn('Main content element not found');
        }

        return true; // Indicate successful update
      } catch (error) {
        console.error('Error updating sidebar:', error);
        return false;
      }
    } else {
      console.warn('Sidebar nav element not found');
      return false;
    }
  }

  // Listen for messages from background script or popup
  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "updateSidebar") {
      sidebarWidth = request.settings.sidebarWidth;
      isPinned = request.settings.isPinned;
      const success = updateSidebar();
      sendResponse({success: success});
    }
    return true; // Indicate that the response will be sent asynchronously
  });

  // Request current settings from background script
  function loadAndApplySettings() {
    chrome.runtime.sendMessage({action: "getSettings"}, function(response) {
      if (chrome.runtime.lastError) {
        console.error('Error getting settings:', chrome.runtime.lastError);
      } else if (response) {
        sidebarWidth = response.sidebarWidth;
        isPinned = response.isPinned;
        updateSidebar();
      }
    });
  }

  // Load settings when the script is first injected
  loadAndApplySettings();

  // Rerun on potential dynamic content changes
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        console.log('Content changed, updating sidebar');
        updateSidebar();
      }
    });
  });
  observer.observe(document.body, { childList: true, subtree: true });

  // Run updateSidebar periodically to catch any delayed renders
  setInterval(() => {
    loadAndApplySettings(); // Reload settings before updating
  }, 2000);
})();