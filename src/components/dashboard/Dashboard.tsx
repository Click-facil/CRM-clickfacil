// src/components/dashboard/Dashboard.tsx

import { Users, FileText, TrendingUp, Target } from 'lucide-react';
import { StatsCard } from './StatsCard';
import { PipelineChart } from './PipelineChart';
import { RecentLeads } from './RecentLeads';
import { Lead, LEAD_STAGES } from '@/types/lead';

interface DashboardProps {
  leads: Lead[];
  stats: {
    total: number;
    byStage: Record<string, number>;
    conversionRate: string;
  };
  onViewLead: (lead: Lead) => void;
}

export function Dashboard({ leads, stats, onViewLead }: DashboardProps) {
  const recentLeads = [...leads]
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    .slice(0, 5);

  const getStat = (key: string) => stats.byStage[key] || 0;

  return (
    <div className="space-y-6 md:space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Visão geral da sua prospecção</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        <StatsCard title="Total de Leads" value={stats.total} icon={Users} subtitle="Todos os leads" />
        <StatsCard title="Novos Leads" value={getStat(LEAD_STAGES.NEW)} icon={Target} variant="primary" subtitle="Aguardando contato" />
        <StatsCard title="Propostas" value={getStat(LEAD_STAGES.PROPOSAL_SENT)} icon={FileText} variant="warning" subtitle="Em análise" />
        <StatsCard title="Conversão" value={`${stats.conversionRate}%`} icon={TrendingUp} variant="success" subtitle={`${getStat(LEAD_STAGES.WON)} fechados`} />
      </div>

      {/* Funil e Leads Recentes — mesma altura, sem vão */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 items-stretch">
        <div className="lg:col-span-2 flex flex-col">
          <PipelineChart stats={stats.byStage} />
        </div>
        <div className="flex flex-col">
          <RecentLeads leads={recentLeads} onViewLead={onViewLead} />
        </div>
      </div>

      {/* Stage Summary */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2 md:gap-4">
        {[
          { label: 'Novos',      stage: LEAD_STAGES.NEW,           border: 'border-l-blue-500'   },
          { label: 'Contatados', stage: LEAD_STAGES.CONTACTED,     border: 'border-l-purple-500' },
          { label: 'Propostas',  stage: LEAD_STAGES.PROPOSAL_SENT, border: 'border-l-orange-500' },
          { label: 'Negociação', stage: LEAD_STAGES.NEGOTIATION,   border: 'border-l-yellow-500' },
          { label: 'Fechados',   stage: LEAD_STAGES.WON,           border: 'border-l-green-500'  },
          { label: 'Perdidos',   stage: LEAD_STAGES.LOST,          border: 'border-l-red-500'    },
        ].map(({ label, stage, border }) => (
          <div key={stage} className={`bg-card rounded-xl p-3 md:p-4 shadow-sm border border-border border-l-4 ${border}`}>
            <p className="text-xs text-muted-foreground truncate">{label}</p>
            <p className="text-xl md:text-2xl font-bold">{getStat(stage)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}