// src/components/scripts/ScriptsPage.tsx — COMPACT

import { Script } from '@/types/lead';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Copy, Edit, Trash2, FileDown, MessageCircle, FileText, Upload, Info } from 'lucide-react';
import { useState, useRef } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ScriptsPageProps {
  scripts: Script[];
  onAddScript: (script: Omit<Script, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateScript: (id: string, updates:   Partial<Script>) => void;
  onDeleteScript: (id: string) => void;
}

const PROPOSTA_CLICKFACIL_B64 = "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";

function base64ToArrayBuffer(b: string): ArrayBuffer {
  const bin = atob(b); const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes.buffer;
}

async function preencherDocx(buffer: ArrayBuffer, campos: { nome: string; empresa: string; data: string; valor: string }): Promise<Blob> {
  const JSZipModule = await import('jszip');
  const JSZip = JSZipModule.default;
  const zip = await JSZip.loadAsync(buffer);
  let xml = await zip.file('word/document.xml')!.async('string');
  const nomeCompleto = campos.empresa ? campos.nome + ' / ' + campos.empresa : campos.nome;
  xml = xml.split('[DATA]').join(campos.data).split('[NOME DO CLIENTE / EMPRESA]').join(nomeCompleto)
    .split('[Nome]').join(campos.nome).split('[VALOR]').join(campos.valor)
    .split('[NOME]').join(campos.nome).split('[EMPRESA]').join(campos.empresa || campos.nome);
  zip.file('word/document.xml', xml);
  return zip.generateAsync({ type: 'blob', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
}

const STORAGE_KEY = 'proposta_docx_b64';

function PropostaGenerator() {
  const [form, setForm] = useState({ nome: '', empresa: '', data: new Date().toLocaleDateString('pt-BR'), valor: '' });
  const [loading, setLoading]       = useState(false);
  const [modeloNome, setModeloNome] = useState<string | null>(() => localStorage.getItem('proposta_modelo_nome'));
  const fileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const set = (campo: string, valor: string) => setForm(prev => ({ ...prev, [campo]: valor }));
  const pronto = form.nome.trim() && form.valor.trim();

  const handleUploadModelo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.name.endsWith('.docx')) { toast({ title: 'Formato inválido', description: 'Use um arquivo .docx', variant: 'destructive' }); return; }
    const reader = new FileReader();
    reader.onload = () => {
      const b64 = (reader.result as string).split(',')[1];
      localStorage.setItem(STORAGE_KEY, b64); localStorage.setItem('proposta_modelo_nome', f.name); setModeloNome(f.name);
      toast({ title: 'Modelo salvo!', description: f.name });
    };
    reader.readAsDataURL(f);
  };

  const getBuffer = (): ArrayBuffer => base64ToArrayBuffer(localStorage.getItem(STORAGE_KEY) || PROPOSTA_CLICKFACIL_B64);

  const handleGerar = async () => {
    if (!pronto) return; setLoading(true);
    try {
      const blob = await preencherDocx(getBuffer(), form);
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href = url; a.download = 'Proposta_' + form.nome.replace(/\s+/g, '_') + '_' + form.data.replace(/\//g, '-') + '.docx';
      a.click(); URL.revokeObjectURL(url);
      toast({ title: 'Proposta gerada!', description: 'Download iniciado.' });
    } catch (e) { console.error(e); toast({ title: 'Erro ao gerar', variant: 'destructive' }); }
    finally { setLoading(false); }
  };

  const handleWhatsApp = () => {
    if (!pronto) return;
    const empresa = form.empresa ? ' para ' + form.empresa : '';
    const texto = 'Olá ' + form.nome + '! 😊\n\nSegue a proposta comercial' + empresa + '.\n\n📋 Resumo:\n• Investimento: R$ ' + form.valor + '\n• Prazo: até 7 dias úteis\n• 50% na aprovação + 50% na entrega\n\nVálida por 7 dias. Qualquer dúvida é só falar! 🚀';
    window.open('https://wa.me/?text=' + encodeURIComponent(texto), '_blank');
  };

  const labelCls = "text-xs font-medium text-muted-foreground";
  const fieldCls = "h-8 text-sm";

  return (
    <Card className="border-primary/30">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <FileText className="w-4 h-4 text-primary" />Gerar Proposta Personalizada
        </CardTitle>
        <CardDescription className="text-xs">Preencha os campos e baixe o .docx com seu modelo</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-3 p-2.5 border rounded-lg bg-muted/40">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium truncate">{modeloNome ?? 'Modelo padrão (Click Fácil)'}</p>
            <p className="text-[10px] text-muted-foreground">{modeloNome ? 'Modelo personalizado' : 'Faça upload do seu .docx'}</p>
          </div>
          <Button size="sm" variant="outline" className="gap-1.5 h-7 text-xs flex-shrink-0" onClick={() => fileRef.current?.click()}>
            <Upload className="w-3 h-3" />{modeloNome ? 'Trocar' : 'Upload'}
          </Button>
          <input ref={fileRef} type="file" accept=".docx" className="hidden" onChange={handleUploadModelo} />
        </div>

        <Alert className="py-2">
          <Info className="h-3.5 w-3.5" />
          <AlertDescription className="text-[10px]">
            Use <strong>[Nome]</strong>, <strong>[EMPRESA]</strong>, <strong>[DATA]</strong>, <strong>[VALOR]</strong> no seu .docx como variáveis.
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className={labelCls}>Nome do cliente *</Label>
            <Input className={fieldCls} placeholder="Ex: João Silva" value={form.nome} onChange={e => set('nome', e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className={labelCls}>Empresa <span className="text-[10px] text-muted-foreground">(opcional)</span></Label>
            <Input className={fieldCls} placeholder="Ex: Clínica Sorriso" value={form.empresa} onChange={e => set('empresa', e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className={labelCls}>Data da proposta *</Label>
            <Input className={fieldCls} placeholder="Ex: 23/02/2025" value={form.data} onChange={e => set('data', e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className={labelCls}>Valor do investimento *</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">R$</span>
              <Input className={`${fieldCls} pl-8`} placeholder="Ex: 1.200,00" value={form.valor} onChange={e => set('valor', e.target.value)} />
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <Button onClick={handleGerar} disabled={!pronto || loading} className="flex-1 gap-1.5" size="sm">
            <FileDown className="w-3.5 h-3.5" />{loading ? 'Gerando...' : 'Baixar Proposta (.docx)'}
          </Button>
          <Button onClick={handleWhatsApp} disabled={!pronto} variant="outline" size="sm"
            className="flex-1 gap-1.5 border-green-500 text-green-600 hover:bg-green-50">
            <MessageCircle className="w-3.5 h-3.5" />Mensagem WhatsApp
          </Button>
        </div>

        {pronto && (
          <p className="text-[10px] text-muted-foreground text-center">
            {form.nome}{form.empresa && ' / ' + form.empresa} — R$ {form.valor} — {form.data}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export function ScriptsPage({ scripts, onAddScript, onUpdateScript, onDeleteScript }: ScriptsPageProps) {
  const [isModalOpen, setIsModalOpen]     = useState(false);
  const [editingScript, setEditingScript] = useState<Script | null>(null);
  const [formData, setFormData]           = useState({ title: '', content: '', category: 'initial' as Script['category'] });
  const { toast } = useToast();

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({ title: 'Copiado!', description: 'Script copiado para a área de transferência.' });
  };

  const handleSave = () => {
    if (!formData.title || !formData.content) { toast({ title: 'Campos obrigatórios', description: 'Preencha título e conteúdo.', variant: 'destructive' }); return; }
    if (editingScript) { onUpdateScript(editingScript.id, formData); }
    else { onAddScript(formData); }
    setIsModalOpen(false); setEditingScript(null); setFormData({ title: '', content: '', category: 'initial' });
  };

  const handleEdit = (script: Script) => {
    setEditingScript(script); setFormData({ title: script.title, content: script.content, category: script.category }); setIsModalOpen(true);
  };

  const handleNew = () => { setEditingScript(null); setFormData({ title: '', content: '', category: 'initial' }); setIsModalOpen(true); };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-sm font-semibold mb-2.5">📄 Proposta Comercial</h2>
        <PropostaGenerator />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2.5">
          <h2 className="text-sm font-semibold">💼 Meus Roteiros</h2>
          <Button onClick={handleNew} size="sm" className="gap-1.5 h-7 text-xs px-2.5">
            <Plus className="w-3.5 h-3.5" />Novo Roteiro
          </Button>
        </div>
        {scripts.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-8 text-center">
              <FileText className="w-8 h-8 text-muted-foreground/40 mb-3" />
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Nenhum roteiro ainda</h3>
              <p className="text-xs text-muted-foreground mb-3">Crie templates para agilizar a prospecção</p>
              <Button onClick={handleNew} size="sm" className="gap-1.5 text-xs h-7">
                <Plus className="w-3 h-3" />Criar primeiro roteiro
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {scripts.map(script => (
              <Card key={script.id}>
                <CardHeader className="pb-2 pt-3 px-3">
                  <CardTitle className="text-sm flex items-center justify-between">
                    <span className="truncate mr-2">{script.title}</span>
                    <div className="flex gap-0.5 flex-shrink-0">
                      <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => handleEdit(script)}>
                        <Edit className="w-3.5 h-3.5" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => onDeleteScript(script.id)}>
                        <Trash2 className="w-3.5 h-3.5 text-destructive" />
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-3 pb-3 space-y-2">
                  <div className="bg-muted p-2.5 rounded text-xs whitespace-pre-wrap max-h-32 overflow-y-auto">
                    {script.content}
                  </div>
                  <Button size="sm" variant="outline" onClick={() => handleCopy(script.content)} className="gap-1.5 w-full h-7 text-xs">
                    <Copy className="w-3 h-3" />Copiar
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-base">{editingScript ? 'Editar Roteiro' : 'Novo Roteiro'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label className="text-xs font-medium text-muted-foreground">Título</Label>
              <Input className="h-8 text-sm" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="Ex: Primeiro Contato - WhatsApp" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-medium text-muted-foreground">Mensagem</Label>
              <Textarea rows={8} className="text-sm resize-none" value={formData.content} onChange={e => setFormData({ ...formData, content: e.target.value })} placeholder="Digite sua mensagem...\n\nUse [NOME], [EMPRESA], [NICHO] como variáveis" />
              <p className="text-[10px] text-muted-foreground">Variáveis: [NOME], [NOME DA EMPRESA], [NICHO], [DIA]</p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
              <Button size="sm" className="h-7 text-xs" onClick={handleSave}>Salvar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}