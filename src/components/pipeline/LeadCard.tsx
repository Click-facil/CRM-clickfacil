// src/components/pipeline/LeadCard.tsx

import { Lead } from '@/types/lead';
import {
  Building2, Globe, AlertTriangle, XCircle,
  MessageCircle, Mail, Instagram, MapPin,
  MoreVertical, Trash2, Eye, Phone, ExternalLink,
  TrendingUp, Calendar, Archive, ChevronRight, Tag, X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubTrigger,
  DropdownMenuSubContent, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';

interface LeadCardProps {
  lead: Lead;
  onView: () => void;
  onStageChange: (stage: Lead['stage']) => void;
  onDelete: () => void;
  onArchive: () => void;
  onLabelChange?: (label: string, color: string) => void;
}

// Calcula websiteQuality em tempo real a partir da URL — nunca usa dado desatualizado do Firestore
function calcQuality(url?: string): 'none' | 'poor' | 'good' {
  if (!url || !url.trim()) return 'none';
  const lower = url.toLowerCase();
  const redesSociais = [
    'instagram.com', 'facebook.com', 'fb.com', 'tiktok.com',
    'twitter.com', 'x.com', 'linkedin.com', 'youtube.com',
    'wa.me', 'whatsapp',
  ];
  if (redesSociais.some(r => lower.includes(r))) return 'poor';
  const ruins = ['linktree', 'linktr.ee', 'bio.link', 'beacons.ai', 'sites.google.com', 'wixsite.com', 'blogspot.com'];
  if (ruins.some(r => lower.includes(r))) return 'poor';
  return 'good';
}

const qualityConfig = {
  good: {
    icon: Globe,
    className: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800',
    label: 'Site Profissional',
  },
  poor: {
    icon: AlertTriangle,
    className: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800',
    label: 'Site Fraco — Oportunidade!',
  },
  none: {
    icon: XCircle,
    className: 'text-rose-600 dark:text-rose-400',
    bg: 'bg-rose-50 border-rose-200 dark:bg-rose-950/30 dark:border-rose-800',
    label: 'Sem Site — Grande Oportunidade!',
  },
};

// Etiquetas pré-definidas — usuário escolhe nome e cor
const LABEL_OPTIONS = [
  { name: 'Quente 🔥',        color: 'bg-red-500' },
  { name: 'Frio ❄️',          color: 'bg-blue-400' },
  { name: 'VIP ⭐',           color: 'bg-yellow-500' },
  { name: 'Aguardando ⏳',    color: 'bg-orange-400' },
  { name: 'Interessado 👍',   color: 'bg-green-500' },
  { name: 'Sem resposta 🔇',  color: 'bg-gray-400' },
  { name: 'Retornar 📞',      color: 'bg-purple-500' },
  { name: 'Prioritário 🎯',   color: 'bg-pink-500' },
];

const STAGE_OPTIONS = [
  { id: 'new',           label: '🔵 Novos Leads' },
  { id: 'contacted',     label: '🟣 Contatados' },
  { id: 'proposal_sent', label: '🟠 Proposta Enviada' },
  { id: 'negotiation',   label: '🟡 Em Negociação' },
  { id: 'won',           label: '🟢 Fechado' },
  { id: 'lost',          label: '🔴 Perdido' },
  { id: 'refused',       label: '⚫ Recusado' },
];

export function LeadCard({ lead, onView, onStageChange, onDelete, onArchive, onLabelChange }: LeadCardProps) {
  const [customLabel, setCustomLabel] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  // Qualidade calculada em tempo real — ignora websiteQuality do Firestore
  const quality = calcQuality(lead.website);
  const qc      = qualityConfig[quality];
  const QIcon   = qc.icon;

  const stop    = (fn: () => void) => (e: React.MouseEvent) => { e.stopPropagation(); fn(); };
  const openUrl = (url: string) => window.open(url.startsWith('http') ? url : `https://${url}`, '_blank');
  const formatDate = (d: Date) =>
    new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(d);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Excluir ${lead.companyName}?`)) onDelete();
  };

  const handleLabelSelect = (name: string, color: string) => {
    onLabelChange?.(name, color);
  };

  const handleCustomLabel = () => {
    if (customLabel.trim()) {
      onLabelChange?.(customLabel.trim(), 'bg-indigo-500');
      setCustomLabel('');
      setShowCustomInput(false);
    }
  };

  const handleRemoveLabel = (e: React.MouseEvent) => {
    e.stopPropagation();
    onLabelChange?.('', '');
  };

  const nomeExibido = lead.companyName?.trim() || `Lead #${lead.id.slice(0, 8)}`;

  return (
    <div
      onClick={onView}
      className="bg-card rounded-xl border border-border hover:border-primary/50 hover:shadow-md dark:hover:shadow-primary/5 transition-all duration-200 cursor-pointer group overflow-hidden"
    >
      {/* Etiqueta colorida no topo — se existir */}
      {(lead as any).label && (
        <div className={cn('px-3 py-1 flex items-center justify-between text-white text-xs font-medium', (lead as any).labelColor || 'bg-indigo-500')}>
          <span className="flex items-center gap-1"><Tag className="w-3 h-3" />{(lead as any).label}</span>
          <button onClick={handleRemoveLabel} className="opacity-70 hover:opacity-100">
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="p-4 pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Building2 className="w-5 h-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-semibold text-sm text-foreground truncate leading-tight mb-1.5">
                {nomeExibido}
              </h4>
              <div className="flex flex-wrap items-center gap-1">
                <Badge variant="secondary" className="text-xs px-1.5 py-0">
                  {lead.niche || 'Outros'}
                </Badge>
                {lead.territory && (
                  <Badge variant="outline" className="text-xs px-1.5 py-0">
                    📍 {lead.territory}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
              <button className="p-1.5 rounded-lg hover:bg-muted opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                <MoreVertical className="w-4 h-4 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">

              <DropdownMenuItem onClick={stop(onView)}>
                <Eye className="w-4 h-4 mr-2" />Ver Detalhes
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              {/* Submenu Mover — todos os estágios */}
              <DropdownMenuSub>
                <DropdownMenuSubTrigger onClick={e => e.stopPropagation()}>
                  <ChevronRight className="w-4 h-4 mr-2" />Mover para...
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  {STAGE_OPTIONS.filter(s => s.id !== lead.stage).map(s => (
                    <DropdownMenuItem key={s.id} onClick={stop(() => onStageChange(s.id as Lead['stage']))}>
                      {s.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>

              {/* Submenu Etiqueta */}
              <DropdownMenuSub>
                <DropdownMenuSubTrigger onClick={e => e.stopPropagation()}>
                  <Tag className="w-4 h-4 mr-2" />Etiqueta
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="w-52">
                  {LABEL_OPTIONS.map(opt => (
                    <DropdownMenuItem
                      key={opt.name}
                      onClick={stop(() => handleLabelSelect(opt.name, opt.color))}
                      className="gap-2"
                    >
                      <span className={cn('w-3 h-3 rounded-full flex-shrink-0', opt.color)} />
                      {opt.name}
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={e => { e.stopPropagation(); e.preventDefault(); setShowCustomInput(true); }}
                    className="gap-2"
                  >
                    <span className="w-3 h-3 rounded-full bg-indigo-500 flex-shrink-0" />
                    Personalizada...
                  </DropdownMenuItem>
                  {showCustomInput && (
                    <div className="px-2 py-1" onClick={e => e.stopPropagation()}>
                      <input
                        autoFocus
                        className="w-full text-xs border rounded px-2 py-1 bg-background"
                        placeholder="Nome da etiqueta"
                        value={customLabel}
                        onChange={e => setCustomLabel(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') handleCustomLabel(); }}
                      />
                    </div>
                  )}
                  {(lead as any).label && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={stop(() => onLabelChange?.('', ''))} className="text-destructive">
                        <X className="w-3 h-3 mr-2" />Remover etiqueta
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuSubContent>
              </DropdownMenuSub>

              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={stop(onArchive)}>
                <Archive className="w-4 h-4 mr-2 text-muted-foreground" />
                Arquivar (Sem Oportunidade)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDelete} className="text-destructive focus:text-destructive">
                <Trash2 className="w-4 h-4 mr-2" />Excluir Lead
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Status do site — calculado em tempo real */}
      <div className={cn('px-4 py-2 border-y text-xs font-medium flex items-center gap-2', qc.bg)}>
        <QIcon className={cn('w-3.5 h-3.5 flex-shrink-0', qc.className)} />
        <span className={qc.className}>{qc.label}</span>
      </div>

      {/* Contato */}
      <div className="px-4 py-3 space-y-1.5">
        {lead.phone && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Phone className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">{lead.phone}</span>
          </div>
        )}
        {lead.notes && lead.notes !== 'Nao' && (
          <div className="text-xs text-muted-foreground italic bg-muted/50 px-2 py-1.5 rounded-md truncate">
            {lead.notes}
          </div>
        )}
        {lead.valor != null && lead.valor > 0 && (
          <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
            <TrendingUp className="w-3.5 h-3.5" />
            R$ {lead.valor.toLocaleString('pt-BR')}
          </div>
        )}
      </div>

      {/* Botões de ação rápida */}
      <div className="px-4 pb-4 grid grid-cols-2 gap-2">
        {(lead.whatsapp || lead.linkWhatsApp) && (
          <button onClick={stop(() => openUrl(lead.linkWhatsApp || `https://wa.me/${lead.whatsapp}`))}
            className="flex items-center justify-center gap-1.5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-medium transition-colors">
            <MessageCircle className="w-3.5 h-3.5" />WhatsApp
          </button>
        )}
        {lead.googleMaps && (
          <button onClick={stop(() => openUrl(lead.googleMaps!))}
            className="flex items-center justify-center gap-1.5 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-xs font-medium transition-colors">
            <MapPin className="w-3.5 h-3.5" />Maps
          </button>
        )}
        {lead.instagram && lead.instagram !== 'Nao encontrado' && (
          <button onClick={stop(() => openUrl(lead.instagram!.startsWith('http') ? lead.instagram! : `https://instagram.com/${lead.instagram!.replace('@', '')}`))}
            className="flex items-center justify-center gap-1.5 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-xs font-medium transition-colors">
            <Instagram className="w-3.5 h-3.5" />Instagram
          </button>
        )}
        {lead.email && (
          <button onClick={stop(() => openUrl(`mailto:${lead.email}`))}
            className="flex items-center justify-center gap-1.5 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium transition-colors">
            <Mail className="w-3.5 h-3.5" />Email
          </button>
        )}
        {lead.website && lead.website !== 'SEM SITE' && (
          <button onClick={stop(() => openUrl(lead.website!))}
            className="flex items-center justify-center gap-1.5 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-medium transition-colors col-span-2">
            <ExternalLink className="w-3.5 h-3.5" />Visitar Site
          </button>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2.5 bg-muted/30 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {formatDate(lead.createdAt)}
        </div>
        <span className="opacity-50">#{lead.id.slice(0, 8)}</span>
      </div>
    </div>
  );
} 