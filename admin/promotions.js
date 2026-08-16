/**
 * promotions.js — Gestion des codes promotionnels
 */

const Promotions = (() => {
  const STORAGE_KEY = 'admin_promotions';

  function loadAll() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch {
      return [];
    }
  }

  function saveAll(promos) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(promos));
  }

  function generateId() {
    return 'promo_' + Date.now();
  }

  // ─── Rendu ───────────────────────────────────────────────────────────────────

  function render() {
    const container = document.getElementById('promotions-section');
    if (!container) return;

    const promos = loadAll();

    let html = `
      <div class="section-header">
        <h2>🏷️ Promotions <span class="badge">${promos.length}</span></h2>
        <button class="btn btn-primary" onclick="Promotions.openAddModal()">+ Nouvelle promotion</button>
      </div>
      <div class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>Nom</th><th>Code</th><th>Réduction</th>
              <th>Début</th><th>Fin</th><th>Portée</th><th>Statut</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>`;

    if (promos.length === 0) {
      html += `<tr><td colspan="8" class="empty-state">Aucune promotion créée</td></tr>`;
    } else {
      promos.forEach(p => {
        const now = Date.now();
        const start = new Date(p.dateDebut).getTime();
        const end = new Date(p.dateFin).getTime();
        const expired = now > end;

        html += `
          <tr>
            <td>${window.Auth.sanitize(p.nom)}</td>
            <td><code class="code-badge">${window.Auth.sanitize(p.code)}</code></td>
            <td>${p.reduction}%</td>
            <td>${p.dateDebut}</td>
            <td>${p.dateFin}</td>
            <td>${p.portee === 'boutique' ? '🏪 Boutique entière' : '📦 ' + window.Auth.sanitize(p.portee)}</td>
            <td>
              <span class="status-badge ${p.actif && !expired ? 'active' : 'inactive'}">
                ${expired ? 'Expirée' : (p.actif ? 'Active' : 'Inactive')}
              </span>
            </td>
            <td class="actions">
              <button class="btn btn-sm ${p.actif ? 'btn-warning' : 'btn-success'}" onclick="Promotions.toggle('${p.id}')">
                ${p.actif ? '⏸ Désactiver' : '▶ Activer'}
              </button>
              <button class="btn btn-sm btn-danger" onclick="Promotions.remove('${p.id}')">🗑️</button>
            </td>
          </tr>`;
      });
    }

    html += `</tbody></table></div>`;
    container.innerHTML = html;
  }

  // ─── Modal Ajout ─────────────────────────────────────────────────────────────

  function openAddModal() {
    const today = new Date().toISOString().split('T')[0];

    // Charger les produits pour la liste déroulante
    let productOptions = '<option value="boutique">🏪 Toute la boutique</option>';
    try {
      const products = JSON.parse(localStorage.getItem('admin_products') || '[]');
      products.forEach(p => {
        productOptions += `<option value="${window.Auth.sanitize(p.id)}">${window.Auth.sanitize(p.nom)}</option>`;
      });
    } catch { /* pas de produits */ }

    const modal = document.getElementById('modal-overlay');
    modal.innerHTML = `
      <div class="modal">
        <div class="modal-header">
          <h3>Nouvelle promotion</h3>
          <button class="modal-close" onclick="Promotions.closeModal()">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-grid">
            <div class="form-group">
              <label>Nom de la promotion *</label>
              <input type="text" id="promo-nom" placeholder="Ex: Soldes été 2024">
            </div>
            <div class="form-group">
              <label>Code promo *</label>
              <input type="text" id="promo-code" placeholder="ETE2024" style="text-transform:uppercase">
            </div>
            <div class="form-group">
              <label>Réduction (%) *</label>
              <input type="number" id="promo-reduction" min="1" max="100" placeholder="10">
            </div>
            <div class="form-group">
              <label>Portée</label>
              <select id="promo-portee">${productOptions}</select>
            </div>
            <div class="form-group">
              <label>Date début</label>
              <input type="date" id="promo-debut" value="${today}">
            </div>
            <div class="form-group">
              <label>Date fin</label>
              <input type="date" id="promo-fin">
            </div>
          </div>
          <div class="form-group form-check">
            <label><input type="checkbox" id="promo-actif" checked> Activer immédiatement</label>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline" onclick="Promotions.closeModal()">Annuler</button>
          <button class="btn btn-primary" onclick="Promotions.save()">💾 Créer</button>
        </div>
      </div>`;
    modal.classList.add('visible');
  }

  function save() {
    const nom       = window.Auth.sanitize(document.getElementById('promo-nom').value.trim());
    const code      = window.Auth.sanitize(document.getElementById('promo-code').value.trim().toUpperCase());
    const reduction = parseInt(document.getElementById('promo-reduction').value || '0', 10);
    const portee    = window.Auth.sanitize(document.getElementById('promo-portee').value);
    const dateDebut = document.getElementById('promo-debut').value;
    const dateFin   = document.getElementById('promo-fin').value;
    const actif     = document.getElementById('promo-actif').checked;

    if (!nom || !code || !reduction || !dateFin) {
      alert('Veuillez remplir tous les champs obligatoires.');
      return;
    }
    if (reduction < 1 || reduction > 100) {
      alert('La réduction doit être entre 1 et 100%.');
      return;
    }

    const promos = loadAll();
    promos.push({ id: generateId(), nom, code, reduction, portee, dateDebut, dateFin, actif });
    saveAll(promos);
    closeModal();
    render();
    if (typeof window.showToast === 'function') window.showToast('Promotion créée !');
  }

  function toggle(id) {
    const promos = loadAll();
    const p = promos.find(x => x.id === id);
    if (!p) return;
    p.actif = !p.actif;
    saveAll(promos);
    render();
  }

  function remove(id) {
    if (!confirm('Supprimer cette promotion ?')) return;
    saveAll(loadAll().filter(p => p.id !== id));
    render();
    if (typeof window.showToast === 'function') window.showToast('Promotion supprimée.');
  }

  function closeModal() {
    const modal = document.getElementById('modal-overlay');
    if (modal) modal.classList.remove('visible');
  }

  function getStats() {
    const all = loadAll();
    return {
      total: all.length,
      actives: all.filter(p => p.actif).length,
    };
  }

  return { render, openAddModal, save, toggle, remove, closeModal, getStats };
})();

window.Promotions = Promotions;
