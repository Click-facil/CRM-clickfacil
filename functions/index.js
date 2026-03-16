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

// ── Rate limiting ─────────────────────────────────────────────────
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

// ── Variações de busca por nicho ──────────────────────────────────
// Cada variação gera até 20 resultados diferentes do Google Maps
// Quanto mais variações, mais leads únicos encontrados
const VARIACOES_NICHO = {
  'Academias': [
    'Academias de ginástica',
    'Academia fitness',
    'Musculação',
    'CrossFit',
    'Pilates',
  ],
  'Advogados': [
    'Advogados',
    'Escritório de advocacia',
    'Advogado trabalhista',
    'Advogado criminal',
    'Consultoria jurídica',
  ],
  'Arquitetura': [
    'Arquitetura',
    'Escritório de arquitetura',
    'Arquiteto e urbanismo',
    'Projeto arquitetônico',
    'Design de interiores',
  ],
  'Bares e Restaurantes': [
    'Restaurantes',
    'Bares',
    'Lanchonetes',
    'Churrascaria',
    'Pizzaria',
  ],
  'Chaveiros': [
    'Chaveiros',
    'Serviço de chaveiro',
    'Chaveiro 24 horas',
    'Cópia de chave',
    'Fechadura e chave',
  ],
  'Clínicas Médicas': [
    'Clínicas médicas',
    'Clínica de saúde',
    'Consultório médico',
    'Clínica geral',
    'Médico especialista',
  ],
  'Clínicas Odontológicas': [
    'Clínicas odontológicas',
    'Dentista',
    'Implante dentário',
    'Ortodontia',
    'Odontologia estética',
  ],
  'Clínicas de Estética': [
    'Clínicas de estética',
    'Estética facial',
    'Estética corporal',
    'Dermatologista',
    'Tratamento estético',
  ],
  'Consultórios': [
    'Consultórios',
    'Consultório médico',
    'Consultório odontológico',
    'Consultório psicológico',
    'Consultório nutricionista',
  ],
  'Contabilidade': [
    'Contabilidade',
    'Escritório contábil',
    'Contador',
    'Assessoria contábil',
    'Contabilidade empresarial',
  ],
  'Desentupidoras': [
    'Desentupidoras',
    'Desentupimento',
    'Hidráulica desentupimento',
    'Desentupidora 24 horas',
    'Limpeza de fossa',
  ],
  'E-commerce': [
    'E-commerce',
    'Loja virtual',
    'Comércio online',
    'Marketplace',
    'Venda online',
  ],
  'Educação': [
    'Escolas',
    'Cursos profissionalizantes',
    'Faculdade',
    'Centro educacional',
    'Curso técnico',
  ],
  'Empresas de Energia Solar': [
    'Empresas de energia solar',
    'Instalação de painéis solares',
    'Energia fotovoltaica',
    'Placa solar',
    'Engenharia solar',
  ],
  'Engenharia': [
    'Engenharia civil',
    'Construtora',
    'Empresa de engenharia',
    'Projeto estrutural',
    'Engenharia elétrica',
  ],
  'Estética e Beleza': [
    'Salão de beleza',
    'Barbearia',
    'Estética',
    'Spa',
    'Manicure e pedicure',
  ],
  'Estética de Alto Padrão': [
    'Clínica de estética premium',
    'Estética alto padrão',
    'Clínica de beleza',
    'Botox e preenchimento',
    'Harmonização facial',
  ],
  'Farmácias': [
    'Farmácias',
    'Drogarias',
    'Farmácia de manipulação',
    'Farmácia popular',
    'Drogaria popular',
  ],
  'Guinchos': [
    'Guinchos',
    'Guincho 24 horas',
    'Reboque de veículos',
    'Assistência veicular',
    'Guincho e reboque',
  ],
  'Imobiliárias': [
    'Imobiliárias',
    'Corretora de imóveis',
    'Imóveis à venda',
    'Aluguel de imóveis',
    'Corretor de imóveis',
  ],
  'Manutenção de Ar-condicionado': [
    'Manutenção de ar-condicionado',
    'Instalação de ar-condicionado',
    'Refrigeração e climatização',
    'Técnico de ar-condicionado',
    'Ar-condicionado split',
  ],
  'Marketing': [
    'Agência de marketing',
    'Marketing digital',
    'Publicidade e propaganda',
    'Agência de publicidade',
    'Social media',
  ],
  'Oficinas Mecânicas': [
    'Oficinas mecânicas',
    'Mecânica automotiva',
    'Auto center',
    'Funilaria e pintura',
    'Troca de óleo',
  ],
  'Padarias': [
    'Padarias',
    'Confeitaria',
    'Panificadora',
    'Pão artesanal',
    'Café e padaria',
  ],
  'Pet Shops': [
    'Pet shops',
    'Veterinário',
    'Clínica veterinária',
    'Banho e tosa',
    'Petshop e veterinária',
  ],
  'Salões de Beleza': [
    'Salões de beleza',
    'Cabeleireiro',
    'Salão feminino',
    'Coloração e corte',
    'Salão especializado',
  ],
  'Tecnologia': [
    'Empresa de tecnologia',
    'Desenvolvimento de software',
    'TI e informática',
    'Assistência técnica em informática',
    'Suporte técnico',
  ],
  'Outros': [
    'Empresas locais',
    'Serviços locais',
    'Comércio local',
  ],
};

function getVariacoes(nicho) {
  return VARIACOES_NICHO[nicho] || [nicho];
}

// ── Helpers ───────────────────────────────────────────────────────
function sanitizar(str, maxLen = 100) {
  if (typeof str !== 'string') return '';
  return str.trim().slice(0, maxLen).replace(/[<>{}[\]\\]/g, '');
}

function validarInput(nicho, cidade, estado, maxLeads) {
  const erros = [];
  if (!nicho  || nicho.length  < 2) erros.push('nicho inválido');
  if (!cidade || cidade.length < 2) erros.push('cidade inválida');
  if (estado  && !/^[A-Z]{2}$/.test(estado)) erros.push('estado inválido');
  if (isNaN(maxLeads) || maxLeads < 1 || maxLeads > 100) erros.push('maxLeads deve ser 1-100');
  return erros;
}

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

// Busca uma query simples, retorna resultados
async function buscarQuery(query, cidade, estado, apiKey) {
  const q   = encodeURIComponent(`${query} em ${cidade} ${estado} Brasil`);
  const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${q}&language=pt-BR&region=br&key=${apiKey}`;
  const data = await httpsGet(url);
  if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
    console.warn(`  ⚠️ Query "${query}": ${data.status}`);
    return [];
  }
  return data.results || [];
}

// Busca múltiplas variações e deduplica por placeId
async function buscarEmpresas(nicho, cidade, estado, maxLeads, apiKey) {
  const variacoes  = getVariacoes(nicho);
  const vistos     = new Set(); // placeIds já vistos — evita duplicatas entre variações
  const todos      = [];

  console.log(`  🔀 ${variacoes.length} variações de busca para "${nicho}"`);

  for (let v = 0; v < variacoes.length; v++) {
    if (todos.length >= maxLeads) break;

    const variacao = variacoes[v];
    console.log(`  🔎 Variação ${v+1}/${variacoes.length}: "${variacao}"`);

    // Delay entre variações para não sobrecarregar a API
    if (v > 0) await new Promise(r => setTimeout(r, 500));

    const resultados = await buscarQuery(variacao, cidade, estado, apiKey);
    let novosNestaVariacao = 0;

    for (const lugar of resultados) {
      if (!lugar.place_id || vistos.has(lugar.place_id)) continue;
      vistos.add(lugar.place_id);
      todos.push(lugar);
      novosNestaVariacao++;
      if (todos.length >= maxLeads) break;
    }

    console.log(`     → ${resultados.length} resultados, ${novosNestaVariacao} únicos novos (total: ${todos.length})`);
  }

  return todos;
}

async function buscarDetalhes(placeId, apiKey) {
  const fields = 'name,formatted_phone_number,website,url';
  const url    = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${fields}&language=pt-BR&key=${apiKey}`;
  const data   = await httpsGet(url);
  return data.result || {};
}

function analisarSite(site) {
  if (!site) return { quality: 'none' };
  const ruins = ['linktree', 'linktr.ee', 'bio.link', 'beacons.ai', 'sites.google.com'];
  if (ruins.some(r => site.toLowerCase().includes(r))) return { quality: 'poor' };
  return { quality: 'good' };
}

function formatarWhatsApp(tel) {
  if (!tel) return '';
  const num = tel.replace(/\D/g, '');
  if (num.length < 10) return '';
  const semPais = num.startsWith('55') ? num.slice(2) : num;
  return '55' + semPais;
}

function gerarIdDoc(uid, placeId) {
  const hash = crypto.createHash('md5').update(`${uid}_${placeId}`).digest('hex');
  return `lead_${hash}`;
}

// ID legado — para migrar leads antigos criados por nome+cidade
function gerarIdLegado(uid, nome, cidade) {
  const raw  = `${uid}_${nome}_${cidade}`.toLowerCase();
  const hash = crypto.createHash('md5').update(raw).digest('hex');
  return `lead_${hash}`;
}

// ── Handler principal ─────────────────────────────────────────────
exports.buscarLeads = onRequest(
  {
    secrets: [googleMapsKey],
    cors: [
      'https://clickfacilcrmprospect.vercel.app',
      'http://localhost:8080',
      'http://localhost:5173',
    ],
    invoker:        'public',
    timeoutSeconds: 540,
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

      if (!idToken) return res.status(401).json({ error: 'Token obrigatório' });

      let uid, email;
      try {
        const decoded = await admin.auth().verifyIdToken(idToken, true);
        uid   = decoded.uid;
        email = decoded.email;
      } catch (e) {
        return res.status(401).json({ error: 'Token inválido. Faça login novamente.' });
      }

      if (!checkRateLimit(uid)) {
        return res.status(429).json({ error: 'Limite de buscas atingido. Aguarde 1 hora.' });
      }

      const nicho    = sanitizar(nichoRaw);
      const cidade   = sanitizar(cidadeRaw);
      const estado   = sanitizar(estadoRaw, 2).toUpperCase();
      const maxLeads = Math.min(Math.max(parseInt(maxLeadsRaw) || 20, 1), 100);

      const erros = validarInput(nicho, cidade, estado, maxLeads);
      if (erros.length > 0) return res.status(400).json({ error: `Input inválido: ${erros.join(', ')}` });

      const apiKey = googleMapsKey.value();
      if (!apiKey) return res.status(500).json({ error: 'Configuração incompleta' });

      console.log(`🔍 [${email}] "${nicho}" em "${cidade}, ${estado}" max:${maxLeads}`);

      const lugares = await buscarEmpresas(nicho, cidade, estado, maxLeads, apiKey);
      const meta    = lugares.length;
      console.log(`📍 ${meta} lugares únicos encontrados, salvando...`);

      if (meta === 0) {
        return res.status(200).json({
          success: true, total: 0, novos: 0, atualizados: 0,
          message: `Nenhuma empresa encontrada para "${nicho}" em "${cidade}". Tente outro nicho ou cidade.`,
        });
      }

      const db = admin.firestore();
      let novos = 0;
      let atualizados = 0;

      for (let i = 0; i < meta; i++) {
        const lugar = lugares[i];
        if (!lugar.name || !lugar.place_id) continue;

        try {
          const detalhes    = await buscarDetalhes(lugar.place_id, apiKey);
          const wpp         = formatarWhatsApp(detalhes.formatted_phone_number || '');
          const { quality } = analisarSite(detalhes.website);

          const idNovo   = gerarIdDoc(uid, lugar.place_id);
          const idLegado = gerarIdLegado(uid, lugar.name, cidade);

          const docRefNovo   = db.collection('leads').doc(idNovo);
          const docRefLegado = db.collection('leads').doc(idLegado);

          const [snapNovo, snapLegado] = await Promise.all([
            docRefNovo.get(),
            docRefLegado.get(),
          ]);

          const dadosContato = {
            phone:          detalhes.formatted_phone_number || '',
            whatsapp:       wpp,
            linkWhatsApp:   wpp ? `https://wa.me/${wpp}` : '',
            website:        detalhes.website || '',
            googleMaps:     detalhes.url || lugar.url || '',
            websiteQuality: quality,
            updatedAt:      admin.firestore.FieldValue.serverTimestamp(),
          };

          if (snapNovo.exists) {
            await docRefNovo.update(dadosContato);
            atualizados++;
            console.log(`  🔄 [${i+1}/${meta}] Já existe: ${lugar.name}`);

          } else if (snapLegado.exists) {
            // Migra lead legado para novo ID, preserva stage/notas/valor
            const dadosLegado = snapLegado.data();
            await docRefNovo.set({
              ...dadosLegado,
              ...dadosContato,
              stage: dadosLegado.stage || 'new',
              notes: dadosLegado.notes || '',
              valor: dadosLegado.valor || 0,
            });
            await docRefLegado.delete();
            atualizados++;
            console.log(`  🔀 [${i+1}/${meta}] Migrado: ${lugar.name}`);

          } else {
            await docRefNovo.set({
              userId:         uid,
              companyName:    lugar.name,
              niche:          nicho,
              territory:      cidade,
              ...dadosContato,
              instagram:      '',
              stage:          'new',
              source:         'google_maps_api',
              notes:          '',
              contactName:    '',
              email:          '',
              valor:          0,
              createdAt:      admin.firestore.FieldValue.serverTimestamp(),
            });
            novos++;
            console.log(`  ✅ [${i+1}/${meta}] Criado: ${lugar.name}`);
          }

          if (i < meta - 1) await new Promise(r => setTimeout(r, 150));

        } catch (e) {
          console.error(`  ❌ [${i+1}] ${lugar.name}: ${e.message}`);
        }
      }

      console.log(`🎉 [${email}] ${novos} novos, ${atualizados} já existiam/migrados`);

      let message;
      if (novos === 0 && atualizados > 0) {
        message = `Todos os leads de "${nicho}" em "${cidade}" já estão no seu CRM. Tente outra cidade.`;
      } else if (novos > 0 && atualizados > 0) {
        message = `${novos} novos leads adicionados! (${atualizados} já existiam no CRM)`;
      } else {
        message = `${novos} novos leads de "${nicho}" em "${cidade}" adicionados ao pipeline!`;
      }

      return res.status(200).json({
        success: true, total: novos + atualizados, novos, atualizados, message,
      });

    } catch (error) {
      console.error('❌ Erro geral:', error.message);
      return res.status(500).json({ error: 'Erro interno. Tente novamente.' });
    }
  }
);