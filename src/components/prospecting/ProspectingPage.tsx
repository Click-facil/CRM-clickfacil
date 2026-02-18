// src/components/prospecting/ProspectingPage.tsx - VERSÃO COMPLETA

import { NICHES } from '@/types/lead';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Search, MapPin, Zap, AlertCircle, PlayCircle, Download, FileText } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';

export function ProspectingPage() {
  const [selectedNiche, setSelectedNiche] = useState('');
  const [location, setLocation] = useState('Paragominas, PA');
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();

  const handleSearch = () => {
    if (!selectedNiche || !location) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha o nicho e a localização.",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    
    toast({
      title: "Integração em desenvolvimento",
      description: "Em breve você poderá buscar leads diretamente daqui! Por enquanto, use o Python.",
    });

    setTimeout(() => {
      setIsSearching(false);
    }, 2000);
  };

  const downloadScript = (tipo: 'python' | 'manual') => {
    if (tipo === 'python') {
      toast({
        title: "Script Python",
        description: "Use o arquivo scraper_google_maps_v2.py que você já tem!",
      });
    } else {
      const scriptManual = `
# GUIA DE PROSPECÇÃO MANUAL

## Passo 1: Buscar no Google Maps
1. Abra: https://www.google.com.br/maps
2. Busque: "${selectedNiche || '[seu nicho]'} em ${location || '[sua cidade]'}"
3. Role a lista lateral para carregar mais resultados

## Passo 2: Coletar Dados
Para cada empresa, anote:
- ✅ Nome da empresa
- ✅ Telefone/WhatsApp
- ✅ Site (se tiver)
- ✅ Instagram (procure nos botões de redes sociais)
- ✅ Link do Google Maps

## Passo 3: Identificar Oportunidades
Empresas SEM:
- Site próprio (usando Linktree, Facebook, etc)
- Instagram ativo
- Presença digital profissional

## Passo 4: Importar no LeadFlow
1. Vá em Pipeline → Novo Lead
2. Preencha os dados coletados
3. Adicione nas Notas as oportunidades identificadas

## Dica Pro:
Use o scraper Python para automatizar este processo!
python scraper_google_maps_v2.py
      `;
      
      const blob = new Blob([scriptManual], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `guia_prospeccao_${selectedNiche || 'manual'}.txt`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast({
        title: "Guia baixado!",
        description: "Siga o passo a passo para prospectar manualmente.",
      });
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Prospecção Automática</h1>
        <p className="text-muted-foreground mt-1">Encontre leads automaticamente por nicho e localização</p>
      </div>

      {/* Alert - Como Funciona */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Como usar:</strong> Configure o nicho e localização, depois execute o scraper Python.
          Os leads serão importados automaticamente para o LeadFlow!
        </AlertDescription>
      </Alert>

      {/* Search Form */}
      <Card>
        <CardHeader>
          <CardTitle>Configurar Busca</CardTitle>
          <CardDescription>Defina os parâmetros para encontrar leads qualificados</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="niche" className="flex items-center gap-2">
                <Search className="w-4 h-4" /> Nicho *
              </Label>
              <Select value={selectedNiche} onValueChange={setSelectedNiche}>
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

            <div className="space-y-2">
              <Label htmlFor="location" className="flex items-center gap-2">
                <MapPin className="w-4 h-4" /> Localização *
              </Label>
              <Input
                id="location"
                placeholder="Ex: São Paulo, SP"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex flex-wrap gap-3 pt-4 border-t">
            <Button 
              onClick={handleSearch} 
              disabled={!selectedNiche || !location || isSearching}
              className="gap-2"
            >
              {isSearching ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Buscando...
                </>
              ) : (
                <>
                  <PlayCircle className="w-4 h-4" />
                  Iniciar Busca (Em Breve)
                </>
              )}
            </Button>

            <Button 
              variant="outline"
              onClick={() => downloadScript('manual')}
              className="gap-2"
            >
              <FileText className="w-4 h-4" />
              Baixar Guia Manual
            </Button>

            <Button 
              variant="outline"
              onClick={() => downloadScript('python')}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              Ver Script Python
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Instruções Python */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            Usando o Scraper Python (Recomendado)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted p-4 rounded-lg font-mono text-sm space-y-2">
            <div># 1. Configure o nicho no código Python:</div>
            <div className="text-primary">nicho = "{selectedNiche || 'Academias'}"</div>
            <div className="text-muted-foreground"># (arquivo: scraper_google_maps_v2.py, linha ~353)</div>
            
            <div className="pt-2"># 2. Execute o scraper:</div>
            <div className="text-primary">python scraper_google_maps_v2.py</div>
            
            <div className="pt-2"># 3. Copie o CSV:</div>
            <div className="text-primary">cp leads_paragominas.csv lead-compass/public/</div>
            
            <div className="pt-2"># 4. Recarregue o LeadFlow (F5)</div>
            <div className="text-success">✅ Leads importados automaticamente!</div>
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Dica:</strong> O scraper busca automaticamente telefone, site, Instagram e Google Maps.
              Identifica oportunidades como empresas sem site ou com presença digital fraca.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Como Funciona */}
      <Card>
        <CardHeader>
          <CardTitle>Como Funciona</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <span className="text-xl font-bold text-primary">1</span>
              </div>
              <h3 className="font-medium mb-1">Selecione o Nicho</h3>
              <p className="text-sm text-muted-foreground">Escolha o tipo de empresa que quer prospectar</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <span className="text-xl font-bold text-primary">2</span>
              </div>
              <h3 className="font-medium mb-1">Execute o Scraper</h3>
              <p className="text-sm text-muted-foreground">Robô busca no Google Maps automaticamente</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <span className="text-xl font-bold text-primary">3</span>
              </div>
              <h3 className="font-medium mb-1">Análise Automática</h3>
              <p className="text-sm text-muted-foreground">Sistema identifica oportunidades de venda</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-3">
                <span className="text-xl font-bold text-success">4</span>
              </div>
              <h3 className="font-medium mb-1">Leads Prontos</h3>
              <p className="text-sm text-muted-foreground">Importados automaticamente no pipeline</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}