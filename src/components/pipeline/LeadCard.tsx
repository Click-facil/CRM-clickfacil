// src/components/pipeline/LeadCard.tsx - VERSÃO PROFISSIONAL COMPLETA

import { Lead } from '@/types/lead';
import { 
  Building2, 
  Globe, 
  AlertTriangle, 
  XCircle,
  MessageCircle,
  Mail,
  Instagram,
  MapPin,
  MoreVertical,
  Trash2,
  Eye,
  Phone,
  ExternalLink,
  TrendingUp,
  Calendar
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

interface LeadCardProps {
  lead: Lead;
  onView: () => void;
  onStageChange: (stage: Lead['stage']) => void;
  onDelete: () => void;
}

const websiteQualityConfig = {
  good: { 
    icon: Globe, 
    className: 'text-emerald-600',
    bg: 'bg-emerald-50 border-emerald-200',
    label: 'Site Profissional',
  },
  poor: { 
    icon: AlertTriangle, 
    className: 'text-amber-600',
    bg: 'bg-amber-50 border-amber-200',
    label: 'Site Genérico - Oportunidade!',
  },
  none: { 
    icon: XCircle, 
    className: 'text-rose-600',
    bg: 'bg-rose-50 border-rose-200',
    label: 'Sem Site - Grande Oportunidade!',
  },
};

export function LeadCard({ lead, onView, onStageChange, onDelete }: LeadCardProps) {
  const qualityConfig = websiteQualityConfig[lead.websiteQuality || 'none'];
  const QualityIcon = qualityConfig.icon;

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Tem certeza que deseja excluir ${lead.companyName}?`)) {
      onDelete();
    }
  };

  const openWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lead.linkWhatsApp) {
      window.open(lead.linkWhatsApp, '_blank');
    } else if (lead.whatsapp) {
      window.open(`https://wa.me/${lead.whatsapp}`, '_blank');
    }
  };

  const openEmail = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lead.email) {
      window.open(`mailto:${lead.email}`, '_blank');
    }
  };

  const openInstagram = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lead.instagram) {
      const url = lead.instagram.startsWith('http') 
        ? lead.instagram 
        : `https://instagram.com/${lead.instagram.replace('@', '')}`;
      window.open(url, '_blank');
    }
  };

  const openGoogleMaps = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lead.googleMaps) {
      window.open(lead.googleMaps, '_blank');
    }
  };

  const openWebsite = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lead.website && lead.website !== 'SEM SITE') {
      const url = lead.website.startsWith('http') ? lead.website : `https://${lead.website}`;
      window.open(url, '_blank');
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', { 
      day: '2-digit', 
      month: 'short' 
    }).format(date);
  };

  return (
    <div 
      onClick={onView}
      className="bg-white rounded-xl border-2 border-gray-100 hover:border-primary/40 hover:shadow-lg transition-all duration-200 cursor-pointer group overflow-hidden"
    >
      {/* Header com Empresa e Menu */}
      <div className="p-4 border-b border-gray-50">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center flex-shrink-0 border border-primary/10">
              <Building2 className="w-6 h-6 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-semibold text-base text-gray-900 truncate mb-1">
                {lead.companyName}
              </h4>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {lead.niche}
                </Badge>
                {lead.territory && (
                  <Badge variant="outline" className="text-xs">
                    📍 {lead.territory}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <button className="p-2 rounded-lg hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                <MoreVertical className="w-4 h-4 text-gray-500" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={onView}>
                <Eye className="w-4 h-4 mr-2" />
                Ver Detalhes
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onStageChange('contacted'); }}>
                Mover para Contatados
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onStageChange('proposal_sent'); }}>
                Mover para Proposta
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onStageChange('won'); }}>
                Marcar como Fechado
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={handleDelete}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Excluir Lead
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Status do Site - DESTAQUE */}
      <div className={cn(
        "px-4 py-3 border-b",
        qualityConfig.bg
      )}>
        <div className="flex items-center gap-2">
          <QualityIcon className={cn('w-4 h-4', qualityConfig.className)} />
          <span className={cn('text-sm font-medium', qualityConfig.className)}>
            {qualityConfig.label}
          </span>
        </div>
      </div>

      {/* Informações de Contato */}
      <div className="p-4 space-y-3">
        {lead.contactName && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-medium">{lead.contactName.charAt(0).toUpperCase()}</span>
            </div>
            <span className="truncate">{lead.contactName}</span>
          </div>
        )}

        {lead.phone && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Phone className="w-4 h-4 text-gray-400" />
            <span className="truncate">{lead.phone}</span>
          </div>
        )}

        {/* Notas/Oportunidades */}
        {lead.notes && (
          <div className="text-xs text-gray-500 italic line-clamp-2 bg-gray-50 p-2 rounded-md">
            "{lead.notes}"
          </div>
        )}

        {/* Valor Estimado */}
        {lead.valor && lead.valor > 0 && (
          <div className="flex items-center gap-2 text-sm font-medium text-emerald-600">
            <TrendingUp className="w-4 h-4" />
            R$ {lead.valor.toLocaleString('pt-BR')}
          </div>
        )}
      </div>

      {/* Quick Actions - GRID DE BOTÕES */}
      <div className="px-4 pb-4">
        <div className="grid grid-cols-2 gap-2">
          {(lead.whatsapp || lead.linkWhatsApp) && (
            <button 
              onClick={openWhatsApp}
              className="flex items-center justify-center gap-2 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white transition-colors text-sm font-medium"
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp
            </button>
          )}
          
          {lead.email && (
            <button 
              onClick={openEmail}
              className="flex items-center justify-center gap-2 py-2.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors text-sm font-medium"
            >
              <Mail className="w-4 h-4" />
              Email
            </button>
          )}
          
          {lead.instagram && (
            <button 
              onClick={openInstagram}
              className="flex items-center justify-center gap-2 py-2.5 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white transition-colors text-sm font-medium"
            >
              <Instagram className="w-4 h-4" />
              Instagram
            </button>
          )}
          
          {lead.googleMaps && (
            <button 
              onClick={openGoogleMaps}
              className="flex items-center justify-center gap-2 py-2.5 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors text-sm font-medium"
            >
              <MapPin className="w-4 h-4" />
              Maps
            </button>
          )}

          {lead.website && lead.website !== 'SEM SITE' && (
            <button 
              onClick={openWebsite}
              className="flex items-center justify-center gap-2 py-2.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white transition-colors text-sm font-medium col-span-2"
            >
              <ExternalLink className="w-4 h-4" />
              Visitar Site
            </button>
          )}
        </div>
      </div>

      {/* Footer com Data */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>{formatDate(lead.createdAt)}</span>
          </div>
          <span className="text-gray-400">#{lead.id.slice(0, 8)}</span>
        </div>
      </div>
    </div>
  );
}