// src/components/dashboard/Dashboard.tsx — COMPACT REDESIGN

import { Users, FileText, TrendingUp, Target } from 'lucide-react';
import { StatsCard } from './StatsCard';
import { PipelineChart } from './PipelineChart';
import { RecentLeads } from './RecentLeads';
import { Lead, LEAD_STAGES } from '@/types/lead';

interface DashboardProps {
  leads: Lead[];
  stats: { total: number; byStage: Record<string, number>; conversionRate: string; };
  onViewLead: (lead: Lead) => void;
}

export function Dashboard({ leads, stats, onViewLead }: DashboardProps) {
  const recentLeads = [...leads]
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    .slice(0, 5);

  const getStat = (key: string) => stats.byStage[key] || 0;

  const stageSummary = [
    { label: 'Novos',      stage: LEAD_STAGES.NEW,           color: 'border-l-blue-500'   },
    { label: 'Contatados', stage: LEAD_STAGES.CONTACTED,     color: 'border-l-purple-500' },
    { label: 'Propostas',  stage: LEAD_STAGES.PROPOSAL_SENT, color: 'border-l-orange-500' },
    { label: 'Negociação', stage: LEAD_STAGES.NEGOTIATION,   color: 'border-l-yellow-500' },
    { label: 'Fechados',   stage: LEAD_STAGES.WON,           color: 'border-l-green-500'  },
    { label: 'Perdidos',   stage: LEAD_STAGES.LOST,          color: 'border-l-red-500'    },
  ];

  return (
    <div className="flex flex-col gap-3" style={{ height: 'calc(100dvh - 120px)' }}>
      {/* Stats — compactos */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 flex-shrink-0">
        <StatsCard title="Total de Leads"  value={stats.total}                        icon={Users}      subtitle="Todos os leads"      />
        <StatsCard title="Novos Leads"     value={getStat(LEAD_STAGES.NEW)}           icon={Target}     variant="primary"  subtitle="Aguardando contato" />
        <StatsCard title="Propostas"       value={getStat(LEAD_STAGES.PROPOSAL_SENT)} icon={FileText}   variant="warning" subtitle="Em análise"       />
        <StatsCard title="Conversão"       value={`${stats.conversionRate}%`}         icon={TrendingUp} variant="success"  subtitle={`${getStat(LEAD_STAGES.WON)} fechados`} />
      </div>

      {/* Funil + Recentes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 items-stretch flex-1 min-h-0">
        <div className="lg:col-span-2 flex flex-col min-h-0">
          <PipelineChart stats={stats.byStage} />
        </div>
        <div className="flex flex-col min-h-0">
          <RecentLeads leads={recentLeads} onViewLead={onViewLead} />
        </div>
      </div>

      {/* Stage summary */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2 flex-shrink-0">
        {stageSummary.map(({ label, stage, color }) => (
          <div key={stage} className={`bg-card rounded-lg px-3 py-2 border border-border border-l-4 ${color}`}>
            <p className="text-[10px] text-muted-foreground truncate leading-none mb-0.5">{label}</p>
            <p className="text-base font-bold leading-none">{getStat(stage)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}