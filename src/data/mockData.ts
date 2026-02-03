import { Lead, Script } from '@/types/lead';

export const mockLeads: Lead[] = [
  {
    id: '1',
    companyName: 'Clínica Sorrisos',
    niche: 'Clínicas Odontológicas',
    contactName: 'Dr. Carlos Silva',
    email: 'contato@clinicasorrisos.com.br',
    phone: '(11) 99999-0001',
    whatsapp: '5511999990001',
    instagram: '@clinicasorrisos',
    hasWebsite: false,
    websiteQuality: 'none',
    stage: 'new',
    source: 'google_business',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    companyName: 'Fit Academia',
    niche: 'Academias',
    contactName: 'João Mendes',
    email: 'joao@fitacademia.com',
    whatsapp: '5511999990002',
    facebook: 'fitacademia',
    website: 'http://fitacademia.com',
    hasWebsite: true,
    websiteQuality: 'poor',
    stage: 'contacted',
    source: 'instagram',
    notes: 'Site muito antigo, não responsivo',
    createdAt: new Date('2024-01-14'),
    updatedAt: new Date('2024-01-16'),
    lastContactAt: new Date('2024-01-16'),
  },
  {
    id: '3',
    companyName: 'Advocacia Santos & Filho',
    niche: 'Escritórios de Advocacia',
    contactName: 'Dr. Roberto Santos',
    email: 'roberto@santosefilho.adv.br',
    phone: '(11) 3333-0003',
    linkedin: 'robertosantosadv',
    hasWebsite: false,
    websiteQuality: 'none',
    stage: 'proposal_sent',
    source: 'linkedin',
    notes: 'Interessado em site institucional',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-17'),
    lastContactAt: new Date('2024-01-17'),
  },
  {
    id: '4',
    companyName: 'Bella Estética',
    niche: 'Salões de Beleza',
    contactName: 'Ana Paula',
    whatsapp: '5511999990004',
    instagram: '@bellastetica',
    hasWebsite: false,
    websiteQuality: 'none',
    stage: 'negotiation',
    source: 'instagram',
    notes: 'Quer site com agendamento online',
    createdAt: new Date('2024-01-08'),
    updatedAt: new Date('2024-01-18'),
    lastContactAt: new Date('2024-01-18'),
  },
  {
    id: '5',
    companyName: 'Contábil Express',
    niche: 'Contabilidades',
    contactName: 'Maria Ferreira',
    email: 'maria@contabilexpress.com.br',
    phone: '(11) 2222-0005',
    website: 'http://contabilexpress.com.br',
    hasWebsite: true,
    websiteQuality: 'poor',
    stage: 'won',
    source: 'google_business',
    notes: 'Fechado! Site + SEO',
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-19'),
    lastContactAt: new Date('2024-01-19'),
  },
  {
    id: '6',
    companyName: 'Pet Love',
    niche: 'Pet Shops',
    contactName: 'Lucas Oliveira',
    whatsapp: '5511999990006',
    instagram: '@petloveshop',
    hasWebsite: false,
    websiteQuality: 'none',
    stage: 'lost',
    source: 'instagram',
    notes: 'Sem orçamento no momento',
    createdAt: new Date('2024-01-12'),
    updatedAt: new Date('2024-01-15'),
    lastContactAt: new Date('2024-01-15'),
  },
];

export const mockScripts: Script[] = [
  {
    id: '1',
    name: 'Primeira Abordagem',
    category: 'initial',
    content: `Olá {nome}! Tudo bem?

Sou da [Sua Empresa] e notei que a {empresa} ainda não tem um site ou presença digital forte.

Hoje em dia, 87% dos clientes pesquisam online antes de escolher um serviço. Posso mostrar como podemos ajudar a {empresa} a conquistar mais clientes?

Tenho uma proposta especial esse mês. Podemos conversar?`,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '2',
    name: 'Follow-up 3 dias',
    category: 'followup',
    content: `Oi {nome}! Como está?

Passei aqui para saber se teve a chance de ver minha mensagem sobre o site da {empresa}.

Sei que a rotina é corrida, mas gostaria muito de te mostrar alguns casos de sucesso no seu segmento.

Quando seria um bom horário para conversarmos?`,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '3',
    name: 'Envio de Proposta',
    category: 'proposal',
    content: `{nome}, conforme conversamos!

Segue a proposta personalizada para a {empresa}:

📋 O que está incluso:
- Site profissional e responsivo
- Otimização para Google (SEO)
- Integração com WhatsApp
- 1 ano de hospedagem

💰 Investimento: R$ [VALOR]
📅 Prazo: [X] dias úteis

Estou à disposição para esclarecer qualquer dúvida!`,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '4',
    name: 'Fechamento',
    category: 'closing',
    content: `{nome}, tudo certo?

Vi que está analisando a proposta há alguns dias. 

Tenho uma condição especial que posso oferecer se fecharmos essa semana:
🎁 [BÔNUS/DESCONTO]

Posso reservar essa condição para você?`,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
];
