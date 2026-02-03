import { Lead } from '@/types/lead';
import { 
  Building2, 
  Globe, 
  AlertTriangle, 
  XCircle,
  MessageCircle,
  Mail,
  Instagram,
  Facebook,
  Linkedin,
  MoreVertical
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface LeadCardProps {
  lead: Lead;
  onView: () => void;
  onStageChange: (stage: Lead['stage']) => void;
  onDelete: () => void;
}

const websiteQualityIcons = {
  good: { icon: Globe, className: 'text-success' },
  poor: { icon: AlertTriangle, className: 'text-warning' },
  none: { icon: XCircle, className: 'text-destructive' },
};

export function LeadCard({ lead, onView, onStageChange, onDelete }: LeadCardProps) {
  const qualityConfig = websiteQualityIcons[lead.websiteQuality || 'none'];
  const QualityIcon = qualityConfig.icon;

  const openWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lead.whatsapp) {
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
      const handle = lead.instagram.replace('@', '');
      window.open(`https://instagram.com/${handle}`, '_blank');
    }
  };

  const openFacebook = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lead.facebook) {
      window.open(`https://facebook.com/${lead.facebook}`, '_blank');
    }
  };

  const openLinkedin = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lead.linkedin) {
      window.open(`https://linkedin.com/in/${lead.linkedin}`, '_blank');
    }
  };

  return (
    <div 
      onClick={onView}
      className="bg-card rounded-xl p-4 card-shadow hover:card-shadow-lg transition-all duration-200 cursor-pointer animate-scale-in group"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Building2 className="w-5 h-5 text-primary" />
          </div>
          <div className="min-w-0">
            <h4 className="font-semibold text-sm truncate">{lead.companyName}</h4>
            <p className="text-xs text-muted-foreground truncate">{lead.niche}</p>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <button className="p-1 rounded-md hover:bg-muted opacity-0 group-hover:opacity-100 transition-opacity">
              <MoreVertical className="w-4 h-4 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onStageChange('new')}>Mover para Novos</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onStageChange('contacted')}>Mover para Contatados</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onStageChange('proposal_sent')}>Mover para Proposta</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onStageChange('negotiation')}>Mover para Negociação</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onStageChange('won')}>Marcar como Fechado</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onStageChange('lost')}>Marcar como Perdido</DropdownMenuItem>
            <DropdownMenuItem onClick={onDelete} className="text-destructive">Excluir</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Website Status */}
      <div className="flex items-center gap-2 mb-3">
        <QualityIcon className={cn('w-4 h-4', qualityConfig.className)} />
        <span className="text-xs text-muted-foreground">
          {lead.websiteQuality === 'good' && 'Site OK'}
          {lead.websiteQuality === 'poor' && 'Site ruim'}
          {lead.websiteQuality === 'none' && 'Sem site'}
        </span>
      </div>

      {/* Contact Name */}
      {lead.contactName && (
        <p className="text-xs text-muted-foreground mb-3 truncate">
          👤 {lead.contactName}
        </p>
      )}

      {/* Quick Actions */}
      <div className="flex items-center gap-1 pt-2 border-t border-border">
        {lead.whatsapp && (
          <button 
            onClick={openWhatsApp}
            className="p-2 rounded-lg hover:bg-success/10 text-success transition-colors"
            title="WhatsApp"
          >
            <MessageCircle className="w-4 h-4" />
          </button>
        )}
        {lead.email && (
          <button 
            onClick={openEmail}
            className="p-2 rounded-lg hover:bg-primary/10 text-primary transition-colors"
            title="Email"
          >
            <Mail className="w-4 h-4" />
          </button>
        )}
        {lead.instagram && (
          <button 
            onClick={openInstagram}
            className="p-2 rounded-lg hover:bg-pink-500/10 text-pink-500 transition-colors"
            title="Instagram"
          >
            <Instagram className="w-4 h-4" />
          </button>
        )}
        {lead.facebook && (
          <button 
            onClick={openFacebook}
            className="p-2 rounded-lg hover:bg-blue-600/10 text-blue-600 transition-colors"
            title="Facebook"
          >
            <Facebook className="w-4 h-4" />
          </button>
        )}
        {lead.linkedin && (
          <button 
            onClick={openLinkedin}
            className="p-2 rounded-lg hover:bg-blue-700/10 text-blue-700 transition-colors"
            title="LinkedIn"
          >
            <Linkedin className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
