// src/pages/Index_COM_TERRITORIO.tsx

import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged, signOut, User } from 'firebase/auth';
import app from '@/lib/firebase';
import { AuthPage } from '@/components/auth/AuthPage';
import { Sidebar } from '@/components/layout/Sidebar';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { Pipeline } from '@/components/pipeline/Pipeline';
import { ScriptsPage } from '@/components/scripts/ScriptsPage';
import { ProspectingPage } from '@/components/prospecting/ProspectingPage';
import { DataSettings } from '@/components/settings/DataSettings';
import { TerritoryFilter } from '@/components/territory/TerritoryFilter';
import { LeadModal } from '@/components/leads/LeadModal';
import { OnboardingModal } from '@/components/onboarding/OnboardingModal';
import { OnboardingChecklist } from '@/components/onboarding/OnboardingChecklist';
import { useLeads } from '@/hooks/useLeads';
import { useScripts } from '@/hooks/useScripts';
import { Lead } from '@/types/lead';
import { useToast } from '@/components/ui/use-toast';
import { Toaster } from '@/components/ui/toaster';
import { Button } from '@/components/ui/button';
import { LogOut, Loader2 } from 'lucide-react';

const auth = getAuth(app);

const CHECKLIST_INITIAL = [
  { id: 'search',   label: 'Buscar seus primeiros leads',     desc: 'Vá para Prospecção e faça uma busca', done: false },
  { id: 'pipeline', label: 'Explorar o Pipeline',             desc: 'Veja como organizar seus leads', done: false },
  { id: 'script',   label: 'Criar um roteiro de abordagem',   desc: 'Vá para Roteiros e crie um', done: false },
  { id: 'proposal', label: 'Gerar uma proposta',              desc: 'Use um roteiro para gerar proposta', done: false },
];

function AppContent({ user }: { user: User }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [territory, setTerritory] = useState('all');
  const { toast } = useToast();

  // Onboarding — só aparece na primeira vez
  const onboardingKey = `onboarding_done_${user.uid}`;
  const checklistKey  = `checklist_${user.uid}`;

  const [showOnboarding, setShowOnboarding] = useState(
    () => !localStorage.getItem(onboardingKey)
  );
  const [showChecklist, setShowChecklist] = useState(
    () => !localStorage.getItem(`checklist_dismissed_${user.uid}`)
  );
  const [checklist, setChecklist] = useState(() => {
    try {
      const saved = localStorage.getItem(checklistKey);
      return saved ? JSON.parse(saved) : CHECKLIST_INITIAL;
    } catch { return CHECKLIST_INITIAL; }
  });

  const closeOnboarding = () => {
    localStorage.setItem(onboardingKey, '1');
    setShowOnboarding(false);
  };

  const dismissChecklist = () => {
    localStorage.setItem(`checklist_dismissed_${user.uid}`, '1');
    setShowChecklist(false);
  };

  const markChecklistDone = (id: string) => {
    setChecklist(prev => {
      const updated = prev.map(i => i.id === id ? { ...i, done: true } : i);
      localStorage.setItem(checklistKey, JSON.stringify(updated));
      return updated;
    });
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    // Marca checklist automaticamente
    if (tab === 'prospecting') markChecklistDone('search');
    if (tab === 'pipeline')    markChecklistDone('pipeline');
    if (tab === 'scripts')     markChecklistDone('script');
  };

  const { leads, loading, addLead, updateLead, updateLeadStage,
    deleteLead, getLeadStats, recarregarLeads } = useLeads({ territory });
  const { scripts, addScript, updateScript, deleteScript } = useScripts();

  const [selectedLead, setSelectedLead]       = useState<Lead | null>(null);
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [leadModalMode, setLeadModalMode]     = useState<'view' | 'edit' | 'create'>('view');
  const stats = getLeadStats();

  const handleLogout = async () => {
    await signOut(auth);
    toast({ title: 'Sessão encerrada', description: 'Até logo!' });
  };

  const handleViewLead = (lead: Lead) => {
    setSelectedLead(lead); setLeadModalMode('view'); setIsLeadModalOpen(true);
  };
  const handleAddLead = () => {
    setSelectedLead(null); setLeadModalMode('create'); setIsLeadModalOpen(true);
  };
  const handleSaveLead = async (data: Partial<Lead>) => {
    if (leadModalMode === 'create') {
      await addLead({
        ...data,
        territory: territory === 'all' ? '' : territory,
      } as Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>);
    } else if (selectedLead) {
      await updateLead(selectedLead.id, data);
    }
    setIsLeadModalOpen(false);
    setSelectedLead(null);
  };

  // Marca proposta como feita quando usuário estiver na aba scripts e tiver leads
  useEffect(() => {
    if (activeTab === 'scripts' && leads.length > 0) {
      markChecklistDone('proposal');
    }
  }, [activeTab, leads.length]);

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">Carregando seus leads...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Sidebar activeTab={activeTab} onTabChange={handleTabChange} />

      <div className="md:ml-64 pt-14 md:pt-0">
        <div className="sticky top-0 z-20 px-4 md:px-8 py-2 md:py-3 border-b bg-card/95 backdrop-blur-sm flex items-center justify-between gap-3 flex-wrap">
          <TerritoryFilter territory={territory} onTerritoryChange={setTerritory} />
          <div className="flex items-center gap-3 ml-auto">
            <span className="text-sm text-muted-foreground hidden sm:block truncate max-w-[200px]">
              {user.email}
            </span>
            <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2">
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sair</span>
            </Button>
          </div>
        </div>

        <main className="px-4 md:px-8 py-4 md:py-8">
          {activeTab === 'dashboard'   && <Dashboard leads={leads} stats={stats} onViewLead={handleViewLead} />}
          {activeTab === 'pipeline'    && (
            <Pipeline leads={leads} onViewLead={handleViewLead}
              onStageChange={updateLeadStage} onDeleteLead={deleteLead} onAddLead={handleAddLead} />
          )}
          {activeTab === 'scripts'     && (
            <ScriptsPage scripts={scripts} onAddScript={addScript}
              onUpdateScript={updateScript} onDeleteScript={deleteScript} />
          )}
          {activeTab === 'prospecting' && <ProspectingPage />}
          {activeTab === 'settings'    && (
            <DataSettings onReloadLeads={recarregarLeads}
              onClearAllLeads={() => {}} totalLeads={leads.length} />
          )}
        </main>
      </div>

      {/* Onboarding modal — só na primeira vez */}
      {showOnboarding && (
        <OnboardingModal
          userName={user.email?.split('@')[0] || ''}
          onClose={closeOnboarding}
          onGoTo={handleTabChange}
        />
      )}

      {/* Checklist flutuante */}
      {showChecklist && !showOnboarding && (
        <OnboardingChecklist
          items={checklist}
          onDismiss={dismissChecklist}
          onGoTo={handleTabChange}
        />
      )}

      <LeadModal lead={selectedLead} isOpen={isLeadModalOpen}
        onClose={() => { setIsLeadModalOpen(false); setSelectedLead(null); }}
        onSave={handleSaveLead} mode={leadModalMode} />
    </div>
  );
}

const Index = () => {
  const [user, setUser]               = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => {
      setUser(u);
      setAuthLoading(false);
    });
    return () => unsub();
  }, []);

  if (authLoading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Loader2 className="w-10 h-10 animate-spin text-primary" />
    </div>
  );

  if (!user) return (
    <>
      <AuthPage onLogin={() => {}} />
      <Toaster />
    </>
  );

  return (
    <>
      <AppContent key={user.uid} user={user} />
      <Toaster />
    </>
  );
};

export default Index;