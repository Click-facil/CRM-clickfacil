// src/components/upload/UploadCSV.tsx - COM FIREBASE

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { csvToLeads } from '@/utils/csvToLeads';
import { firebaseDB } from '@/lib/firebaseDB';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface UploadCSVProps {
  onSuccess: () => void;
}

export function UploadCSV({ onSuccess }: UploadCSVProps) {
  const [territory, setTerritory] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.name.endsWith('.csv')) {
      setFile(selectedFile);
    } else {
      toast({
        title: "Arquivo inválido",
        description: "Por favor, selecione um arquivo CSV.",
        variant: "destructive",
      });
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

    try {
      // Ler arquivo CSV
      const text = await file.text();
      
      // Converter para leads
      const leads = csvToLeads(text);
      
      if (leads.length === 0) {
        toast({
          title: "CSV vazio",
          description: "Nenhum lead foi encontrado no arquivo.",
          variant: "destructive",
        });
        setIsUploading(false);
        return;
      }

      // Adicionar território aos leads
      const leadsComTerritorio = leads.map(lead => ({
        ...lead,
        territory: territory,
      }));

      // Importar para o Firebase
      const importados = await firebaseDB.importLeads(leadsComTerritorio);

      toast({
        title: "Importação concluída!",
        description: `${importados} leads de ${territory} foram importados com sucesso.`,
      });

      // Limpar formulário
      setFile(null);
      setTerritory('');
      const fileInput = document.getElementById('csv-file') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

      // Callback de sucesso
      onSuccess();

    } catch (error) {
      console.error('Erro ao importar:', error);
      toast({
        title: "Erro ao importar",
        description: "Ocorreu um erro ao processar o arquivo. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Importar Leads do CSV
        </CardTitle>
        <CardDescription>
          Faça upload do CSV gerado pelo scraper Python
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Alerta de instrução */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Como funciona:</strong> Execute o scraper Python, selecione o território e faça upload do CSV gerado.
          </AlertDescription>
        </Alert>

        {/* Seleção de Território */}
        <div className="space-y-2">
          <Label htmlFor="territory">Território *</Label>
          <Select value={territory} onValueChange={setTerritory}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o território dos leads" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Paragominas">Paragominas</SelectItem>
              <SelectItem value="Belém">Belém</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Upload de Arquivo */}
        <div className="space-y-2">
          <Label htmlFor="csv-file">Arquivo CSV *</Label>
          <div className="flex items-center gap-3">
            <input
              id="csv-file"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium"
            />
          </div>
          {file && (
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <FileText className="w-4 h-4" />
              {file.name}
            </p>
          )}
        </div>

        {/* Botão de Upload */}
        <Button 
          onClick={handleUpload} 
          disabled={!file || !territory || isUploading}
          className="w-full gap-2"
        >
          {isUploading ? (
            <>
              <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              Importando...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              Importar Leads
            </>
          )}
        </Button>

        {/* Instruções */}
        <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
          <p><strong>Passo 1:</strong> Execute o scraper Python para gerar o CSV</p>
          <p><strong>Passo 2:</strong> Selecione o território correto</p>
          <p><strong>Passo 3:</strong> Faça upload do arquivo</p>
          <p><strong>Passo 4:</strong> Os leads aparecerão automaticamente no pipeline</p>
        </div>
      </CardContent>
    </Card>
  );
}