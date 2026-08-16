/**
 * products.js — Gestion des produits
 * CRUD complet, pagination, recherche avec debounce
 */

const Products = (() => {
  const STORAGE_KEY = 'admin_products';
  const PAGE_SIZE = 10;
  let currentPage = 1;
  let searchQuery = '';
  let searchTimer = null;
  let editingId = null;
  let dynamicCount = 1; // Nombre de formulaires dans l'ajout multiple

  // ─── Persistance ────────────────────────────────────────────────────────────

  function loadAll() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch {
      return [];
    }
  }

  function saveAll(products) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  }

  function generateId() {
    return 'prod_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
  }

  // ─── Filtrage & Pagination ───────────────────────────────────────────────────

  function getFiltered() {
    const all = loadAll();
    if (!searchQuery) return all;
    const q = searchQuery.toLowerCase();
    return all.filter(p =>
      p.nom.toLowerCase().includes(q) ||
      p.categorie.toLowerCase().includes(q)
    );
  }

  function getPage(page) {
    const filtered = getFiltered();
    const start = (page - 1) * PAGE_SIZE;
    return {
      items: filtered.slice(start, start + PAGE_SIZE),
      total: filtered.length,
      pages: Math.ceil(filtered.length / PAGE_SIZE),
      current: page,
    };
  }

  // ─── Rendu principal ─────────────────────────────────────────────────────────

  function render() {
    const container = document.getElementById('products-section');
    if (!container) return;

    const data = getPage(currentPage);

    let html = `
      <div class="section-header">
        <h2>📦 Produits <span class="badge">${data.total}</span></h2>
        <button class="btn btn-primary" onclick="Products.openAddModal()">+ Ajouter des produits</button>
      </div>
      <div class="search-bar">
        <input type="text" id="product-search" placeholder="Rechercher un produit..."
          value="${window.Auth.sanitize(searchQuery)}"
          oninput="Products.onSearch(this.value)" autocomplete="off">
      </div>
      <div class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>Image</th><th>Nom</th><th>Prix</th><th>Stock</th>
              <th>Catégorie</th><th>Statut</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>`;

    if (data.items.length === 0) {
      html += `<tr><td colspan="7" class="empty-state">Aucun produit trouvé</td></tr>`;
    } else {
      data.items.forEach(p => {
        const img = p.images && p.images[0]
          ? `<img src="${window.Auth.sanitize(p.images[0])}" loading="lazy" class="thumb" alt="">`
          : '<span class="no-img">—</span>';
        html += `
          <tr>
            <td>${img}</td>
            <td>${window.Auth.sanitize(p.nom)}</td>
            <td>${Number(p.prix).toLocaleString('fr-DZ')} DA</td>
            <td>${Number(p.stock)}</td>
            <td>${window.Auth.sanitize(p.categorie)}</td>
            <td><span class="status-badge ${p.actif ? 'active' : 'inactive'}">${p.actif ? 'Actif' : 'Inactif'}</span></td>
            <td class="actions">
              <button class="btn btn-sm btn-edit" onclick="Products.openEditModal('${p.id}')">✏️</button>
              <button class="btn btn-sm btn-danger" onclick="Products.deleteProduct('${p.id}')">🗑️</button>
            </td>
          </tr>`;
      });
    }

    html += `</tbody></table></div>`;

    // Pagination
    if (data.pages > 1) {
      html += `<div class="pagination">`;
      for (let i = 1; i <= data.pages; i++) {
        html += `<button class="page-btn ${i === data.current ? 'active' : ''}" onclick="Products.goToPage(${i})">${i}</button>`;
      }
      html += `</div>`;
    }

    container.innerHTML = html;
  }

  // ─── Recherche avec debounce ──────────────────────────────────────────────────

  function onSearch(value) {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      searchQuery = window.Auth.sanitize(value).trim();
      currentPage = 1;
      render();
    }, 300);
  }

  function goToPage(page) {
    currentPage = page;
    render();
  }

  // ─── Modal Ajout (plusieurs produits) ────────────────────────────────────────

  function openAddModal() {
    dynamicCount = 1;
    const modal = document.getElementById('modal-overlay');
    modal.innerHTML = `
      <div class="modal">
        <div class="modal-header">
          <h3>Ajouter des produits</h3>
          <button class="modal-close" onclick="Products.closeModal()">✕</button>
        </div>
        <div class="modal-body">
          <div id="product-forms">
            ${buildProductForm(1)}
          </div>
          <button class="btn btn-secondary mt-2" onclick="Products.addMoreForm()">+ Ajouter un autre produit</button>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline" onclick="Products.closeModal()">Annuler</button>
          <button class="btn btn-primary" onclick="Products.saveNewProducts()">💾 Sauvegarder</button>
        </div>
      </div>`;
    modal.classList.add('visible');
  }

  function buildProductForm(index) {
    return `
      <fieldset class="product-form-block" id="pform-${index}">
        <legend>Produit ${index}</legend>
        <div class="form-grid">
          <div class="form-group">
            <label>Nom *</label>
            <input type="text" id="p${index}-nom" placeholder="Nom du produit" required>
          </div>
          <div class="form-group">
            <label>Prix (DA) *</label>
            <input type="number" id="p${index}-prix" placeholder="0" min="0" required>
          </div>
          <div class="form-group">
            <label>Stock</label>
            <input type="number" id="p${index}-stock" placeholder="0" min="0" value="0">
          </div>
          <div class="form-group">
            <label>Catégorie</label>
            <input type="text" id="p${index}-categorie" placeholder="Ex: Vêtements">
          </div>
        </div>
        <div class="form-group">
          <label>Description</label>
          <textarea id="p${index}-description" rows="3" placeholder="Description du produit"></textarea>
        </div>
        <div class="form-group">
          <label>Images (URLs, une par ligne)</label>
          <textarea id="p${index}-images" rows="2" placeholder="https://..."></textarea>
        </div>
        <div class="form-group form-check">
          <label><input type="checkbox" id="p${index}-actif" checked> Produit actif</label>
        </div>
      </fieldset>`;
  }

  function addMoreForm() {
    dynamicCount++;
    const container = document.getElementById('product-forms');
    const div = document.createElement('div');
    div.innerHTML = buildProductForm(dynamicCount);
    container.appendChild(div.firstElementChild);
  }

  async function saveNewProducts() {
    const products = loadAll();
    let saved = 0;

    for (let i = 1; i <= dynamicCount; i++) {
      const nomEl = document.getElementById(`p${i}-nom`);
      if (!nomEl) continue;
      const nom = window.Auth.sanitize(nomEl.value.trim());
      if (!nom) continue;

      const prix = parseFloat(document.getElementById(`p${i}-prix`)?.value || '0');
      const stock = parseInt(document.getElementById(`p${i}-stock`)?.value || '0', 10);
      const categorie = window.Auth.sanitize(document.getElementById(`p${i}-categorie`)?.value.trim() || '');
      const description = window.Auth.sanitize(document.getElementById(`p${i}-description`)?.value.trim() || '');
      const imagesRaw = document.getElementById(`p${i}-images`)?.value || '';
      const images = imagesRaw.split('\n').map(u => u.trim()).filter(u => u.length > 0);
      const actif = document.getElementById(`p${i}-actif`)?.checked ?? true;

      products.push({ id: generateId(), nom, prix, stock, categorie, description, images, actif });
      saved++;
    }

    saveAll(products);
    closeModal();
    render();
    showToast(`${saved} produit(s) ajouté(s) avec succès !`);
  }

  // ─── Modal Édition ────────────────────────────────────────────────────────────

  function openEditModal(id) {
    const products = loadAll();
    const p = products.find(x => x.id === id);
    if (!p) return;
    editingId = id;

    const modal = document.getElementById('modal-overlay');
    modal.innerHTML = `
      <div class="modal">
        <div class="modal-header">
          <h3>Modifier le produit</h3>
          <button class="modal-close" onclick="Products.closeModal()">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-grid">
            <div class="form-group">
              <label>Nom *</label>
              <input type="text" id="edit-nom" value="${window.Auth.sanitize(p.nom)}">
            </div>
            <div class="form-group">
              <label>Prix (DA) *</label>
              <input type="number" id="edit-prix" value="${p.prix}" min="0">
            </div>
            <div class="form-group">
              <label>Stock</label>
              <input type="number" id="edit-stock" value="${p.stock}" min="0">
            </div>
            <div class="form-group">
              <label>Catégorie</label>
              <input type="text" id="edit-categorie" value="${window.Auth.sanitize(p.categorie)}">
            </div>
          </div>
          <div class="form-group">
            <label>Description</label>
            <textarea id="edit-description" rows="3">${window.Auth.sanitize(p.description)}</textarea>
          </div>
          <div class="form-group">
            <label>Images (URLs, une par ligne)</label>
            <textarea id="edit-images" rows="2">${p.images.map(u => window.Auth.sanitize(u)).join('\n')}</textarea>
          </div>
          <div class="form-group form-check">
            <label><input type="checkbox" id="edit-actif" ${p.actif ? 'checked' : ''}> Produit actif</label>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline" onclick="Products.closeModal()">Annuler</button>
          <button class="btn btn-primary" onclick="Products.saveEdit()">💾 Sauvegarder</button>
        </div>
      </div>`;
    modal.classList.add('visible');
  }

  function saveEdit() {
    const products = loadAll();
    const idx = products.findIndex(x => x.id === editingId);
    if (idx === -1) return;

    products[idx].nom         = window.Auth.sanitize(document.getElementById('edit-nom').value.trim());
    products[idx].prix        = parseFloat(document.getElementById('edit-prix').value || '0');
    products[idx].stock       = parseInt(document.getElementById('edit-stock').value || '0', 10);
    products[idx].categorie   = window.Auth.sanitize(document.getElementById('edit-categorie').value.trim());
    products[idx].description = window.Auth.sanitize(document.getElementById('edit-description').value.trim());
    const imagesRaw = document.getElementById('edit-images').value;
    products[idx].images      = imagesRaw.split('\n').map(u => u.trim()).filter(u => u.length > 0);
    products[idx].actif       = document.getElementById('edit-actif').checked;

    saveAll(products);
    closeModal();
    render();
    showToast('Produit modifié avec succès !');
  }

  // ─── Suppression ──────────────────────────────────────────────────────────────

  function deleteProduct(id) {
    if (!confirm('Confirmer la suppression de ce produit ?')) return;
    const products = loadAll().filter(p => p.id !== id);
    saveAll(products);
    render();
    showToast('Produit supprimé.');
  }

  // ─── Utilitaires ─────────────────────────────────────────────────────────────

  function closeModal() {
    const modal = document.getElementById('modal-overlay');
    if (modal) modal.classList.remove('visible');
    editingId = null;
  }

  function showToast(msg) {
    if (typeof window.showToast === 'function') window.showToast(msg);
  }

  // ─── Stats pour le dashboard ──────────────────────────────────────────────────

  function getStats() {
    const all = loadAll();
    return {
      total: all.length,
      actifs: all.filter(p => p.actif).length,
      stockFaible: all.filter(p => p.stock <= 5).length,
    };
  }

  return { render, onSearch, goToPage, openAddModal, addMoreForm, saveNewProducts, openEditModal, saveEdit, deleteProduct, closeModal, getStats };
})();

window.Products = Products;
