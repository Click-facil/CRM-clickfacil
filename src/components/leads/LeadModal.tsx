// src/components/leads/LeadModal.tsx - VERSÃO FINAL COMPLETA

import { Lead, LeadStatus, NICHES, PIPELINE_COLUMNS } from '@/types/lead';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  MessageCircle, 
  Mail, 
  Instagram, 
  Globe,
  Building2,
  User,
  Phone,
  MapPin,
  Edit,
  X
} from 'lucide-react';
import { useState, useEffect } from 'react';

interface LeadModalProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (lead: Partial<Lead>) => void;
  mode: 'view' | 'edit' | 'create';
}

export function LeadModal({ lead, isOpen, onClose, onSave, mode: initialMode }: LeadModalProps) {
  const [formData, setFormData] = useState<Partial<Lead>>({});
  const [mode, setMode] = useState<'view' | 'edit' | 'create'>(initialMode);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  useEffect(() => {
    if (isOpen) {
      if (lead) {
        setFormData(lead);
      } else {
        // Reset para novo lead
        setFormData({
          companyName: '',
          niche: '',
          contactName: '',
          email: '',
          phone: '',
          whatsapp: '',
          instagram: '',
          website: '',
          googleMaps: '',
          stage: 'new',
          source: 'manual',
          notes: '',
          valor: 0,
        });
      }
    }
  }, [lead, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.companyName?.trim()) {
      alert('O nome da empresa é obrigatório!');
      return;
    }

    try {
      setIsSaving(true);
      await onSave(formData);
      onClose();
      setMode('view');
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('Erro ao salvar o lead. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = () => {
    setMode('edit');
  };

  const handleCancelEdit = () => {
    setMode('view');
    if (lead) {
      setFormData(lead);
    }
  };

  const isViewMode = mode === 'view';

  const openLink = (url: string) => {
    if (url && url !== 'SEM SITE') {
      const finalUrl = url.startsWith('http') ? url : `https://${url}`;
      window.open(finalUrl, '_blank');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              {mode === 'create' ? 'Novo Lead' : formData.companyName}
            </div>
            {isViewMode && lead && (
              <Button variant="outline" size="sm" onClick={handleEdit} className="gap-2">
                <Edit className="w-4 h-4" />
                Editar
              </Button>
            )}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações da Empresa */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-muted-foreground">Informações da Empresa</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Nome da Empresa *</Label>
                <Input
                  id="companyName"
                  value={formData.companyName || ''}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  disabled={isViewMode}
                  required
                  placeholder="Ex: Eco Solar"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="niche">Nicho *</Label>
                <Select
                  value={formData.niche || ''}
                  onValueChange={(value) => setFormData({ ...formData, niche: value })}
                  disabled={isViewMode}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o nicho" />
                  </SelectTrigger>
                  <SelectContent>
                    {NICHES.map((niche) => (
                      <SelectItem key={niche} value={niche}>{niche}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Contato */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-muted-foreground">Contato</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contactName" className="flex items-center gap-2">
                  <User className="w-4 h-4" /> Nome do Contato
                </Label>
                <Input
                  id="contactName"
                  value={formData.contactName || ''}
                  onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                  disabled={isViewMode}
                  placeholder="Nome da pessoa"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="w-4 h-4" /> Telefone
                </Label>
                <Input
                  id="phone"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  disabled={isViewMode}
                  placeholder="(91) 99999-9999"
                />
              </div>
            </div>
          </div>

          {/* Botões de Ação Rápida (Modo Visualização) */}
          {isViewMode && (
            <div className="flex flex-wrap gap-2 p-4 bg-muted/50 rounded-lg">
              {(formData.whatsapp || formData.linkWhatsApp) && (
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={() => openLink(formData.linkWhatsApp || `https://wa.me/${formData.whatsapp}`)} 
                  className="gap-2"
                >
                  <MessageCircle className="w-4 h-4 text-green-600" /> WhatsApp
                </Button>
              )}
              
              {formData.email && (
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={() => openLink(`mailto:${formData.email}`)} 
                  className="gap-2"
                >
                  <Mail className="w-4 h-4 text-blue-600" /> Email
                </Button>
              )}
              
              {formData.instagram && (
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={() => openLink(formData.instagram?.startsWith('http') ? formData.instagram : `https://instagram.com/${formData.instagram?.replace('@', '')}`)} 
                  className="gap-2"
                >
                  <Instagram className="w-4 h-4 text-pink-600" /> Instagram
                </Button>
              )}
              
              {formData.website && formData.website !== 'SEM SITE' && (
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={() => openLink(formData.website!)} 
                  className="gap-2"
                >
                  <Globe className="w-4 h-4 text-purple-600" /> Website
                </Button>
              )}
              
              {formData.googleMaps && (
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={() => openLink(formData.googleMaps!)} 
                  className="gap-2"
                >
                  <MapPin className="w-4 h-4 text-red-600" /> Google Maps
                </Button>
              )}
            </div>
          )}

          {/* Redes Sociais e Web (Modo Edição) */}
          {!isViewMode && (
            <div className="space-y-4">
              <h3 className="font-semibold text-sm text-muted-foreground">Online</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="whatsapp" className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-green-600" /> WhatsApp
                  </Label>
                  <Input
                    id="whatsapp"
                    placeholder="5591999999999"
                    value={formData.whatsapp || ''}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-blue-600" /> Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="contato@empresa.com"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="instagram" className="flex items-center gap-2">
                    <Instagram className="w-4 h-4 text-pink-600" /> Instagram
                  </Label>
                  <Input
                    id="instagram"
                    placeholder="@empresa ou URL"
                    value={formData.instagram || ''}
                    onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="website" className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-purple-600" /> Website
                  </Label>
                  <Input
                    id="website"
                    placeholder="https://empresa.com"
                    value={formData.website || ''}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  />
                </div>
                
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="googleMaps" className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-red-600" /> Google Maps
                  </Label>
                  <Input
                    id="googleMaps"
                    placeholder="https://maps.google.com/..."
                    value={formData.googleMaps || ''}
                    onChange={(e) => setFormData({ ...formData, googleMaps: e.target.value })}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Estágio e Valor */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Estágio</Label>
              <Select
                value={formData.stage || 'new'}
                onValueChange={(value: LeadStatus) => setFormData({ ...formData, stage: value })}
                disabled={isViewMode}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PIPELINE_COLUMNS.map((column) => (
                    <SelectItem key={column.id} value={column.id}>{column.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="valor">Valor Estimado (R$)</Label>
              <Input
                id="valor"
                type="number"
                min="0"
                step="0.01"
                value={formData.valor || 0}
                onChange={(e) => setFormData({ ...formData, valor: parseFloat(e.target.value) || 0 })}
                disabled={isViewMode}
              />
            </div>
          </div>

          {/* Notas */}
          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              rows={4}
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              disabled={isViewMode}
              placeholder="Adicione observações sobre este lead..."
            />
          </div>

          {/* Ações */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button 
              type="button" 
              variant="outline" 
              onClick={mode === 'edit' ? handleCancelEdit : onClose}
              disabled={isSaving}
            >
              {mode === 'edit' ? 'Cancelar' : 'Fechar'}
            </Button>
            
            {!isViewMode && (
              <Button type="submit" disabled={isSaving}>
                {isSaving ? 'Salvando...' : (mode === 'create' ? 'Criar Lead' : 'Salvar Alterações')}
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}