import { Lead, PIPELINE_COLUMNS } from '@/types/lead';
import { PipelineColumn } from './PipelineColumn';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PipelineProps {
  leads: Lead[];
  onViewLead: (lead: Lead) => void;
  onStageChange: (leadId: string, stage: Lead['stage']) => void;
  onDeleteLead: (leadId: string) => void;
  onAddLead: () => void;
}

export function Pipeline({ 
  leads, 
  onViewLead, 
  onStageChange, 
  onDeleteLead,
  onAddLead 
}: PipelineProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Pipeline</h1>
          <p className="text-muted-foreground mt-1">Gerencie seus leads por estágio</p>
        </div>
        <Button onClick={onAddLead} className="gap-2">
          <Plus className="w-4 h-4" />
          Novo Lead
        </Button>
      </div>

      {/* Pipeline Board */}
      <div className="flex gap-6 overflow-x-auto pb-4">
        {PIPELINE_COLUMNS.map((column) => (
          <PipelineColumn
            key={column.id}
            column={column}
            leads={leads.filter((lead) => lead.stage === column.id)}
            onViewLead={onViewLead}
            onStageChange={onStageChange}
            onDeleteLead={onDeleteLead}
          />
        ))}
      </div>
    </div>
  );
}
