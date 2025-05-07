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
    initializeOrdersPage();
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

/**
 * Initialize Orders Tracking page functionality
 */
function initializeOrdersPage() {
  // Check if we're on the orders tracking page
  if (!document.querySelector('.table-responsive') ||
      !document.querySelector('#selectAll')) {
    return;
  }

  // Select All checkbox functionality
  const selectAllCheckbox = document.getElementById('selectAll');
  const rowCheckboxes = document.querySelectorAll('tbody .form-check-input');

  if (selectAllCheckbox) {
    selectAllCheckbox.addEventListener('change', function() {
      const isChecked = this.checked;
      rowCheckboxes.forEach(checkbox => {
        checkbox.checked = isChecked;

        // Highlight the row
        const row = checkbox.closest('tr');
        if (isChecked) {
          row.classList.add('table-active');
        } else {
          row.classList.remove('table-active');
        }
      });
    });
  }

  // Individual checkboxes update select all status
  rowCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', function() {
      const allChecked = Array.from(rowCheckboxes).every(cb => cb.checked);
      const anyChecked = Array.from(rowCheckboxes).some(cb => cb.checked);

      if (selectAllCheckbox) {
        selectAllCheckbox.checked = allChecked;
        selectAllCheckbox.indeterminate = anyChecked && !allChecked;
      }

      // Highlight the row
      const row = this.closest('tr');
      if (this.checked) {
        row.classList.add('table-active');
      } else {
        row.classList.remove('table-active');
      }
    });
  });

  // Order Status Dropdown functionality
  const statusDropdowns = document.querySelectorAll('td .dropdown-menu');
  statusDropdowns.forEach(dropdown => {
    const dropdownItems = dropdown.querySelectorAll('.dropdown-item');
    const dropdownButton = dropdown.previousElementSibling;

    dropdownItems.forEach(item => {
      item.addEventListener('click', function(e) {
        e.preventDefault();
        const status = this.textContent.trim();
        const statusSpan = dropdownButton.querySelector('span');
        if (statusSpan) {
          statusSpan.textContent = status;
        } else {
          dropdownButton.textContent = status;
        }

        // Update status icon color
        const statusIcon = dropdownButton.querySelector('i');
        if (statusIcon) {
          statusIcon.classList.remove('text-success', 'text-warning', 'text-danger', 'text-primary');

          if (status === 'Completed') {
            statusIcon.classList.add('text-success');
          } else if (status === 'Processing') {
            statusIcon.classList.add('text-warning');
          } else if (status === 'Cancelled') {
            statusIcon.classList.add('text-danger');
          } else {
            statusIcon.classList.add('text-primary');
          }
        }
      });
    });
  });

  // Task category filtering
  const taskLinks = document.querySelectorAll('.task-link');

  taskLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();

      // Remove active class from all links
      taskLinks.forEach(l => l.classList.remove('active'));

      // Add active class to clicked link
      this.classList.add('active');

      // Get the category name
      const categoryText = this.querySelector('div').textContent.trim();

      // Filter the table rows based on the category
      const tableRows = document.querySelectorAll('tbody tr');

      tableRows.forEach(row => {
        const orderType = row.querySelector('td:nth-child(2)').textContent;

        if (categoryText === 'All Tasks') {
          row.style.display = '';
        } else if (categoryText === 'Ice Luge' && orderType.includes('Luge')) {
          row.style.display = '';
        } else if (categoryText === 'Seafood Display' && orderType.includes('Seafood')) {
          row.style.display = '';
        } else if (categoryText === 'Ice Bar' && orderType.includes('Ice Bar')) {
          row.style.display = '';
        } else if (categoryText === '3D Showpieces' && (orderType.includes('3D') || orderType.includes('Selfish') || orderType.includes('Mermaid'))) {
          row.style.display = '';
        } else if (categoryText === 'Mini Luge' && orderType.includes('Mini')) {
          row.style.display = '';
        } else {
          row.style.display = 'none';
        }
      });
    });
  });

  // Task search functionality
  const taskSearchInput = document.getElementById('taskSearch');

  function performTaskSearch() {
    if (!taskSearchInput) return;

    const searchTerm = taskSearchInput.value.toLowerCase().trim();
    let foundAny = false;

    // Filter task links based on search term
    taskLinks.forEach(link => {
      const taskText = link.querySelector('div').textContent.toLowerCase();
      const badge = link.querySelector('.badge');
      const badgeValue = badge ? badge.textContent.trim() : '';

      if (searchTerm === '' ||
          taskText.includes(searchTerm) ||
          badgeValue.includes(searchTerm)) {
        link.parentElement.style.display = ''; // Show the parent task-group
        foundAny = true;
      } else {
        link.parentElement.style.display = 'none'; // Hide the parent task-group
      }
    });

    // If no results found and search term exists, show a message
    const existingNoResults = document.getElementById('no-search-results');
    if (!foundAny && searchTerm !== '') {
      if (!existingNoResults) {
        const noResults = document.createElement('div');
        noResults.id = 'no-search-results';
        noResults.className = 'alert alert-info mt-3';
        noResults.textContent = `No tasks matching "${searchTerm}" found`;
        taskSearchInput.parentElement.parentElement.after(noResults);
      }
    } else if (existingNoResults) {
      existingNoResults.remove();
    }

    // Adjust headings visibility
    const headings = document.querySelectorAll('h6.text-muted.mb-3');
    headings.forEach(heading => {
      // Skip if there's no search term
      if (searchTerm === '') {
        heading.style.display = '';
        return;
      }

      // Find all task groups after this heading until the next heading
      let visibleTasksUnderHeading = false;
      let current = heading.nextElementSibling;

      while (current && current.tagName !== 'H6') {
        if (current.classList.contains('task-group') && current.style.display !== 'none') {
          visibleTasksUnderHeading = true;
          break;
        }
        current = current.nextElementSibling;
        if (!current) break;
      }

      heading.style.display = visibleTasksUnderHeading ? '' : 'none';
    });
  }

  if (taskSearchInput) {
    // Search as you type
    taskSearchInput.addEventListener('input', performTaskSearch);

    // Handle keyboard events
    taskSearchInput.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        this.value = '';
        performTaskSearch();
      }

      if (e.key === 'Enter') {
        e.preventDefault();
        performTaskSearch();
      }
    });

    // Initial search to ensure everything is visible
    setTimeout(performTaskSearch, 500);
  }

  // Table search functionality
  const tableSearchInput = document.querySelector('.card-header .input-group input');
  const tableRows = document.querySelectorAll('tbody tr');
  const searchButton = document.querySelector('.card-header .input-group button');

  function performTableSearch() {
    const searchTerm = tableSearchInput.value.toLowerCase().trim();

    tableRows.forEach(row => {
      const orderName = row.querySelector('td:nth-child(2)').textContent.toLowerCase();
      const customerName = row.querySelector('td:nth-child(3)').textContent.toLowerCase();
      const sku = row.querySelector('td:nth-child(4)').textContent.toLowerCase();
      const orderDate = row.querySelector('td:nth-child(5)').textContent.toLowerCase();
      const refundDate = row.querySelector('td:nth-child(6)').textContent.toLowerCase();

      if (searchTerm === '' ||
          orderName.includes(searchTerm) ||
          customerName.includes(searchTerm) ||
          sku.includes(searchTerm) ||
          orderDate.includes(searchTerm) ||
          refundDate.includes(searchTerm)) {
        row.style.display = '';
      } else {
        row.style.display = 'none';
      }
    });
  }

  if (tableSearchInput) {
    // Perform search when typing
    tableSearchInput.addEventListener('input', performTableSearch);

    // Perform search when pressing Enter
    tableSearchInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        performTableSearch();
      }
    });

    // Perform search when clicking the search button
    if (searchButton) {
      searchButton.addEventListener('click', function(e) {
        e.preventDefault();
        performTableSearch();
      });
    }
  }

  // Pagination functionality
  const paginationButtons = document.querySelectorAll('.d-flex .btn-sm');

  paginationButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      // Remove active class from all buttons
      paginationButtons.forEach(btn => {
        btn.classList.remove('btn-primary');
        btn.classList.add('btn-outline-secondary');
      });

      // Add active class to clicked button
      if (!this.classList.contains('disabled')) {
        this.classList.add('btn-primary');
        this.classList.remove('btn-outline-secondary');
      }
    });
  });

  // Filter dropdown functionality
  const filterDropdowns = document.querySelectorAll('.table-options .dropdown-menu');

  filterDropdowns.forEach(dropdown => {
    const dropdownItems = dropdown.querySelectorAll('.dropdown-item');
    const dropdownButton = dropdown.previousElementSibling;

    dropdownItems.forEach(item => {
      item.addEventListener('click', function(e) {
        e.preventDefault();
        const filter = this.textContent.trim();
        dropdownButton.textContent = filter;
      });
    });
  });
}
