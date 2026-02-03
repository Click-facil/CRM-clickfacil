export type LeadStage = 
  | 'new' 
  | 'contacted' 
  | 'proposal_sent' 
  | 'negotiation' 
  | 'won' 
  | 'lost';

export type LeadSource = 
  | 'google_business' 
  | 'instagram' 
  | 'facebook' 
  | 'linkedin' 
  | 'manual';

export interface Lead {
  id: string;
  companyName: string;
  niche: string;
  contactName?: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  instagram?: string;
  facebook?: string;
  linkedin?: string;
  website?: string;
  hasWebsite: boolean;
  websiteQuality?: 'good' | 'poor' | 'none';
  stage: LeadStage;
  source: LeadSource;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  lastContactAt?: Date;
}

export interface Script {
  id: string;
  name: string;
  content: string;
  category: 'initial' | 'followup' | 'proposal' | 'closing';
  createdAt: Date;
  updatedAt: Date;
}

export interface PipelineColumn {
  id: LeadStage;
  title: string;
  color: string;
}

export const PIPELINE_COLUMNS: PipelineColumn[] = [
  { id: 'new', title: 'Novos Leads', color: 'bg-stage-new' },
  { id: 'contacted', title: 'Contatados', color: 'bg-stage-contacted' },
  { id: 'proposal_sent', title: 'Proposta Enviada', color: 'bg-stage-proposal' },
  { id: 'negotiation', title: 'Em Negociação', color: 'bg-stage-negotiation' },
  { id: 'won', title: 'Fechados', color: 'bg-stage-won' },
  { id: 'lost', title: 'Perdidos', color: 'bg-stage-lost' },
];

export const NICHES = [
  'Clínicas Médicas',
  'Clínicas Odontológicas',
  'Academias',
  'Restaurantes',
  'Salões de Beleza',
  'Escritórios de Advocacia',
  'Contabilidades',
  'Imobiliárias',
  'Pet Shops',
  'Oficinas Mecânicas',
];
