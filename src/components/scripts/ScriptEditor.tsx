import { Script } from "@/types/lead";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  const [formData, setFormData] = useState<Partial<Script>>({ title: '', content: '', category: 'initial' });

  useEffect(() => {
    if (script) {
      setFormData(script);
    } else {
      setFormData({ title: '', content: '', category: 'initial' });
    }
  }, [script, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Novo Script' : 'Editar Script'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Título</Label>
            <Input id="title" value={formData.title || ''} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
          </div>
          <div>
            <Label htmlFor="category">Categoria</Label>
            <Select value={formData.category || 'initial'} onValueChange={(value: any) => setFormData({ ...formData, category: value })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {categoryOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="content">Conteúdo</Label>
            <Textarea id="content" rows={6} value={formData.content || ''} onChange={(e) => setFormData({ ...formData, content: e.target.value })} required />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit">Salvar</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}