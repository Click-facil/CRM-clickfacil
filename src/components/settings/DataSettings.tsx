// src/components/settings/DataSettings.tsx - SEM PROGRESS BAR (FIX)

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RefreshCw, Trash2, Download, Upload, FileText, AlertCircle, Database, CheckCircle, XCircle, Loader2 } from 'lucide-react';
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

export function DataSettings({ onReloadLeads, onClearAllLeads, totalLeads }: DataSettingsProps) {
  const [isReloading, setIsReloading] = useState(false);
  const [territory, setTerritory] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [fileInputKey, setFileInputKey] = useState(Date.now()); // Chave para resetar o input
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const { toast } = useToast();

  const handleReload = async () => {
    setIsReloading(true);
    try {
      await onReloadLeads();
      toast({
        title: "Dados atualizados!",
        description: "Leads recarregados do Firebase.",
      });
    } catch (error) {
      console.error('Erro ao recarregar:', error);
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível recarregar os dados.",
        variant: "destructive",
      });
    } finally {
      setIsReloading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setErrorMessage('');
      setUploadStatus('');
      
      const selectedFile = e.target.files?.[0];
      
      if (!selectedFile) return;
      
      if (!selectedFile.name.toLowerCase().endsWith('.csv')) {
        setErrorMessage('Arquivo inválido. Selecione um arquivo .csv');
        return;
      }
      
      const maxSize = 10 * 1024 * 1024;
      if (selectedFile.size > maxSize) {
        setErrorMessage('Arquivo muito grande. Máximo: 10MB');
        return;
      }
      
      if (selectedFile.size === 0) {
        setErrorMessage('Arquivo vazio');
        return;
      }
      
      setFile(selectedFile);
      console.log('✅ Arquivo selecionado:', selectedFile.name);
      
    } catch (error) {
      console.error('Erro ao selecionar arquivo:', error);
      setErrorMessage('Erro ao selecionar arquivo');
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: "Selecione um arquivo",
        description: "Escolha o CSV para importar.",
        variant: "destructive",
      });
      return;
    }

    if (!territory) {
      toast({
        title: "Selecione o território",
        description: "Escolha se os leads são de Paragominas ou Belém.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setErrorMessage('');
    setUploadStatus('Lendo arquivo...');

    try {
      console.log('🔄 Iniciando importação...');
      
      const text = await file.text();
      console.log('📄 Arquivo lido:', text.length, 'caracteres');
      
      if (!text || text.trim().length === 0) {
        throw new Error('Arquivo CSV está vazio');
      }
      
      setUploadStatus('Convertendo dados...');
      
      let leads;
      try {
        leads = csvToLeads(text);
      } catch (csvError: any) {
        console.error('❌ Erro na conversão:', csvError);
        throw new Error(`Erro ao processar CSV: ${csvError.message}`);
      }
      
      console.log('✅ Leads convertidos:', leads.length);
      
      if (leads.length === 0) {
        throw new Error('Nenhum lead válido encontrado no CSV');
      }
      
      const leadsComTerritorio = leads.map(lead => ({
        ...lead,
        territory: territory,
      }));
      
      setUploadStatus('Enviando para Firebase...');
      console.log('⬆️ Importando para Firebase...');
      
      let importados = 0;
      try {
        importados = await firebaseDB.importLeads(leadsComTerritorio);
      } catch (fbError: any) {
        console.error('❌ Erro no Firebase:', fbError);
        throw new Error(`Erro ao salvar no banco: ${fbError.message}`);
      }
      
      console.log('✅ Importação concluída:', importados, 'leads');
      
      toast({
        title: "Importação concluída!",
        description: `${importados} leads de ${territory} foram importados.`,
      });
      
      // Limpar
      setFile(null);
      setTerritory('');
      setFileInputKey(Date.now()); // Reseta o input de arquivo da forma correta
      
      setUploadStatus('Concluído! Recarregando...');
      
      // Recarregar após 500ms
      setTimeout(async () => {
        await onReloadLeads();
        setUploadStatus('');
      }, 500);

    } catch (error: any) {
      console.error('❌ Erro fatal na importação:', error);
      
      setErrorMessage(error.message || 'Erro desconhecido');
      
      toast({
        title: "Erro ao importar",
        description: error.message || "Ocorreu um erro. Verifique o arquivo e tente novamente.",
        variant: "destructive",
      });
      
    } finally {
      setIsUploading(false);
    }
  };

  const exportarDados = async () => {
    try {
      const allLeads = await firebaseDB.getAllLeads();
      
      if (allLeads.length === 0) {
        toast({
          title: "Nenhum dado",
          description: "Não há leads para exportar.",
          variant: "destructive",
        });
        return;
      }

      const json = JSON.stringify(allLeads, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `leadflow_backup_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);

      toast({
        title: "Backup criado!",
        description: `${allLeads.length} leads exportados.`,
      });
    } catch (error) {
      console.error('Erro ao exportar:', error);
      toast({
        title: "Erro ao exportar",
        description: "Não foi possível criar o backup.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Configurações</h1>
        <p className="text-muted-foreground mt-1">Gerencie seus dados e sincronização</p>
      </div>

      {/* UPLOAD */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Importar Leads do CSV
          </CardTitle>
          <CardDescription>
            Faça upload do arquivo CSV gerado pelo scraper
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Importante:</strong> Selecione o território correto. Aceita arquivos .csv de até 10MB.
            </AlertDescription>
          </Alert>

          {/* Território */}
          <div className="space-y-2">
            <Label>Território *</Label>
            <Select value={territory} onValueChange={setTerritory} disabled={isUploading}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o território" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Paragominas">🏢 Paragominas</SelectItem>
                <SelectItem value="Belém">🌆 Belém</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Upload */}
          <div className="space-y-2">
            <Label>Arquivo CSV *</Label>
            <input
              key={fileInputKey} // Adiciona a key para permitir o reset
              id="csv-file-upload"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              disabled={isUploading}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:opacity-50"
            />
            {file && !errorMessage && (
              <p className="text-sm text-success flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                {file.name} ({(file.size / 1024).toFixed(2)} KB)
              </p>
            )}
            {errorMessage && (
              <p className="text-sm text-destructive flex items-center gap-2">
                <XCircle className="w-4 h-4" />
                {errorMessage}
              </p>
            )}
          </div>

          {/* Status */}
          {uploadStatus && (
            <Alert>
              <Loader2 className="h-4 w-4 animate-spin" />
              <AlertDescription>{uploadStatus}</AlertDescription>
            </Alert>
          )}

          {/* Botão */}
          <Button 
            onClick={handleUpload} 
            disabled={!file || !territory || isUploading || !!errorMessage}
            className="w-full gap-2"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Importando...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Importar Leads
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* GERENCIAMENTO */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Gerenciamento
          </CardTitle>
          <CardDescription>
            {totalLeads} leads no Firebase
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Atualizar */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h3 className="font-medium">Atualizar Leads</h3>
              <p className="text-sm text-muted-foreground">Recarrega do Firebase</p>
            </div>
            <Button
              onClick={handleReload}
              disabled={isReloading}
              variant="outline"
              className="gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isReloading ? 'animate-spin' : ''}`} />
              {isReloading ? 'Atualizando...' : 'Atualizar'}
            </Button>
          </div>

          {/* Exportar */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h3 className="font-medium">Exportar Dados</h3>
              <p className="text-sm text-muted-foreground">Backup JSON</p>
            </div>
            <Button onClick={exportarDados} variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Exportar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}