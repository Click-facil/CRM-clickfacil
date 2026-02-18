// src/pages/Index.tsx - VERSÃO FINAL COM SELEÇÃO DE USUÁRIO

import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { Pipeline } from '@/components/pipeline/Pipeline';
import { ScriptsPage } from '@/components/scripts/ScriptsPage';
import { ProspectingPage } from '@/components/prospecting/ProspectingPage';
import { DataSettings } from '@/components/settings/DataSettings';
import { TerritoryFilter } from '@/components/territory/TerritoryFilter';
import { UserSelector } from '@/components/auth/UserSelector';
import { LeadModal } from '@/components/leads/LeadModal';
import { useLeads } from '@/hooks/useLeads';
import { useScripts } from '@/hooks/useScripts';
import { Lead } from '@/types/lead';
import { useToast } from '@/components/ui/use-toast';
import { Toaster } from '@/components/ui/toaster';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

const Index = () => {
  const [userType, setUserType] = useState<'admin' | 'prospector' | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [territory, setTerritory] = useState('Paragominas');
  const { toast } = useToast();
  
  const { 
    leads, 
    loading,
    addLead, 
    updateLead, 
    updateLeadStage, 
    deleteLead, 
    getLeadStats,
    recarregarLeads,
  } = useLeads({ territory });
  
  const { scripts, addScript, updateScript, deleteScript } = useScripts();
  
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [leadModalMode, setLeadModalMode] = useState<'view' | 'edit' | 'create'>('view');

  const stats = getLeadStats();

  // Verificar se já tem usuário selecionado no localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('leadflow_user_type');
    const savedTerritory = localStorage.getItem('leadflow_territory');
    if (savedUser && savedTerritory) {
      setUserType(savedUser as 'admin' | 'prospector');
      setTerritory(savedTerritory);
    }
  }, []);

  const handleSelectUser = (type: 'admin' | 'prospector', selectedTerritory: string) => {
    setUserType(type);
    setTerritory(selectedTerritory);
    
    // Salvar no localStorage para lembrar
    localStorage.setItem('leadflow_user_type', type);
    localStorage.setItem('leadflow_territory', selectedTerritory);
    
    toast({
      title: type === 'admin' ? "Acesso Admin" : "Acesso Prospectora",
      description: `Território: ${selectedTerritory}`,
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('leadflow_user_type');
    localStorage.removeItem('leadflow_territory');
    setUserType(null);
    toast({
      title: "Sessão encerrada",
      description: "Até logo!",
    });
  };

  const handleViewLead = (lead: Lead) => {
    try {
      setSelectedLead(lead);
      setLeadModalMode('view');
      setIsLeadModalOpen(true);
    } catch (error) {
      console.error('❌ Erro ao abrir lead:', error);
    }
  };

  const handleAddLead = () => {
    try {
      setSelectedLead(null);
      setLeadModalMode('create');
      setIsLeadModalOpen(true);
    } catch (error) {
      console.error('❌ Erro ao abrir formulário:', error);
    }
  };

  const handleSaveLead = async (data: Partial<Lead>) => {
    try {
      if (leadModalMode === 'create') {
        await addLead({ ...data, territory } as Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>);
      } else if (selectedLead) {
        await updateLead(selectedLead.id, data);
      }
      
      setIsLeadModalOpen(false);
      setSelectedLead(null);
      
    } catch (error) {
      console.error('❌ Erro ao salvar lead:', error);
      throw error;
    }
  };

  const handleCloseModal = () => {
    setIsLeadModalOpen(false);
    setSelectedLead(null);
    setLeadModalMode('view');
  };

  const handleReloadLeads = async () => {
    try {
      await recarregarLeads();
    } catch (error) {
      console.error('❌ Erro ao recarregar leads:', error);
    }
  };

  const handleDeleteLead = (leadId: string) => {
    try {
      deleteLead(leadId);
    } catch (error) {
      console.error('❌ Erro ao deletar lead:', error);
    }
  };

  const handleStageChange = (leadId: string, stage: Lead['stage']) => {
    try {
      updateLeadStage(leadId, stage);
    } catch (error) {
      console.error('❌ Erro ao mudar estágio:', error);
    }
  };

  // Se não selecionou usuário, mostra tela de seleção
  if (!userType) {
    return <UserSelector onSelectUser={handleSelectUser} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando leads...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      
      {/* Header com Filtro e Logout */}
      <div className="ml-64 px-8 py-4 border-b bg-card flex items-center justify-between">
        <TerritoryFilter 
          territory={territory} 
          onTerritoryChange={setTerritory}
          isAdmin={userType === 'admin'}
        />
        
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            {userType === 'admin' ? '👑 Admin' : '👤 Prospectora'}
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2">
            <LogOut className="w-4 h-4" />
            Sair
          </Button>
        </div>
      </div>
      
      <main className="ml-64 p-8">
        {activeTab === 'dashboard' && (
          <Dashboard 
            leads={leads} 
            stats={stats} 
            onViewLead={handleViewLead}
          />
        )}
        
        {activeTab === 'pipeline' && (
          <Pipeline
            leads={leads}
            onViewLead={handleViewLead}
            onStageChange={handleStageChange}
            onDeleteLead={handleDeleteLead}
            onAddLead={handleAddLead}
          />
        )}
        
        {activeTab === 'scripts' && (
          <ScriptsPage
            scripts={scripts}
            onAddScript={addScript}
            onUpdateScript={updateScript}
            onDeleteScript={deleteScript}
          />
        )}
        
        {activeTab === 'prospecting' && (
          <ProspectingPage />
        )}

        {activeTab === 'settings' && userType === 'admin' && (
          <DataSettings
            onReloadLeads={handleReloadLeads}
            onClearAllLeads={() => {}}
            totalLeads={leads.length}
          />
        )}

        {activeTab === 'settings' && userType !== 'admin' && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Acesso restrito ao administrador</p>
          </div>
        )}
      </main>

      <LeadModal
        lead={selectedLead}
        isOpen={isLeadModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveLead}
        mode={leadModalMode}
      />

      <Toaster />
    </div>
  );
};

export default Index;