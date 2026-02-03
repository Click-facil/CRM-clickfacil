import { Users, UserCheck, FileText, TrendingUp, Target, XCircle } from 'lucide-react';
import { StatsCard } from './StatsCard';
import { PipelineChart } from './PipelineChart';
import { RecentLeads } from './RecentLeads';
import { Lead } from '@/types/lead';

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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Visão geral da sua prospecção</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total de Leads"
          value={stats.total}
          icon={Users}
          subtitle="Todos os leads"
        />
        <StatsCard
          title="Novos Leads"
          value={stats.byStage.new}
          icon={Target}
          variant="primary"
          subtitle="Aguardando contato"
        />
        <StatsCard
          title="Propostas Enviadas"
          value={stats.byStage.proposal_sent}
          icon={FileText}
          variant="warning"
          subtitle="Em análise"
        />
        <StatsCard
          title="Taxa de Conversão"
          value={`${stats.conversionRate}%`}
          icon={TrendingUp}
          variant="success"
          subtitle={`${stats.byStage.won} fechados`}
        />
      </div>

      {/* Charts and Recent Leads */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PipelineChart stats={stats.byStage} />
        </div>
        <div>
          <RecentLeads leads={recentLeads} onViewLead={onViewLead} />
        </div>
      </div>

      {/* Stage Summary */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-card rounded-xl p-4 card-shadow border-l-4 border-l-stage-new">
          <p className="text-sm text-muted-foreground">Novos</p>
          <p className="text-2xl font-bold">{stats.byStage.new}</p>
        </div>
        <div className="bg-card rounded-xl p-4 card-shadow border-l-4 border-l-stage-contacted">
          <p className="text-sm text-muted-foreground">Contatados</p>
          <p className="text-2xl font-bold">{stats.byStage.contacted}</p>
        </div>
        <div className="bg-card rounded-xl p-4 card-shadow border-l-4 border-l-stage-proposal">
          <p className="text-sm text-muted-foreground">Propostas</p>
          <p className="text-2xl font-bold">{stats.byStage.proposal_sent}</p>
        </div>
        <div className="bg-card rounded-xl p-4 card-shadow border-l-4 border-l-stage-negotiation">
          <p className="text-sm text-muted-foreground">Negociação</p>
          <p className="text-2xl font-bold">{stats.byStage.negotiation}</p>
        </div>
        <div className="bg-card rounded-xl p-4 card-shadow border-l-4 border-l-stage-won">
          <p className="text-sm text-muted-foreground">Fechados</p>
          <p className="text-2xl font-bold">{stats.byStage.won}</p>
        </div>
        <div className="bg-card rounded-xl p-4 card-shadow border-l-4 border-l-stage-lost">
          <p className="text-sm text-muted-foreground">Perdidos</p>
          <p className="text-2xl font-bold">{stats.byStage.lost}</p>
        </div>
      </div>
    </div>
  );
}
