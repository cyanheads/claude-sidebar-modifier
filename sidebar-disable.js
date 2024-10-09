(function() {
  let sidebarWidth = 288; // Default width in pixels (18rem)
  let isDragging = false;
  let startX, startWidth;

  function modifyExistingSidebar() {
      const sidebar = document.querySelector('.fixed.bottom-0.left-0.top-0.z-20');
      if (!sidebar) {
          console.error('Sidebar not found');
          return;
      }

      sidebar.id = 'custom-sidebar';
      
      // Add resizer
      const resizer = document.createElement('div');
      resizer.id = 'sidebar-resizer';
      sidebar.appendChild(resizer);

      resizer.addEventListener('mousedown', initResize, false);
  }

  function initResize(e) {
      isDragging = true;
      startX = e.clientX;
      startWidth = parseInt(document.defaultView.getComputedStyle(document.getElementById('custom-sidebar')).width, 10);
      document.documentElement.addEventListener('mousemove', resize, false);
      document.documentElement.addEventListener('mouseup', stopResize, false);
  }

  function resize(e) {
      if (isDragging) {
          const width = startWidth + e.clientX - startX;
          sidebarWidth = Math.max(72, Math.min(width, 384)); // Min 4.5rem (72px), Max 24rem (384px)
          updateSidebar();
      }
  }

  function stopResize() {
      isDragging = false;
      document.documentElement.removeEventListener('mousemove', resize, false);
      document.documentElement.removeEventListener('mouseup', stopResize, false);
  }

  function updateSidebar() {
      const sidebar = document.getElementById('custom-sidebar');
      const mainContent = document.querySelector('div.flex.min-h-screen.w-full > div:not(.z-20)');
      
      if (sidebar && mainContent) {
          sidebar.style.width = `${sidebarWidth}px`;
          sidebar.style.minWidth = `${sidebarWidth}px`;
          sidebar.style.maxWidth = `${sidebarWidth}px`;
          
          // Update all direct children of the sidebar
          Array.from(sidebar.children).forEach(child => {
              if (child.id !== 'sidebar-resizer') {
                  child.style.width = `${sidebarWidth}px`;
                  child.style.minWidth = `${sidebarWidth}px`;
                  child.style.maxWidth = `${sidebarWidth}px`;
              }
          });

          mainContent.style.marginLeft = `${sidebarWidth}px`;
          mainContent.style.width = `calc(100% - ${sidebarWidth}px)`;
      }
  }

  function init() {
      modifyExistingSidebar();
      updateSidebar();
  }

  // Run initialization when the script is injected
  init();

  // Rerun on potential dynamic content changes
  const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
          if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
              if (!document.getElementById('custom-sidebar')) {
                  init();
              }
              updateSidebar();
          }
      });
  });
  observer.observe(document.body, { childList: true, subtree: true });
})();