/**
 * orders.js — Gestion des commandes
 * Lien direct vers Google Sheets + statistiques
 */

const Orders = (() => {
  // URL Google Apps Script pour les commandes (lien réel)
  const ORDERS_URL = 'https://script.google.com/macros/s/AKfycbz_4dO_WRBPKtl_869i_9PGYqTIOreGXtxbfET9jsA77g9_TIxYPa7jV6K9m4TVnIjHdg/exec';

  function render() {
    const container = document.getElementById('orders-section');
    if (!container) return;

    container.innerHTML = `
      <div class="section-header">
        <h2>📋 Commandes</h2>
      </div>
      <div class="orders-card">
        <div class="orders-icon">📋</div>
        <h3>Accès aux commandes</h3>
        <p>Toutes les commandes sont centralisées dans Google Sheets.</p>
        <a href="${ORDERS_URL}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-lg">
          📤 Ouvrir les commandes Google Sheets
        </a>
      </div>
      <div class="stats-row mt-4" id="orders-stats-row">
        <div class="stat-card">
          <div class="stat-icon">📦</div>
          <div class="stat-value" id="stat-total-orders">—</div>
          <div class="stat-label">Commandes totales</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">✅</div>
          <div class="stat-value" id="stat-orders-today">—</div>
          <div class="stat-label">Aujourd'hui</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">💰</div>
          <div class="stat-value" id="stat-revenue">—</div>
          <div class="stat-label">Chiffre d'affaires</div>
        </div>
      </div>`;
  }

  return { render };
})();

window.Orders = Orders;
