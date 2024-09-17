(function() {
    function disableHoverSidebar() {
      const sidebarNav = document.querySelector('nav[data-testid="menu-sidebar"]');
      if (sidebarNav) {
        // Check if the sidebar is pinned (width is 18rem)
        const isPinned = sidebarNav.style.width === '18rem';
        
        if (!isPinned) {
          // Hide all children of the sidebar except the Claude title
          Array.from(sidebarNav.children).forEach(child => {
            if (!child.querySelector('div > div > div')) {
              child.style.display = 'none';
            }
          });
  
          // Set sidebar width to minimum to show only the Claude title
          sidebarNav.style.width = 'auto';
          sidebarNav.style.minWidth = 'fit-content';
          sidebarNav.style.maxWidth = 'fit-content';
        }
      }
  
      // Ensure the Claude title remains visible
      const claudeTitle = document.querySelector('nav[data-testid="menu-sidebar"] > div > div > div');
      if (claudeTitle) {
        claudeTitle.style.opacity = '1';
        claudeTitle.style.pointerEvents = 'auto';
        claudeTitle.closest('div[class*="flex"]').style.width = 'auto';
      }
  
      // Remove hover effects
      const hoverElements = document.querySelectorAll('.from-bg-300\\/70, .to-bg-400\\/70');
      hoverElements.forEach(el => {
        el.style.opacity = '0';
        el.style.pointerEvents = 'none';
      });
    }
  
    // Run the disableHoverSidebar function when the page loads
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', disableHoverSidebar);
    } else {
      disableHoverSidebar();
    }
  
    // Rerun on potential dynamic content changes
    const observer = new MutationObserver(disableHoverSidebar);
    observer.observe(document.body, { childList: true, subtree: true });
  
    // Run disableHoverSidebar periodically to catch any delayed renders
    setInterval(disableHoverSidebar, 1000);
  })();