import { Script } from '@/types/lead';
import { ScriptCard } from './ScriptCard';
import { ScriptEditor } from './ScriptEditor';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useState } from 'react';

interface ScriptsPageProps {
  scripts: Script[];
  onAddScript: (script: Omit<Script, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateScript: (id: string, updates: Partial<Script>) => void;
  onDeleteScript: (id: string) => void;
}

export function ScriptsPage({ scripts, onAddScript, onUpdateScript, onDeleteScript }: ScriptsPageProps) {
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [selectedScript, setSelectedScript] = useState<Script | null>(null);
  const [editorMode, setEditorMode] = useState<'edit' | 'create'>('create');

  const handleCreate = () => {
    setSelectedScript(null);
    setEditorMode('create');
    setIsEditorOpen(true);
  };

  const handleEdit = (script: Script) => {
    setSelectedScript(script);
    setEditorMode('edit');
    setIsEditorOpen(true);
  };

  const handleSave = (data: Partial<Script>) => {
    if (editorMode === 'create') {
      onAddScript(data as Omit<Script, 'id' | 'createdAt' | 'updatedAt'>);
    } else if (selectedScript) {
      onUpdateScript(selectedScript.id, data);
    }
  };

  const groupedScripts = {
    initial: scripts.filter((s) => s.category === 'initial'),
    followup: scripts.filter((s) => s.category === 'followup'),
    proposal: scripts.filter((s) => s.category === 'proposal'),
    closing: scripts.filter((s) => s.category === 'closing'),
  };

  const categories = [
    { key: 'initial', label: 'Primeira Abordagem' },
    { key: 'followup', label: 'Follow-up' },
    { key: 'proposal', label: 'Proposta' },
    { key: 'closing', label: 'Fechamento' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Scripts</h1>
          <p className="text-muted-foreground mt-1">Gerencie seus modelos de mensagens</p>
        </div>
        <Button onClick={handleCreate} className="gap-2">
          <Plus className="w-4 h-4" />
          Novo Script
        </Button>
      </div>

      {/* Scripts by Category */}
      {categories.map((category) => {
        const categoryScripts = groupedScripts[category.key as keyof typeof groupedScripts];
        if (categoryScripts.length === 0) return null;

        return (
          <div key={category.key} className="space-y-4">
            <h2 className="text-xl font-semibold">{category.label}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryScripts.map((script) => (
                <ScriptCard
                  key={script.id}
                  script={script}
                  onEdit={() => handleEdit(script)}
                  onDelete={() => onDeleteScript(script.id)}
                />
              ))}
            </div>
          </div>
        );
      })}

      {scripts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">Você ainda não tem scripts criados.</p>
          <Button onClick={handleCreate} className="gap-2">
            <Plus className="w-4 h-4" />
            Criar primeiro script
          </Button>
        </div>
      )}

      <ScriptEditor
        script={selectedScript}
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        onSave={handleSave}
        mode={editorMode}
      />
    </div>
  );
}
