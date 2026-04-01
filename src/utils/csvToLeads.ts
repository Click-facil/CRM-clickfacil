// src/utils/csvToLeads.ts

import { Lead, LEAD_STAGES, WebsiteQuality } from '@/types/lead';

// Mesma lógica do LeadCard e LeadModal — redes sociais = poor
const analisarQualidadeSite = (site: string): WebsiteQuality => {
  if (!site || site === 'SEM SITE' || site.toLowerCase().includes('sem site')) return 'none';

  const lower = site.toLowerCase();

  const redesSociais = [
    'instagram.com', 'facebook.com', 'fb.com', 'tiktok.com',
    'twitter.com', 'x.com', 'linkedin.com', 'youtube.com',
    'wa.me', 'whatsapp',
  ];
  if (redesSociais.some(r => lower.includes(r))) return 'poor';

  const ruins = [
    'linktree', 'linktr.ee', 'bio.link', 'meulink.com',
    'beacons.ai', 'sites.google.com', 'lojalocal.com',
    'wixsite.com', 'blogspot.com',
  ];
  if (ruins.some(r => lower.includes(r))) return 'poor';

  return 'good';
};

const limparWhatsApp = (whatsapp: string): { limpo: string; link: string } => {
  if (!whatsapp || whatsapp === 'Não encontrado') return { limpo: '', link: '' };
  let limpo = whatsapp.replace(/\D/g, '');
  if (limpo && !limpo.startsWith('55')) limpo = '55' + limpo;
  if (limpo.length < 12) return { limpo: '', link: '' };
  return { limpo, link: `https://wa.me/${limpo}` };
};

const parseCsvLine = (line: string): string[] => {
  const valores: string[] = [];
  let valorAtual = '';
  let dentroDeAspas = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') { dentroDeAspas = !dentroDeAspas; }
    else if (char === ',' && !dentroDeAspas) { valores.push(valorAtual.trim()); valorAtual = ''; }
    else { valorAtual += char; }
  }
  valores.push(valorAtual.trim());
  return valores;
};

// Normaliza nome para comparação — remove acentos, lowercase, espaços extras
export const normalizarNome = (nome: string): string =>
  nome.trim().toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ');

const csvLineToLead = (linha: string, headers: string[], linhaNumero: number): Lead | null => {
  try {
    const valores = parseCsvLine(linha);
    const row: Record<string, string> = {};
    headers.forEach((header, i) => { row[header] = valores[i] || ''; });

    const empresa = row.Empresa || row.empresa || row.Company || row.company || '';
    if (!empresa.trim()) {
      console.warn(`⚠️ Linha ${linhaNumero} ignorada: sem nome de empresa`);
      return null;
    }

    const site            = row.Site || row.site || row.Website || row.website || '';
    const whatsappRaw     = row.WhatsApp || row.whatsapp || row.Phone || row.phone || '';
    const instagram       = row.Instagram || row.instagram || '';
    const googleMaps      = row.Google_Maps || row.google_maps || row.GoogleMaps || '';
    const nicho           = row.Nicho || row.nicho || row.Niche || row.niche || 'Outros';
    const territory       = row.Cidade || row.cidade || row.Territory || row.territory || '';

    const { limpo: whatsappLimpo, link: linkWhatsApp } = limparWhatsApp(whatsappRaw);
    const websiteQuality  = analisarQualidadeSite(site);

    return {
      id:           `csv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      companyName:  empresa.trim(),
      niche:        nicho,
      territory,
      contactName:  '',
      email:        '',
      phone:        whatsappRaw !== 'Não encontrado' ? whatsappRaw : '',
      whatsapp:     whatsappLimpo,
      instagram:    instagram !== 'Não encontrado' ? instagram : '',
      facebook:     '',
      linkedin:     '',
      website:      site,
      googleMaps,
      linkWhatsApp,
      stage:        LEAD_STAGES.NEW,
      source:       'scraper',
      websiteQuality,
      notes:        '',
      dataContato:  new Date().toISOString().split('T')[0],
      valor:        0,
      createdAt:    new Date(),
      updatedAt:    new Date(),
    } as Lead;

  } catch (error) {
    console.error(`❌ Erro ao processar linha ${linhaNumero}:`, error);
    return null;
  }
};

// Converte CSV para array de leads — SEM deduplicação aqui
// A deduplicação por nome é feita em useLeads.importarLeadsCSV()
// que cruza com todos os leads existentes no Firestore
export const csvToLeads = (csvContent: string): Lead[] => {
  if (!csvContent?.trim()) throw new Error('Arquivo CSV está vazio');

  const linhas = csvContent.trim().split('\n').map(l => l.trim()).filter(Boolean);
  if (linhas.length < 2) throw new Error('CSV não contém dados. Precisa ter cabeçalho + dados.');

  const headers = parseCsvLine(linhas[0]);

  const temEmpresa = headers.some(h =>
    h.toLowerCase().includes('empresa') || h.toLowerCase().includes('company')
  );
  if (!temEmpresa) throw new Error('CSV inválido: coluna "Empresa" ou "Company" não encontrada');

  const leads: Lead[] = [];
  // Deduplicação interna ao CSV — evita duplicatas dentro do próprio arquivo
  const nomesNoCSV = new Set<string>();

  for (let i = 1; i < linhas.length; i++) {
    const lead = csvLineToLead(linhas[i], headers, i + 1);
    if (!lead) continue;

    const nomeNorm = normalizarNome(lead.companyName);
    if (nomesNoCSV.has(nomeNorm)) {
      console.warn(`⚠️ Duplicata no CSV ignorada: ${lead.companyName}`);
      continue;
    }
    nomesNoCSV.add(nomeNorm);
    leads.push(lead);
  }

  if (leads.length === 0) throw new Error('Nenhum lead válido encontrado no CSV');

  console.log(`✅ CSV: ${leads.length} leads válidos, ${linhas.length - 1 - leads.length} ignorados`);
  return leads;
};

export const carregarCSV = async (): Promise<Lead[]> => {
  try {
    const response = await fetch(`/leads_paragominas.csv?v=${Date.now()}`);
    if (!response.ok) return [];
    return csvToLeads(await response.text());
  } catch (error) {
    console.error('❌ Erro ao carregar CSV:', error);
    return [];
  }
};