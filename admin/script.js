/**
 * script.js — Logique principale du dashboard admin
 * Navigation, stats, toast notifications, paramètres
 */

// ─── Navigation ──────────────────────────────────────────────────────────────

const NAV_SECTIONS = ['dashboard', 'products', 'promotions', 'delivery', 'orders', 'settings'];

function navigateTo(section) {
  // Masquer toutes les sections
  NAV_SECTIONS.forEach(s => {
    const el = document.getElementById(`${s}-section`);
    if (el) el.classList.remove('active');
    const nav = document.querySelector(`[data-nav="${s}"]`);
    if (nav) nav.classList.remove('active');
  });

  // Afficher la section active
  const target = document.getElementById(`${section}-section`);
  if (target) target.classList.add('active');
  const navItem = document.querySelector(`[data-nav="${section}"]`);
  if (navItem) navItem.classList.add('active');

  // Fermer le menu mobile
  document.getElementById('sidebar')?.classList.remove('open');

  // Rendre la section correspondante
  switch (section) {
    case 'products':    Products.render();    break;
    case 'promotions':  Promotions.render();  break;
    case 'delivery':    Delivery.render();    break;
    case 'orders':      Orders.render();      break;
    case 'dashboard':   renderDashboard();    break;
    case 'settings':    renderSettings();     break;
  }

  // Stocker la dernière section visitée
  sessionStorage.setItem('admin_last_section', section);
}

// ─── Dashboard stats ──────────────────────────────────────────────────────────

function renderDashboard() {
  const ps = Products.getStats();
  const promos = Promotions.getStats();
  const delivery = Delivery.getStats();

  const cards = [
    { icon: '📦', value: ps.total,        label: 'Produits',          color: 'blue' },
    { icon: '✅', value: ps.actifs,        label: 'Produits actifs',   color: 'green' },
    { icon: '⚠️', value: ps.stockFaible,  label: 'Stock faible',      color: 'orange' },
    { icon: '🏷️', value: promos.actives,  label: 'Promos actives',    color: 'purple' },
    { icon: '🚚', value: delivery.actives, label: 'Wilayas actives',   color: 'teal' },
    { icon: '🎁', value: delivery.gratuit ? 'OUI' : 'NON', label: 'Livraison gratuite', color: delivery.gratuit ? 'green' : 'red' },
  ];

  const container = document.getElementById('dashboard-section');
  if (!container) return;

  let html = `
    <div class="section-header">
      <h2>🏠 Tableau de bord</h2>
      <span class="subtitle">Bienvenue dans votre espace admin</span>
    </div>
    <div class="stats-grid">`;

  cards.forEach(c => {
    html += `
      <div class="stat-card color-${c.color}">
        <div class="stat-icon">${c.icon}</div>
        <div class="stat-value">${c.value}</div>
        <div class="stat-label">${c.label}</div>
      </div>`;
  });

  html += `</div>
    <div class="quick-actions">
      <h3>Actions rapides</h3>
      <div class="quick-btns">
        <button class="btn btn-primary" onclick="navigateTo('products'); Products.openAddModal()">+ Ajouter un produit</button>
        <button class="btn btn-secondary" onclick="navigateTo('promotions'); Promotions.openAddModal()">+ Nouvelle promo</button>
        <button class="btn btn-outline" onclick="navigateTo('orders')">📋 Voir les commandes</button>
      </div>
    </div>`;

  container.innerHTML = html;
}

// ─── Paramètres ──────────────────────────────────────────────────────────────

function renderSettings() {
  const container = document.getElementById('settings-section');
  if (!container) return;

  const account = JSON.parse(localStorage.getItem('admin_account') || '{}');

  container.innerHTML = `
    <div class="section-header">
      <h2>⚙️ Paramètres</h2>
    </div>
    <div class="settings-card">
      <h3>Compte admin</h3>
      <div class="setting-row">
        <span class="setting-label">Email</span>
        <span class="setting-value">${window.Auth.sanitize(account.email || '—')}</span>
      </div>
      <div class="setting-row">
        <span class="setting-label">Sécurité</span>
        <span class="setting-value">Mot de passe haché (SHA-256)</span>
      </div>
      <hr class="divider">
      <h3>Modifier le mot de passe</h3>
      <div class="form-group">
        <label>Nouveau mot de passe</label>
        <input type="password" id="new-password" placeholder="Minimum 8 caractères">
      </div>
      <div class="form-group">
        <label>Confirmer le mot de passe</label>
        <input type="password" id="confirm-password" placeholder="Répéter le mot de passe">
      </div>
      <button class="btn btn-primary" onclick="changePassword()">🔒 Changer le mot de passe</button>
      <hr class="divider">
      <h3>Session</h3>
      <p class="text-muted">Votre session est stockée dans sessionStorage et expire à la fermeture du navigateur.</p>
      <button class="btn btn-danger" onclick="Auth.logout()">🚪 Se déconnecter</button>
    </div>`;
}

async function changePassword() {
  const newPass = document.getElementById('new-password')?.value;
  const confirmPass = document.getElementById('confirm-password')?.value;

  if (!newPass || newPass.length < 8) {
    showToast('Le mot de passe doit contenir au moins 8 caractères.', 'error');
    return;
  }
  if (newPass !== confirmPass) {
    showToast('Les mots de passe ne correspondent pas.', 'error');
    return;
  }

  const account = JSON.parse(localStorage.getItem('admin_account') || '{}');
  // Hachage via SubtleCrypto
  const safePass = window.Auth.sanitize(newPass);
  const msgBuffer = new TextEncoder().encode(safePass);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  account.passwordHash = hash;
  localStorage.setItem('admin_account', JSON.stringify(account));
  showToast('Mot de passe modifié avec succès !');
}

// ─── Toast notifications ──────────────────────────────────────────────────────

function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  if (!toast) return;

  toast.textContent = message;
  toast.className = `toast toast-${type} visible`;

  setTimeout(() => {
    toast.classList.remove('visible');
  }, 3500);
}
window.showToast = showToast;

// ─── Sidebar mobile ──────────────────────────────────────────────────────────

function toggleSidebar() {
  document.getElementById('sidebar')?.classList.toggle('open');
}

// ─── Initialisation ──────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  // Vérification de l'authentification
  if (!window.Auth.isAuthenticated()) {
    showAuthPage();
    return;
  }

  showDashboard();
});

function showAuthPage() {
  const app = document.getElementById('app');
  const authSection = document.getElementById('auth-section');
  if (authSection) authSection.classList.add('active');
  if (app) app.style.display = 'none';

  // Afficher le bon formulaire selon si un compte existe
  if (window.Auth.accountExists()) {
    document.getElementById('login-form')?.classList.add('active');
    document.getElementById('register-form')?.classList.remove('active');
  } else {
    document.getElementById('register-form')?.classList.add('active');
    document.getElementById('login-form')?.classList.remove('active');
  }
}

function showDashboard() {
  const app = document.getElementById('app');
  const authSection = document.getElementById('auth-section');
  if (authSection) authSection.classList.remove('active');
  if (app) app.style.display = '';

  // Restaurer la dernière section visitée
  const lastSection = sessionStorage.getItem('admin_last_section') || 'dashboard';
  navigateTo(lastSection);
}

// ─── Gestion du formulaire de login ──────────────────────────────────────────

async function handleLogin(e) {
  e.preventDefault();
  const email    = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  const btn      = document.getElementById('login-btn');

  btn.disabled = true;
  btn.textContent = 'Connexion…';

  const result = await window.Auth.login(email, password);

  if (result.success) {
    showDashboard();
  } else {
    document.getElementById('login-error').textContent = result.message;
    document.getElementById('login-error').classList.add('visible');
    btn.disabled = false;
    btn.textContent = 'Se connecter';
  }
}

async function handleRegister(e) {
  e.preventDefault();
  const email    = document.getElementById('reg-email').value;
  const password = document.getElementById('reg-password').value;
  const confirm  = document.getElementById('reg-confirm').value;
  const btn      = document.getElementById('reg-btn');

  if (password !== confirm) {
    document.getElementById('reg-error').textContent = 'Les mots de passe ne correspondent pas.';
    document.getElementById('reg-error').classList.add('visible');
    return;
  }

  btn.disabled = true;
  btn.textContent = 'Création…';

  const result = await window.Auth.createAccount(email, password);

  document.getElementById('reg-error').textContent = result.message;
  document.getElementById('reg-error').classList.toggle('visible', true);
  document.getElementById('reg-error').classList.toggle('error', !result.success);
  document.getElementById('reg-error').classList.toggle('success-msg', result.success);

  if (result.success) {
    setTimeout(() => {
      document.getElementById('register-form').classList.remove('active');
      document.getElementById('login-form').classList.add('active');
    }, 1500);
  } else {
    btn.disabled = false;
    btn.textContent = 'Créer le compte';
  }
}

window.navigateTo = navigateTo;
window.toggleSidebar = toggleSidebar;
window.handleLogin = handleLogin;
window.handleRegister = handleRegister;
window.changePassword = changePassword;
