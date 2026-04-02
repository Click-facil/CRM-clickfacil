// src/components/layout/Sidebar.tsx — COMPACT

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Users, FileText, Search, Settings, Menu, X, Sun, Moon } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  arquivadosCount?: number;
}

const menuItems = [
  { id: 'dashboard',   label: 'Painel',       icon: LayoutDashboard },
  { id: 'pipeline',    label: 'Pipeline',      icon: Users           },
  { id: 'scripts',     label: 'Roteiros',      icon: FileText        },
  { id: 'prospecting', label: 'Prospecção',    icon: Search          },
  { id: 'settings',    label: 'Configurações', icon: Settings        },
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
    <div className="mb-5">
      <div className="flex items-center gap-2.5">
        <img src="/ponteiro_clickfacil.ico" alt="Click Fácil" className="w-7 h-7 flex-shrink-0" />
        <div>
          <h1 className="font-bold text-base leading-tight">Click Fácil</h1>
          <p className="text-[10px] text-muted-foreground leading-tight">CRM de Prospecção</p>
        </div>
      </div>
    </div>
  );

  const NavLinks = () => (
    <nav className="flex-1 space-y-0.5">
      {menuItems.map(item => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button key={item.id} onClick={() => handleTabChange(item.id)}
            className={cn(
              'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all duration-150 text-sm',
              isActive
                ? 'bg-primary text-primary-foreground shadow-sm font-medium'
                : 'hover:bg-muted text-muted-foreground hover:text-foreground'
            )}>
            <Icon className="w-4 h-4 flex-shrink-0" />
            <span>{item.label}</span>
            {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-foreground/60" />}
          </button>
        );
      })}
    </nav>
  );

  const Footer = () => (
    <div className="pt-3 border-t border-border space-y-2">
      <button onClick={toggle}
        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground text-sm">
        {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        <span>{dark ? 'Tema Claro' : 'Tema Escuro'}</span>
        <span className={cn('ml-auto w-7 h-3.5 rounded-full transition-colors relative flex-shrink-0', dark ? 'bg-primary' : 'bg-muted-foreground/30')}>
          <span className={cn('absolute top-0.5 w-2.5 h-2.5 rounded-full bg-white shadow transition-all duration-200', dark ? 'left-3.5' : 'left-0.5')} />
        </span>
      </button>
      <div className="text-[10px] text-muted-foreground px-3 space-y-0.5">
        <p>Versão 2.0</p>
        <p className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
          Sistema Online
        </p>
      </div>
    </div>
  );

  const SidebarContent = () => <><Logo /><NavLinks /><Footer /></>;

  return (
    <>
      <aside className="hidden md:flex fixed left-0 top-0 h-screen w-56 bg-card border-r border-border px-4 py-5 flex-col z-30">
        <SidebarContent />
      </aside>

      <div className="md:hidden fixed top-0 left-0 right-0 h-12 bg-card border-b border-border flex items-center justify-between px-3 z-40">
        <div className="flex items-center gap-2.5">
          <button onClick={() => setMobileOpen(true)} className="p-1.5 rounded-lg hover:bg-muted">
            <Menu className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
              <img src="/ponteiro_clickfacil.ico" alt="Click Fácil" className="w-4 h-4" />
            </div>
            <span className="font-bold text-sm">Click Fácil</span>
          </div>
        </div>
        <button onClick={toggle} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground">
          {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-64 max-w-[85vw] h-full bg-card px-4 py-5 flex flex-col shadow-xl">
            <button onClick={() => setMobileOpen(false)} className="absolute top-3 right-3 p-1 rounded-lg hover:bg-muted">
              <X className="w-4 h-4" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}
    </>
  );
}