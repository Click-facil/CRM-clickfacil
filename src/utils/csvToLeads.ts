// src/utils/csvToLeads.ts - VERSÃO PROFISSIONAL COM VALIDAÇÃO COMPLETA

import { Lead, LEAD_STAGES, WebsiteQuality } from '@/types/lead';

/**
 * Analisa qualidade do site
 */
const analisarQualidadeSite = (site: string): WebsiteQuality => {
  if (!site || site === 'SEM SITE' || site.toLowerCase().includes('sem site')) {
    return 'none';
  }
  
  const siteLower = site.toLowerCase();
  if (siteLower.includes('linktree') || 
      siteLower.includes('linktr.ee') ||
      siteLower.includes('bio.link') ||
      siteLower.includes('meulink.com') ||
      siteLower.includes('beacons.ai') ||
      siteLower.includes('sites.google.com') ||
      siteLower.includes('lojalocal.com')) {
    return 'poor';
  }
  
  return 'good';
};

/**
 * Identifica oportunidades baseado no site
 */
const identificarOportunidade = (site: string, websiteQuality: WebsiteQuality): string => {
  const problemas: string[] = [];
  
  if (websiteQuality === 'none') {
    problemas.push('SEM SITE - Grande oportunidade de venda!');
  } else if (websiteQuality === 'poor') {
    const siteLower = site.toLowerCase();
    if (siteLower.includes('linktree') || siteLower.includes('linktr.ee')) {
      problemas.push('Usando Linktree - Precisa de site profissional');
    } else if (siteLower.includes('sites.google.com')) {
      problemas.push('Google Sites - Site amador, precisa de upgrade');
    } else if (siteLower.includes('lojalocal.com')) {
      problemas.push('Site genérico - Baixa credibilidade');
    } else {
      problemas.push('Site de baixa qualidade - Oportunidade de melhoria');
    }
  }
  
  return problemas.length > 0 ? problemas.join(' | ') : 'Site profissional detectado';
};

/**
 * Limpa e valida WhatsApp
 */
const limparWhatsApp = (whatsapp: string): { limpo: string; link: string } => {
  try {
    if (!whatsapp || whatsapp === 'Não encontrado') {
      return { limpo: '', link: '' };
    }
    
    // Remove tudo que não é número
    let limpo = whatsapp.replace(/\D/g, '');
    
    // Adiciona código do Brasil se necessário
    if (limpo && !limpo.startsWith('55')) {
      limpo = '55' + limpo;
    }
    
    // Valida se tem tamanho mínimo (55 + DDD + número)
    if (limpo.length < 12) {
      console.warn('⚠️ WhatsApp inválido:', whatsapp);
      return { limpo: '', link: '' };
    }
    
    return {
      limpo,
      link: `https://wa.me/${limpo}`
    };
  } catch (error) {
    console.error('Erro ao limpar WhatsApp:', error);
    return { limpo: '', link: '' };
  }
};

/**
 * Valida se uma linha CSV tem dados mínimos
 */
const validarLinhaCsv = (valores: string[], headers: string[]): boolean => {
  // Precisa ter pelo menos nome da empresa
  const empresaIndex = headers.findIndex(h => 
    h.toLowerCase().includes('empresa') || 
    h.toLowerCase().includes('company')
  );
  
  if (empresaIndex === -1 || !valores[empresaIndex]?.trim()) {
    return false;
  }
  
  return true;
};

/**
 * Parse seguro de linha CSV respeitando vírgulas entre aspas
 */
const parseCsvLine = (line: string): string[] => {
  const valores: string[] = [];
  let valorAtual = '';
  let dentroDeAspas = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      dentroDeAspas = !dentroDeAspas;
    } else if (char === ',' && !dentroDeAspas) {
      valores.push(valorAtual.trim());
      valorAtual = '';
    } else {
      valorAtual += char;
    }
  }
  
  valores.push(valorAtual.trim());
  return valores;
};

/**
 * Converte linha CSV para Lead com validação completa
 */
const csvLineToLead = (linha: string, headers: string[], linhaNumero: number): Lead | null => {
  try {
    const valores = parseCsvLine(linha);
    
    // Valida linha
    if (!validarLinhaCsv(valores, headers)) {
      console.warn(`⚠️ Linha ${linhaNumero} ignorada: sem nome de empresa`);
      return null;
    }
    
    // Cria objeto do CSV
    const row: Record<string, string> = {};
    headers.forEach((header, i) => {
      row[header] = valores[i] || '';
    });
    
    // Extrai dados com fallbacks
    const empresa = row.Empresa || row.empresa || row.Company || row.company || '';
    if (!empresa.trim()) {
      return null;
    }
    
    const nicho = row.Nicho || row.nicho || row.Niche || row.niche || 'Outros';
    const site = row.Site || row.site || row.Website || row.website || '';
    const whatsappRaw = row.WhatsApp || row.whatsapp || row.Phone || row.phone || '';
    const instagram = row.Instagram || row.instagram || '';
    const googleMaps = row.Google_Maps || row.google_maps || row.GoogleMaps || '';
    
    // Processa WhatsApp
    const { limpo: whatsappLimpo, link: linkWhatsApp } = limparWhatsApp(whatsappRaw);
    
    // Analisa site
    const websiteQuality = analisarQualidadeSite(site);
    const oportunidade = identificarOportunidade(site, websiteQuality);
    
    // Cria lead
    const lead: Lead = {
      id: `csv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      companyName: empresa.trim(),
      niche: nicho,
      contactName: '',
      email: '',
      phone: whatsappRaw !== 'Não encontrado' ? whatsappRaw : '',
      whatsapp: whatsappLimpo,
      instagram: instagram !== 'Não encontrado' ? instagram : '',
      facebook: '',
      linkedin: '',
      website: site,
      googleMaps: googleMaps,
      linkWhatsApp: linkWhatsApp,
      stage: LEAD_STAGES.NEW,
      source: 'scraper',
      websiteQuality,
      notes: oportunidade,
      dataContato: new Date().toISOString().split('T')[0],
      valor: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    return lead;
    
  } catch (error) {
    console.error(`❌ Erro ao processar linha ${linhaNumero}:`, error);
    return null;
  }
};

/**
 * Converte conteúdo CSV completo para array de Leads
 * COM VALIDAÇÃO E TRATAMENTO DE ERROS COMPLETO
 */
export const csvToLeads = (csvContent: string): Lead[] => {
  console.log('📄 Iniciando conversão CSV...');
  
  try {
    // Valida conteúdo
    if (!csvContent || csvContent.trim().length === 0) {
      console.error('❌ CSV vazio');
      throw new Error('Arquivo CSV está vazio');
    }
    
    // Limpa e quebra linhas
    const linhas = csvContent
      .trim()
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 0);
    
    console.log(`📋 ${linhas.length} linhas encontradas`);
    
    if (linhas.length < 2) {
      console.error('❌ CSV sem dados (apenas header ou vazio)');
      throw new Error('CSV não contém dados. Precisa ter pelo menos 2 linhas (cabeçalho + dados)');
    }
    
    // Primeira linha = headers
    const headers = parseCsvLine(linhas[0]);
    console.log('📊 Headers:', headers.join(', '));
    
    // Valida se tem coluna de empresa
    const temEmpresa = headers.some(h => 
      h.toLowerCase().includes('empresa') || 
      h.toLowerCase().includes('company')
    );
    
    if (!temEmpresa) {
      console.error('❌ CSV inválido: sem coluna de empresa');
      throw new Error('CSV inválido: não encontrada coluna "Empresa" ou "Company"');
    }
    
    // Processa linhas de dados
    const leads: Lead[] = [];
    let linhasProcessadas = 0;
    let linhasIgnoradas = 0;
    
    for (let i = 1; i < linhas.length; i++) {
      const lead = csvLineToLead(linhas[i], headers, i + 1);
      
      if (lead) {
        leads.push(lead);
        linhasProcessadas++;
      } else {
        linhasIgnoradas++;
      }
    }
    
    console.log(`✅ Conversão concluída:`);
    console.log(`   • ${linhasProcessadas} leads convertidos`);
    console.log(`   • ${linhasIgnoradas} linhas ignoradas`);
    
    // Estatísticas de oportunidades
    const semSite = leads.filter(l => l.websiteQuality === 'none').length;
    const siteRuim = leads.filter(l => l.websiteQuality === 'poor').length;
    const comWhatsApp = leads.filter(l => l.whatsapp).length;
    
    console.log(`🎯 Oportunidades identificadas:`);
    console.log(`   • ${semSite} sem site`);
    console.log(`   • ${siteRuim} com site ruim`);
    console.log(`   • ${comWhatsApp} com WhatsApp`);
    
    if (leads.length === 0) {
      throw new Error('Nenhum lead válido encontrado no CSV');
    }
    
    return leads;
    
  } catch (error) {
    console.error('❌ Erro fatal na conversão CSV:', error);
    throw error;
  }
};

/**
 * Carrega CSV do servidor
 * NOTA: Para upload manual, use csvToLeads diretamente
 */
export const carregarCSV = async (): Promise<Lead[]> => {
  try {
    const timestamp = new Date().getTime();
    const response = await fetch(`/leads_paragominas.csv?v=${timestamp}`);
    
    if (!response.ok) {
      console.warn('⚠️ CSV não encontrado no servidor');
      return [];
    }
    
    const csvContent = await response.text();
    return csvToLeads(csvContent);
    
  } catch (error) {
    console.error('❌ Erro ao carregar CSV:', error);
    return [];
  }
};