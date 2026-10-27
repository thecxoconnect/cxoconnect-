/**
 * The CXO Network - Client Web Application & Member Portal
 */

const state = {
  token: localStorage.getItem('cxo_session_token') || '',
  user: JSON.parse(localStorage.getItem('cxo_user') || 'null'),
  currentView: 'home',
  adminTab: 'applications',
  adminStatusFilter: '',
  adminSearchQuery: '',
  cachedUsers: [],
  selectedUser: null
};

// Toast notification helper
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span>${type === 'success' ? '✓' : type === 'error' ? '⚠' : 'ℹ'}</span>
    <div style="flex:1;">${message}</div>
  `;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 250);
  }, 4500);
}

// Router and view switcher
function navigate(route, params = {}) {
  const cleanRoute = route.replace('#', '').split('?')[0] || 'home';
  state.currentView = cleanRoute;

  // Hide all screens
  const screens = document.querySelectorAll('.page-view');
  screens.forEach((el) => (el.style.display = 'none'));

  // Update nav active states
  const navLinks = document.querySelectorAll('.nav-item a');
  navLinks.forEach((a) => {
    const href = a.getAttribute('href');
    if (href === `#${cleanRoute}` || (cleanRoute === 'home' && href === '#home')) {
      a.classList.add('active');
    } else {
      a.classList.remove('active');
    }
  });

  // Target screen
  const targetScreen = document.getElementById(`view-${cleanRoute}`);
  if (targetScreen) {
    targetScreen.style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else {
    // Default fallback to home
    document.getElementById('view-home').style.display = 'block';
  }

  // Handle route specifics
  if (cleanRoute === 'dashboard') {
    if (!state.token || !state.user) {
      showToast('Please log in to access your Member Dashboard.', 'info');
      navigate('login');
      return;
    }
    renderMemberDashboard();
  }

  if (cleanRoute === 'admin') {
    if (!state.token || !state.user) {
      showToast('Administrator authentication required.', 'error');
      navigate('login');
      return;
    }
    if (state.user.role !== 'admin') {
      showToast('Access denied: Authorised administrators only.', 'error');
      navigate('dashboard');
      return;
    }
    loadAdminMetrics();
    loadAdminTable();
  }

  // Parse URL query parameters if route was triggered by URL hash
  handleRouteParams();
}

function handleRouteParams() {
  const hash = window.location.hash;
  if (!hash.includes('?')) return;

  const queryString = hash.split('?')[1];
  const urlParams = new URLSearchParams(queryString);

  // Activation token
  const actToken = urlParams.get('token');
  if (hash.startsWith('#activate') && actToken) {
    openModal('modal-activate');
    const tokenInput = document.getElementById('activate-token-input');
    if (tokenInput) tokenInput.value = actToken;
  }

  // Reset password token
  if (hash.startsWith('#reset-password') && actToken) {
    openModal('modal-reset-password');
    const resetInput = document.getElementById('reset-token-input');
    if (resetInput) resetInput.value = actToken;
  }
}

// Modal System
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
  }
}

// Global modal close on click outside
window.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('active');
    document.body.style.overflow = 'auto';
  }
});

/**
 * 1. Member Login Submission (Screen 2)
 */
async function handleMemberLogin(e) {
  e.preventDefault();
  const emailInput = document.getElementById('login-email');
  const passwordInput = document.getElementById('login-password');
  const submitBtn = document.getElementById('btn-submit-login');
  const noticeBox = document.getElementById('login-notice-box');

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (!email || !password) {
    showToast('Please enter both your email address and password.', 'error');
    return;
  }

  // Loading state
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<span>Verifying credentials...</span>';
  noticeBox.style.display = 'none';

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<span>Log In</span> &rarr;';

    if (data.success) {
      state.token = data.token;
      state.user = data.user;
      localStorage.setItem('cxo_session_token', data.token);
      localStorage.setItem('cxo_user', JSON.stringify(data.user));

      showToast(data.message || 'Login successful', 'success');
      updateNavAuthUI();

      if (data.user.role === 'admin') {
        navigate('admin');
      } else {
        navigate('dashboard');
      }
    } else {
      // Display essential message states
      noticeBox.style.display = 'flex';
      noticeBox.className = 'notice-box ' + (data.status === 'pending' ? 'notice-box-warning' : 'notice-box-error');
      noticeBox.innerHTML = `<span>⚠</span> <div>${data.message}</div>`;
      showToast(data.message, 'error');
    }
  } catch (err) {
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<span>Log In</span> &rarr;';
    noticeBox.style.display = 'flex';
    noticeBox.className = 'notice-box notice-box-error';
    noticeBox.innerHTML = `<span>⚠</span> <div>Network communication error. Please try again.</div>`;
    showToast(`Error: ${err.message}`, 'error');
  }
}

/**
 * 2. Apply for Membership Submission (Screen 3)
 */
async function handleApplyMembership(e) {
  e.preventDefault();
  const form = document.getElementById('form-apply-membership');
  const submitBtn = document.getElementById('btn-submit-apply');
  const formContainer = document.getElementById('apply-form-container');
  const confirmationCard = document.getElementById('apply-confirmation-card');

  const name = document.getElementById('apply-name').value.trim();
  const email = document.getElementById('apply-email').value.trim();
  const designation = document.getElementById('apply-designation').value.trim();
  const company = document.getElementById('apply-company').value.trim();
  const linkedin = document.getElementById('apply-linkedin').value.trim();
  const termsCheckbox = document.getElementById('apply-terms');

  if (!termsCheckbox.checked) {
    showToast('Please accept the Privacy Policy and Terms of Membership.', 'error');
    return;
  }

  // Gather selected areas of interest
  const interestCheckboxes = document.querySelectorAll('input[name="interests"]:checked');
  const areasOfInterest = Array.from(interestCheckboxes).map((cb) => cb.value);

  submitBtn.disabled = true;
  submitBtn.innerHTML = '<span>Submitting application...</span>';

  try {
    const res = await fetch('/api/auth/apply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        email,
        designation,
        company,
        linkedin,
        areasOfInterest,
        termsAccepted: true
      })
    });

    const data = await res.json();
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<span>Submit Application</span> &rarr;';

    if (data.success) {
      // Show confirmation state
      formContainer.style.display = 'none';
      confirmationCard.style.display = 'block';
      showToast('Application received! Acknowledgement email sent.', 'success');
    } else {
      showToast(data.message || 'Application submission failed', 'error');
    }
  } catch (err) {
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<span>Submit Application</span> &rarr;';
    showToast(`Error: ${err.message}`, 'error');
  }
}

/**
 * 3. Render Member Dashboard (Screen 4)
 */
function renderMemberDashboard() {
  const u = state.user;
  if (!u) return;

  // Greeting
  const firstName = u.name ? u.name.split(' ')[0] : 'Leader';
  const welcomeGreeting = document.getElementById('dashboard-greeting');
  if (welcomeGreeting) welcomeGreeting.textContent = `Welcome, ${firstName}`;

  // Profile Details
  const profileName = document.getElementById('dash-profile-name');
  if (profileName) profileName.textContent = u.name || 'Executive Member';

  const profileDesignation = document.getElementById('dash-profile-designation');
  if (profileDesignation) profileDesignation.textContent = u.designation || u.position || 'Senior Decision Maker';

  const profileCompany = document.getElementById('dash-profile-company');
  if (profileCompany) profileCompany.textContent = u.company || 'Enterprise Leader';

  const profileEmail = document.getElementById('dash-profile-email');
  if (profileEmail) profileEmail.textContent = u.email;

  const profilePhone = document.getElementById('dash-profile-phone');
  if (profilePhone) profilePhone.textContent = u.phone || 'Not specified';

  const profileCity = document.getElementById('dash-profile-city');
  if (profileCity) profileCity.textContent = u.city ? `${u.city} ${u.pincode ? `(${u.pincode})` : ''}` : 'Mumbai';

  // Membership status badge
  const statusBadge = document.getElementById('dash-membership-status');
  if (statusBadge) {
    statusBadge.className = 'badge badge-approved';
    statusBadge.textContent = 'Active Member';
  }

  // Pre-fill Edit Profile modal
  prefillEditProfileModal(u);
}

function prefillEditProfileModal(u) {
  if (document.getElementById('edit-name')) document.getElementById('edit-name').value = u.name || '';
  if (document.getElementById('edit-designation')) document.getElementById('edit-designation').value = u.designation || u.position || '';
  if (document.getElementById('edit-company')) document.getElementById('edit-company').value = u.company || '';
  if (document.getElementById('edit-phone')) document.getElementById('edit-phone').value = u.phone || '';
  if (document.getElementById('edit-city')) document.getElementById('edit-city').value = u.city || '';
  if (document.getElementById('edit-linkedin')) document.getElementById('edit-linkedin').value = u.linkedin || '';
}

/**
 * 4. Admin Console Functions (Screen 5)
 */
async function loadAdminMetrics() {
  try {
    const res = await fetch('/api/users/overview', {
      headers: { Authorization: `Bearer ${state.token}` }
    });
    const data = await res.json();
    if (data.success && data.summary) {
      document.getElementById('metric-total').textContent = data.summary.total || 0;
      document.getElementById('metric-pending').textContent = data.summary.pending || 0;
      document.getElementById('metric-approved').textContent = data.summary.approved || 0;
      document.getElementById('metric-declined').textContent = (data.summary.declined || 0) + (data.summary.inactive || 0);
    }
  } catch (err) {
    console.error('Error fetching admin metrics', err);
  }
}

async function loadAdminTable() {
  const tbody = document.getElementById('admin-records-tbody');
  if (!tbody) return;

  tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 24px;">Loading records...</td></tr>`;

  try {
    let url = `/api/users?tab=${state.adminTab}`;
    if (state.adminStatusFilter) url += `&status=${state.adminStatusFilter}`;
    if (state.adminSearchQuery) url += `&search=${encodeURIComponent(state.adminSearchQuery)}`;

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${state.token}` }
    });
    const data = await res.json();

    if (data.success && data.users) {
      state.cachedUsers = data.users;
      if (data.users.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 30px; color: var(--text-dim);">No matching records found.</td></tr>`;
        return;
      }

      tbody.innerHTML = data.users
        .map((u) => {
          const statusBadge =
            u.status === 'approved' || u.status === 'accepted'
              ? '<span class="badge badge-approved">Approved</span>'
              : u.status === 'pending'
              ? '<span class="badge badge-pending">Pending</span>'
              : u.status === 'inactive'
              ? '<span class="badge badge-inactive">Inactive</span>'
              : '<span class="badge badge-declined">Declined</span>';

          const isPending = u.status === 'pending';
          const isActive = u.status === 'approved' || u.status === 'accepted';

          return `
          <tr>
            <td>
              <strong style="color: #ffffff;">${u.name || 'Unnamed'}</strong><br>
              <span style="font-size: 11px; color: var(--text-dim);">${u.role === 'admin' ? '★ Admin' : 'Member'}</span>
            </td>
            <td>${u.company || '-'}</td>
            <td>${u.designation || u.position || '-'}</td>
            <td><a href="mailto:${u.email}" style="color: #94a3b8; text-decoration: none;">${u.email}</a></td>
            <td>${statusBadge}</td>
            <td>
              <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                <button class="btn btn-secondary btn-sm" onclick="viewApplicationModal('${u._id}')">View</button>
                ${
                  isPending
                    ? `<button class="btn btn-success btn-sm" onclick="adminApproveUser('${u._id}')">Approve</button>
                       <button class="btn btn-danger btn-sm" onclick="adminDeclineUser('${u._id}')">Decline</button>`
                    : ''
                }
                ${
                  isActive
                    ? `<button class="btn btn-secondary btn-sm" onclick="adminResendInvite('${u._id}')">Resend Invite</button>
                       <button class="btn btn-danger btn-sm" onclick="adminDeactivateUser('${u._id}')">Deactivate</button>`
                    : ''
                }
                <button class="btn btn-secondary btn-sm" onclick="adminEditUserModal('${u._id}')">Edit</button>
              </div>
            </td>
          </tr>
        `;
        })
        .join('');
    } else {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--danger); padding: 20px;">${data.message || 'Error loading records.'}</td></tr>`;
    }
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--danger); padding: 20px;">Network error: ${err.message}</td></tr>`;
  }
}

// Admin Action: Approve
async function adminApproveUser(id) {
  if (!confirm('Approve this membership application and dispatch account setup invitation?')) return;
  try {
    const res = await fetch(`/api/users/${id}/approve`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${state.token}` }
    });
    const data = await res.json();
    if (data.success) {
      showToast(data.message, 'success');
      loadAdminMetrics();
      loadAdminTable();
    } else {
      showToast(data.message || 'Approval failed', 'error');
    }
  } catch (err) {
    showToast(`Error: ${err.message}`, 'error');
  }
}

// Admin Action: Decline
async function adminDeclineUser(id) {
  if (!confirm('Decline this application?')) return;
  try {
    const res = await fetch(`/api/users/${id}/decline`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${state.token}` }
    });
    const data = await res.json();
    if (data.success) {
      showToast(data.message, 'info');
      loadAdminMetrics();
      loadAdminTable();
    } else {
      showToast(data.message || 'Action failed', 'error');
    }
  } catch (err) {
    showToast(`Error: ${err.message}`, 'error');
  }
}

// Admin Action: Deactivate
async function adminDeactivateUser(id) {
  if (!confirm('Deactivate access for this member?')) return;
  try {
    const res = await fetch(`/api/users/${id}/deactivate`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${state.token}` }
    });
    const data = await res.json();
    if (data.success) {
      showToast(data.message, 'info');
      loadAdminMetrics();
      loadAdminTable();
    } else {
      showToast(data.message || 'Deactivation failed', 'error');
    }
  } catch (err) {
    showToast(`Error: ${err.message}`, 'error');
  }
}

// Admin Action: Resend Invite
async function adminResendInvite(id) {
  try {
    const res = await fetch(`/api/users/${id}/resend-invite`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${state.token}` }
    });
    const data = await res.json();
    if (data.success) {
      showToast(data.message, 'success');
    } else {
      showToast(data.message || 'Failed to resend invite', 'error');
    }
  } catch (err) {
    showToast(`Error: ${err.message}`, 'error');
  }
}

// Admin: View Application Modal
function viewApplicationModal(id) {
  const user = state.cachedUsers.find((u) => u._id === id);
  if (!user) return;

  const content = document.getElementById('view-applicant-content');
  if (!content) return;

  const interestsList =
    user.areasOfInterest && user.areasOfInterest.length > 0
      ? user.areasOfInterest.map((i) => `<span class="eng-pill" style="font-size: 12px;">${i}</span>`).join(' ')
      : '<span style="color: var(--text-dim);">None specified</span>';

  content.innerHTML = `
    <div style="margin-bottom: 20px;">
      <h3 style="color: #ffffff; font-size: 20px; margin-bottom: 4px;">${user.name || 'Unnamed Applicant'}</h3>
      <div style="color: var(--accent-gold); font-size: 14px;">${user.designation || user.position || 'C-Suite Executive'} @ ${user.company || 'Enterprise'}</div>
    </div>
    
    <div class="profile-meta-list">
      <div class="profile-meta-item">
        <span class="profile-meta-label">Work Email:</span>
        <span class="profile-meta-value">${user.email}</span>
      </div>
      <div class="profile-meta-item">
        <span class="profile-meta-label">LinkedIn:</span>
        <span class="profile-meta-value">${user.linkedin ? `<a href="${user.linkedin}" target="_blank" style="color: #a5b4fc;">Profile Link &nearr;</a>` : 'Not provided'}</span>
      </div>
      <div class="profile-meta-item">
        <span class="profile-meta-label">Current Status:</span>
        <span class="profile-meta-value">${user.status}</span>
      </div>
      <div class="profile-meta-item">
        <span class="profile-meta-label">Applied Date:</span>
        <span class="profile-meta-value">${new Date(user.createdAt).toLocaleDateString()}</span>
      </div>
    </div>

    <div style="margin: 20px 0;">
      <div style="font-size: 13px; font-weight: 600; color: #cbd5e1; margin-bottom: 8px;">Areas of Interest:</div>
      <div style="display: flex; gap: 8px; flex-wrap: wrap;">${interestsList}</div>
    </div>
  `;

  openModal('modal-view-applicant');
}

// Admin: Edit User Modal
function adminEditUserModal(id) {
  const user = state.cachedUsers.find((u) => u._id === id);
  if (!user) return;
  state.selectedUser = user;

  document.getElementById('admin-edit-id').value = user._id;
  document.getElementById('admin-edit-name').value = user.name || '';
  document.getElementById('admin-edit-designation').value = user.designation || user.position || '';
  document.getElementById('admin-edit-company').value = user.company || '';
  document.getElementById('admin-edit-phone').value = user.phone || '';
  document.getElementById('admin-edit-status').value = user.status;

  openModal('modal-admin-edit-user');
}

/**
 * 5. Account Activation Form (Supporting Screen)
 */
async function handleAccountActivation(e) {
  e.preventDefault();
  const token = document.getElementById('activate-token-input').value.trim();
  const password = document.getElementById('activate-password-input').value;
  const confirmPassword = document.getElementById('activate-confirm-password-input').value;

  if (password !== confirmPassword) {
    showToast('Passwords do not match.', 'error');
    return;
  }

  if (password.length < 8) {
    showToast('Password must be at least 8 characters long.', 'error');
    return;
  }

  try {
    const res = await fetch('/api/auth/activate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password })
    });
    const data = await res.json();
    if (data.success) {
      state.token = data.token;
      state.user = data.user;
      localStorage.setItem('cxo_session_token', data.token);
      localStorage.setItem('cxo_user', JSON.stringify(data.user));

      closeModal('modal-activate');
      showToast(data.message, 'success');
      updateNavAuthUI();
      navigate('dashboard');
    } else {
      showToast(data.message || 'Activation failed', 'error');
    }
  } catch (err) {
    showToast(`Error: ${err.message}`, 'error');
  }
}

/**
 * 6. Password Recovery Form (Supporting Screen)
 */
async function handleForgotPassword(e) {
  e.preventDefault();
  const email = document.getElementById('forgot-email-input').value.trim();

  try {
    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const data = await res.json();
    closeModal('modal-forgot-password');
    showToast(data.message || 'Password reset instructions dispatched.', 'info');
  } catch (err) {
    showToast(`Error: ${err.message}`, 'error');
  }
}

/**
 * 7. Reset Password Form (Supporting Screen)
 */
async function handleResetPassword(e) {
  e.preventDefault();
  const token = document.getElementById('reset-token-input').value.trim();
  const password = document.getElementById('reset-new-password-input').value;

  try {
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password })
    });
    const data = await res.json();
    if (data.success) {
      closeModal('modal-reset-password');
      showToast(data.message, 'success');
      navigate('login');
    } else {
      showToast(data.message || 'Reset failed', 'error');
    }
  } catch (err) {
    showToast(`Error: ${err.message}`, 'error');
  }
}

/**
 * 8. Load Standee QR Code for Live Mobile Test
 */
async function loadStandeeQr() {
  try {
    const res = await fetch('/api/qr');
    const data = await res.json();
    if (data.success && data.qrDataUrl) {
      const heroQrImg = document.getElementById('hero-standee-qr');
      if (heroQrImg) heroQrImg.src = data.qrDataUrl;

      const modalQrImg = document.getElementById('modal-standee-qr-img');
      if (modalQrImg) modalQrImg.src = data.qrDataUrl;

      const targetUrlSpan = document.getElementById('standee-target-url');
      if (targetUrlSpan) targetUrlSpan.textContent = data.targetUrl;
    }
  } catch (err) {
    console.error('Failed loading standee QR code', err);
  }
}

/**
 * 9. Update Navigation UI State
 */
function updateNavAuthUI() {
  const loginNavItem = document.getElementById('nav-item-login');
  if (!loginNavItem) return;

  if (state.token && state.user) {
    const name = state.user.name ? state.user.name.split(' ')[0] : 'Dashboard';
    const isAdm = state.user.role === 'admin';
    loginNavItem.innerHTML = `
      <div style="display: flex; gap: 8px;">
        <a href="#dashboard" class="nav-link btn-nav-login" onclick="navigate('dashboard'); return false;">
          <span>👤 ${name}</span>
        </a>
        ${
          isAdm
            ? `<a href="#admin" class="nav-link" style="color:#fbbf24;" onclick="navigate('admin'); return false;">🛡 Admin</a>`
            : ''
        }
        <button class="btn btn-secondary btn-sm" onclick="logout()" style="padding: 6px 10px;">Logout</button>
      </div>
    `;
  } else {
    loginNavItem.innerHTML = `
      <a href="#login" class="nav-link btn-nav-login" onclick="navigate('login'); return false;">Member Login</a>
    `;
  }
}

/**
 * 10. Logout
 */
function logout() {
  state.token = '';
  state.user = null;
  localStorage.removeItem('cxo_session_token');
  localStorage.removeItem('cxo_user');
  updateNavAuthUI();
  showToast('You have been logged out.', 'info');
  navigate('home');
}

/**
 * Quick Test Login Chips for Leadership Review
 */
function quickFillAdmin() {
  document.getElementById('login-email').value = 'admin@myhrsg.org';
  document.getElementById('login-password').value = 'AdminPass2026!';
  showToast('Loaded Administrator Credentials: admin@myhrsg.org', 'info');
}

function quickFillMember() {
  document.getElementById('login-email').value = 'rajesh.mehta@tata.com';
  document.getElementById('login-password').value = 'MemberPass2026!';
  showToast('Loaded Member Credentials: rajesh.mehta@tata.com', 'info');
}

function quickFillPending() {
  document.getElementById('login-email').value = 'vikram.aditya@reliance.com';
  document.getElementById('login-password').value = 'AnyPassword123!';
  showToast('Loaded Pending Applicant: vikram.aditya@reliance.com (Testing 403 review message)', 'info');
}

// Global expose
window.navigate = navigate;
window.openModal = openModal;
window.closeModal = closeModal;
window.logout = logout;
window.quickFillAdmin = quickFillAdmin;
window.quickFillMember = quickFillMember;
window.quickFillPending = quickFillPending;
window.viewApplicationModal = viewApplicationModal;
window.adminApproveUser = adminApproveUser;
window.adminDeclineUser = adminDeclineUser;
window.adminDeactivateUser = adminDeactivateUser;
window.adminResendInvite = adminResendInvite;
window.adminEditUserModal = adminEditUserModal;

// Initialize on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  updateNavAuthUI();
  loadStandeeQr();

  // Listen to hash changes
  window.addEventListener('hashchange', () => {
    navigate(window.location.hash || 'home');
  });

  // Mobile hamburger
  const hamburger = document.getElementById('mobile-hamburger');
  const navMenu = document.getElementById('nav-menu');
  if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => navMenu.classList.toggle('open'));
  }

  // Password visibility toggle
  const toggleBtn = document.getElementById('btn-toggle-password');
  const passwordInput = document.getElementById('login-password');
  if (toggleBtn && passwordInput) {
    toggleBtn.addEventListener('click', () => {
      const isPass = passwordInput.type === 'password';
      passwordInput.type = isPass ? 'text' : 'password';
      toggleBtn.textContent = isPass ? 'Hide' : 'Show';
    });
  }

  // Form Handlers
  const loginForm = document.getElementById('form-member-login');
  if (loginForm) loginForm.addEventListener('submit', handleMemberLogin);

  const applyForm = document.getElementById('form-apply-membership');
  if (applyForm) applyForm.addEventListener('submit', handleApplyMembership);

  const activateForm = document.getElementById('form-activate-account');
  if (activateForm) activateForm.addEventListener('submit', handleAccountActivation);

  const forgotForm = document.getElementById('form-forgot-password');
  if (forgotForm) forgotForm.addEventListener('submit', handleForgotPassword);

  const resetForm = document.getElementById('form-reset-password');
  if (resetForm) resetForm.addEventListener('submit', handleResetPassword);

  // Admin Toolbar filters
  const tabApplications = document.getElementById('tab-btn-applications');
  const tabMembers = document.getElementById('tab-btn-members');

  if (tabApplications && tabMembers) {
    tabApplications.addEventListener('click', () => {
      tabApplications.classList.add('active');
      tabMembers.classList.remove('active');
      state.adminTab = 'applications';
      loadAdminTable();
    });

    tabMembers.addEventListener('click', () => {
      tabMembers.classList.add('active');
      tabApplications.classList.remove('active');
      state.adminTab = 'members';
      loadAdminTable();
    });
  }

  const searchInput = document.getElementById('admin-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      state.adminSearchQuery = e.target.value.trim();
      loadAdminTable();
    });
  }

  const statusSelect = document.getElementById('admin-status-filter');
  if (statusSelect) {
    statusSelect.addEventListener('change', (e) => {
      state.adminStatusFilter = e.target.value;
      loadAdminTable();
    });
  }

  // Admin Add Member Form
  const addMemberForm = document.getElementById('form-admin-add-member');
  if (addMemberForm) {
    addMemberForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('admin-add-name').value.trim();
      const email = document.getElementById('admin-add-email').value.trim();
      const designation = document.getElementById('admin-add-designation').value.trim();
      const company = document.getElementById('admin-add-company').value.trim();
      const phone = document.getElementById('admin-add-phone').value.trim();
      const role = document.getElementById('admin-add-role').value;

      try {
        const res = await fetch('/api/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${state.token}`
          },
          body: JSON.stringify({ name, email, designation, company, phone, role })
        });
        const data = await res.json();
        if (data.success) {
          closeModal('modal-admin-add-member');
          showToast(data.message, 'success');
          loadAdminMetrics();
          loadAdminTable();
        } else {
          showToast(data.message || 'Failed to add member', 'error');
        }
      } catch (err) {
        showToast(`Error: ${err.message}`, 'error');
      }
    });
  }

  // Admin Edit Member Form
  const editMemberForm = document.getElementById('form-admin-edit-user');
  if (editMemberForm) {
    editMemberForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = document.getElementById('admin-edit-id').value;
      const name = document.getElementById('admin-edit-name').value.trim();
      const designation = document.getElementById('admin-edit-designation').value.trim();
      const company = document.getElementById('admin-edit-company').value.trim();
      const phone = document.getElementById('admin-edit-phone').value.trim();
      const status = document.getElementById('admin-edit-status').value;

      try {
        const res = await fetch(`/api/users/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${state.token}`
          },
          body: JSON.stringify({ name, designation, company, phone, status })
        });
        const data = await res.json();
        if (data.success) {
          closeModal('modal-admin-edit-user');
          showToast(data.message, 'success');
          loadAdminMetrics();
          loadAdminTable();
        } else {
          showToast(data.message || 'Update failed', 'error');
        }
      } catch (err) {
        showToast(`Error: ${err.message}`, 'error');
      }
    });
  }

  // Edit Profile Form in Dashboard
  const editProfileForm = document.getElementById('form-member-edit-profile');
  if (editProfileForm) {
    editProfileForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('edit-name').value.trim();
      const designation = document.getElementById('edit-designation').value.trim();
      const company = document.getElementById('edit-company').value.trim();
      const phone = document.getElementById('edit-phone').value.trim();
      const city = document.getElementById('edit-city').value.trim();
      const linkedin = document.getElementById('edit-linkedin').value.trim();

      try {
        const res = await fetch('/api/auth/complete-profile', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${state.token}`
          },
          body: JSON.stringify({ name, designation, company, phone, city, linkedin })
        });
        const data = await res.json();
        if (data.success) {
          state.user = data.user;
          localStorage.setItem('cxo_user', JSON.stringify(data.user));
          closeModal('modal-edit-profile');
          showToast('Profile updated successfully!', 'success');
          renderMemberDashboard();
        } else {
          showToast(data.message || 'Profile update failed', 'error');
        }
      } catch (err) {
        showToast(`Error: ${err.message}`, 'error');
      }
    });
  }

  // Initial routing
  const initialHash = window.location.hash || '#home';
  navigate(initialHash);
});
