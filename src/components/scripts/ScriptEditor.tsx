import { Script } from '@/types/lead';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Info } from 'lucide-react';
import { useState, useEffect } from 'react';

interface ScriptEditorProps {
  script: Script | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (script: Partial<Script>) => void;
  mode: 'edit' | 'create';
}

const categoryOptions = [
  { value: 'initial', label: 'Primeira Abordagem' },
  { value: 'followup', label: 'Follow-up' },
  { value: 'proposal', label: 'Proposta' },
  { value: 'closing', label: 'Fechamento' },
];

export function ScriptEditor({ script, isOpen, onClose, onSave, mode }: ScriptEditorProps) {
  const [formData, setFormData] = useState<Partial<Script>>({
    name: '',
    content: '',
    category: 'initial',
  });

  useEffect(() => {
    if (script) {
      setFormData(script);
    } else {
      setFormData({
        name: '',
        content: '',
        category: 'initial',
      });
    }
  }, [script]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            {mode === 'create' ? 'Novo Script' : 'Editar Script'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name & Category */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Script *</Label>
              <Input
                id="name"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="Ex: Primeira Abordagem Clínicas"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Categoria *</Label>
              <Select
                value={formData.category || 'initial'}
                onValueChange={(value: any) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Variables Info */}
          <div className="flex items-start gap-3 p-4 bg-info/10 rounded-lg border border-info/20">
            <Info className="w-5 h-5 text-info flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-foreground mb-1">Variáveis disponíveis:</p>
              <p className="text-muted-foreground">
                Use <code className="bg-muted px-1 rounded">{'{nome}'}</code> para o nome do contato e{' '}
                <code className="bg-muted px-1 rounded">{'{empresa}'}</code> para o nome da empresa.
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content">Conteúdo do Script *</Label>
            <Textarea
              id="content"
              rows={12}
              value={formData.content || ''}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              required
              placeholder="Digite aqui o texto do seu script..."
              className="font-mono text-sm"
            />
          </div>

          {/* Preview */}
          {formData.content && (
            <div className="space-y-2">
              <Label>Pré-visualização</Label>
              <div className="p-4 bg-muted rounded-lg text-sm whitespace-pre-wrap">
                {formData.content
                  .replace(/{nome}/g, 'João')
                  .replace(/{empresa}/g, 'Empresa Exemplo')}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              {mode === 'create' ? 'Criar Script' : 'Salvar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
