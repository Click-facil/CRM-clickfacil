// src/lib/firebaseDB.ts - Funções do Banco de Dados

import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { db } from './firebase';
import { Lead, LeadStatus } from '@/types/lead';

// Coleção de leads no Firestore
const leadsCollection = collection(db, 'leads');

// Converter Lead para formato Firebase
const leadToFirestore = (lead: Partial<Lead>) => ({
  companyName: lead.companyName || '',
  niche: lead.niche || 'Outros',
  territory: lead.territory || '',
  contactName: lead.contactName || '',
  email: lead.email || '',
  phone: lead.phone || '',
  whatsapp: lead.whatsapp || '',
  instagram: lead.instagram || '',
  facebook: lead.facebook || '',
  linkedin: lead.linkedin || '',
  website: lead.website || '',
  googleMaps: lead.googleMaps || '',
  linkWhatsApp: lead.linkWhatsApp || '',
  stage: lead.stage || 'new',
  source: lead.source || 'scraper',
  websiteQuality: lead.websiteQuality || 'none',
  notes: lead.notes || '',
  dataContato: lead.dataContato || new Date().toISOString().split('T')[0],
  valor: lead.valor || 0,
  createdAt: lead.createdAt ? Timestamp.fromDate(lead.createdAt) : Timestamp.now(),
  updatedAt: Timestamp.now(),
});

// Converter Firebase para Lead
const firestoreToLead = (id: string, data: any): Lead => ({
  id,
  companyName: data.companyName || '',
  niche: data.niche || 'Outros',
  territory: data.territory,
  contactName: data.contactName || '',
  email: data.email || '',
  phone: data.phone || '',
  whatsapp: data.whatsapp || '',
  instagram: data.instagram || '',
  facebook: data.facebook || '',
  linkedin: data.linkedin || '',
  website: data.website || '',
  googleMaps: data.googleMaps || '',
  linkWhatsApp: data.linkWhatsApp || '',
  stage: data.stage as LeadStatus,
  source: data.source,
  websiteQuality: data.websiteQuality,
  notes: data.notes || '',
  dataContato: data.dataContato,
  valor: data.valor || 0,
  createdAt: data.createdAt?.toDate() || new Date(),
  updatedAt: data.updatedAt?.toDate() || new Date(),
});

export const firebaseDB = {
  // Buscar todos os leads
  async getAllLeads(): Promise<Lead[]> {
    try {
      const q = query(leadsCollection, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => firestoreToLead(doc.id, doc.data()));
    } catch (error) {
      console.error('Erro ao buscar leads:', error);
      return [];
    }
  },

  // Buscar leads por território
  async getLeadsByTerritory(territory: string): Promise<Lead[]> {
    try {
      const q = query(
        leadsCollection, 
        where('territory', '==', territory),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => firestoreToLead(doc.id, doc.data()));
    } catch (error) {
      console.error('Erro ao buscar leads por território:', error);
      return [];
    }
  },

  // Buscar lead por ID
  async getLeadById(id: string): Promise<Lead | null> {
    try {
      const docRef = doc(leadsCollection, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return firestoreToLead(docSnap.id, docSnap.data());
      }
      return null;
    } catch (error) {
      console.error('Erro ao buscar lead:', error);
      return null;
    }
  },

  // Adicionar lead
  async addLead(lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>): Promise<string | null> {
    try {
      const leadData = leadToFirestore(lead);
      const docRef = await addDoc(leadsCollection, leadData);
      console.log('✅ Lead adicionado:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('❌ Erro ao adicionar lead:', error);
      return null;
    }
  },

  // Atualizar lead
  async updateLead(id: string, updates: Partial<Lead>): Promise<boolean> {
    try {
      const docRef = doc(leadsCollection, id);
      const updateData = leadToFirestore(updates);
      await updateDoc(docRef, updateData);
      console.log('✅ Lead atualizado:', id);
      return true;
    } catch (error) {
      console.error('❌ Erro ao atualizar lead:', error);
      return false;
    }
  },

  // Deletar lead
  async deleteLead(id: string): Promise<boolean> {
    try {
      const docRef = doc(leadsCollection, id);
      await deleteDoc(docRef);
      console.log('✅ Lead deletado:', id);
      return true;
    } catch (error) {
      console.error('❌ Erro ao deletar lead:', error);
      return false;
    }
  },

  // Importar múltiplos leads (do CSV)
  async importLeads(leads: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<number> {
    let imported = 0;
    
    for (const lead of leads) {
      const id = await this.addLead(lead);
      if (id) imported++;
    }
    
    console.log(`✅ ${imported} leads importados de ${leads.length}`);
    return imported;
  },

  // Estatísticas por território
  async getStatsByTerritory(territory: string) {
    try {
      const leads = await this.getLeadsByTerritory(territory);
      
      const stats = {
        total: leads.length,
        new: leads.filter(l => l.stage === 'new').length,
        contacted: leads.filter(l => l.stage === 'contacted').length,
        proposal_sent: leads.filter(l => l.stage === 'proposal_sent').length,
        negotiation: leads.filter(l => l.stage === 'negotiation').length,
        won: leads.filter(l => l.stage === 'won').length,
        lost: leads.filter(l => l.stage === 'lost').length,
      };
      
      return stats;
    } catch (error) {
      console.error('Erro ao calcular estatísticas:', error);
      return null;
    }
  }
};