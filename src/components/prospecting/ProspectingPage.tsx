import { NICHES } from '@/types/lead';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search, MapPin, Zap, AlertCircle } from 'lucide-react';
import { useState } from 'react';

export function ProspectingPage() {
  const [selectedNiche, setSelectedNiche] = useState('');
  const [location, setLocation] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = () => {
    setIsSearching(true);
    // Simulating search - in production this would call the backend
    setTimeout(() => {
      setIsSearching(false);
    }, 2000);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Prospecção Automática</h1>
        <p className="text-muted-foreground mt-1">Encontre leads automaticamente por nicho e localização</p>
      </div>

      {/* Info Banner */}
      <div className="flex items-start gap-4 p-6 bg-warning/10 rounded-xl border border-warning/20">
        <AlertCircle className="w-6 h-6 text-warning flex-shrink-0" />
        <div>
          <h3 className="font-semibold text-foreground mb-1">Funcionalidade em desenvolvimento</h3>
          <p className="text-sm text-muted-foreground">
            Para ativar a busca automática de leads, precisamos conectar o backend (Lovable Cloud). 
            Com isso habilitado, o robô vai buscar perfis no Google Meu Negócio, analisar sites e 
            salvar automaticamente os contatos de empresas que precisam dos seus serviços.
          </p>
          <Button variant="outline" className="mt-4 gap-2">
            <Zap className="w-4 h-4" />
            Habilitar Automação
          </Button>
        </div>
      </div>

      {/* Search Form */}
      <div className="bg-card rounded-xl p-6 card-shadow">
        <h2 className="text-lg font-semibold mb-6">Configurar Busca</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label htmlFor="niche" className="flex items-center gap-2">
              <Search className="w-4 h-4" /> Nicho
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
              <MapPin className="w-4 h-4" /> Localização
            </Label>
            <Input
              id="location"
              placeholder="Ex: São Paulo, SP"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          <div className="flex items-end">
            <Button 
              onClick={handleSearch} 
              disabled={!selectedNiche || !location || isSearching}
              className="w-full gap-2"
            >
              {isSearching ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Buscando...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  Iniciar Busca
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* How it Works */}
      <div className="bg-card rounded-xl p-6 card-shadow">
        <h2 className="text-lg font-semibold mb-6">Como Funciona</h2>
        
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
            <h3 className="font-medium mb-1">Defina a Região</h3>
            <p className="text-sm text-muted-foreground">Informe a cidade ou região de interesse</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
              <span className="text-xl font-bold text-primary">3</span>
            </div>
            <h3 className="font-medium mb-1">Robô Busca</h3>
            <p className="text-sm text-muted-foreground">O sistema analisa Google, redes sociais e sites</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-3">
              <span className="text-xl font-bold text-success">4</span>
            </div>
            <h3 className="font-medium mb-1">Leads Prontos</h3>
            <p className="text-sm text-muted-foreground">Contatos salvos automaticamente no pipeline</p>
          </div>
        </div>
      </div>

      {/* Filters Preview */}
      <div className="bg-card rounded-xl p-6 card-shadow">
        <h2 className="text-lg font-semibold mb-4">Filtros de Qualificação</h2>
        <p className="text-sm text-muted-foreground mb-4">
          O robô irá filtrar e salvar apenas empresas que:
        </p>
        <ul className="space-y-2 text-sm">
          <li className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-destructive" />
            <span>Não possuem site</span>
          </li>
          <li className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-warning" />
            <span>Possuem site desatualizado ou não responsivo</span>
          </li>
          <li className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-success" />
            <span>Têm contatos públicos (WhatsApp, email, redes sociais)</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
