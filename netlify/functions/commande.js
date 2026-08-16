// ═══════════════════════════════════════
// NETLIFY FUNCTION — INVISIBLE DANS F12
// Clés API stockées ici, jamais exposées
// ═══════════════════════════════════════

exports.handler = async function(event, context) {

  // Seulement les requêtes POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Méthode non autorisée' })
    };
  }

  try {
    const commande = JSON.parse(event.body);

    // ═══════════════════════════════════
    // ENVOI VERS GOOGLE SHEETS
    // ═══════════════════════════════════
    const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL;

    if (GOOGLE_SCRIPT_URL) {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(commande)
      });
    }

    // ═══════════════════════════════════
    // ENVOI EMAIL VIA EMAILJS
    // ═══════════════════════════════════
    const EMAILJS_SERVICE_ID  = process.env.EMAILJS_SERVICE_ID;
    const EMAILJS_TEMPLATE_ID = process.env.EMAILJS_TEMPLATE_ID;
    const EMAILJS_PRIVATE_KEY = process.env.EMAILJS_PRIVATE_KEY;

    if (EMAILJS_SERVICE_ID && EMAILJS_TEMPLATE_ID && EMAILJS_PRIVATE_KEY) {
      await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_id:  EMAILJS_SERVICE_ID,
          template_id: EMAILJS_TEMPLATE_ID,
          user_id:     EMAILJS_PRIVATE_KEY,
          template_params: {
            nom:          commande.nom,
            telephone:    commande.telephone,
            wilaya:       commande.wilaya,
            adresse:      commande.adresse || '—',
            produit:      commande.produit,
            quantite:     commande.quantite,
            total:        commande.total + ' DA',
            date:         commande.date
          }
        })
      });
    }

    // ═══════════════════════════════════
    // SUCCÈS
    // ═══════════════════════════════════
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message: 'Commande reçue avec succès ✅' })
    };

  } catch (err) {
    console.error('Erreur commande:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Erreur serveur' })
    };
  }
};