// Main JavaScript for Ice Butcher Dashboard
/**
 * Utility functions to load components and handle component interactions
 */

document.addEventListener('DOMContentLoaded', function() {
  // Load components
  loadComponents();

  // Run any post-component-load initialization
  initializeComponents();
  setTimeout(() => {
    initializeSidebarComponents();
  }, 1000);
});

/**
 * Load all components from the components directory
 */
async function loadComponents() {
  const components = [
    { selector: '#header-container', file: 'components/header.html' },
    { selector: '#sidebar-container', file: 'components/sidebar.html' }
  ];

  for (const component of components) {
    const container = document.querySelector(component.selector);
    if (container) {
      try {
        const response = await fetch(component.file);
        if (response.ok) {
          let html = await response.text();
          container.innerHTML = html;
        }
      } catch (error) {
        console.error(`Failed to load component: ${component.file}`, error);
      }
    }
  }
}

/**
 * Initialize component-specific functionality
 */
function initializeComponents() {
  // Mark the current page in the sidebar
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const sidebarLinks = document.querySelectorAll('.sidebar-menu-item');

  sidebarLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage) {
      link.classList.add('active');
    }
  });

  
}
function initializeSidebarComponents() {
  // Sidebar toggle logic with chevron and overlay
      const sidebar = document.getElementById("sidebar-container");
      const sidebarToggleBtn = document.getElementById("sidebarToggleBtn");
      const sidebarArrow = document.getElementById("sidebarArrow");
      const sidebarMobileOverlay = document.getElementById(
        "sidebarMobileOverlay"
      );
      function setSidebarCollapsed(collapsed) {
        if (collapsed) {
          sidebar.classList.add("collapsed");
          sidebarArrow.classList.remove("bi-chevron-left");
          sidebarArrow.classList.add("bi-chevron-right");
          sidebarMobileOverlay.classList.remove("active");
        } else {
          sidebar.classList.remove("collapsed");
          sidebarArrow.classList.add("bi-chevron-left");
          sidebarArrow.classList.remove("bi-chevron-right");
          if (window.innerWidth < 992) {
            sidebarMobileOverlay.classList.add("active");
          }
        }
      }
      sidebarToggleBtn.onclick = () => {
        if (sidebar.classList.contains("collapsed")) {
          setSidebarCollapsed(false);
        } else {
          setSidebarCollapsed(true);
        }
      };
      sidebarMobileOverlay.onclick = function () {
        setSidebarCollapsed(true);
      };
      function handleSidebarOnResize() {
        if (window.innerWidth < 992) {
          setSidebarCollapsed(true);
        } else {
          setSidebarCollapsed(false);
          sidebarMobileOverlay.classList.remove("active");
        }
      }
      window.addEventListener("resize", handleSidebarOnResize);
      window.addEventListener("DOMContentLoaded", handleSidebarOnResize);
}
