// src/components/pipeline/Pipeline.tsx — COMPACT REDESIGN

import { Lead, PIPELINE_COLUMNS, LeadStatus } from '@/types/lead';
import { LeadCard } from './LeadCard';
import { Plus, Search, Archive, BarChart2 } from 'lucide-react';
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
  onLabelChange?: (leadId: string, label: string, color: string) => void;
}

export function Pipeline({
  leads, leadsSemOportunidade,
  onViewLead, onStageChange, onDeleteLead, onAddLead,
  onArchiveLead, onGoToSemOportunidade, onLabelChange,
}: PipelineProps) {
  const boardRef     = useRef<HTMLDivElement>(null);
  const [search, setSearch]         = useState('');
  const [draggedId, setDraggedId]   = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<string | null>(null);

  const [statsOpen, setStatsOpen] = useState(false);
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

  const filtered = leads.filter(l =>
    (l.companyName || '').toLowerCase().includes(search.toLowerCase()) ||
    (l.niche || '').toLowerCase().includes(search.toLowerCase())
  );

  const stageValue = (arr: Lead[]) => arr.reduce((s, l) => s + (l.valor || 0), 0);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDrop = (e: React.DragEvent, colId: string) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    if (id && colId) {
      const lead = leads.find(l => l.id === id);
      if (lead && lead.stage !== colId) onStageChange(id, colId as LeadStatus);
    }
    setDraggedId(null); setDragOverCol(null);
  };

  const draggedLead = draggedId ? leads.find(l => l.id === draggedId) : null;

  return (
    <div className="flex flex-col" style={{ height: 'calc(100dvh - 120px)' }}>

      {/* Header compacto */}
      <div className="flex-shrink-0 mb-3">
        <div className="flex items-center gap-2 mb-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input placeholder="Buscar empresa ou nicho..." value={search}
              onChange={e => setSearch(e.target.value)} className="pl-8 h-8 text-sm" />
          </div>

          <Button onClick={onAddLead} size="sm" className="gap-1.5 text-xs h-8 px-2.5 flex-shrink-0">
            <Plus className="w-3.5 h-3.5" /><span className="hidden sm:inline">Novo Lead</span>
          </Button>
          <Button variant="outline" size="sm" onClick={() => setStatsOpen(v => !v)}
            className={cn('gap-1.5 text-xs h-8 px-2.5 flex-shrink-0', statsOpen && 'bg-muted')}>
            <BarChart2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Estatísticas</span>
          </Button>
          <Button variant="outline" size="sm" onClick={onGoToSemOportunidade}
            className="gap-1.5 text-xs h-8 px-2.5 text-muted-foreground hover:text-foreground flex-shrink-0">
            <Archive className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sem Oportunidade</span>
            {leadsSemOportunidade.length > 0 && (
              <span className="bg-muted text-muted-foreground text-[10px] px-1.5 py-0.5 rounded-full">
                {leadsSemOportunidade.length}
              </span>
            )}
          </Button>
        </div>

        {statsOpen && (
          <div className="grid grid-cols-4 gap-2 mb-2 p-3 rounded-lg border bg-muted/30">
            {[
              { label: 'Total de Leads',  value: filtered.length,                                                                                                    cls: 'text-foreground'  },
              { label: 'Oportunidades',   value: filtered.filter(l => l.websiteQuality === 'none' || l.websiteQuality === 'poor').length,                             cls: 'text-amber-500'   },
              { label: 'Valor Total',     value: `R$ ${(stageValue(filtered)/1000).toFixed(1)}k`,                                                                    cls: 'text-emerald-500' },
              { label: 'Conversão',       value: `${filtered.length > 0 ? ((filtered.filter(l=>l.stage==='won').length/filtered.length)*100).toFixed(1) : '0.0'}%`, cls: 'text-primary'     },
            ].map(s => (
              <div key={s.label} className="text-center">
                <div className={cn('text-lg font-bold', s.cls)}>{s.value}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {draggedLead && (
          <p className="text-[11px] text-primary text-center mt-1.5 animate-pulse font-medium">
            Movendo: <strong>{draggedLead.companyName}</strong>
          </p>
        )}
      </div>

      {/* Board */}
      <div className="flex-1 overflow-hidden -mx-2">
        <div ref={boardRef}
          className="h-full overflow-x-auto overflow-y-hidden px-2 pb-2 select-none"
          style={{ scrollbarWidth: 'thin' }}
          onMouseDown={onBoardMouseDown} onMouseMove={onBoardMouseMove}
          onMouseUp={onBoardMouseUp} onMouseLeave={onBoardMouseUp}>
          <div className="flex gap-2 h-full" style={{ minWidth: 'max-content' }}>
            {PIPELINE_COLUMNS.map(col => {
              const colLeads   = filtered.filter(l => l.stage === col.id);
              const totalVal   = stageValue(colLeads);
              const isDragOver = dragOverCol === col.id;

              return (
                <div key={col.id}
                  className="flex-shrink-0 w-[75vw] sm:w-[240px] md:w-[255px] h-full flex flex-col"
                  onDragOver={e => { e.preventDefault(); setDragOverCol(col.id); }}
                  onDrop={e => handleDrop(e, col.id)}
                  onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragOverCol(null); }}>

                  {/* Cabeçalho da coluna */}
                  <div className={cn(
                    'flex-shrink-0 px-2.5 py-2 rounded-t-lg border border-b-0 transition-colors',
                    isDragOver ? 'bg-primary/10 border-primary/40' : 'bg-muted/40 border-border'
                  )}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${col.color}`} />
                        <h3 className="font-semibold text-xs truncate">{col.title}</h3>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {totalVal > 0 && (
                          <span className="text-[10px] text-emerald-500 font-medium">
                            R${(totalVal / 1000).toFixed(0)}k
                          </span>
                        )}
                        <span className={cn(
                          'text-[10px] px-1.5 py-0.5 rounded-full font-semibold',
                          isDragOver ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary'
                        )}>{colLeads.length}</span>
                      </div>
                    </div>
                  </div>

                  {/* Cards */}
                  <div className={cn(
                    'flex-1 overflow-y-auto rounded-b-lg border border-t-0 p-1.5 space-y-1.5 transition-all',
                    isDragOver ? 'bg-primary/5 border-primary/40' : 'bg-muted/10 border-border'
                  )}>
                    {isDragOver && colLeads.length === 0 && (
                      <div className="h-14 rounded border-2 border-dashed border-primary/40 bg-primary/5 flex items-center justify-center">
                        <p className="text-[10px] font-medium text-primary">Soltar aqui</p>
                      </div>
                    )}

                    {colLeads.map(lead => (
                      <div key={lead.id} data-lead-card draggable
                        onDragStart={e => handleDragStart(e, lead.id)}
                        onDragEnd={() => { setDraggedId(null); setDragOverCol(null); }}
                        className={cn(
                          'transition-all duration-150 rounded-lg',
                          draggedId === lead.id ? 'opacity-30 scale-95' : 'opacity-100 cursor-grab active:cursor-grabbing'
                        )}>
                        <LeadCard
                          lead={lead}
                          onView={() => onViewLead(lead)}
                          onStageChange={stage => onStageChange(lead.id, stage)}
                          onDelete={() => onDeleteLead(lead.id)}
                          onArchive={() => onArchiveLead(lead.id)}
                          onLabelChange={(label, color) => onLabelChange?.(lead.id, label, color)}
                        />
                      </div>
                    ))}

                    <button onClick={onAddLead}
                      className="w-full flex items-center gap-1.5 px-2 py-1.5 rounded text-[11px] text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
                      <Plus className="w-3 h-3" />Adicionar lead
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

    </div>
  );
}