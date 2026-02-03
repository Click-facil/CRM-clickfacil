import { Lead } from '@/types/lead';
import { Building2, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RecentLeadsProps {
  leads: Lead[];
  onViewLead: (lead: Lead) => void;
}

const stageStyles: Record<string, string> = {
  new: 'bg-stage-new/10 text-stage-new',
  contacted: 'bg-stage-contacted/10 text-stage-contacted',
  proposal_sent: 'bg-stage-proposal/10 text-stage-proposal',
  negotiation: 'bg-stage-negotiation/10 text-stage-negotiation',
  won: 'bg-stage-won/10 text-stage-won',
  lost: 'bg-stage-lost/10 text-stage-lost',
};

const stageLabels: Record<string, string> = {
  new: 'Novo',
  contacted: 'Contatado',
  proposal_sent: 'Proposta',
  negotiation: 'Negociação',
  won: 'Fechado',
  lost: 'Perdido',
};

export function RecentLeads({ leads, onViewLead }: RecentLeadsProps) {
  return (
    <div className="bg-card rounded-xl p-6 card-shadow h-full">
      <h3 className="text-lg font-semibold mb-4">Leads Recentes</h3>
      <div className="space-y-3">
        {leads.map((lead) => (
          <button
            key={lead.id}
            onClick={() => onViewLead(lead)}
            className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors text-left group"
          >
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Building2 className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{lead.companyName}</p>
              <p className="text-xs text-muted-foreground truncate">{lead.niche}</p>
            </div>
            <span className={cn(
              'text-xs font-medium px-2 py-1 rounded-full',
              stageStyles[lead.stage]
            )}>
              {stageLabels[lead.stage]}
            </span>
            <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        ))}
      </div>
    </div>
  );
}
