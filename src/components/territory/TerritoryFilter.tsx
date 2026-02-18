// src/components/territory/TerritoryFilter.tsx - Seletor de Território

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin } from 'lucide-react';

interface TerritoryFilterProps {
  territory: string;
  onTerritoryChange: (territory: string) => void;
  isAdmin?: boolean;
}

export function TerritoryFilter({ territory, onTerritoryChange, isAdmin = true }: TerritoryFilterProps) {
  return (
    <div className="flex items-center gap-3">
      <MapPin className="w-5 h-5 text-primary" />
      <Select value={territory} onValueChange={onTerritoryChange}>
        <SelectTrigger className="w-[200px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {isAdmin && (
            <SelectItem value="all">
              <span className="font-semibold">📊 Todos os Territórios</span>
            </SelectItem>
          )}
          <SelectItem value="Paragominas">
            <span className="flex items-center gap-2">
              🏢 Paragominas
            </span>
          </SelectItem>
          <SelectItem value="Belém">
            <span className="flex items-center gap-2">
              🌆 Belém
            </span>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}