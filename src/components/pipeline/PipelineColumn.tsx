import { Lead, PipelineColumn as PipelineColumnType } from '@/types/lead';
import { LeadCard } from './LeadCard';
import { cn } from '@/lib/utils';

interface PipelineColumnProps {
  column: PipelineColumnType;
  leads: Lead[];
  onViewLead: (lead: Lead) => void;
  onStageChange: (leadId: string, stage: Lead['stage']) => void;
  onDeleteLead: (leadId: string) => void;
}

export function PipelineColumn({ 
  column, 
  leads, 
  onViewLead, 
  onStageChange,
  onDeleteLead 
}: PipelineColumnProps) {
  return (
    <div className="flex flex-col min-w-[300px] max-w-[300px]">
      {/* Column Header */}
      <div className="flex items-center gap-3 mb-4 px-1">
        <div className={cn('w-3 h-3 rounded-full', column.color)} />
        <h3 className="font-semibold text-foreground">{column.title}</h3>
        <span className="ml-auto text-sm text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
          {leads.length}
        </span>
      </div>

      {/* Cards Container */}
      <div className="flex-1 space-y-3 overflow-y-auto pb-4">
        {leads.map((lead) => (
          <LeadCard
            key={lead.id}
            lead={lead}
            onView={() => onViewLead(lead)}
            onStageChange={(stage) => onStageChange(lead.id, stage)}
            onDelete={() => onDeleteLead(lead.id)}
          />
        ))}
        {leads.length === 0 && (
          <div className="text-center py-8 text-muted-foreground text-sm">
            Nenhum lead neste estágio
          </div>
        )}
      </div>
    </div>
  );
}
