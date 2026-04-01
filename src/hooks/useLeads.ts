// src/hooks/useLeads.ts

import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { Lead, LeadStatus, LEAD_STAGES } from '@/types/lead';
import { useToast } from '@/components/ui/use-toast';
import { firebaseDB } from '@/lib/firebaseDB';

interface UseLeadsProps {
  territory: string;
}

// Normaliza nome para comparação — remove espaços extras, lowercase, sem acentos
function normalizarNome(nome: string): string {
  return nome
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ');
}

export const useLeads = ({ territory }: UseLeadsProps) => {
  const [allLeads, setAllLeads]     = useState<Lead[]>([]);
  const [loading, setLoading]       = useState(true);
  const [currentUid, setCurrentUid] = useState<string | null>(null);
  const { toast } = useToast();

  const leads                = allLeads.filter(l => l.stage !== 'no_opportunity');
  const leadsSemOportunidade = allLeads.filter(l => l.stage === 'no_opportunity');

  useEffect(() => {
    const auth = getAuth();
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        if (user.uid !== currentUid) {
          setAllLeads([]);
          setCurrentUid(user.uid);
        }
      } else {
        setAllLeads([]);
        setCurrentUid(null);
      }
    });
    return () => unsub();
  }, [currentUid]);

  useEffect(() => {
    if (!currentUid) { setLoading(false); return; }
    carregarLeads(currentUid);
  }, [currentUid, territory]);

  const carregarLeads = async (uid?: string) => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) { setLoading(false); return; }
    if (uid && uid !== user.uid) return;

    setLoading(true);
    try {
      const loaded = territory === 'all'
        ? await firebaseDB.getAllLeads()
        : await firebaseDB.getLeadsByTerritory(territory);

      const userAposQuery = getAuth().currentUser;
      if (!userAposQuery || userAposQuery.uid !== user.uid) return;

      setAllLeads(loaded);
    } catch (error) {
      console.error('Erro ao carregar leads:', error);
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
      setAllLeads(prev => prev.map(l =>
        l.id === id ? { ...l, ...updates, updatedAt: new Date() } : l
      ));
      toast({ title: 'Lead atualizado!' });
    }
  };

  const updateLeadLabel = async (id: string, label: string, labelColor: string) => {
    const ok = await firebaseDB.updateLead(id, { label, labelColor } as any);
    if (ok) {
      setAllLeads(prev => prev.map(l =>
        l.id === id ? { ...l, label, labelColor, updatedAt: new Date() } as any : l
      ));
    }
  };

  const updateLeadStage = async (id: string, stage: LeadStatus) => {
    const ok = await firebaseDB.updateLead(id, { stage });
    if (ok) {
      setAllLeads(prev => prev.map(l =>
        l.id === id ? { ...l, stage, updatedAt: new Date() } : l
      ));
    }
  };

  const deleteLead = async (id: string) => {
    const lead = allLeads.find(l => l.id === id);
    const ok = await firebaseDB.deleteLead(id);
    if (ok) {
      setAllLeads(prev => prev.filter(l => l.id !== id));
      toast({
        title: 'Lead removido',
        description: `${lead?.companyName || 'Lead'} removido permanentemente.`,
        variant: 'destructive',
      });
    }
  };

  const arquivarLead = async (id: string) => {
    const ok = await firebaseDB.updateLead(id, { stage: 'no_opportunity' as LeadStatus });
    if (ok) {
      setAllLeads(prev => prev.map(l =>
        l.id === id ? { ...l, stage: 'no_opportunity' as LeadStatus } : l
      ));
    }
  };

  const arquivarSemOportunidade = async () => {
    const paraArquivar = allLeads.filter(l => l.stage === 'new' && l.websiteQuality === 'good');
    for (const lead of paraArquivar) {
      await firebaseDB.updateLead(lead.id, { stage: 'no_opportunity' as LeadStatus });
    }
    setAllLeads(prev => prev.map(l =>
      paraArquivar.find(p => p.id === l.id)
        ? { ...l, stage: 'no_opportunity' as LeadStatus }
        : l
    ));
    toast({ title: `${paraArquivar.length} leads arquivados`, description: 'Leads com site profissional movidos para o arquivo.' });
    return paraArquivar.length;
  };

  const restaurarLead = async (id: string) => {
    const ok = await firebaseDB.updateLead(id, { stage: 'new' as LeadStatus });
    if (ok) {
      setAllLeads(prev => prev.map(l =>
        l.id === id ? { ...l, stage: 'new' as LeadStatus } : l
      ));
      toast({ title: 'Lead restaurado para Novos Leads!' });
    }
  };

  const deletarTodosSemOportunidade = async () => {
    const ids = leadsSemOportunidade.map(l => l.id);
    for (const id of ids) {
      await firebaseDB.deleteLead(id);
    }
    setAllLeads(prev => prev.filter(l => l.stage !== 'no_opportunity'));
    toast({ title: `${ids.length} leads apagados`, description: 'Todos os leads sem oportunidade foram removidos.', variant: 'destructive' });
  };

  // ── Import CSV com deduplicação por nome ─────────────────────────
  // Cruza companyName normalizado com leads existentes — não sobe se já existe
  const importarLeadsCSV = async (novosLeads: Partial<Lead>[]): Promise<{ importados: number; duplicatas: number }> => {
    const nomesExistentes = new Set(allLeads.map(l => normalizarNome(l.companyName)));
    const paraImportar: Partial<Lead>[] = [];
    let duplicatas = 0;

    for (const lead of novosLeads) {
      if (!lead.companyName?.trim()) continue;
      const nomeNorm = normalizarNome(lead.companyName);
      if (nomesExistentes.has(nomeNorm)) {
        duplicatas++;
      } else {
        paraImportar.push(lead);
        nomesExistentes.add(nomeNorm); // evita duplicata dentro do próprio CSV
      }
    }

    const importados = await firebaseDB.importLeads(paraImportar);
    await carregarLeads();

    const msg = duplicatas > 0
      ? `${importados} leads importados. ${duplicatas} duplicatas ignoradas.`
      : `${importados} leads importados com sucesso.`;

    toast({
      title: '✅ Importação concluída',
      description: msg,
      variant: duplicatas > 0 ? 'default' : 'default',
    });

    return { importados, duplicatas };
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
      refused: 0,
    };
    for (const lead of leads) {
      if (byStage[lead.stage] !== undefined) byStage[lead.stage]++;
    }
    const conversionRate = total > 0
      ? ((byStage[LEAD_STAGES.WON] / total) * 100).toFixed(1) : '0.0';
    return { total, byStage, conversionRate };
  };

  return {
    leads,
    leadsSemOportunidade,
    loading,
    addLead,
    updateLead,
    updateLeadLabel,
    updateLeadStage,
    deleteLead,
    arquivarLead,
    arquivarSemOportunidade,
    restaurarLead,
    deletarTodosSemOportunidade,
    importarLeadsCSV,
    getLeadStats,
    recarregarLeads,
  };
};