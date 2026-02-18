import { useState } from 'react';
import { Script } from '@/types/lead'; // Importa o tipo correto

// Dados de exemplo para os scripts
const getMockScripts = (): Script[] => [
  {
    id: 'script-1',
    title: 'Primeiro Contato (WhatsApp)',
    content: 'Olá [Nome do Contato], vi que a [Nome da Empresa] não possui um site profissional. Gostaria de apresentar uma proposta para criarmos uma presença digital de impacto para vocês. Podemos conversar?',
    category: 'initial',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'script-2',
    title: 'Follow-up Pós-Contato',
    content: 'Olá [Nome do Contato], tudo bem? Só para saber se você teve um momento para pensar na nossa conversa sobre o novo site para a [Nome da Empresa]. Fico à disposição!',
    category: 'followup',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const useScripts = () => {
  const [scripts, setScripts] = useState<Script[]>(getMockScripts());

  const addScript = (scriptData: Omit<Script, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newScript: Script = {
      ...scriptData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setScripts(prev => [...prev, newScript]);
  };

  const updateScript = (id: string, updates: Partial<Script>) => setScripts(prev => prev.map(s => s.id === id ? { ...s, ...updates, updatedAt: new Date() } : s));
  const deleteScript = (id: string) => setScripts(prev => prev.filter(s => s.id !== id));
  
  return { scripts, addScript, updateScript, deleteScript };
};