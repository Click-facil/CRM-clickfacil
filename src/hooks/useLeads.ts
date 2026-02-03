import { useState } from 'react';
import { Lead, LeadStage } from '@/types/lead';
import { mockLeads } from '@/data/mockData';

export function useLeads() {
  const [leads, setLeads] = useState<Lead[]>(mockLeads);

  const addLead = (lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newLead: Lead = {
      ...lead,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setLeads((prev) => [...prev, newLead]);
    return newLead;
  };

  const updateLead = (id: string, updates: Partial<Lead>) => {
    setLeads((prev) =>
      prev.map((lead) =>
        lead.id === id
          ? { ...lead, ...updates, updatedAt: new Date() }
          : lead
      )
    );
  };

  const updateLeadStage = (id: string, stage: LeadStage) => {
    updateLead(id, { stage });
  };

  const deleteLead = (id: string) => {
    setLeads((prev) => prev.filter((lead) => lead.id !== id));
  };

  const getLeadsByStage = (stage: LeadStage) => {
    return leads.filter((lead) => lead.stage === stage);
  };

  const getLeadStats = () => {
    const total = leads.length;
    const byStage = {
      new: leads.filter((l) => l.stage === 'new').length,
      contacted: leads.filter((l) => l.stage === 'contacted').length,
      proposal_sent: leads.filter((l) => l.stage === 'proposal_sent').length,
      negotiation: leads.filter((l) => l.stage === 'negotiation').length,
      won: leads.filter((l) => l.stage === 'won').length,
      lost: leads.filter((l) => l.stage === 'lost').length,
    };
    const conversionRate = total > 0 ? ((byStage.won / total) * 100).toFixed(1) : '0';
    
    return { total, byStage, conversionRate };
  };

  return {
    leads,
    addLead,
    updateLead,
    updateLeadStage,
    deleteLead,
    getLeadsByStage,
    getLeadStats,
  };
}
