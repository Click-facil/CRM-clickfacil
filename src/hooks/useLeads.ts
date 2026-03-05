// src/hooks/useLeads.ts - MULTI-USUÁRIO DEFINITIVO

import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { Lead, LeadStatus, LEAD_STAGES } from '@/types/lead';
import { useToast } from '@/components/ui/use-toast';
import { firebaseDB } from '@/lib/firebaseDB';

interface UseLeadsProps {
  territory: string;
}

export const useLeads = ({ territory }: UseLeadsProps) => {
  const [leads, setLeads]     = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUid, setCurrentUid] = useState<string | null>(null);
  const { toast } = useToast();

  // Monitora mudanças de usuário — quando troca de conta, limpa leads imediatamente
  useEffect(() => {
    const auth = getAuth();
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        if (user.uid !== currentUid) {
          setLeads([]);        // limpa estado imediatamente ao trocar usuário
          setCurrentUid(user.uid);
        }
      } else {
        setLeads([]);
        setCurrentUid(null);
      }
    });
    return () => unsub();
  }, [currentUid]);

  // Carrega leads quando uid ou territory mudam
  useEffect(() => {
    if (!currentUid) {
      setLoading(false);
      return;
    }
    carregarLeads(currentUid);
  }, [currentUid, territory]);

  const carregarLeads = async (uid?: string) => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) { setLoading(false); return; }

    // Garante que o uid passado bate com o usuário logado
    if (uid && uid !== user.uid) {
      console.warn('UID inconsistente, abortando carregamento');
      return;
    }

    setLoading(true);
    try {
      const loaded = territory === 'all'
        ? await firebaseDB.getAllLeads()
        : await firebaseDB.getLeadsByTerritory(territory);

      // Verifica se o usuário ainda é o mesmo após a query (evita race condition)
      const userAposQuery = getAuth().currentUser;
      if (!userAposQuery || userAposQuery.uid !== user.uid) {
        console.warn('Usuário mudou durante a query, descartando resultado');
        return;
      }

      setLeads(loaded);
      console.log(`✅ ${loaded.length} leads carregados para ${user.uid.slice(0,8)}`);
    } catch (error) {
      console.error('❌ Erro ao carregar leads:', error);
      toast({
        title: 'Erro ao carregar leads',
        description: 'Não foi possível conectar ao Firebase.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const recarregarLeads = async () => {
    await carregarLeads();
    toast({ title: 'Leads atualizados!' });
  };

  const addLead = async (newLead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) => {
    const id = await firebaseDB.addLead(newLead);
    if (id) {
      await carregarLeads();
      toast({ title: 'Lead adicionado!', description: `${newLead.companyName} adicionado.` });
    }
  };

  const updateLead = async (id: string, updates: Partial<Lead>) => {
    const ok = await firebaseDB.updateLead(id, updates);
    if (ok) {
      setLeads(prev => prev.map(l =>
        l.id === id ? { ...l, ...updates, updatedAt: new Date() } : l
      ));
      toast({ title: 'Lead atualizado!' });
    }
  };

  const updateLeadStage = async (id: string, stage: LeadStatus) => {
    await updateLead(id, { stage });
  };

  const deleteLead = async (id: string) => {
    const lead = leads.find(l => l.id === id);
    const ok = await firebaseDB.deleteLead(id);
    if (ok) {
      setLeads(prev => prev.filter(l => l.id !== id));
      toast({ title: 'Lead removido', description: `${lead?.companyName} removido.`, variant: 'destructive' });
    }
  };

  const getLeadStats = () => {
    const total = leads.length;
    const byStage: Record<string, number> = {
      [LEAD_STAGES.NEW]: 0, [LEAD_STAGES.CONTACTED]: 0,
      [LEAD_STAGES.PROPOSAL_SENT]: 0, [LEAD_STAGES.NEGOTIATION]: 0,
      [LEAD_STAGES.WON]: 0, [LEAD_STAGES.LOST]: 0,
    };
    for (const lead of leads) {
      if (byStage[lead.stage] !== undefined) byStage[lead.stage]++;
    }
    const conversionRate = total > 0
      ? ((byStage[LEAD_STAGES.WON] / total) * 100).toFixed(1) : '0.0';
    return { total, byStage, conversionRate };
  };

  return { leads, loading, addLead, updateLead, updateLeadStage, deleteLead, getLeadStats, recarregarLeads };
};