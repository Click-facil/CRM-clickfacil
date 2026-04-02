// src/components/settings/DataSettings.tsx — COMPACT

import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RefreshCw, Download, Upload, Database, CheckCircle, XCircle, Loader2, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { csvToLeads } from '@/utils/csvToLeads';
import { firebaseDB } from '@/lib/firebaseDB';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface DataSettingsProps {
  onReloadLeads: () => Promise<void>;
  onClearAllLeads: () => void;
  totalLeads: number;
}

export function DataSettings({ onReloadLeads, totalLeads }: DataSettingsProps) {
  const [isReloading, setIsReloading]       = useState(false);
  const [territory, setTerritory]           = useState('');
  const [file, setFile]                     = useState<File | null>(null);
  const [isUploading, setIsUploading]       = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileInputKey, setFileInputKey]     = useState(Date.now());
  const [uploadStatus, setUploadStatus]     = useState('');
  const [errorMessage, setErrorMessage]     = useState('');
  const { toast } = useToast();

  const handleReload = async () => {
    setIsReloading(true);
    try { await onReloadLeads(); toast({ title: 'Dados atualizados!', description: 'Leads recarregados.' }); }
    catch { toast({ title: 'Erro ao atualizar', variant: 'destructive' }); }
    finally { setIsReloading(false); }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(''); setUploadStatus('');
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.name.toLowerCase().endsWith('.csv')) { setErrorMessage('Selecione um arquivo .csv'); return; }
    if (f.size > 10 * 1024 * 1024)              { setErrorMessage('Arquivo muito grande. Máximo 10MB'); return; }
    if (f.size === 0)                            { setErrorMessage('Arquivo vazio'); return; }
    setFile(f);
  };

  const handleUpload = async () => {
    if (!file)      { toast({ title: 'Selecione um arquivo', variant: 'destructive' }); return; }
    if (!territory) { toast({ title: 'Informe o território/cidade', variant: 'destructive' }); return; }
    setIsUploading(true); setErrorMessage(''); setUploadStatus('Lendo arquivo...'); setUploadProgress(0);
    try {
      const text = await file.text();
      if (!text.trim()) throw new Error('Arquivo CSV está vazio');
      setUploadStatus('Convertendo dados...');
      const leads = csvToLeads(text);
      if (leads.length === 0) throw new Error('Nenhum lead válido encontrado no CSV');
      const leadsComTerritorio = leads.map(lead => ({
        ...lead,
        id: (lead.companyName.trim() + territory).toLowerCase().replace(/[^a-z0-9]/g, ''),
        territory,
      }));
      setUploadStatus('Enviando para Firebase...');
      const importados = await firebaseDB.importLeads(leadsComTerritorio, setUploadProgress);
      toast({ title: 'Importação concluída!', description: `${importados} leads importados em "${territory}".` });
      setFile(null); setTerritory(''); setFileInputKey(Date.now());
      setUploadStatus('Recarregando...');
      setTimeout(async () => { await onReloadLeads(); setUploadStatus(''); }, 500);
    } catch (error: any) {
      setErrorMessage(error.message || 'Erro desconhecido');
      toast({ title: 'Erro ao importar', description: error.message, variant: 'destructive' });
    } finally { setIsUploading(false); setUploadProgress(0); }
  };

  const exportarDados = async () => {
    try {
      const leads = await firebaseDB.exportarLeads();
      if (leads.length === 0) { toast({ title: 'Nenhum dado para exportar', variant: 'destructive' }); return; }
      const blob = new Blob([JSON.stringify(leads, null, 2)], { type: 'application/json' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href = url; a.download = `leads_backup_${new Date().toISOString().split('T')[0]}.json`;
      a.click(); URL.revokeObjectURL(url);
      toast({ title: 'Backup criado!', description: `${leads.length} leads exportados.` });
    } catch { toast({ title: 'Erro ao exportar', variant: 'destructive' }); }
  };

  const labelCls = "text-xs font-medium text-muted-foreground";
  const fieldCls = "h-8 text-sm";

  return (
    <div className="space-y-4">

      {/* Importar CSV */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Upload className="w-4 h-4" />Importar Leads do CSV
          </CardTitle>
          <CardDescription className="text-xs">Faça upload do arquivo CSV gerado pelo scraper</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Alert className="py-2">
            <AlertCircle className="h-3.5 w-3.5" />
            <AlertDescription className="text-xs">
              Leads importados ficam visíveis <strong>apenas para você</strong>. Informe a cidade para organizar o território.
            </AlertDescription>
          </Alert>

          <div className="space-y-1">
            <Label className={labelCls}>Cidade / Território *</Label>
            <Input className={fieldCls} placeholder="Ex: Belém, São Paulo..." value={territory}
              onChange={e => setTerritory(e.target.value)} disabled={isUploading} />
          </div>

          <div className="space-y-1">
            <Label className={labelCls}>Arquivo CSV *</Label>
            <input key={fileInputKey} type="file" accept=".csv" onChange={handleFileChange} disabled={isUploading}
              className="flex h-8 w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs file:border-0 file:bg-transparent file:text-xs file:font-medium disabled:opacity-50" />
            {file && !errorMessage && (
              <p className="text-xs text-green-600 flex items-center gap-1.5">
                <CheckCircle className="w-3 h-3" />{file.name} ({(file.size/1024).toFixed(1)} KB)
              </p>
            )}
            {errorMessage && (
              <p className="text-xs text-destructive flex items-center gap-1.5">
                <XCircle className="w-3 h-3" />{errorMessage}
              </p>
            )}
          </div>

          {isUploading && (
            <Alert className="py-2">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <AlertDescription className="text-xs">
                {uploadStatus} {uploadProgress > 0 && `(${uploadProgress}%)`}
                <Progress value={uploadProgress} className="mt-1.5 h-1" />
              </AlertDescription>
            </Alert>
          )}

          <Button onClick={handleUpload} disabled={!file || !territory || isUploading || !!errorMessage}
            className="w-full gap-2" size="sm">
            {isUploading
              ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Importando...</>
              : <><Upload className="w-3.5 h-3.5" />Importar Leads</>
            }
          </Button>
        </CardContent>
      </Card>

      {/* Gerenciamento */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Database className="w-4 h-4" />Gerenciamento
          </CardTitle>
          <CardDescription className="text-xs">{totalLeads} leads na sua conta</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {[
            {
              title: 'Atualizar Leads', desc: 'Recarrega do Firebase',
              btn: isReloading ? 'Atualizando...' : 'Atualizar',
              icon: <RefreshCw className={`w-3.5 h-3.5 ${isReloading ? 'animate-spin' : ''}`} />,
              onClick: handleReload, disabled: isReloading,
            },
            {
              title: 'Exportar Dados', desc: 'Backup JSON dos seus leads',
              btn: 'Exportar', icon: <Download className="w-3.5 h-3.5" />,
              onClick: exportarDados, disabled: false,
            },
          ].map(item => (
            <div key={item.title} className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="text-sm font-medium leading-tight">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
              <Button onClick={item.onClick} disabled={item.disabled} variant="outline" size="sm" className="gap-1.5 h-7 text-xs">
                {item.icon}{item.btn}
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}