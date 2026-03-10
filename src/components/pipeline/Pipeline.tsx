// src/components/pipeline/Pipeline.tsx

import { Lead, PIPELINE_COLUMNS, LeadStatus } from '@/types/lead';
import { LeadCard } from './LeadCard';
import { Plus, Search, Archive } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRef, useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface PipelineProps {
  leads: Lead[];
  leadsSemOportunidade: Lead[];
  onViewLead: (lead: Lead) => void;
  onStageChange: (leadId: string, stage: LeadStatus) => void;
  onDeleteLead: (leadId: string) => void;
  onAddLead: () => void;
  onArchiveLead: (leadId: string) => void;
  onGoToSemOportunidade: () => void;
}

export function Pipeline({
  leads, leadsSemOportunidade,
  onViewLead, onStageChange, onDeleteLead, onAddLead,
  onArchiveLead, onGoToSemOportunidade,
}: PipelineProps) {
  const boardRef = useRef<HTMLDivElement>(null);
  const [searchTerm,    setSearchTerm]    = useState('');
  const [draggedId,     setDraggedId]     = useState<string | null>(null);
  const [dragOverCol,   setDragOverCol]   = useState<string | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const isScrolling  = useRef(false);
  const scrollStartX = useRef(0);
  const scrollLeft0  = useRef(0);

  const onBoardMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.closest('[data-lead-card]') || target.closest('button') || target.closest('input')) return;
    isScrolling.current  = true;
    scrollStartX.current = e.pageX;
    scrollLeft0.current  = boardRef.current?.scrollLeft || 0;
    document.body.style.cursor = 'grabbing';
  };

  const onBoardMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isScrolling.current || !boardRef.current) return;
    e.preventDefault();
    boardRef.current.scrollLeft = scrollLeft0.current - (e.pageX - scrollStartX.current);
  }, []);

  const onBoardMouseUp = () => { isScrolling.current = false; document.body.style.cursor = ''; };

  const filteredLeads = leads.filter(l =>
    (l.companyName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (l.niche || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStageValue = (stageLeads: Lead[]) =>
    stageLeads.reduce((sum, l) => sum + (l.valor || 0), 0);

  const handleDragStart = (e: React.DragEvent, leadId: string) => {
    setDraggedId(leadId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', leadId);
  };

  const handleDragOver = (e: React.DragEvent, colId: string, index?: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverCol(colId);
    if (index !== undefined) setDragOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent, colId: string) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    if (id && colId) {
      const lead = leads.find(l => l.id === id);
      if (lead && lead.stage !== colId) onStageChange(id, colId as LeadStatus);
    }
    setDraggedId(null); setDragOverCol(null); setDragOverIndex(null);
  };

  const handleDragEnd = () => { setDraggedId(null); setDragOverCol(null); setDragOverIndex(null); };
  const draggedLead = draggedId ? leads.find(l => l.id === draggedId) : null;

  return (
    <div className="flex flex-col" style={{ height: 'calc(100dvh - 130px)' }}>

      {/* Header */}
      <div className="flex-shrink-0 mb-4">
        <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
          <div>
            <h1 className="text-xl md:text-2xl font-bold">Pipeline de Vendas</h1>
            <p className="text-sm text-muted-foreground">{filteredLeads.length} leads no funil</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onGoToSemOportunidade}
              className="gap-2 text-muted-foreground hover:text-foreground"
            >
              <Archive className="w-4 h-4" />
              <span className="hidden sm:inline">Sem Oportunidade</span>
              {leadsSemOportunidade.length > 0 && (
                <span className="bg-muted text-muted-foreground text-xs px-1.5 py-0.5 rounded-full">
                  {leadsSemOportunidade.length}
                </span>
              )}
            </Button>
            <Button onClick={onAddLead} className="gap-2" size="sm">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Novo Lead</span>
            </Button>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar empresa ou nicho..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-9 h-9"
          />
        </div>

        {draggedLead && (
          <p className="text-xs text-primary text-center mt-2 animate-pulse font-medium">
            Movendo: <strong>{draggedLead.companyName}</strong> — solte em outra coluna
          </p>
        )}
      </div>

      {/* Board */}
      <div className="flex-1 overflow-hidden -mx-2">
        <div
          ref={boardRef}
          className="h-full overflow-x-auto overflow-y-hidden px-2 pb-2 select-none"
          style={{ scrollbarWidth: 'thin' }}
          onMouseDown={onBoardMouseDown}
          onMouseMove={onBoardMouseMove}
          onMouseUp={onBoardMouseUp}
          onMouseLeave={onBoardMouseUp}
        >
          <div className="flex gap-3 h-full" style={{ minWidth: 'max-content' }}>
            {PIPELINE_COLUMNS.map(column => {
              const columnLeads = filteredLeads.filter(l => l.stage === column.id);
              const totalValue  = getStageValue(columnLeads);
              const isDragOver  = dragOverCol === column.id;

              return (
                <div
                  key={column.id}
                  className="flex-shrink-0 w-[80vw] sm:w-[280px] md:w-[300px] h-full flex flex-col"
                  onDragOver={e => handleDragOver(e, column.id)}
                  onDrop={e => handleDrop(e, column.id)}
                  onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragOverCol(null); }}
                >
                  <div className={cn(
                    'flex-shrink-0 px-3 py-2.5 rounded-t-xl border border-b-0 transition-colors',
                    isDragOver ? 'bg-primary/10 border-primary/40' : 'bg-muted/50 border-border'
                  )}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${column.color}`} />
                        <h3 className="font-semibold text-sm truncate">{column.title}</h3>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {totalValue > 0 && (
                          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                            R${(totalValue / 1000).toFixed(0)}k
                          </span>
                        )}
                        <span className={cn(
                          'text-xs px-2 py-0.5 rounded-full font-semibold transition-colors',
                          isDragOver ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary'
                        )}>
                          {columnLeads.length}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className={cn(
                    'flex-1 overflow-y-auto rounded-b-xl border border-t-0 transition-all duration-150 p-2 space-y-2',
                    isDragOver ? 'bg-primary/5 border-primary/40' : 'bg-muted/20 border-border'
                  )}>
                    {isDragOver && columnLeads.length === 0 && (
                      <div className="h-20 rounded-lg border-2 border-dashed border-primary/50 bg-primary/5 flex items-center justify-center">
                        <p className="text-xs font-medium text-primary">Soltar aqui</p>
                      </div>
                    )}

                    {columnLeads.map((lead, index) => (
                      <div key={lead.id}>
                        {isDragOver && dragOverIndex === index && draggedId !== lead.id && (
                          <div className="h-1 bg-primary rounded-full mx-1 mb-2 animate-pulse" />
                        )}
                        <div
                          data-lead-card
                          draggable
                          onDragStart={e => handleDragStart(e, lead.id)}
                          onDragEnd={handleDragEnd}
                          onDragOver={e => { e.stopPropagation(); handleDragOver(e, column.id, index); }}
                          className={cn(
                            'transition-all duration-150 rounded-xl',
                            draggedId === lead.id
                              ? 'opacity-30 scale-95'
                              : 'opacity-100 hover:scale-[1.01] cursor-grab active:cursor-grabbing'
                          )}
                        >
                          <LeadCard
                            lead={lead}
                            onView={() => onViewLead(lead)}
                            onStageChange={stage => onStageChange(lead.id, stage)}
                            onDelete={() => onDeleteLead(lead.id)}
                            onArchive={() => onArchiveLead(lead.id)}
                          />
                        </div>
                      </div>
                    ))}

                    <button
                      onClick={onAddLead}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors mt-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Adicionar lead
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer stats */}
      <div className="flex-shrink-0 grid grid-cols-2 md:grid-cols-4 gap-2 mt-3 pt-3 border-t">
        <div className="text-center">
          <div className="text-xl md:text-2xl font-bold">{filteredLeads.length}</div>
          <div className="text-xs text-muted-foreground">Total</div>
        </div>
        <div className="text-center">
          <div className="text-xl md:text-2xl font-bold text-amber-600">
            {filteredLeads.filter(l => l.websiteQuality === 'none' || l.websiteQuality === 'poor').length}
          </div>
          <div className="text-xs text-muted-foreground">Oportunidades</div>
        </div>
        <div className="text-center">
          <div className="text-xl md:text-2xl font-bold text-emerald-600">
            R$ {(getStageValue(filteredLeads) / 1000).toFixed(0)}k
          </div>
          <div className="text-xs text-muted-foreground">Valor Total</div>
        </div>
        <div className="text-center">
          <div className="text-xl md:text-2xl font-bold text-primary">
            {filteredLeads.length > 0
              ? ((filteredLeads.filter(l => l.stage === 'won').length / filteredLeads.length) * 100).toFixed(1)
              : '0.0'}%
          </div>
          <div className="text-xs text-muted-foreground">Conversão</div>
        </div>
      </div>
    </div>
  );
}