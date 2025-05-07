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
    initializeProfilePage();
    initializeUsersTeamsPage();
    initializeNotificationsPage();
    initializeAuditLogPage();
    initializeWorkSchedulePage();
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
  setTimeout(() => {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const sidebarLinks = document.querySelectorAll('.sidebar-menu-item');

    sidebarLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href === currentPage) {
        link.classList.add('active');
      } else if (currentPage === 'user-profile.html' && href === 'user-profile.html') {
        link.classList.add('active');
      } else if (currentPage === 'users-teams.html' && href === 'users-teams.html') {
        link.classList.add('active');
      } else if (currentPage === 'notifications.html' && href === 'notifications.html') {
        link.classList.add('active');
      } else if (currentPage === 'audit-log.html' && href === 'audit-log.html') {
        link.classList.add('active');
      } else if (currentPage === 'works-schedule.html' && href === 'works-schedule.html') {
        link.classList.add('active');
      }
    });
  }, 1200);
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
  if (sidebarToggleBtn) {
    sidebarToggleBtn.onclick = () => {
      if (sidebar.classList.contains("collapsed")) {
        setSidebarCollapsed(false);
      } else {
        setSidebarCollapsed(true);
      }
    };
  }
  if (sidebarMobileOverlay) {
    sidebarMobileOverlay.onclick = function () {
      setSidebarCollapsed(true);
    };
  }
  function handleSidebarOnResize() {
    if (window.innerWidth < 992) {
      setSidebarCollapsed(true);
    } else {
      setSidebarCollapsed(false);
      if (sidebarMobileOverlay) {
        sidebarMobileOverlay.classList.remove("active");
      }
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

/**
 * Initialize User Profile page functionality
 */
function initializeProfilePage() {
  // Check if we're on the profile page
  if (!document.querySelector('#profileTabs')) {
    return;
  }

  // Upload profile picture functionality
  const uploadBtn = document.querySelector('.upload-btn');
  const deleteBtn = document.querySelector('.delete-btn');
  const profilePicture = document.querySelector('.profile-picture');

  if (uploadBtn) {
    uploadBtn.addEventListener('click', function() {
      // Create a file input element
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = 'image/*';
      fileInput.style.display = 'none';

      // Append to body
      document.body.appendChild(fileInput);

      // Trigger click on file input
      fileInput.click();

      // Listen for file selection
      fileInput.addEventListener('change', function() {
        if (this.files && this.files[0]) {
          const reader = new FileReader();

          reader.onload = function(e) {
            profilePicture.src = e.target.result;
          };

          reader.readAsDataURL(this.files[0]);
        }

        // Remove the input
        document.body.removeChild(fileInput);
      });
    });
  }

  if (deleteBtn && profilePicture) {
    deleteBtn.addEventListener('click', function() {
      // Set default profile picture
      profilePicture.src = 'assets/images/avatar1.png';
    });
  }

  // Save changes button functionality
  const saveButtons = document.querySelectorAll('.save-changes-btn');

  saveButtons.forEach(button => {
    button.addEventListener('click', function() {
      // Create alert element
      const alert = document.createElement('div');
      alert.className = 'alert alert-success alert-dismissible fade show mt-3';
      alert.setAttribute('role', 'alert');
      alert.innerHTML = `
        <strong>Success!</strong> Your changes have been saved.
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      `;

      // Append alert after form
      const form = this.closest('.profile-section, .security-section');
      if (form) {
        form.after(alert);

        // Automatically dismiss after 3 seconds
        setTimeout(() => {
          const bsAlert = new bootstrap.Alert(alert);
          bsAlert.close();
        }, 3000);
      }
    });
  });

  // Delete account confirmation
  const deleteAccountBtn = document.querySelector('.delete-account-btn');

  if (deleteAccountBtn) {
    deleteAccountBtn.addEventListener('click', function() {
      if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
        alert('Account deletion request submitted. An administrator will contact you shortly.');
      }
    });
  }

  // Password form validation
  const passwordForm = document.getElementById('passwordForm');
  const newPasswordInput = document.getElementById('newPassword');
  const confirmPasswordInput = document.getElementById('confirmPassword');

  if (passwordForm && newPasswordInput && confirmPasswordInput) {
    passwordForm.addEventListener('submit', function(e) {
      e.preventDefault();

      // Check if passwords match
      if (newPasswordInput.value !== confirmPasswordInput.value) {
        alert('Passwords do not match. Please try again.');
        return;
      }

      // Check password requirements
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&\s])[A-Za-z\d@$!%*?&\s]{8,}$/;
      if (!passwordRegex.test(newPasswordInput.value)) {
        alert('Password does not meet all requirements. Please check and try again.');
        return;
      }

      alert('Password updated successfully!');
    });
  }

  // 2FA button functionality
  const enable2FABtn = document.querySelector('.btn-2fa');

  if (enable2FABtn) {
    enable2FABtn.addEventListener('click', function() {
      const twoFASection = this.closest('.security-section');
      const statusText = twoFASection.querySelector('p.text-muted.small.mt-3');

      if (this.textContent.includes('Enable')) {
        this.innerHTML = '<i class="bi bi-shield-lock-fill me-2"></i>Disable Two-Factor Authentication';
        this.classList.remove('btn-primary');
        this.classList.add('btn-danger');

        if (statusText) {
          statusText.textContent = 'Two-factor authentication is enabled.';
        }
      } else {
        this.innerHTML = '<i class="bi bi-shield-lock me-2"></i>Enable Two-Factor Authentication';
        this.classList.remove('btn-danger');
        this.classList.add('btn-primary');

        if (statusText) {
          statusText.textContent = 'Two-factor authentication is not enabled.';
        }
      }
    });
  }
}

/**
 * Initialize Users & Teams page functionality
 */
function initializeUsersTeamsPage() {
  // Check if we're on the users-teams page
  if (!document.querySelector('.users-teams-section')) {
    return;
  }

  // Select All users checkbox functionality
  const selectAllUsersCheckbox = document.getElementById('selectAllUsers');
  const userCheckboxes = document.querySelectorAll('tbody .form-check-input');

  if (selectAllUsersCheckbox) {
    selectAllUsersCheckbox.addEventListener('change', function() {
      const isChecked = this.checked;
      userCheckboxes.forEach(checkbox => {
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

  // Individual user checkbox functionality
  userCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', function() {
      const allChecked = Array.from(userCheckboxes).every(cb => cb.checked);
      const anyChecked = Array.from(userCheckboxes).some(cb => cb.checked);

      if (selectAllUsersCheckbox) {
        selectAllUsersCheckbox.checked = allChecked;
        selectAllUsersCheckbox.indeterminate = anyChecked && !allChecked;
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

  // Search functionality
  const searchInput = document.querySelector('.search-input');
  const tableRows = document.querySelectorAll('tbody tr');

  if (searchInput) {
    searchInput.addEventListener('input', function() {
      const searchTerm = this.value.toLowerCase().trim();

      tableRows.forEach(row => {
        const userName = row.querySelector('td:nth-child(2)').textContent.toLowerCase();
        const userEmail = row.querySelector('td:nth-child(2) small').textContent.toLowerCase();
        const userAccess = row.querySelector('td:nth-child(3)').textContent.toLowerCase();

        if (searchTerm === '' ||
            userName.includes(searchTerm) ||
            userEmail.includes(searchTerm) ||
            userAccess.includes(searchTerm)) {
          row.style.display = '';
        } else {
          row.style.display = 'none';
        }
      });
    });
  }

  // Grant Access button functionality
  const grantAccessBtn = document.querySelector('.grant-access-btn');

  if (grantAccessBtn) {
    grantAccessBtn.addEventListener('click', function() {
      // In a real implementation, this would open a modal
      alert('Grant access functionality would open a modal here.');
    });
  }

  // Filter buttons functionality
  const filterButtons = document.querySelectorAll('.table-filters .dropdown-item');

  filterButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();

      const dropdownButton = this.closest('.dropdown').querySelector('button');
      const filterValue = this.textContent.trim();

      if (dropdownButton) {
        dropdownButton.textContent = filterValue;

        // Add chevron icon back
        const icon = document.createElement('i');
        icon.className = 'bi bi-chevron-down ms-2';
        dropdownButton.appendChild(icon);
      }

      // Apply filtering logic based on the selected filter
      // This is just a basic example - real implementation would be more complex
      if (filterValue.includes('All')) {
        tableRows.forEach(row => {
          row.style.display = '';
        });
      } else if (filterValue.includes('Active')) {
        tableRows.forEach(row => {
          const status = row.querySelector('td:nth-child(6) span').textContent;
          if (status.includes('Active')) {
            row.style.display = '';
          } else {
            row.style.display = 'none';
          }
        });
      } else if (filterValue.includes('Inactive')) {
        tableRows.forEach(row => {
          const status = row.querySelector('td:nth-child(6) span').textContent;
          if (status.includes('Inactive')) {
            row.style.display = '';
          } else {
            row.style.display = 'none';
          }
        });
      }
    });
  });

  // Actions dropdown functionality
  const actionButtons = document.querySelectorAll('.dropdown .dropdown-item');

  actionButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();

      const action = this.textContent.trim();
      const row = this.closest('tr');
      const userName = row.querySelector('td:nth-child(2) .fw-medium').textContent;

      if (action.includes('Edit')) {
        alert(`Edit user: ${userName}`);
      } else if (action.includes('Delete')) {
        if (confirm(`Are you sure you want to delete user: ${userName}?`)) {
          // In a real implementation, this would send an API request to delete the user
          row.remove();
        }
      } else if (action.includes('Change Access')) {
        alert(`Change access for user: ${userName}`);
      }
    });
  });
}

/**
 * Initialize Notifications page functionality
 */
function initializeNotificationsPage() {
  // Check if we're on the notifications page
  if (!document.querySelector('.notifications-section')) {
    return;
  }

  // Toggle switches functionality
  const toggleSwitches = document.querySelectorAll('.form-switch .form-check-input');

  toggleSwitches.forEach(toggle => {
    toggle.addEventListener('change', function() {
      const notificationName = this.closest('.notification-option').querySelector('.fw-medium').textContent;

      if (this.checked) {
        console.log(`Notification enabled: ${notificationName}`);
      } else {
        console.log(`Notification disabled: ${notificationName}`);
      }
    });
  });

  // Radio button groups functionality
  const radioGroups = document.querySelectorAll('.notification-category');

  radioGroups.forEach(group => {
    const radios = group.querySelectorAll('input[type="radio"]');

    radios.forEach(radio => {
      radio.addEventListener('change', function() {
        if (this.checked) {
          const categoryName = this.closest('.notification-category').querySelector('h5').textContent;
          const optionName = this.closest('.notification-option').querySelector('.fw-medium').textContent;

          console.log(`${categoryName}: Selected option - ${optionName}`);
        }
      });
    });
  });
}

/**
 * Initialize Audit Log page functionality
 */
function initializeAuditLogPage() {
  // Check if we're on the audit log page
  if (!document.querySelector('.audit-log-section')) {
    return;
  }

  // Select All logs checkbox functionality
  const selectAllLogsCheckbox = document.getElementById('selectAllLogs');
  const logCheckboxes = document.querySelectorAll('tbody .form-check-input');

  if (selectAllLogsCheckbox) {
    selectAllLogsCheckbox.addEventListener('change', function() {
      const isChecked = this.checked;
      logCheckboxes.forEach(checkbox => {
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

  // Individual log checkbox functionality
  logCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', function() {
      const allChecked = Array.from(logCheckboxes).every(cb => cb.checked);
      const anyChecked = Array.from(logCheckboxes).some(cb => cb.checked);

      if (selectAllLogsCheckbox) {
        selectAllLogsCheckbox.checked = allChecked;
        selectAllLogsCheckbox.indeterminate = anyChecked && !allChecked;
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

  // Tab functionality
  const tabButtons = document.querySelectorAll('#auditTabs .nav-link');

  tabButtons.forEach(button => {
    button.addEventListener('click', function() {
      // Update active class
      tabButtons.forEach(btn => btn.classList.remove('active'));
      this.classList.add('active');

      // Show corresponding content
      const tabId = this.getAttribute('data-bs-target').slice(1);
      const tabContents = document.querySelectorAll('.tab-pane');

      tabContents.forEach(content => {
        if (content.id === tabId) {
          content.classList.add('show', 'active');
        } else {
          content.classList.remove('show', 'active');
        }
      });
    });
  });

  // Search functionality
  const searchInput = document.querySelector('.search-input');
  const tableRows = document.querySelectorAll('#all-logs tbody tr');

  if (searchInput) {
    searchInput.addEventListener('input', function() {
      const searchTerm = this.value.toLowerCase().trim();

      tableRows.forEach(row => {
        const category = row.querySelector('td:nth-child(2)').textContent.toLowerCase();
        const subCategory = row.querySelector('td:nth-child(3)').textContent.toLowerCase();
        const action = row.querySelector('td:nth-child(4)').textContent.toLowerCase();
        const modifiedBy = row.querySelector('td:nth-child(5)').textContent.toLowerCase();

        if (searchTerm === '' ||
            category.includes(searchTerm) ||
            subCategory.includes(searchTerm) ||
            action.includes(searchTerm) ||
            modifiedBy.includes(searchTerm)) {
          row.style.display = '';
        } else {
          row.style.display = 'none';
        }
      });
    });
  }

  // Export button functionality
  const exportBtn = document.querySelector('.export-btn');

  if (exportBtn) {
    exportBtn.addEventListener('click', function() {
      alert('Export functionality would generate a CSV/PDF file here.');
    });
  }

  // Filter dropdown functionality
  const filterDropdowns = document.querySelectorAll('.table-filters .dropdown');

  filterDropdowns.forEach(dropdown => {
    const dropdownItems = dropdown.querySelectorAll('.dropdown-item');
    const dropdownButton = dropdown.querySelector('button');

    dropdownItems.forEach(item => {
      item.addEventListener('click', function(e) {
        e.preventDefault();

        const filterValue = this.textContent.trim();

        if (dropdownButton) {
          dropdownButton.textContent = filterValue;

          // Add chevron icon back
          const icon = document.createElement('i');
          icon.className = 'bi bi-chevron-down ms-2';
          dropdownButton.appendChild(icon);
        }
      });
    });
  });
}

/**
 * Initialize Works Schedule page functionality
 */
function initializeWorkSchedulePage() {
  // Check if we're on the works schedule page
  if (!document.querySelector('.works-schedule-section')) {
    return;
  }

  // Calendar day selection
  const calendarDays = document.querySelectorAll('.calendar-day');

  calendarDays.forEach(day => {
    day.addEventListener('click', function() {
      // Remove active class from all days
      calendarDays.forEach(d => d.classList.remove('active'));

      // Add active class to clicked day
      this.classList.add('active');
    });
  });

  // Works Schedule checkboxes
  const dayCheckboxes = document.querySelectorAll('.schedule-row .form-check-input');

  dayCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', function() {
      const timeSelectors = this.closest('.schedule-row').querySelectorAll('select');
      const timeDisplay = this.closest('.schedule-row').querySelector('.text-muted');

      if (this.checked) {
        // Enable time selectors
        timeSelectors.forEach(selector => {
          selector.disabled = false;
        });

        // Update time display
        if (timeDisplay) {
          timeDisplay.textContent = '9 hrs';
        }
      } else {
        // Disable time selectors
        timeSelectors.forEach(selector => {
          selector.disabled = true;
        });

        // Update time display
        if (timeDisplay) {
          timeDisplay.textContent = '--';
        }
      }
    });
  });

  // Time selectors for calculating hours
  const timeSelectors = document.querySelectorAll('.time-selectors select');

  timeSelectors.forEach(selector => {
    selector.addEventListener('change', function() {
      const row = this.closest('.schedule-row');
      const allSelectors = row.querySelectorAll('select');
      const timeDisplay = row.querySelector('.text-muted');

      // Get start and end times
      const startHour = parseInt(allSelectors[0].value.split(':')[0], 10);
      const startPeriod = allSelectors[1].value;
      const endHour = parseInt(allSelectors[2].value.split(':')[0], 10);
      const endPeriod = allSelectors[3].value;

      // Calculate hours (simplified calculation)
      let hours = endHour - startHour;

      if (startPeriod === 'AM' && endPeriod === 'PM') {
        // Add 12 hours for AM to PM
        hours += 12;
      } else if (startPeriod === 'PM' && endPeriod === 'AM') {
        // Add 12 hours for overnight (PM to AM)
        hours += 24;
      }

      // Update time display
      if (timeDisplay) {
        timeDisplay.textContent = `${hours} hrs`;
      }
    });
  });

  // Selected employs badges
  const employBadges = document.querySelectorAll('.selected-employs .badge i');

  employBadges.forEach(badge => {
    badge.addEventListener('click', function() {
      // Remove the badge
      this.closest('.badge').remove();
    });
  });

  // Send Alerts button
  const sendAlertsBtn = document.querySelector('.send-alerts-btn');

  if (sendAlertsBtn) {
    sendAlertsBtn.addEventListener('click', function() {
      alert('Schedule alerts have been sent to the selected employees.');
    });
  }
}
