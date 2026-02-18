// src/components/layout/Sidebar.tsx - COM CONFIGURAÇÕES

import { cn } from '@/lib/utils';
import { LayoutDashboard, Users, FileText, Search, Settings } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Painel', icon: LayoutDashboard },
  { id: 'pipeline', label: 'Pipeline', icon: Users },
  { id: 'scripts', label: 'Roteiros', icon: FileText },
  { id: 'prospecting', label: 'Prospecção', icon: Search },
  { id: 'settings', label: 'Configurações', icon: Settings },
];

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-card border-r border-border p-6 flex flex-col">
      {/* Logo */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-xl">⚡</span>
          </div>
          <div>
            <h1 className="font-bold text-xl">Click Fácil</h1>
            <p className="text-xs text-muted-foreground">CRM de Prospecção</p>
          </div>
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted text-muted-foreground'
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="pt-6 border-t border-border">
        <div className="text-xs text-muted-foreground space-y-1">
          <p>Versão 2.0</p>
          <p className="flex items-center gap-1">
            <span className="w-2 h-2 bg-success rounded-full animate-pulse" />
            Sistema Online
          </p>
        </div>
      </div>
    </aside>
  );
}