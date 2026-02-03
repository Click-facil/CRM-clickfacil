import { useState } from 'react';
import { Script } from '@/types/lead';
import { mockScripts } from '@/data/mockData';

export function useScripts() {
  const [scripts, setScripts] = useState<Script[]>(mockScripts);

  const addScript = (script: Omit<Script, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newScript: Script = {
      ...script,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setScripts((prev) => [...prev, newScript]);
    return newScript;
  };

  const updateScript = (id: string, updates: Partial<Script>) => {
    setScripts((prev) =>
      prev.map((script) =>
        script.id === id
          ? { ...script, ...updates, updatedAt: new Date() }
          : script
      )
    );
  };

  const deleteScript = (id: string) => {
    setScripts((prev) => prev.filter((script) => script.id !== id));
  };

  const getScriptsByCategory = (category: Script['category']) => {
    return scripts.filter((script) => script.category === category);
  };

  const applyVariables = (content: string, variables: Record<string, string>) => {
    let result = content;
    Object.entries(variables).forEach(([key, value]) => {
      result = result.replace(new RegExp(`{${key}}`, 'g'), value);
    });
    return result;
  };

  return {
    scripts,
    addScript,
    updateScript,
    deleteScript,
    getScriptsByCategory,
    applyVariables,
  };
}
