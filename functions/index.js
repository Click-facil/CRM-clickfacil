// functions/index.js — Firebase Cloud Function v2

const { onRequest } = require('firebase-functions/v2/https');
const { defineSecret } = require('firebase-functions/params');
const { setGlobalOptions } = require('firebase-functions/v2');
const admin = require('firebase-admin');
const https = require('https');

admin.initializeApp();
setGlobalOptions({ region: 'us-central1' });

const googleMapsKey = defineSecret('GOOGLE_MAPS_API_KEY');

const ALLOWED_ORIGINS = [
  'https://clickfacilcrmprospect.vercel.app',
  'http://localhost:8080',
  'http://localhost:5173',
];

function setCors(req, res) {
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '3600');
}

function httpsGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error('Resposta inválida')); }
      });
    }).on('error', reject);
  });
}

async function buscarEmpresas(nicho, cidade, estado, apiKey) {
  const query = encodeURIComponent(`${nicho} em ${cidade} ${estado} Brasil`);
  const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${query}&language=pt-BR&region=br&key=${apiKey}`;
  const data = await httpsGet(url);
  if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
    throw new Error(`Google Places erro: ${data.status} — ${data.error_message || ''}`);
  }
  return data.results || [];
}

async function buscarDetalhes(placeId, apiKey) {
  const fields = 'name,formatted_phone_number,website,url,rating,formatted_address';
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${fields}&language=pt-BR&key=${apiKey}`;
  const data = await httpsGet(url);
  return data.result || {};
}

function analisarSite(site) {
  if (!site) return { quality: 'none', oportunidade: true };
  const ruins = ['linktree', 'linktr.ee', 'bio.link', 'beacons.ai', 'sites.google.com'];
  if (ruins.some(r => site.toLowerCase().includes(r))) {
    return { quality: 'poor', oportunidade: true };
  }
  return { quality: 'good', oportunidade: false };
}

function formatarWhatsApp(tel) {
  if (!tel) return '';
  const num = tel.replace(/\D/g, '');
  if (num.length < 10) return '';
  const semPais = num.startsWith('55') ? num.slice(2) : num;
  return '55' + semPais;
}

exports.buscarLeads = onRequest(
  { cors: false, secrets: [googleMapsKey] },
  async (req, res) => {
    setCors(req, res);
    if (req.method === 'OPTIONS') return res.status(204).send('');
    if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });

    try {
      const { nicho, cidade, estado = 'PA', maxLeads = 20, idToken } = req.body;

      if (!nicho || !cidade) return res.status(400).json({ error: 'nicho e cidade são obrigatórios' });
      if (!idToken)          return res.status(401).json({ error: 'Token obrigatório' });

      // Verificar usuário
      let uid;
      try {
        const decoded = await admin.auth().verifyIdToken(idToken);
        uid = decoded.uid;
        console.log(`✅ uid: ${uid.slice(0, 12)}...`);
      } catch {
        return res.status(401).json({ error: 'Token inválido. Faça login novamente.' });
      }

      const apiKey = googleMapsKey.value();
      if (!apiKey) return res.status(500).json({ error: 'API Key não configurada' });

      console.log(`🔍 "${nicho}" em "${cidade}, ${estado}"`);
      const lugares = await buscarEmpresas(nicho, cidade, estado, apiKey);
      const meta = Math.min(Number(maxLeads), lugares.length, 20);
      console.log(`📍 ${lugares.length} resultados, processando ${meta}`);

      const db = admin.firestore();
      const salvos = [];

      for (let i = 0; i < meta; i++) {
        const lugar = lugares[i];
        try {
          const detalhes = await buscarDetalhes(lugar.place_id, apiKey);
          const wpp = formatarWhatsApp(detalhes.formatted_phone_number || '');
          const { quality, oportunidade } = analisarSite(detalhes.website);

          const idDoc = (lugar.name + '_' + cidade + '_' + uid.slice(0, 8))
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '_')
            .replace(/_+/g, '_')
            .slice(0, 120);

          await db.collection('leads').doc(idDoc).set({
            userId:         uid,
            companyName:    lugar.name || '',
            niche:          nicho,
            territory:      cidade,
            phone:          detalhes.formatted_phone_number || '',
            whatsapp:       wpp,
            linkWhatsApp:   wpp ? `https://wa.me/${wpp}` : '',
            website:        detalhes.website || '',
            googleMaps:     detalhes.url || '',
            instagram:      '',
            stage:          'new',
            source:         'google_maps_api',
            websiteQuality: quality,
            notes:          oportunidade ? 'Oportunidade' : '',
            contactName:    '',
            email:          '',
            valor:          0,
            createdAt:      admin.firestore.FieldValue.serverTimestamp(),
            updatedAt:      admin.firestore.FieldValue.serverTimestamp(),
          }, { merge: true });

          salvos.push(lugar.name);
          console.log(`  ✅ [${i+1}/${meta}] ${lugar.name}`);
          if (i < meta - 1) await new Promise(r => setTimeout(r, 150));
        } catch (e) {
          console.error(`  ❌ [${i+1}] ${lugar.name}: ${e.message}`);
        }
      }

      console.log(`🎉 ${salvos.length} leads salvos`);
      return res.status(200).json({
        success: true,
        total: salvos.length,
        message: `${salvos.length} leads de "${nicho}" em "${cidade}" adicionados ao seu pipeline!`,
      });

    } catch (error) {
      console.error('❌ Erro:', error);
      return res.status(500).json({ error: error.message || 'Erro interno' });
    }
  }
);