// src/components/pipeline/Pipeline.tsx - COM NAVEGAÇÃO FIXA

import { Lead, PIPELINE_COLUMNS, LeadStatus } from '@/types/lead';
import { LeadCard } from './LeadCard';
import { Plus, ArrowLeft, ArrowRight, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRef, useState } from 'react';
import { Input } from '@/components/ui/input';

interface PipelineProps {
  leads: Lead[];
  onViewLead: (lead: Lead) => void;
  onStageChange: (leadId: string, stage: LeadStatus) => void;
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
  const scrollRef = useRef<HTMLDivElement>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -420, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 420, behavior: 'smooth' });
    }
  };

  const filteredLeads = leads.filter(lead => 
    lead.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.niche.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.contactName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStageValue = (stageLeads: Lead[]) => {
    return stageLeads.reduce((sum, lead) => sum + (lead.valor || 0), 0);
  };

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col">
      {/* Header e Navegação - FIXO NO TOPO */}
      <div className="flex-shrink-0 space-y-4 mb-4 sticky top-0 bg-background z-20 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Pipeline de Vendas</h1>
            <p className="text-muted-foreground mt-1">
              {filteredLeads.length} leads
            </p>
          </div>
          <Button onClick={onAddLead} size="lg" className="gap-2">
            <Plus className="w-5 h-5" />
            Novo Lead
          </Button>
        </div>

        {/* Busca e Setas - SEMPRE VISÍVEL */}
        <div className="flex items-center gap-4 bg-card p-4 rounded-lg border">
          <div className="relative flex-1 max-w-md">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar empresa, nicho..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="icon"
              onClick={scrollLeft}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            
            <span className="text-sm text-muted-foreground px-4">
              Use as setas ou arraste →
            </span>
            
            <Button 
              variant="outline" 
              size="icon"
              onClick={scrollRight}
            >
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Pipeline Board - SCROLL PRÓPRIO */}
      <div className="flex-1 overflow-hidden">
        <div 
          ref={scrollRef}
          className="h-full overflow-x-auto overflow-y-hidden pb-4 scroll-smooth"
        >
          <div className="flex gap-6 h-full">
            {PIPELINE_COLUMNS.map((column) => {
              const columnLeads = filteredLeads.filter((lead) => lead.stage === column.id);
              const totalValue = getStageValue(columnLeads);
              
              return (
                <div key={column.id} className="flex-shrink-0 w-96 h-full">
                  <div className="bg-card rounded-xl border-2 h-full flex flex-col">
                    {/* Header Coluna */}
                    <div className="flex-shrink-0 p-4 border-b">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${column.color}`} />
                          <h3 className="font-bold text-base">{column.title}</h3>
                        </div>
                        <span className="text-xs font-medium bg-primary/10 text-primary px-3 py-1 rounded-full">
                          {columnLeads.length}
                        </span>
                      </div>
                      
                      {totalValue > 0 && (
                        <div className="text-xs font-semibold text-emerald-600">
                          💰 R$ {totalValue.toLocaleString('pt-BR')}
                        </div>
                      )}
                    </div>

                    {/* Lista - SCROLL VERTICAL */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                      {columnLeads.map((lead) => (
                        <LeadCard
                          key={lead.id}
                          lead={lead}
                          onView={() => onViewLead(lead)}
                          onStageChange={(stage) => onStageChange(lead.id, stage)}
                          onDelete={() => onDeleteLead(lead.id)}
                        />
                      ))}
                      
                      {columnLeads.length === 0 && (
                        <div className="text-center py-16 text-muted-foreground">
                          <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                            <div className={`w-4 h-4 rounded-full ${column.color}`} />
                          </div>
                          <p className="text-sm font-medium">Nenhum lead</p>
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    {columnLeads.length > 0 && (
                      <div className="flex-shrink-0 p-3 border-t bg-muted/30">
                        <div className="text-xs text-muted-foreground text-center">
                          🎯 {columnLeads.filter(l => l.websiteQuality === 'none' || l.websiteQuality === 'poor').length} oportunidades
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Estatísticas - FIXO NO RODAPÉ */}
      <div className="flex-shrink-0 grid grid-cols-4 gap-4 pt-4 mt-4 border-t sticky bottom-0 bg-background">
        <div className="bg-card p-3 rounded-lg border">
          <div className="text-xs text-muted-foreground mb-1">Total</div>
          <div className="text-xl font-bold">{filteredLeads.length}</div>
        </div>
        <div className="bg-card p-3 rounded-lg border">
          <div className="text-xs text-muted-foreground mb-1">Oportunidades</div>
          <div className="text-xl font-bold text-amber-600">
            {filteredLeads.filter(l => l.websiteQuality === 'none' || l.websiteQuality === 'poor').length}
          </div>
        </div>
        <div className="bg-card p-3 rounded-lg border">
          <div className="text-xs text-muted-foreground mb-1">Valor Total</div>
          <div className="text-xl font-bold text-emerald-600">
            R$ {getStageValue(filteredLeads).toLocaleString('pt-BR')}
          </div>
        </div>
        <div className="bg-card p-3 rounded-lg border">
          <div className="text-xs text-muted-foreground mb-1">Conversão</div>
          <div className="text-xl font-bold text-primary">
            {filteredLeads.length > 0 
              ? ((filteredLeads.filter(l => l.stage === 'won').length / filteredLeads.length) * 100).toFixed(1)
              : '0.0'
            }%
          </div>
        </div>
      </div>
    </div>
  );
}