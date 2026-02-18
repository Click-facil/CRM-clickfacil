// src/components/pipeline/Pipeline.tsx - UI/UX PROFISSIONAL

import { Lead, PIPELINE_COLUMNS, LeadStatus } from '@/types/lead';
import { LeadCard } from './LeadCard';
import { Plus, ArrowLeft, ArrowRight, Search } from 'lucide-react';
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
    scrollRef.current?.scrollBy({ left: -400, behavior: 'smooth' });
  };

  const scrollRight = () => {
    scrollRef.current?.scrollBy({ left: 400, behavior: 'smooth' });
  };

  const filteredLeads = leads.filter(lead => 
    lead.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.niche.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStageValue = (stageLeads: Lead[]) => {
    return stageLeads.reduce((sum, lead) => sum + (lead.valor || 0), 0);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)]">
      {/* HEADER FIXO - LIMPO E PROFISSIONAL */}
      <div className="flex-shrink-0 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">Pipeline de Vendas</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {filteredLeads.length} leads no funil
            </p>
          </div>
          <Button onClick={onAddLead} className="gap-2">
            <Plus className="w-4 h-4" />
            Novo Lead
          </Button>
        </div>

        {/* NAVEGAÇÃO E BUSCA - EM LINHA */}
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="icon"
            onClick={scrollLeft}
            className="flex-shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>

          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar empresa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
          
          <Button 
            variant="outline" 
            size="icon"
            onClick={scrollRight}
            className="flex-shrink-0"
          >
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* PIPELINE BOARD - SEM SCROLL BAR VISÍVEL */}
      <div className="flex-1 -mx-2">
        <div 
          ref={scrollRef}
          className="h-full overflow-x-auto overflow-y-hidden px-2 pb-2"
          style={{ 
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}
        >
          <style>{`
            .overflow-x-auto::-webkit-scrollbar {
              display: none;
            }
          `}</style>
          
          <div className="flex gap-4 h-full">
            {PIPELINE_COLUMNS.map((column) => {
              const columnLeads = filteredLeads.filter((lead) => lead.stage === column.id);
              const totalValue = getStageValue(columnLeads);
              
              return (
                <div key={column.id} className="flex-shrink-0 w-[380px] h-full">
                  <div className="bg-muted/30 rounded-lg h-full flex flex-col">
                    {/* HEADER DA COLUNA - COMPACTO */}
                    <div className="flex-shrink-0 p-3 border-b bg-background/50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${column.color}`} />
                          <h3 className="font-semibold text-sm">{column.title}</h3>
                        </div>
                        <div className="flex items-center gap-2">
                          {totalValue > 0 && (
                            <span className="text-xs text-emerald-600 font-medium">
                              R$ {(totalValue / 1000).toFixed(0)}k
                            </span>
                          )}
                          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                            {columnLeads.length}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* LISTA DE LEADS - SCROLL SUAVE */}
                    <div className="flex-1 overflow-y-auto p-3 space-y-3">
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
                        <div className="flex items-center justify-center h-full text-center p-6">
                          <div>
                            <div className={`w-12 h-12 rounded-full ${column.color} opacity-20 mx-auto mb-2`} />
                            <p className="text-xs text-muted-foreground">Nenhum lead</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ESTATÍSTICAS - RODAPÉ COMPACTO */}
      <div className="flex-shrink-0 grid grid-cols-4 gap-3 mt-4 pt-4 border-t">
        <div className="text-center">
          <div className="text-2xl font-bold">{filteredLeads.length}</div>
          <div className="text-xs text-muted-foreground">Total</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-amber-600">
            {filteredLeads.filter(l => l.websiteQuality === 'none' || l.websiteQuality === 'poor').length}
          </div>
          <div className="text-xs text-muted-foreground">Oportunidades</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-emerald-600">
            R$ {(getStageValue(filteredLeads) / 1000).toFixed(0)}k
          </div>
          <div className="text-xs text-muted-foreground">Valor Total</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-primary">
            {filteredLeads.length > 0 
              ? ((filteredLeads.filter(l => l.stage === 'won').length / filteredLeads.length) * 100).toFixed(1)
              : '0.0'
            }%
          </div>
          <div className="text-xs text-muted-foreground">Conversão</div>
        </div>
      </div>
    </div>
  );
}