// src/hooks/useLeads.ts - COM FIREBASE

import { useState, useEffect } from 'react';
import { Lead, LeadStatus, LEAD_STAGES, WebsiteQuality } from '@/types/lead';
import { useToast } from '@/components/ui/use-toast';
import { firebaseDB } from '@/lib/firebaseDB';

interface UseLeadsProps {
  territory: string; // 'all', 'Paragominas', 'Belém'
}

export const useLeads = ({ territory }: UseLeadsProps) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const carregarLeads = async () => {
    setLoading(true);
    try {
      let loadedLeads: Lead[];
      
      if (territory === 'all') {
        loadedLeads = await firebaseDB.getAllLeads();
      } else {
        loadedLeads = await firebaseDB.getLeadsByTerritory(territory);
      }
      
      setLeads(loadedLeads);
      console.log(`✅ ${loadedLeads.length} leads carregados (${territory})`);
    } catch (error) {
      console.error('❌ Erro ao carregar leads:', error);
      toast({
        title: "Erro ao carregar leads",
        description: "Não foi possível conectar ao Firebase.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarLeads();
  }, [territory]);

  const recarregarLeads = async () => {
    await carregarLeads();
    toast({
      title: "Leads atualizados!",
      description: `${leads.length} leads de ${territory}.`,
    });
  };

  const addLead = async (newLead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const id = await firebaseDB.addLead(newLead);
      
      if (id) {
        // Recarrega para pegar o lead com ID do Firebase
        await carregarLeads();
        
        toast({
          title: "Lead adicionado!",
          description: `${newLead.companyName} foi adicionado com sucesso.`,
        });
      }
    } catch (error) {
      console.error('❌ Erro ao adicionar lead:', error);
      toast({
        title: "Erro ao adicionar",
        description: "Ocorreu um erro. Tente novamente.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateLead = async (id: string, updates: Partial<Lead>) => {
    try {
      const success = await firebaseDB.updateLead(id, updates);
      
      if (success) {
        // Atualiza localmente
        setLeads(prev => prev.map(l => 
          l.id === id 
            ? { ...l, ...updates, updatedAt: new Date() }
            : l
        ));
        
        toast({
          title: "Lead atualizado!",
          description: "As informações foram salvas com sucesso.",
        });
      }
    } catch (error) {
      console.error('❌ Erro ao atualizar lead:', error);
      toast({
        title: "Erro ao atualizar",
        description: "Ocorreu um erro. Tente novamente.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateLeadStage = async (id: string, newStage: LeadStatus) => {
    await updateLead(id, { stage: newStage });
  };

  const deleteLead = async (id: string) => {
    try {
      const lead = leads.find(l => l.id === id);
      const success = await firebaseDB.deleteLead(id);
      
      if (success) {
        setLeads(prev => prev.filter(l => l.id !== id));
        
        toast({
          title: "Lead removido",
          description: `${lead?.companyName} foi removido da lista.`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('❌ Erro ao deletar lead:', error);
      toast({
        title: "Erro ao remover",
        description: "Ocorreu um erro. Tente novamente.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const getLeadStats = () => {
    const total = leads.length;
    const byStage: Record<string, number> = {
      [LEAD_STAGES.NEW]: 0,
      [LEAD_STAGES.CONTACTED]: 0,
      [LEAD_STAGES.PROPOSAL_SENT]: 0,
      [LEAD_STAGES.NEGOTIATION]: 0,
      [LEAD_STAGES.WON]: 0,
      [LEAD_STAGES.LOST]: 0,
    };

    for (const lead of leads) {
      if (byStage[lead.stage] !== undefined) {
        byStage[lead.stage]++;
      }
    }
    
    const conversionRate = total > 0 ? ((byStage[LEAD_STAGES.WON] / total) * 100).toFixed(1) : '0.0';

    return {
      total,
      byStage,
      conversionRate,
    };
  };

  return {
    leads,
    loading,
    addLead,
    updateLead,
    updateLeadStage,
    deleteLead,
    getLeadStats,
    recarregarLeads,
  };
};