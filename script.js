// ================================================================
// DONNÉES
// ================================================================

let SETTINGS = {};
let PRODUIT  = {};
let quantite = 1;

async function chargerDonnees() {
  try {
    const [resSettings, resProduit] = await Promise.all([
      fetch('/content/settings.json'),
      fetch('/content/produits/produit-1.json')
    ]);
    SETTINGS = await resSettings.json();
    PRODUIT  = await resProduit.json();
  } catch (e) {
    console.warn('Erreur chargement données', e);
  }

  appliquerSettings();
  appliquerProduit();
  chargerWilayas();
  bindEvents();
}

// ================================================================
// SETTINGS
// ================================================================

function appliquerSettings() {
  if (SETTINGS.pixel_id) {
    window.PIXEL_ID = SETTINGS.pixel_id;
    fbq('init', SETTINGS.pixel_id);
  }

  if (SETTINGS.nom_site) {
    document.getElementById('site-title').textContent = SETTINGS.nom_site;
  }
}

// ================================================================
// PRODUIT
// ================================================================

function appliquerProduit() {
  // Nom
  const nom = PRODUIT.nom || '';
  document.getElementById('product-name').textContent = nom;
  document.getElementById('recap-produit-label').textContent = nom;

  // Accroche
  if (PRODUIT.accroche) {
    document.getElementById('product-tagline').textContent = PRODUIT.accroche;
  }

  // Prix
  const prix = getPrixFinal();
  document.getElementById('product-price').textContent =
    prix.toLocaleString('fr-DZ') + ' DA';

  // Description
  if (PRODUIT.description) {
    const el = document.getElementById('product-description');
    PRODUIT.description.split('\n').forEach(ligne => {
      if (!ligne.trim()) return;
      const p = document.createElement('p');
      p.textContent = ligne;
      el.appendChild(p);
    });
  }

  // Galerie
  if (PRODUIT.images && PRODUIT.images.length > 0) {
    const mainImg   = document.getElementById('gallery-main-img');
    const thumbsEl  = document.getElementById('gallery-thumbs');

    mainImg.src = PRODUIT.images[0];
    mainImg.alt = nom;

    PRODUIT.images.forEach((src, i) => {
      const btn = document.createElement('button');
      btn.type      = 'button';
      btn.className = 'thumb-btn' + (i === 0 ? ' active' : '');

      const img = document.createElement('img');
      img.src = src;
      img.alt = nom + ' ' + (i + 1);

      btn.appendChild(img);
      btn.addEventListener('click', () => {
        mainImg.style.opacity = '0';
        setTimeout(() => {
          mainImg.src           = src;
          mainImg.style.opacity = '1';
        }, 150);
        document.querySelectorAll('.thumb-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });

      thumbsEl.appendChild(btn);
    });
  }

  // Recap produit valeur initiale
  document.getElementById('recap-produit-val').textContent =
    getPrixFinal().toLocaleString('fr-DZ') + ' DA';
  document.getElementById('recap-qty-val').textContent = 1;
}

// ================================================================
// PRIX
// ================================================================

function getPrixFinal() {
  if (PRODUIT.prix_promo && PRODUIT.prix_promo > 0) return parseInt(PRODUIT.prix_promo);
  if (PRODUIT.prix) return parseInt(PRODUIT.prix);
  return 0;
}

function getLivraison(wilaya) {
  if (!SETTINGS.tarifs_livraison) return 0;
  return SETTINGS.tarifs_livraison[wilaya]
      ?? SETTINGS.tarifs_livraison['defaut']
      ?? 0;
}

// ================================================================
// WILAYAS
// ================================================================

const WILAYAS = [
  { code: '01', nom: 'Adrar' },
  { code: '02', nom: 'Chlef' },
  { code: '03', nom: 'Laghouat' },
  { code: '04', nom: 'Oum El Bouaghi' },
  { code: '05', nom: 'Batna' },
  { code: '06', nom: 'Bejaia' },
  { code: '07', nom: 'Biskra' },
  { code: '08', nom: 'Bechar' },
  { code: '09', nom: 'Blida' },
  { code: '10', nom: 'Bouira' },
  { code: '11', nom: 'Tamanrasset' },
  { code: '12', nom: 'Tebessa' },
  { code: '13', nom: 'Tlemcen' },
  { code: '14', nom: 'Tiaret' },
  { code: '15', nom: 'Tizi Ouzou' },
  { code: '16', nom: 'Alger' },
  { code: '17', nom: 'Djelfa' },
  { code: '18', nom: 'Jijel' },
  { code: '19', nom: 'Setif' },
  { code: '20', nom: 'Saida' },
  { code: '21', nom: 'Skikda' },
  { code: '22', nom: 'Sidi Bel Abbes' },
  { code: '23', nom: 'Annaba' },
  { code: '24', nom: 'Guelma' },
  { code: '25', nom: 'Constantine' },
  { code: '26', nom: 'Medea' },
  { code: '27', nom: 'Mostaganem' },
  { code: '28', nom: 'MSila' },
  { code: '29', nom: 'Mascara' },
  { code: '30', nom: 'Ouargla' },
  { code: '31', nom: 'Oran' },
  { code: '32', nom: 'El Bayadh' },
  { code: '33', nom: 'Illizi' },
  { code: '34', nom: 'Bordj Bou Arreridj' },
  { code: '35', nom: 'Boumerdes' },
  { code: '36', nom: 'El Tarf' },
  { code: '37', nom: 'Tindouf' },
  { code: '38', nom: 'Tissemsilt' },
  { code: '39', nom: 'El Oued' },
  { code: '40', nom: 'Khenchela' },
  { code: '41', nom: 'Souk Ahras' },
  { code: '42', nom: 'Tipaza' },
  { code: '43', nom: 'Mila' },
  { code: '44', nom: 'Ain Defla' },
  { code: '45', nom: 'Naama' },
  { code: '46', nom: 'Ain Temouchent' },
  { code: '47', nom: 'Ghardaia' },
  { code: '48', nom: 'Relizane' },
  { code: '49', nom: 'Timimoun' },
  { code: '50', nom: 'Bordj Badji Mokhtar' },
  { code: '51', nom: 'Ouled Djellal' },
  { code: '52', nom: 'Beni Abbes' },
  { code: '53', nom: 'In Salah' },
  { code: '54', nom: 'In Guezzam' },
  { code: '55', nom: 'Touggourt' },
  { code: '56', nom: 'Djanet' },
  { code: '57', nom: 'El MGhair' },
  { code: '58', nom: 'El Meniaa' }
];

function chargerWilayas() {
  const select = document.getElementById('champ-wilaya');
  WILAYAS.forEach(w => {
    const opt    = document.createElement('option');
    opt.value    = w.nom;
    opt.textContent = w.code + ' — ' + w.nom;
    select.appendChild(opt);
  });
}

// ================================================================
// RECAP
// ================================================================

function mettreAJourRecap() {
  const wilaya   = document.getElementById('champ-wilaya').value;
  const livraison = getLivraison(wilaya);
  const prix      = getPrixFinal();
  const total     = prix * quantite + livraison;

  document.getElementById('recap-produit-val').textContent =
    (prix * quantite).toLocaleString('fr-DZ') + ' DA';
  document.getElementById('recap-qty-val').textContent = quantite;
  document.getElementById('recap-livraison-val').textContent =
    livraison === 0 ? 'Gratuite' : livraison.toLocaleString('fr-DZ') + ' DA';
  document.getElementById('recap-total-val').textContent =
    total.toLocaleString('fr-DZ') + ' DA';

  // Afficher recap si wilaya choisie
  const recap = document.getElementById('order-summary');
  recap.style.display = wilaya ? 'block' : 'none';

  // Pixel
  if (wilaya) pixel('InitiateCheckout', { value: total, num_items: quantite });
}

// ================================================================
// EVENTS
// ================================================================

function bindEvents() {

  // Quantite
  document.getElementById('btn-moins').addEventListener('click', () => {
    if (quantite <= 1) return;
    quantite--;
    document.getElementById('champ-quantite').value = quantite;
    mettreAJourRecap();
  });

  document.getElementById('btn-plus').addEventListener('click', () => {
    quantite++;
    document.getElementById('champ-quantite').value = quantite;
    mettreAJourRecap();
    pixel('AddToCart', { value: getPrixFinal() * quantite });
  });

  // Wilaya
  document.getElementById('champ-wilaya').addEventListener('change', mettreAJourRecap);

  // Formulaire
  document.getElementById('formulaire').addEventListener('submit', soumettreCommande);
}

// ================================================================
// VALIDATION
// ================================================================

function valider() {
  const prenom   = document.getElementById('champ-prenom').value.trim();
  const nom      = document.getElementById('champ-nom').value.trim();
  const tel      = document.getElementById('champ-telephone').value.trim();
  const wilaya   = document.getElementById('champ-wilaya').value;
  const honeypot = document.querySelector('input[name="website"]').value;

  if (honeypot) return false;

  if (!prenom || prenom.length < 2) {
    alert('Veuillez entrer votre prenom.');
    return false;
  }

  if (!nom || nom.length < 2) {
    alert('Veuillez entrer votre nom.');
    return false;
  }

  if (!tel || !/^(05|06|07)[0-9]{8}$/.test(tel.replace(/\s/g, ''))) {
    alert('Numero de telephone invalide. Format : 05XXXXXXXX');
    return false;
  }

  if (!wilaya) {
    alert('Veuillez selectionner votre wilaya.');
    return false;
  }

  return true;
}

// ================================================================
// SOUMISSION
// ================================================================

async function soumettreCommande(e) {
  e.preventDefault();
  if (!valider()) return;

  const btn = document.getElementById('btn-submit');
  btn.disabled    = true;
  btn.textContent = 'Envoi en cours...';

  const prenom   = document.getElementById('champ-prenom').value.trim();
  const nom      = document.getElementById('champ-nom').value.trim();
  const tel      = document.getElementById('champ-telephone').value.trim();
  const wilaya   = document.getElementById('champ-wilaya').value;
  const livraison = getLivraison(wilaya);
  const total     = getPrixFinal() * quantite + livraison;

  const commande = {
    prenom,
    nom,
    telephone:    tel,
    wilaya,
    produit:      PRODUIT.nom || '',
    quantite,
    prix_unitaire: getPrixFinal(),
    livraison,
    total,
    date: new Date().toLocaleDateString('fr-DZ')
  };

  try {
    const res = await fetch('/.netlify/functions/commande', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(commande)
    });

    if (!res.ok) throw new Error('Erreur serveur');

    // Pixel Purchase
    pixel('Purchase', { value: total, num_items: quantite });

    // Afficher confirmation
    document.getElementById('page-principale').style.display  = 'none';
    const confEl = document.getElementById('page-confirmation');
    confEl.style.display = 'flex';
    document.getElementById('conf-prenom').textContent    = prenom;
    document.getElementById('conf-telephone').textContent = tel;

  } catch (err) {
    btn.disabled    = false;
    btn.textContent = 'Valider la commande';
    alert('Une erreur est survenue. Veuillez reessayer.');
  }
}

// ================================================================
// PIXEL HELPER
// ================================================================

function pixel(event, params = {}) {
  if (typeof fbq === 'undefined') return;
  fbq('track', event, {
    currency: 'DZD',
    content_name: PRODUIT.nom || '',
    ...params
  });
}

// ================================================================
// INIT
// ================================================================

document.addEventListener('DOMContentLoaded', chargerDonnees);