// src/components/pipeline/LeadCard.tsx

import { Lead } from '@/types/lead';
import {
  Building2, Globe, AlertTriangle, XCircle,
  MessageCircle, Mail, Instagram, MapPin,
  MoreVertical, Trash2, Eye, Phone, ExternalLink,
  TrendingUp, Calendar
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

interface LeadCardProps {
  lead: Lead;
  onView: () => void;
  onStageChange: (stage: Lead['stage']) => void;
  onDelete: () => void;
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

export function LeadCard({ lead, onView, onStageChange, onDelete }: LeadCardProps) {
  const qc   = qualityConfig[lead.websiteQuality || 'none'];
  const QIcon = qc.icon;

  const stop   = (fn: () => void) => (e: React.MouseEvent) => { e.stopPropagation(); fn(); };
  const openUrl = (url: string) => window.open(url.startsWith('http') ? url : `https://${url}`, '_blank');

  const formatDate = (d: Date) =>
    new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(d);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Excluir ${lead.companyName}?`)) onDelete();
  };

  // Garante que companyName nunca aparece vazio
  const nomeExibido = lead.companyName && lead.companyName.trim()
    ? lead.companyName
    : `Lead #${lead.id.slice(0, 8)}`;

  return (
    <div
      onClick={onView}
      className="bg-card rounded-xl border border-border hover:border-primary/50 hover:shadow-md dark:hover:shadow-primary/5 transition-all duration-200 cursor-pointer group overflow-hidden"
    >
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
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuItem onClick={onView}>
                <Eye className="w-4 h-4 mr-2" />Ver Detalhes
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={stop(() => onStageChange('new'))}>
                🔵 Mover → Novos Líderes
              </DropdownMenuItem>
              <DropdownMenuItem onClick={stop(() => onStageChange('contacted'))}>
                🟣 Mover → Contatados
              </DropdownMenuItem>
              <DropdownMenuItem onClick={stop(() => onStageChange('proposal_sent'))}>
                🟠 Mover → Proposta Enviada
              </DropdownMenuItem>
              <DropdownMenuItem onClick={stop(() => onStageChange('negotiation'))}>
                🟡 Mover → Em Negociação
              </DropdownMenuItem>
              <DropdownMenuItem onClick={stop(() => onStageChange('won'))}>
                🟢 Marcar como Fechado
              </DropdownMenuItem>
              <DropdownMenuItem onClick={stop(() => onStageChange('lost'))}>
                🔴 Marcar como Perdido
              </DropdownMenuItem>
              <DropdownMenuItem onClick={stop(() => onStageChange('refused'))}>
                ⚫ Marcar como Recusado
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleDelete} className="text-destructive focus:text-destructive">
                <Trash2 className="w-4 h-4 mr-2" />Excluir Lead
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Status do site */}
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

      {/* Botões */}
      <div className="px-4 pb-4 grid grid-cols-2 gap-2">
        {(lead.whatsapp || lead.linkWhatsApp) && (
          <button
            onClick={stop(() => openUrl(lead.linkWhatsApp || `https://wa.me/${lead.whatsapp}`))}
            className="flex items-center justify-center gap-1.5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-medium transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5" />WhatsApp
          </button>
        )}
        {lead.googleMaps && (
          <button
            onClick={stop(() => openUrl(lead.googleMaps!))}
            className="flex items-center justify-center gap-1.5 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-xs font-medium transition-colors"
          >
            <MapPin className="w-3.5 h-3.5" />Maps
          </button>
        )}
        {lead.instagram && lead.instagram !== 'Nao encontrado' && (
          <button
            onClick={stop(() => openUrl(lead.instagram!.startsWith('http') ? lead.instagram! : `https://instagram.com/${lead.instagram!.replace('@', '')}`))}
            className="flex items-center justify-center gap-1.5 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-xs font-medium transition-colors"
          >
            <Instagram className="w-3.5 h-3.5" />Instagram
          </button>
        )}
        {lead.email && (
          <button
            onClick={stop(() => openUrl(`mailto:${lead.email}`))}
            className="flex items-center justify-center gap-1.5 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium transition-colors"
          >
            <Mail className="w-3.5 h-3.5" />Email
          </button>
        )}
        {lead.website && lead.website !== 'SEM SITE' && (
          <button
            onClick={stop(() => openUrl(lead.website!))}
            className="flex items-center justify-center gap-1.5 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-medium transition-colors col-span-2"
          >
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