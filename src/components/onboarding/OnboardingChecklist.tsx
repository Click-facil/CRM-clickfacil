// src/components/onboarding/OnboardingChecklist.tsx

import { useState } from 'react';
import { CheckCircle, Circle, ChevronDown, ChevronUp, X } from 'lucide-react';

interface ChecklistItem {
  id: string;
  label: string;
  desc: string;
  done: boolean;
}

interface OnboardingChecklistProps {
  items: ChecklistItem[];
  onDismiss: () => void;
  onGoTo: (tab: string) => void;
}

const TAB_MAP: Record<string, string> = {
  search:   'prospecting',
  pipeline: 'pipeline',
  script:   'scripts',
  proposal: 'scripts',
};

export function OnboardingChecklist({ items, onDismiss, onGoTo }: OnboardingChecklistProps) {
  const [collapsed, setCollapsed] = useState(false);
  const done  = items.filter(i => i.done).length;
  const total = items.length;
  const pct   = Math.round((done / total) * 100);

  if (done === total) return null;

  return (
    // Mobile: bottom bar full width | Desktop: floating card bottom-right
    <div className="
      fixed z-40
      bottom-0 left-0 right-0
      sm:bottom-6 sm:right-6 sm:left-auto sm:w-72
      bg-card border-t sm:border border-border
      sm:rounded-2xl shadow-xl overflow-hidden
    ">
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => setCollapsed(c => !c)}
      >
        <div className="flex items-center gap-2.5">
          <div className="relative w-8 h-8 flex-shrink-0">
            <svg className="w-8 h-8 -rotate-90" viewBox="0 0 32 32">
              <circle cx="16" cy="16" r="12" fill="none" stroke="currentColor" strokeWidth="3" className="text-muted" />
              <circle
                cx="16" cy="16" r="12" fill="none" stroke="currentColor" strokeWidth="3"
                strokeDasharray={`${2 * Math.PI * 12}`}
                strokeDashoffset={`${2 * Math.PI * 12 * (1 - pct / 100)}`}
                className="text-primary transition-all duration-500"
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-primary">
              {done}
            </span>
          </div>
          <div>
            <p className="text-sm font-semibold">Primeiros passos</p>
            <p className="text-xs text-muted-foreground">{done} de {total} concluídos</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {collapsed
            ? <ChevronUp className="w-4 h-4 text-muted-foreground" />
            : <ChevronDown className="w-4 h-4 text-muted-foreground" />
          }
          <button
            onClick={e => { e.stopPropagation(); onDismiss(); }}
            className="p-1 rounded-lg hover:bg-muted transition-colors"
          >
            <X className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Barra de progresso */}
      <div className="h-1 bg-muted mx-4 rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Items — ocultos quando collapsed */}
      {!collapsed && (
        <div className="px-4 py-3 space-y-1 max-h-60 overflow-y-auto">
          {items.map(item => (
            <button
              key={item.id}
              onClick={() => !item.done && onGoTo(TAB_MAP[item.id] || 'dashboard')}
              className={`w-full flex items-start gap-3 p-2.5 rounded-xl transition-all text-left ${
                item.done
                  ? 'opacity-50 cursor-default'
                  : 'hover:bg-muted cursor-pointer'
              }`}
            >
              {item.done
                ? <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                : <Circle      className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
              }
              <div>
                <p className={`text-sm font-medium leading-tight ${
                  item.done ? 'line-through text-muted-foreground' : 'text-foreground'
                }`}>
                  {item.label}
                </p>
                {!item.done && (
                  <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Espaço seguro no iOS */}
      <div className="h-safe-bottom sm:hidden" />
    </div>
  );
}