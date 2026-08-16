/**
 * delivery.js — Gestion des livraisons par wilaya
 * 58 wilayas d'Algérie avec prix et délais personnalisables
 */

const Delivery = (() => {
  const STORAGE_KEY = 'admin_delivery';

  // Liste complète des 58 wilayas d'Algérie
  const WILAYAS_DEFAULT = [
    { code: '01', nom: 'Adrar',           prix: 600, delai: '5-7 jours', actif: true },
    { code: '02', nom: 'Chlef',           prix: 400, delai: '3-4 jours', actif: true },
    { code: '03', nom: 'Laghouat',        prix: 500, delai: '4-5 jours', actif: true },
    { code: '04', nom: 'Oum El Bouaghi',  prix: 450, delai: '3-4 jours', actif: true },
    { code: '05', nom: 'Batna',           prix: 450, delai: '3-4 jours', actif: true },
    { code: '06', nom: 'Béjaïa',          prix: 400, delai: '2-3 jours', actif: true },
    { code: '07', nom: 'Biskra',          prix: 500, delai: '4-5 jours', actif: true },
    { code: '08', nom: 'Béchar',          prix: 600, delai: '5-7 jours', actif: true },
    { code: '09', nom: 'Blida',           prix: 300, delai: '1-2 jours', actif: true },
    { code: '10', nom: 'Bouira',          prix: 350, delai: '2-3 jours', actif: true },
    { code: '11', nom: 'Tamanrasset',     prix: 700, delai: '7-10 jours', actif: true },
    { code: '12', nom: 'Tébessa',         prix: 500, delai: '4-5 jours', actif: true },
    { code: '13', nom: 'Tlemcen',         prix: 450, delai: '3-4 jours', actif: true },
    { code: '14', nom: 'Tiaret',          prix: 450, delai: '3-4 jours', actif: true },
    { code: '15', nom: 'Tizi Ouzou',      prix: 350, delai: '2-3 jours', actif: true },
    { code: '16', nom: 'Alger',           prix: 300, delai: '1-2 jours', actif: true },
    { code: '17', nom: 'Djelfa',          prix: 500, delai: '4-5 jours', actif: true },
    { code: '18', nom: 'Jijel',           prix: 400, delai: '3-4 jours', actif: true },
    { code: '19', nom: 'Sétif',           prix: 400, delai: '3-4 jours', actif: true },
    { code: '20', nom: 'Saïda',           prix: 500, delai: '4-5 jours', actif: true },
    { code: '21', nom: 'Skikda',          prix: 450, delai: '3-4 jours', actif: true },
    { code: '22', nom: 'Sidi Bel Abbès',  prix: 450, delai: '3-4 jours', actif: true },
    { code: '23', nom: 'Annaba',          prix: 400, delai: '3-4 jours', actif: true },
    { code: '24', nom: 'Guelma',          prix: 450, delai: '3-4 jours', actif: true },
    { code: '25', nom: 'Constantine',     prix: 400, delai: '2-3 jours', actif: true },
    { code: '26', nom: 'Médéa',           prix: 350, delai: '2-3 jours', actif: true },
    { code: '27', nom: 'Mostaganem',      prix: 400, delai: '3-4 jours', actif: true },
    { code: '28', nom: 'M\'Sila',         prix: 450, delai: '3-4 jours', actif: true },
    { code: '29', nom: 'Mascara',         prix: 450, delai: '3-4 jours', actif: true },
    { code: '30', nom: 'Ouargla',         prix: 550, delai: '5-6 jours', actif: true },
    { code: '31', nom: 'Oran',            prix: 350, delai: '2-3 jours', actif: true },
    { code: '32', nom: 'El Bayadh',       prix: 550, delai: '5-6 jours', actif: true },
    { code: '33', nom: 'Illizi',          prix: 700, delai: '7-10 jours', actif: true },
    { code: '34', nom: 'Bordj Bou Arreridj', prix: 400, delai: '3-4 jours', actif: true },
    { code: '35', nom: 'Boumerdès',       prix: 300, delai: '1-2 jours', actif: true },
    { code: '36', nom: 'El Tarf',         prix: 450, delai: '3-4 jours', actif: true },
    { code: '37', nom: 'Tindouf',         prix: 700, delai: '7-10 jours', actif: true },
    { code: '38', nom: 'Tissemsilt',      prix: 450, delai: '3-4 jours', actif: true },
    { code: '39', nom: 'El Oued',         prix: 550, delai: '5-6 jours', actif: true },
    { code: '40', nom: 'Khenchela',       prix: 500, delai: '4-5 jours', actif: true },
    { code: '41', nom: 'Souk Ahras',      prix: 500, delai: '4-5 jours', actif: true },
    { code: '42', nom: 'Tipaza',          prix: 300, delai: '1-2 jours', actif: true },
    { code: '43', nom: 'Mila',            prix: 450, delai: '3-4 jours', actif: true },
    { code: '44', nom: 'Aïn Defla',       prix: 400, delai: '3-4 jours', actif: true },
    { code: '45', nom: 'Naâma',           prix: 550, delai: '5-6 jours', actif: true },
    { code: '46', nom: 'Aïn Témouchent',  prix: 450, delai: '3-4 jours', actif: true },
    { code: '47', nom: 'Ghardaïa',        prix: 500, delai: '4-5 jours', actif: true },
    { code: '48', nom: 'Relizane',        prix: 450, delai: '3-4 jours', actif: true },
    { code: '49', nom: 'Timimoun',        prix: 650, delai: '6-7 jours', actif: true },
    { code: '50', nom: 'Bordj Badji Mokhtar', prix: 700, delai: '7-10 jours', actif: true },
    { code: '51', nom: 'Ouled Djellal',   prix: 550, delai: '5-6 jours', actif: true },
    { code: '52', nom: 'Béni Abbès',      prix: 650, delai: '6-7 jours', actif: true },
    { code: '53', nom: 'In Salah',        prix: 700, delai: '7-10 jours', actif: true },
    { code: '54', nom: 'In Guezzam',      prix: 700, delai: '7-10 jours', actif: true },
    { code: '55', nom: 'Touggourt',       prix: 550, delai: '5-6 jours', actif: true },
    { code: '56', nom: 'Djanet',          prix: 700, delai: '7-10 jours', actif: true },
    { code: '57', nom: 'El M\'Ghair',     prix: 550, delai: '5-6 jours', actif: true },
    { code: '58', nom: 'El Meniaa',       prix: 600, delai: '6-7 jours', actif: true },
  ];

  function loadAll() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : JSON.parse(JSON.stringify(WILAYAS_DEFAULT));
    } catch {
      return JSON.parse(JSON.stringify(WILAYAS_DEFAULT));
    }
  }

  function saveAll(wilayas) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(wilayas));
  }

  function getFreeLivraison() {
    return localStorage.getItem('admin_free_delivery') === 'true';
  }

  function setFreeLivraison(val) {
    localStorage.setItem('admin_free_delivery', val ? 'true' : 'false');
  }

  // ─── Rendu ───────────────────────────────────────────────────────────────────

  function render() {
    const container = document.getElementById('delivery-section');
    if (!container) return;

    const wilayas = loadAll();
    const isFree = getFreeLivraison();
    const actives = wilayas.filter(w => w.actif).length;

    let html = `
      <div class="section-header">
        <h2>🚚 Livraisons <span class="badge">${actives}/58 actives</span></h2>
        <div class="header-actions">
          <label class="toggle-label">
            <span>Livraison gratuite</span>
            <label class="toggle-switch">
              <input type="checkbox" id="free-delivery-toggle" ${isFree ? 'checked' : ''} onchange="Delivery.toggleFree(this.checked)">
              <span class="toggle-slider"></span>
            </label>
          </label>
          <button class="btn btn-secondary" onclick="Delivery.activateAll()">Tout activer</button>
          <button class="btn btn-outline" onclick="Delivery.deactivateAll()">Tout désactiver</button>
          <button class="btn btn-primary" onclick="Delivery.saveChanges()">💾 Sauvegarder</button>
        </div>
      </div>
      <div class="search-bar">
        <input type="text" id="wilaya-search" placeholder="Rechercher une wilaya..."
          oninput="Delivery.onSearch(this.value)" autocomplete="off">
      </div>
      <div class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>Code</th><th>Wilaya</th><th>Prix (DA)</th>
              <th>Délai estimé</th><th>Statut</th>
            </tr>
          </thead>
          <tbody id="wilayas-tbody">`;

    wilayas.forEach(w => {
      html += `
        <tr data-wilaya="${w.code}">
          <td>${w.code}</td>
          <td>${window.Auth.sanitize(w.nom)}</td>
          <td><input type="number" class="prix-input" data-code="${w.code}" value="${w.prix}" min="0" ${isFree ? 'disabled' : ''}></td>
          <td><input type="text" class="delai-input" data-code="${w.code}" value="${window.Auth.sanitize(w.delai)}"></td>
          <td>
            <label class="toggle-switch sm">
              <input type="checkbox" data-code="${w.code}" class="wilaya-toggle" ${w.actif ? 'checked' : ''}>
              <span class="toggle-slider"></span>
            </label>
          </td>
        </tr>`;
    });

    html += `</tbody></table></div>`;
    container.innerHTML = html;
  }

  let searchTimer = null;
  function onSearch(value) {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      const q = value.toLowerCase();
      document.querySelectorAll('#wilayas-tbody tr').forEach(row => {
        const nom = row.querySelector('td:nth-child(2)')?.textContent.toLowerCase() || '';
        row.style.display = nom.includes(q) ? '' : 'none';
      });
    }, 200);
  }

  function toggleFree(val) {
    setFreeLivraison(val);
    render();
  }

  function activateAll() {
    document.querySelectorAll('.wilaya-toggle').forEach(cb => cb.checked = true);
  }

  function deactivateAll() {
    document.querySelectorAll('.wilaya-toggle').forEach(cb => cb.checked = false);
  }

  function saveChanges() {
    const wilayas = loadAll();
    wilayas.forEach(w => {
      const prixEl = document.querySelector(`.prix-input[data-code="${w.code}"]`);
      const delaiEl = document.querySelector(`.delai-input[data-code="${w.code}"]`);
      const toggleEl = document.querySelector(`.wilaya-toggle[data-code="${w.code}"]`);

      if (prixEl)   w.prix  = parseFloat(prixEl.value) || 0;
      if (delaiEl)  w.delai = window.Auth.sanitize(delaiEl.value.trim());
      if (toggleEl) w.actif = toggleEl.checked;
    });
    saveAll(wilayas);
    if (typeof window.showToast === 'function') window.showToast('Paramètres de livraison sauvegardés !');
  }

  function getStats() {
    const wilayas = loadAll();
    return {
      total: 58,
      actives: wilayas.filter(w => w.actif).length,
      gratuit: getFreeLivraison(),
    };
  }

  return { render, onSearch, toggleFree, activateAll, deactivateAll, saveChanges, getStats };
})();

window.Delivery = Delivery;
