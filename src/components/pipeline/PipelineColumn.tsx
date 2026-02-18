// src/components/pipeline/PipelineColumn.tsx - COM BOTÃO DELETAR

import { Lead, LeadStatus } from '@/types/lead';
import { LeadCard } from './LeadCard';
import { useDrop } from 'react-dnd';

interface PipelineColumn {
  id: LeadStatus;
  title: string;
  color: string;
}

interface PipelineColumnProps {
  column: PipelineColumn;
  leads: Lead[];
  onViewLead: (lead: Lead) => void;
  onStageChange: (leadId: string, stage: LeadStatus) => void;
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
    <div className="flex-shrink-0 w-80">
      <div className="bg-card rounded-xl p-4 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${column.color}`} />
            <h3 className="font-semibold">{column.title}</h3>
          </div>
          <span className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded">
            {leads.length}
          </span>
        </div>

        {/* Leads */}
        <div className="space-y-3 overflow-y-auto flex-1">
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
    </div>
  );
}