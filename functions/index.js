// functions/index.js — Firebase Cloud Function v2 — PRODUÇÃO SEGURA

const { onRequest } = require('firebase-functions/v2/https');
const { defineSecret } = require('firebase-functions/params');
const { setGlobalOptions } = require('firebase-functions/v2');
const admin = require('firebase-admin');
const https = require('https');
const crypto = require('crypto');

admin.initializeApp();
setGlobalOptions({ region: 'us-central1' });

const googleMapsKey = defineSecret('GOOGLE_MAPS_API_KEY');

// ── Rate limiting ────────────────────────────────────────────────
const rateLimitMap = new Map();
const RATE_LIMIT_MAX    = 10;
const RATE_LIMIT_WINDOW = 60 * 60 * 1000;

function checkRateLimit(uid) {
  const now   = Date.now();
  const entry = rateLimitMap.get(uid);
  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW) {
    rateLimitMap.set(uid, { count: 1, windowStart: now });
    return true;
  }
  if (entry.count >= RATE_LIMIT_MAX) return false;
  entry.count++;
  return true;
}

// ── Sanitização ──────────────────────────────────────────────────
function sanitizar(str, maxLen = 100) {
  if (typeof str !== 'string') return '';
  return str.trim().slice(0, maxLen).replace(/[<>{}[\]\\]/g, '');
}

function validarInput(nicho, cidade, estado, maxLeads) {
  const erros = [];
  if (!nicho  || nicho.length  < 2) erros.push('nicho inválido');
  if (!cidade || cidade.length < 2) erros.push('cidade inválida');
  if (estado  && !/^[A-Z]{2}$/.test(estado)) erros.push('estado inválido');
  if (isNaN(maxLeads) || maxLeads < 1 || maxLeads > 20) erros.push('maxLeads deve ser 1-20');
  return erros;
}

// ── HTTP helper ──────────────────────────────────────────────────
function httpsGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error('Resposta inválida da API')); }
      });
    }).on('error', reject);
  });
}

// ── Google Maps ──────────────────────────────────────────────────
async function buscarEmpresas(nicho, cidade, estado, apiKey) {
  const query = encodeURIComponent(`${nicho} em ${cidade} ${estado} Brasil`);
  const url   = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${query}&language=pt-BR&region=br&key=${apiKey}`;
  const data  = await httpsGet(url);
  if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
    throw new Error(`Google Places erro: ${data.status} — ${data.error_message || ''}`);
  }
  return data.results || [];
}

async function buscarDetalhes(placeId, apiKey) {
  const fields = 'name,formatted_phone_number,website,url';
  const url    = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${fields}&language=pt-BR&key=${apiKey}`;
  const data   = await httpsGet(url);
  return data.result || {};
}

// ── Helpers ──────────────────────────────────────────────────────
function analisarSite(site) {
  if (!site) return { quality: 'none' };
  const ruins = ['linktree', 'linktr.ee', 'bio.link', 'beacons.ai', 'sites.google.com'];
  if (ruins.some(r => site.toLowerCase().includes(r))) return { quality: 'poor' };
  return { quality: 'good' };
}

function formatarWhatsApp(tel) {
  if (!tel) return '';
  const num    = tel.replace(/\D/g, '');
  if (num.length < 10) return '';
  const semPais = num.startsWith('55') ? num.slice(2) : num;
  return '55' + semPais;
}

// ── Gera ID curto e único por usuário + empresa + cidade ─────────
// Usa hash MD5 para garantir comprimento fixo e sem caracteres inválidos
function gerarIdDoc(uid, nomeEmpresa, cidade) {
  const raw  = `${uid}_${nomeEmpresa}_${cidade}`.toLowerCase();
  const hash = crypto.createHash('md5').update(raw).digest('hex');
  return `lead_${hash}`; // ex: lead_a1b2c3d4e5f6...  (sempre 37 chars)
}

// ── Handler ──────────────────────────────────────────────────────
exports.buscarLeads = onRequest(
  {
    secrets: [googleMapsKey],
    cors: [
      'https://clickfacilcrmprospect.vercel.app',
      'http://localhost:8080',
      'http://localhost:5173',
    ],
    invoker:        'public',
    timeoutSeconds: 120,
    memory:         '256MiB',
  },
  async (req, res) => {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Método não permitido' });
    }

    try {
      const {
        nicho:    nichoRaw,
        cidade:   cidadeRaw,
        estado:   estadoRaw  = 'PA',
        maxLeads: maxLeadsRaw = 20,
        idToken,
      } = req.body;

      // 1. Token primeiro
      if (!idToken) return res.status(401).json({ error: 'Token obrigatório' });

      let uid, email;
      try {
        const decoded = await admin.auth().verifyIdToken(idToken, true);
        uid   = decoded.uid;
        email = decoded.email;
      } catch (e) {
        return res.status(401).json({ error: 'Token inválido. Faça login novamente.' });
      }

      // 2. Rate limit
      if (!checkRateLimit(uid)) {
        return res.status(429).json({ error: 'Limite de buscas atingido. Aguarde 1 hora.' });
      }

      // 3. Sanitizar + validar
      const nicho    = sanitizar(nichoRaw);
      const cidade   = sanitizar(cidadeRaw);
      const estado   = sanitizar(estadoRaw, 2).toUpperCase();
      const maxLeads = Math.min(Math.max(parseInt(maxLeadsRaw) || 10, 1), 20);

      const erros = validarInput(nicho, cidade, estado, maxLeads);
      if (erros.length > 0) return res.status(400).json({ error: `Input inválido: ${erros.join(', ')}` });

      // 4. API Key
      const apiKey = googleMapsKey.value();
      if (!apiKey) return res.status(500).json({ error: 'Configuração incompleta' });

      console.log(`🔍 [${email}] "${nicho}" em "${cidade}, ${estado}" max:${maxLeads}`);

      // 5. Buscar
      const lugares = await buscarEmpresas(nicho, cidade, estado, apiKey);
      const meta    = Math.min(maxLeads, lugares.length);
      console.log(`📍 ${lugares.length} resultados, processando ${meta}`);

      // 6. Salvar
      const db     = admin.firestore();
      const salvos = [];

      for (let i = 0; i < meta; i++) {
        const lugar = lugares[i];
        if (!lugar.name) {
          console.warn(`  ⚠️ [${i+1}] Sem nome, pulando`);
          continue;
        }

        try {
          const detalhes = await buscarDetalhes(lugar.place_id, apiKey);
          const wpp      = formatarWhatsApp(detalhes.formatted_phone_number || '');
          const { quality } = analisarSite(detalhes.website);

          // ID único e estável por usuário + empresa + cidade (hash MD5, sempre válido)
          const idDoc = gerarIdDoc(uid, lugar.name, cidade);

          const leadData = {
            userId:         uid,
            companyName:    lugar.name,          // garante que nunca é vazio
            niche:          nicho,
            territory:      cidade,
            phone:          detalhes.formatted_phone_number || '',
            whatsapp:       wpp,
            linkWhatsApp:   wpp ? `https://wa.me/${wpp}` : '',
            website:        detalhes.website || '',
            googleMaps:     detalhes.url || lugar.url || '',
            instagram:      '',
            stage:          'new',
            source:         'google_maps_api',
            websiteQuality: quality,
            notes:          quality !== 'good' ? 'Oportunidade' : '',
            contactName:    '',
            email:          '',
            valor:          0,
            updatedAt:      admin.firestore.FieldValue.serverTimestamp(),
          };

          // set com merge — preserva dados existentes (stage, notes editadas, etc.)
          // mas NÃO sobrescreve companyName se já existe
          const docRef = db.collection('leads').doc(idDoc);
          const docSnap = await docRef.get();

          if (docSnap.exists) {
            // Lead já existe — só atualiza campos de contato, preserva stage e anotações
            await docRef.update({
              phone:          leadData.phone,
              whatsapp:       leadData.whatsapp,
              linkWhatsApp:   leadData.linkWhatsApp,
              website:        leadData.website,
              googleMaps:     leadData.googleMaps,
              websiteQuality: leadData.websiteQuality,
              updatedAt:      admin.firestore.FieldValue.serverTimestamp(),
            });
            console.log(`  🔄 [${i+1}/${meta}] Atualizado: ${lugar.name}`);
          } else {
            // Lead novo — cria com todos os campos
            await docRef.set({
              ...leadData,
              createdAt: admin.firestore.FieldValue.serverTimestamp(),
            });
            console.log(`  ✅ [${i+1}/${meta}] Criado: ${lugar.name}`);
          }

          salvos.push(lugar.name);
          if (i < meta - 1) await new Promise(r => setTimeout(r, 150));

        } catch (e) {
          console.error(`  ❌ [${i+1}] ${lugar.name}: ${e.message}`);
        }
      }

      console.log(`🎉 [${email}] ${salvos.length} leads processados`);
      return res.status(200).json({
        success: true,
        total:   salvos.length,
        message: `${salvos.length} leads de "${nicho}" em "${cidade}" adicionados ao seu pipeline!`,
      });

    } catch (error) {
      console.error('❌ Erro geral:', error.message);
      return res.status(500).json({ error: 'Erro interno. Tente novamente.' });
    }
  }
);