// src/types/lead.ts - COM TERRITÓRIO

export const LEAD_STAGES = {
  NEW: 'new',
  CONTACTED: 'contacted',
  PROPOSAL_SENT: 'proposal_sent',
  NEGOTIATION: 'negotiation',
  WON: 'won',
  LOST: 'lost',
} as const;

export type LeadStatus = typeof LEAD_STAGES[keyof typeof LEAD_STAGES];

export const PIPELINE_COLUMNS = [
  { id: LEAD_STAGES.NEW, title: 'Novos Líderes', color: 'bg-blue-500' },
  { id: LEAD_STAGES.CONTACTED, title: 'Contatados', color: 'bg-purple-500' },
  { id: LEAD_STAGES.PROPOSAL_SENT, title: 'Proposta Enviada', color: 'bg-orange-500' },
  { id: LEAD_STAGES.NEGOTIATION, title: 'Em Negociação', color: 'bg-yellow-500' },
  { id: LEAD_STAGES.WON, title: 'Fechados', color: 'bg-green-500' },
  { id: LEAD_STAGES.LOST, title: 'Perdidos', color: 'bg-red-500' },
] as const;

export const NICHES = [
  'Academias',
  'Advogados',
  'Arquitetura',
  'Bares e Restaurantes',
  'Clínicas Médicas',
  'Clínicas Odontológicas',
  'Consultórios',
  'Contabilidade',
  'E-commerce',
  'Educação',
  'Empresas de Energia Solar',
  'Engenharia',
  'Estética e Beleza',
  'Farmácias',
  'Imobiliárias',
  'Marketing',
  'Oficinas Mecânicas',
  'Padarias',
  'Pet Shops',
  'Salões de Beleza',
  'Tecnologia',
  'Outros',
] as const;

export type WebsiteQuality = 'good' | 'poor' | 'none';

export interface Lead {
  id: string;
  companyName: string;
  niche: string;
  territory?: string;  // NOVO CAMPO! 'Paragominas' | 'Belém'
  contactName?: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  instagram?: string;
  facebook?: string;
  linkedin?: string;
  website?: string;
  googleMaps?: string;
  linkWhatsApp?: string;
  stage: LeadStatus;
  source?: 'manual' | 'scraper' | 'import';
  websiteQuality?: WebsiteQuality;
  notes?: string;
  dataContato?: string;
  valor?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Script {
  id: string;
  title: string;
  content: string;
  category: 'initial' | 'followup' | 'proposal' | 'closing' | 'other';
  createdAt: Date;
  updatedAt: Date;
}