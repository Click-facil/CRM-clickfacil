import { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { Pipeline } from '@/components/pipeline/Pipeline';
import { ScriptsPage } from '@/components/scripts/ScriptsPage';
import { ProspectingPage } from '@/components/prospecting/ProspectingPage';
import { LeadModal } from '@/components/leads/LeadModal';
import { useLeads } from '@/hooks/useLeads';
import { useScripts } from '@/hooks/useScripts';
import { Lead } from '@/types/lead';

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { leads, addLead, updateLead, updateLeadStage, deleteLead, getLeadStats } = useLeads();
  const { scripts, addScript, updateScript, deleteScript } = useScripts();
  
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [leadModalMode, setLeadModalMode] = useState<'view' | 'edit' | 'create'>('view');

  const stats = getLeadStats();

  const handleViewLead = (lead: Lead) => {
    setSelectedLead(lead);
    setLeadModalMode('view');
    setIsLeadModalOpen(true);
  };

  const handleAddLead = () => {
    setSelectedLead(null);
    setLeadModalMode('create');
    setIsLeadModalOpen(true);
  };

  const handleSaveLead = (data: Partial<Lead>) => {
    if (leadModalMode === 'create') {
      addLead(data as Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>);
    } else if (selectedLead) {
      updateLead(selectedLead.id, data);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      
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
            onStageChange={updateLeadStage}
            onDeleteLead={deleteLead}
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
      </main>

      <LeadModal
        lead={selectedLead}
        isOpen={isLeadModalOpen}
        onClose={() => setIsLeadModalOpen(false)}
        onSave={handleSaveLead}
        mode={leadModalMode}
      />
    </div>
  );
};

export default Index;
