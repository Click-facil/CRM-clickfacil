// src/components/dashboard/RecentLeads.tsx

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lead } from "@/types/lead";
import { Globe, AlertTriangle, XCircle, Phone, MapPin, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface RecentLeadsProps {
  leads: Lead[];
  onViewLead: (lead: Lead) => void;
}

const stageConfig: Record<string, { label: string; color: string }> = {
  new:           { label: 'Novo',      color: 'bg-blue-500/15 text-blue-500' },
  contacted:     { label: 'Contatado', color: 'bg-purple-500/15 text-purple-500' },
  proposal_sent: { label: 'Proposta',  color: 'bg-amber-500/15 text-amber-500' },
  negotiation:   { label: 'Negociação',color: 'bg-orange-500/15 text-orange-500' },
  won:           { label: 'Fechado',   color: 'bg-emerald-500/15 text-emerald-500' },
  lost:          { label: 'Perdido',   color: 'bg-red-500/15 text-red-500' },
  refused:       { label: 'Recusado',  color: 'bg-zinc-500/15 text-zinc-400' },
};

const qualityIcon = {
  good: <Globe className="w-3.5 h-3.5 text-emerald-500" />,
  poor: <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />,
  none: <XCircle className="w-3.5 h-3.5 text-rose-500" />,
};

export function RecentLeads({ leads, onViewLead }: RecentLeadsProps) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex-shrink-0 pb-3">
        <CardTitle className="text-base font-semibold">Leads Recentes</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-0 overflow-hidden">
        {leads.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-sm text-muted-foreground px-6">
            Nenhum lead recente.
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {leads.map((lead) => {
              const stage = stageConfig[lead.stage] || stageConfig.new;
              const initials = (lead.companyName || '??').slice(0, 2).toUpperCase();
              const quality = lead.websiteQuality || 'none';

              return (
                <li
                  key={lead.id}
                  onClick={() => onViewLead(lead)}
                  className="flex items-center gap-3 px-5 py-3.5 hover:bg-muted/50 cursor-pointer transition-colors group"
                >
                  {/* Avatar */}
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 text-xs font-bold text-primary">
                    {initials}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm truncate leading-tight">
                        {lead.companyName || 'Lead sem nome'}
                      </p>
                      {qualityIcon[quality as keyof typeof qualityIcon]}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className="text-xs text-muted-foreground truncate">{lead.niche || 'Outros'}</span>
                      {lead.territory && (
                        <span className="flex items-center gap-0.5 text-xs text-muted-foreground/60">
                          <MapPin className="w-3 h-3" />{lead.territory}
                        </span>
                      )}
                      {lead.phone && (
                        <span className="flex items-center gap-0.5 text-xs text-muted-foreground/60">
                          <Phone className="w-3 h-3" />{lead.phone}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Stage badge + arrow */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium hidden sm:block', stage.color)}>
                      {stage.label}
                    </span>
                    <ArrowUpRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary transition-colors" />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}