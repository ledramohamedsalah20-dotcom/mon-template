// ═══════════════════════════════════════
// CHARGEMENT DES DONNÉES DEPUIS settings.json
// ═══════════════════════════════════════

let SETTINGS = {};
let PRODUIT = {};
let quantite = 1;

async function chargerSettings() {
  try {
    const res = await fetch('/content/settings.json');
    SETTINGS = await res.json();
    appliquerSettings();
  } catch (e) {
    console.log('settings.json non trouvé, valeurs par défaut');
  }
}

async function chargerProduit() {
  try {
    const res = await fetch('/content/produits/produit-1.json');
    PRODUIT = await res.json();
    appliquerProduit();
  } catch (e) {
    console.log('produit-1.json non trouvé, valeurs par défaut');
  }
}

// ═══════════════════════════════════════
// APPLIQUER SETTINGS AU SITE
// ═══════════════════════════════════════

function appliquerSettings() {

  // Pixel ID
  if (SETTINGS.pixel_id) {
    window.PIXEL_ID = SETTINGS.pixel_id;
    fbq('init', SETTINGS.pixel_id);
  }

  // Couleur principale
  if (SETTINGS.couleur_principale) {
    document.documentElement.style.setProperty(
      '--couleur-principale', SETTINGS.couleur_principale
    );
  }

  // Couleur secondaire
  if (SETTINGS.couleur_secondaire) {
    document.documentElement.style.setProperty(
      '--couleur-secondaire', SETTINGS.couleur_secondaire
    );
  }

  // Logo
  if (SETTINGS.logo) {
    const logo = document.getElementById('site-logo');
    logo.src = SETTINGS.logo;
    logo.classList.remove('hidden');
  }

  // Nom du site
  if (SETTINGS.nom_site) {
    document.getElementById('site-nom').textContent = SETTINGS.nom_site;
    document.getElementById('site-title').textContent = SETTINGS.nom_site;
  }

  // Bannière
  if (SETTINGS.banniere_active && SETTINGS.banniere_texte) {
    const banniere = document.getElementById('banniere');
    document.getElementById('banniere-texte').textContent = SETTINGS.banniere_texte;
    banniere.classList.remove('hidden');
  }

  // Footer
  if (SETTINGS.footer_texte) {
    document.getElementById('footer-texte').textContent = SETTINGS.footer_texte;
  }

  // Wilayas + tarifs livraison
  chargerWilayas();
}

// ═══════════════════════════════════════
// APPLIQUER PRODUIT AU SITE
// ═══════════════════════════════════════

function appliquerProduit() {

  // Nom
  if (PRODUIT.nom) {
    document.getElementById('produit-nom').textContent = PRODUIT.nom;
    document.getElementById('recap-produit').textContent = PRODUIT.nom;
  }

  // Description
  if (PRODUIT.description) {
    document.getElementById('produit-description').textContent = PRODUIT.description;
  }

  // Prix
  if (PRODUIT.prix) {
    document.getElementById('produit-prix').textContent = PRODUIT.prix + ' DA';
  }

  // Prix promo
  if (PRODUIT.prix_promo) {
    const el = document.getElementById('produit-prix-promo');
    el.textContent = PRODUIT.prix + ' DA';
    document.getElementById('produit-prix').textContent = PRODUIT.prix_promo + ' DA';
    el.classList.remove('hidden');
  }

  // Badge
  if (PRODUIT.badge) {
    const badge = document.getElementById('produit-badge');
    badge.textContent = PRODUIT.badge;
    badge.classList.remove('hidden');
  }

  // Image principale
  if (PRODUIT.images && PRODUIT.images.length > 0) {
    document.getElementById('produit-image-principale').src = PRODUIT.images[0];

    // Galerie
    const galerie = document.getElementById('galerie');
    PRODUIT.images.forEach((img, index) => {
      const el = document.createElement('img');
      el.src = img;
      el.alt = 'Photo ' + (index + 1);
      if (index === 0) el.classList.add('active');
      el.onclick = () => {
        document.getElementById('produit-image-principale').src = img;
        document.querySelectorAll('.galerie img').forEach(i => i.classList.remove('active'));
        el.classList.add('active');
      };
      galerie.appendChild(el);
    });
  }

  // Recap
  mettreAJourRecap();
}

// ═══════════════════════════════════════
// 58 WILAYAS D'ALGÉRIE
// ═══════════════════════════════════════

const WILAYAS = [
  { code: '01', nom: 'Adrar' },
  { code: '02', nom: 'Chlef' },
  { code: '03', nom: 'Laghouat' },
  { code: '04', nom: 'Oum El Bouaghi' },
  { code: '05', nom: 'Batna' },
  { code: '06', nom: 'Béjaïa' },
  { code: '07', nom: 'Biskra' },
  { code: '08', nom: 'Béchar' },
  { code: '09', nom: 'Blida' },
  { code: '10', nom: 'Bouira' },
  { code: '11', nom: 'Tamanrasset' },
  { code: '12', nom: 'Tébessa' },
  { code: '13', nom: 'Tlemcen' },
  { code: '14', nom: 'Tiaret' },
  { code: '15', nom: 'Tizi Ouzou' },
  { code: '16', nom: 'Alger' },
  { code: '17', nom: 'Djelfa' },
  { code: '18', nom: 'Jijel' },
  { code: '19', nom: 'Sétif' },
  { code: '20', nom: 'Saïda' },
  { code: '21', nom: 'Skikda' },
  { code: '22', nom: 'Sidi Bel Abbès' },
  { code: '23', nom: 'Annaba' },
  { code: '24', nom: 'Guelma' },
  { code: '25', nom: 'Constantine' },
  { code: '26', nom: 'Médéa' },
  { code: '27', nom: 'Mostaganem' },
  { code: '28', nom: 'M\'Sila' },
  { code: '29', nom: 'Mascara' },
  { code: '30', nom: 'Ouargla' },
  { code: '31', nom: 'Oran' },
  { code: '32', nom: 'El Bayadh' },
  { code: '33', nom: 'Illizi' },
  { code: '34', nom: 'Bordj Bou Arréridj' },
  { code: '35', nom: 'Boumerdès' },
  { code: '36', nom: 'El Tarf' },
  { code: '37', nom: 'Tindouf' },
  { code: '38', nom: 'Tissemsilt' },
  { code: '39', nom: 'El Oued' },
  { code: '40', nom: 'Khenchela' },
  { code: '41', nom: 'Souk Ahras' },
  { code: '42', nom: 'Tipaza' },
  { code: '43', nom: 'Mila' },
  { code: '44', nom: 'Aïn Defla' },
  { code: '45', nom: 'Naâma' },
  { code: '46', nom: 'Aïn Témouchent' },
  { code: '47', nom: 'Ghardaïa' },
  { code: '48', nom: 'Relizane' },
  { code: '49', nom: 'Timimoun' },
  { code: '50', nom: 'Bordj Badji Mokhtar' },
  { code: '51', nom: 'Ouled Djellal' },
  { code: '52', nom: 'Béni Abbès' },
  { code: '53', nom: 'In Salah' },
  { code: '54', nom: 'In Guezzam' },
  { code: '55', nom: 'Touggourt' },
  { code: '56', nom: 'Djanet' },
  { code: '57', nom: 'El M\'Ghair' },
  { code: '58', nom: 'El Meniaa' }
];

function chargerWilayas() {
  const select = document.getElementById('wilaya');
  WILAYAS.forEach(w => {
    const option = document.createElement('option');
    option.value = w.nom;
    option.textContent = w.code + ' — ' + w.nom;
    select.appendChild(option);
  });

  // Mettre à jour livraison quand wilaya change
  select.addEventListener('change', mettreAJourRecap);
}

// ═══════════════════════════════════════
// QUANTITÉ
// ═══════════════════════════════════════

function changerQty(delta) {
  quantite = Math.max(1, quantite + delta);
  document.getElementById('quantite').textContent = quantite;
  document.getElementById('recap-qty').textContent = quantite;
  mettreAJourRecap();

  // Pixel — si qty > 1 on track
  if (typeof fbq !== 'undefined') {
    fbq('track', 'AddToCart', {
      value: getPrixFinal() * quantite,
      currency: 'DZD'
    });
  }
}

// ═══════════════════════════════════════
// RECAP COMMANDE
// ═══════════════════════════════════════

function getPrixFinal() {
  if (PRODUIT.prix_promo) return parseInt(PRODUIT.prix_promo);
  if (PRODUIT.prix) return parseInt(PRODUIT.prix);
  return 0;
}

function getLivraison(wilaya) {
  if (!SETTINGS.tarifs_livraison) return 0;
  return SETTINGS.tarifs_livraison[wilaya] || SETTINGS.tarifs_livraison['defaut'] || 0;
}

function mettreAJourRecap() {
  const wilaya = document.getElementById('wilaya')?.value || '';
  const livraison = getLivraison(wilaya);
  const prixUnitaire = getPrixFinal();
  const total = (prixUnitaire * quantite) + livraison;

  document.getElementById('recap-qty').textContent = quantite;
  document.getElementById('recap-livraison').textContent = livraison === 0 ? 'Gratuite 🎉' : livraison + ' DA';
  document.getElementById('recap-total').textContent = total + ' DA';

  // Pixel InitiateCheckout
  if (wilaya && typeof fbq !== 'undefined') {
    fbq('track', 'InitiateCheckout', {
      value: total,
      currency: 'DZD',
      num_items: quantite
    });
  }
}

// ═══════════════════════════════════════
// SCROLL VERS FORMULAIRE
// ═══════════════════════════════════════

function scrollFormulaire() {
  document.getElementById('formulaire-section').scrollIntoView({
    behavior: 'smooth'
  });

  // Pixel ViewContent
  if (typeof fbq !== 'undefined') {
    fbq('track', 'ViewContent', {
      value: getPrixFinal(),
      currency: 'DZD',
      content_name: PRODUIT.nom || 'Produit'
    });
  }
}

// ═══════════════════════════════════════
// VALIDATION FORMULAIRE
// ═══════════════════════════════════════

function validerFormulaire() {
  const nom = document.getElementById('nom').value.trim();
  const tel = document.getElementById('telephone').value.trim();
  const wilaya = document.getElementById('wilaya').value;
  const honeypot = document.querySelector('.honeypot').value;

  // Anti-bot
  if (honeypot) return false;

  if (!nom || nom.length < 3) {
    alert('Veuillez entrer votre nom complet.');
    return false;
  }

  if (!tel || !/^(05|06|07)[0-9]{8}$/.test(tel)) {
    alert('Numéro de téléphone invalide. Format : 05XXXXXXXX');
    return false;
  }

  if (!wilaya) {
    alert('Veuillez sélectionner votre wilaya.');
    return false;
  }

  return true;
}

// ═══════════════════════════════════════
// SOUMISSION COMMANDE
// ═══════════════════════════════════════

async function soumettreCommande(event) {
  event.preventDefault();

  if (!validerFormulaire()) return;

  const btn = document.querySelector('.btn-submit');
  btn.disabled = true;
  btn.textContent = '⏳ Envoi en cours...';

  const nom = document.getElementById('nom').value.trim();
  const tel = document.getElementById('telephone').value.trim();
  const wilaya = document.getElementById('wilaya').value;
  const adresse = document.getElementById('adresse').value.trim();
  const livraison = getLivraison(wilaya);
  const total = (getPrixFinal() * quantite) + livraison;

  const commande = {
    nom,
    telephone: tel,
    wilaya,
    adresse,
    produit: PRODUIT.nom || 'Produit',
    quantite,
    prix_unitaire: getPrixFinal(),
    livraison,
    total,
    date: new Date().toLocaleDateString('fr-DZ')
  };

  try {
    // Envoi vers Netlify Function (clés cachées)
    const res = await fetch('/.netlify/functions/commande', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(commande)
    });

    if (res.ok) {
      // Pixel Purchase ✅
      if (typeof fbq !== 'undefined') {
        fbq('track', 'Purchase', {
          value: total,
          currency: 'DZD',
          num_items: quantite,
          content_name: PRODUIT.nom || 'Produit'
        });
      }

      // Afficher confirmation
      document.getElementById('formulaire').classList.add('hidden');
      document.getElementById('confirmation').classList.remove('hidden');
      document.getElementById('conf-nom').textContent = nom;

      // Scroll confirmation
      document.getElementById('confirmation').scrollIntoView({
        behavior: 'smooth'
      });

    } else {
      throw new Error('Erreur serveur');
    }

  } catch (err) {
    btn.disabled = false;
    btn.textContent = '✅ Confirmer ma commande';
    alert('Une erreur est survenue. Veuillez réessayer.');
  }
}

// ═══════════════════════════════════════
// INITIALISATION
// ═══════════════════════════════════════

document.addEventListener('DOMContentLoaded', async () => {
  await chargerSettings();
  await chargerProduit();
});