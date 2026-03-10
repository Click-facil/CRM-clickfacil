// src/components/layout/Sidebar.tsx

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Users, FileText, Search, Settings, Menu, X, Sun, Moon, Archive } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  arquivadosCount?: number;
}

const menuItems = [
  { id: 'dashboard',   label: 'Painel',       icon: LayoutDashboard },
  { id: 'pipeline',    label: 'Pipeline',      icon: Users },
  { id: 'scripts',     label: 'Roteiros',      icon: FileText },
  { id: 'prospecting', label: 'Prospecção',    icon: Search },
  { id: 'settings',    label: 'Configurações', icon: Settings },
];

function useTheme() {
  const [dark, setDark] = useState(() => {
    try {
      const saved = localStorage.getItem('theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch { return false; }
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

  return { dark, toggle: () => setDark(v => !v) };
}

export function Sidebar({ activeTab, onTabChange, arquivadosCount = 0 }: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { dark, toggle } = useTheme();

  const handleTabChange = (tab: string) => { onTabChange(tab); setMobileOpen(false); };

  const Logo = () => (
    <div className="mb-8">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
          <span className="text-primary-foreground font-bold text-xl">⚡</span>
        </div>
        <div>
          <h1 className="font-bold text-xl">Click Fácil</h1>
          <p className="text-xs text-muted-foreground">CRM de Prospecção</p>
        </div>
      </div>
    </div>
  );

  const NavLinks = () => (
    <nav className="flex-1 space-y-1">
      {menuItems.map(item => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => handleTabChange(item.id)}
            className={cn(
              'w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-150',
              isActive
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'hover:bg-muted text-muted-foreground hover:text-foreground'
            )}
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            <span className="font-medium">{item.label}</span>
            {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-foreground/60" />}
          </button>
        );
      })}

      {/* Separador arquivo */}
      <div className="pt-4 pb-1">
        <p className="text-xs text-muted-foreground/50 px-4 uppercase tracking-wider font-semibold">Arquivo</p>
      </div>

      <button
        onClick={() => handleTabChange('sem_oportunidade')}
        className={cn(
          'w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-150',
          activeTab === 'sem_oportunidade'
            ? 'bg-muted text-foreground'
            : 'hover:bg-muted text-muted-foreground hover:text-foreground'
        )}
      >
        <Archive className="w-4 h-4 flex-shrink-0" />
        <span className="text-sm font-medium">Sem Oportunidade</span>
        {arquivadosCount > 0 && (
          <span className="ml-auto text-xs bg-muted-foreground/20 text-muted-foreground px-1.5 py-0.5 rounded-full">
            {arquivadosCount}
          </span>
        )}
      </button>
    </nav>
  );

  const Footer = () => (
    <div className="pt-4 border-t border-border space-y-3">
      <button
        onClick={toggle}
        className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
      >
        {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        <span className="text-sm">{dark ? 'Tema Claro' : 'Tema Escuro'}</span>
        <span className={cn('ml-auto w-8 h-4 rounded-full transition-colors relative flex-shrink-0', dark ? 'bg-primary' : 'bg-muted-foreground/30')}>
          <span className={cn('absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-all duration-200', dark ? 'left-4' : 'left-0.5')} />
        </span>
      </button>
      <div className="text-xs text-muted-foreground px-1 space-y-1">
        <p>Versão 2.0</p>
        <p className="flex items-center gap-1">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          Sistema Online
        </p>
      </div>
    </div>
  );

  const SidebarContent = () => <><Logo /><NavLinks /><Footer /></>;

  return (
    <>
      <aside className="hidden md:flex fixed left-0 top-0 h-screen w-64 bg-card border-r border-border p-6 flex-col z-30">
        <SidebarContent />
      </aside>

      <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-card border-b border-border flex items-center justify-between px-4 z-40">
        <div className="flex items-center gap-3">
          <button onClick={() => setMobileOpen(true)} className="p-2 rounded-lg hover:bg-muted">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">⚡</span>
            </div>
            <span className="font-bold">Click Fácil</span>
          </div>
        </div>
        <button onClick={toggle} className="p-2 rounded-lg hover:bg-muted text-muted-foreground">
          {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-72 max-w-[85vw] h-full bg-card p-6 flex flex-col shadow-xl">
            <button onClick={() => setMobileOpen(false)} className="absolute top-4 right-4 p-1 rounded-lg hover:bg-muted">
              <X className="w-5 h-5" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}
    </>
  );
}