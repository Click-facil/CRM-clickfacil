// src/components/territory/TerritoryFilter.tsx - DINÂMICO

import { useEffect, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { firebaseDB } from '@/lib/firebaseDB';

interface TerritoryFilterProps {
  territory: string;
  onTerritoryChange: (t: string) => void;
  isAdmin?: boolean;
}

export function TerritoryFilter({ territory, onTerritoryChange }: TerritoryFilterProps) {
  const [territorios, setTerritorios] = useState<string[]>([]);

  useEffect(() => {
    firebaseDB.getTerritorios()
      .then(setTerritorios)
      .catch(() => setTerritorios([]));
  }, []);

  // Se não tem territórios ainda, não renderiza o filtro
  if (territorios.length === 0) return null;

  return (
    <Select value={territory} onValueChange={onTerritoryChange}>
      <SelectTrigger className="w-[180px] h-8 text-sm">
        <SelectValue placeholder="Todos os territórios" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Todos os territórios</SelectItem>
        {territorios.map(t => (
          <SelectItem key={t} value={t}>{t}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}