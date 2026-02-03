import { Script } from '@/types/lead';
import { FileText, Edit, Trash2, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface ScriptCardProps {
  script: Script;
  onEdit: () => void;
  onDelete: () => void;
}

const categoryStyles: Record<string, { bg: string; text: string; label: string }> = {
  initial: { bg: 'bg-info/10', text: 'text-info', label: 'Primeira Abordagem' },
  followup: { bg: 'bg-stage-contacted/10', text: 'text-stage-contacted', label: 'Follow-up' },
  proposal: { bg: 'bg-warning/10', text: 'text-warning', label: 'Proposta' },
  closing: { bg: 'bg-success/10', text: 'text-success', label: 'Fechamento' },
};

export function ScriptCard({ script, onEdit, onDelete }: ScriptCardProps) {
  const [copied, setCopied] = useState(false);
  const style = categoryStyles[script.category] || categoryStyles.initial;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(script.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-card rounded-xl p-5 card-shadow hover:card-shadow-lg transition-all duration-200 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <FileText className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">{script.name}</h3>
            <span className={cn(
              'text-xs font-medium px-2 py-0.5 rounded-full',
              style.bg,
              style.text
            )}>
              {style.label}
            </span>
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="text-sm text-muted-foreground line-clamp-3 mb-4 whitespace-pre-wrap">
        {script.content}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-3 border-t border-border">
        <Button variant="outline" size="sm" onClick={handleCopy} className="gap-2">
          {copied ? (
            <>
              <Check className="w-4 h-4" /> Copiado!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" /> Copiar
            </>
          )}
        </Button>
        <Button variant="ghost" size="sm" onClick={onEdit}>
          <Edit className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={onDelete} className="text-destructive hover:text-destructive">
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
