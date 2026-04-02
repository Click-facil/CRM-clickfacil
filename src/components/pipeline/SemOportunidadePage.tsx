// src/components/pipeline/SemOportunidadePage.tsx

import { Lead } from '@/types/lead';
import { Globe, Trash2, RotateCcw, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';

interface SemOportunidadePageProps {
  leads: Lead[];
  onRestaurar: (id: string) => void;
  onDeletar: (id: string) => void;
  onDeletarTodos: () => void;
}

export function SemOportunidadePage({
  leads,
  onRestaurar,
  onDeletar,
  onDeletarTodos,
}: SemOportunidadePageProps) {
  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false);

  const handleDeletarTodos = () => {
    if (!confirmDeleteAll) {
      setConfirmDeleteAll(true);
      setTimeout(() => setConfirmDeleteAll(false), 4000);
      return;
    }
    onDeletarTodos();
    setConfirmDeleteAll(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <p className="text-sm text-muted-foreground">
          {leads.length} lead{leads.length !== 1 ? 's' : ''} arquivado{leads.length !== 1 ? 's' : ''}.
          Estes leads existem no banco para evitar duplicatas nas próximas buscas.
        </p>

        {leads.length > 0 && (
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDeletarTodos}
            className="gap-2 flex-shrink-0"
          >
            <Trash2 className="w-4 h-4" />
            {confirmDeleteAll
              ? 'Clique de novo para confirmar'
              : `Apagar todos (${leads.length})`
            }
          </Button>
        )}
      </div>

      {/* Aviso */}
      {leads.length > 0 && (
        <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700 dark:text-amber-300">
            Apagar estes leads significa que a próxima prospecção pode buscá-los novamente.
            Restaure leads que queira voltar para o pipeline.
          </p>
        </div>
      )}

      {/* Lista */}
      {leads.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Archive className="w-12 h-12 text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground font-medium">Nenhum lead arquivado</p>
          <p className="text-sm text-muted-foreground/60 mt-1">
            Leads sem oportunidade aparecerão aqui
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {leads.map(lead => (
            <div
              key={lead.id}
              className="bg-card border border-border rounded-xl p-4 space-y-3 opacity-75 hover:opacity-100 transition-opacity"
            >
              {/* Nome e nicho */}
              <div>
                <p className="font-medium text-sm truncate">
                  {lead.companyName || `Lead #${lead.id.slice(0, 8)}`}
                </p>
                <div className="flex items-center gap-1.5 mt-1 flex-wrap">
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

              {/* Indicador site profissional */}
              <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
                <Globe className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Site Profissional</span>
              </div>

              {/* Telefone */}
              {lead.phone && (
                <p className="text-xs text-muted-foreground truncate">{lead.phone}</p>
              )}

              {/* Ações */}
              <div className="flex gap-2 pt-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onRestaurar(lead.id)}
                  className="flex-1 gap-1.5 text-xs h-8"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Restaurar
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    if (confirm(`Apagar ${lead.companyName || 'este lead'} permanentemente?`)) {
                      onDeletar(lead.id);
                    }
                  }}
                  className="h-8 px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}