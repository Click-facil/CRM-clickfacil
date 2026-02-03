import { Lead, LeadStage, NICHES } from '@/types/lead';
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
  Facebook, 
  Linkedin,
  Globe,
  Building2,
  User,
  Phone
} from 'lucide-react';
import { useState, useEffect } from 'react';

interface LeadModalProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (lead: Partial<Lead>) => void;
  mode: 'view' | 'edit' | 'create';
}

const stageOptions: { value: LeadStage; label: string }[] = [
  { value: 'new', label: 'Novo Lead' },
  { value: 'contacted', label: 'Contatado' },
  { value: 'proposal_sent', label: 'Proposta Enviada' },
  { value: 'negotiation', label: 'Em Negociação' },
  { value: 'won', label: 'Fechado' },
  { value: 'lost', label: 'Perdido' },
];

export function LeadModal({ lead, isOpen, onClose, onSave, mode }: LeadModalProps) {
  const [formData, setFormData] = useState<Partial<Lead>>({
    companyName: '',
    niche: '',
    contactName: '',
    email: '',
    phone: '',
    whatsapp: '',
    instagram: '',
    facebook: '',
    linkedin: '',
    website: '',
    hasWebsite: false,
    websiteQuality: 'none',
    stage: 'new',
    source: 'manual',
    notes: '',
  });

  useEffect(() => {
    if (lead) {
      setFormData(lead);
    } else {
      setFormData({
        companyName: '',
        niche: '',
        contactName: '',
        email: '',
        phone: '',
        whatsapp: '',
        instagram: '',
        facebook: '',
        linkedin: '',
        website: '',
        hasWebsite: false,
        websiteQuality: 'none',
        stage: 'new',
        source: 'manual',
        notes: '',
      });
    }
  }, [lead]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const isViewMode = mode === 'view';

  const openLink = (type: string) => {
    switch (type) {
      case 'whatsapp':
        if (formData.whatsapp) window.open(`https://wa.me/${formData.whatsapp}`, '_blank');
        break;
      case 'email':
        if (formData.email) window.open(`mailto:${formData.email}`, '_blank');
        break;
      case 'instagram':
        if (formData.instagram) window.open(`https://instagram.com/${formData.instagram.replace('@', '')}`, '_blank');
        break;
      case 'facebook':
        if (formData.facebook) window.open(`https://facebook.com/${formData.facebook}`, '_blank');
        break;
      case 'linkedin':
        if (formData.linkedin) window.open(`https://linkedin.com/in/${formData.linkedin}`, '_blank');
        break;
      case 'website':
        if (formData.website) window.open(formData.website, '_blank');
        break;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" />
            {mode === 'create' ? 'Novo Lead' : formData.companyName}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Company Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Empresa *</Label>
              <Input
                id="companyName"
                value={formData.companyName || ''}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                disabled={isViewMode}
                required
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

          {/* Contact Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contactName" className="flex items-center gap-2">
                <User className="w-4 h-4" /> Contato
              </Label>
              <Input
                id="contactName"
                value={formData.contactName || ''}
                onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                disabled={isViewMode}
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
              />
            </div>
          </div>

          {/* Quick Contact Buttons (View Mode) */}
          {isViewMode && (
            <div className="flex flex-wrap gap-2 p-4 bg-muted rounded-lg">
              {formData.whatsapp && (
                <Button type="button" variant="outline" size="sm" onClick={() => openLink('whatsapp')} className="gap-2">
                  <MessageCircle className="w-4 h-4 text-success" /> WhatsApp
                </Button>
              )}
              {formData.email && (
                <Button type="button" variant="outline" size="sm" onClick={() => openLink('email')} className="gap-2">
                  <Mail className="w-4 h-4 text-primary" /> Email
                </Button>
              )}
              {formData.instagram && (
                <Button type="button" variant="outline" size="sm" onClick={() => openLink('instagram')} className="gap-2">
                  <Instagram className="w-4 h-4 text-pink-500" /> Instagram
                </Button>
              )}
              {formData.facebook && (
                <Button type="button" variant="outline" size="sm" onClick={() => openLink('facebook')} className="gap-2">
                  <Facebook className="w-4 h-4 text-blue-600" /> Facebook
                </Button>
              )}
              {formData.linkedin && (
                <Button type="button" variant="outline" size="sm" onClick={() => openLink('linkedin')} className="gap-2">
                  <Linkedin className="w-4 h-4 text-blue-700" /> LinkedIn
                </Button>
              )}
              {formData.website && (
                <Button type="button" variant="outline" size="sm" onClick={() => openLink('website')} className="gap-2">
                  <Globe className="w-4 h-4" /> Site
                </Button>
              )}
            </div>
          )}

          {/* Social & Contact Fields */}
          {!isViewMode && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="whatsapp" className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-success" /> WhatsApp
                </Label>
                <Input
                  id="whatsapp"
                  placeholder="5511999999999"
                  value={formData.whatsapp || ''}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-primary" /> Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="instagram" className="flex items-center gap-2">
                  <Instagram className="w-4 h-4 text-pink-500" /> Instagram
                </Label>
                <Input
                  id="instagram"
                  placeholder="@usuario"
                  value={formData.instagram || ''}
                  onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="facebook" className="flex items-center gap-2">
                  <Facebook className="w-4 h-4 text-blue-600" /> Facebook
                </Label>
                <Input
                  id="facebook"
                  value={formData.facebook || ''}
                  onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="linkedin" className="flex items-center gap-2">
                  <Linkedin className="w-4 h-4 text-blue-700" /> LinkedIn
                </Label>
                <Input
                  id="linkedin"
                  value={formData.linkedin || ''}
                  onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website" className="flex items-center gap-2">
                  <Globe className="w-4 h-4" /> Website
                </Label>
                <Input
                  id="website"
                  placeholder="https://"
                  value={formData.website || ''}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                />
              </div>
            </div>
          )}

          {/* Website Quality & Stage */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Qualidade do Site</Label>
              <Select
                value={formData.websiteQuality || 'none'}
                onValueChange={(value: any) => setFormData({ ...formData, websiteQuality: value, hasWebsite: value !== 'none' })}
                disabled={isViewMode}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sem site</SelectItem>
                  <SelectItem value="poor">Site ruim</SelectItem>
                  <SelectItem value="good">Site bom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Estágio</Label>
              <Select
                value={formData.stage || 'new'}
                onValueChange={(value: LeadStage) => setFormData({ ...formData, stage: value })}
                disabled={isViewMode}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {stageOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              rows={3}
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              disabled={isViewMode}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              {isViewMode ? 'Fechar' : 'Cancelar'}
            </Button>
            {!isViewMode && (
              <Button type="submit">
                {mode === 'create' ? 'Criar Lead' : 'Salvar'}
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
