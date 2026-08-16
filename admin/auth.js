/**
 * auth.js — Authentification admin sécurisée
 * Fonctionnalités : création de compte, login, hashing SHA-256,
 * protection brute-force, sessions via sessionStorage
 */

// Email autorisé pour créer un compte admin
const ADMIN_EMAIL = 'mohs49850@gmail.com';

// Clés de stockage
const KEYS = {
  account:    'admin_account',
  session:    'admin_session',
  attempts:   'admin_attempts',
  blockUntil: 'admin_block_until',
};

// Durée de blocage après 5 tentatives (15 minutes en ms)
const BLOCK_DURATION_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;

/**
 * Hache une chaîne avec SHA-256 (SubtleCrypto natif)
 * @param {string} message
 * @returns {Promise<string>} hash hexadécimal
 */
async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Sanitise une chaîne contre XSS (via DOMPurify si disponible, sinon encodage manuel)
 * @param {string} input
 * @returns {string}
 */
function sanitize(input) {
  if (typeof DOMPurify !== 'undefined') {
    return DOMPurify.sanitize(String(input), { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
  }
  // Fallback : encodage HTML basique
  return String(input)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

/**
 * Vérifie si l'IP/navigateur est bloqué suite à trop de tentatives
 * @returns {boolean}
 */
function isBlocked() {
  const blockUntil = parseInt(localStorage.getItem(KEYS.blockUntil) || '0', 10);
  if (Date.now() < blockUntil) return true;
  // Réinitialiser si le blocage est expiré
  if (blockUntil > 0) {
    localStorage.removeItem(KEYS.blockUntil);
    localStorage.removeItem(KEYS.attempts);
  }
  return false;
}

/**
 * Enregistre une tentative échouée et bloque si nécessaire
 */
function recordFailedAttempt() {
  let attempts = parseInt(localStorage.getItem(KEYS.attempts) || '0', 10);
  attempts++;
  localStorage.setItem(KEYS.attempts, attempts.toString());
  if (attempts >= MAX_ATTEMPTS) {
    localStorage.setItem(KEYS.blockUntil, (Date.now() + BLOCK_DURATION_MS).toString());
  }
}

/**
 * Réinitialise les compteurs après un login réussi
 */
function resetAttempts() {
  localStorage.removeItem(KEYS.attempts);
  localStorage.removeItem(KEYS.blockUntil);
}

/**
 * Génère un token de session aléatoire
 * @returns {string}
 */
function generateSessionToken() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Vérifie si une session admin active existe dans sessionStorage
 * @returns {boolean}
 */
function isAuthenticated() {
  const session = sessionStorage.getItem(KEYS.session);
  return session !== null;
}

/**
 * Déconnecte l'admin (supprime la session)
 */
function logout() {
  sessionStorage.removeItem(KEYS.session);
  window.location.reload();
}

/**
 * Crée un compte admin (première fois)
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{success: boolean, message: string}>}
 */
async function createAccount(email, password) {
  const cleanEmail = sanitize(email).trim().toLowerCase();
  const cleanPassword = sanitize(password);

  // Vérification de l'email autorisé
  if (cleanEmail !== ADMIN_EMAIL) {
    return { success: false, message: 'Cet email n\'est pas autorisé à créer un compte admin.' };
  }

  // Vérification si un compte existe déjà
  const existing = localStorage.getItem(KEYS.account);
  if (existing) {
    return { success: false, message: 'Un compte admin existe déjà. Veuillez vous connecter.' };
  }

  // Validation du mot de passe
  if (cleanPassword.length < 8) {
    return { success: false, message: 'Le mot de passe doit contenir au moins 8 caractères.' };
  }

  // Hachage du mot de passe
  const hashedPassword = await sha256(cleanPassword);

  // Sauvegarde du compte
  const account = { email: cleanEmail, passwordHash: hashedPassword };
  localStorage.setItem(KEYS.account, JSON.stringify(account));

  return { success: true, message: 'Compte créé avec succès !' };
}

/**
 * Connecte l'admin avec email + mot de passe
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{success: boolean, message: string}>}
 */
async function login(email, password) {
  // Vérification du blocage brute-force
  if (isBlocked()) {
    const blockUntil = parseInt(localStorage.getItem(KEYS.blockUntil) || '0', 10);
    const remaining = Math.ceil((blockUntil - Date.now()) / 60000);
    return { success: false, message: `Trop de tentatives. Réessayez dans ${remaining} minute(s).` };
  }

  const cleanEmail = sanitize(email).trim().toLowerCase();
  const cleanPassword = sanitize(password);

  // Chargement du compte
  const accountStr = localStorage.getItem(KEYS.account);
  if (!accountStr) {
    recordFailedAttempt();
    return { success: false, message: 'Aucun compte admin trouvé. Créez d\'abord un compte.' };
  }

  const account = JSON.parse(accountStr);

  // Vérification email
  if (cleanEmail !== account.email) {
    recordFailedAttempt();
    return { success: false, message: 'Email ou mot de passe incorrect.' };
  }

  // Vérification mot de passe
  const hashedPassword = await sha256(cleanPassword);
  if (hashedPassword !== account.passwordHash) {
    recordFailedAttempt();
    const attempts = parseInt(localStorage.getItem(KEYS.attempts) || '0', 10);
    const remaining = MAX_ATTEMPTS - attempts;
    if (remaining > 0) {
      return { success: false, message: `Mot de passe incorrect. ${remaining} tentative(s) restante(s).` };
    }
    return { success: false, message: 'Compte bloqué pour 15 minutes.' };
  }

  // Succès : créer la session
  resetAttempts();
  const token = generateSessionToken();
  sessionStorage.setItem(KEYS.session, token);

  return { success: true, message: 'Connexion réussie !' };
}

/**
 * Vérifie si un compte admin a déjà été créé
 * @returns {boolean}
 */
function accountExists() {
  return localStorage.getItem(KEYS.account) !== null;
}

// Exporter pour utilisation dans d'autres modules
window.Auth = { login, createAccount, logout, isAuthenticated, accountExists, sanitize };
