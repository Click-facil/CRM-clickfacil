// src/components/prospecting/ProspectingPage.tsx

import { useState } from 'react';
import { getAuth } from 'firebase/auth';
import { NICHES } from '@/types/lead';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Search, MapPin, Loader2, CheckCircle, AlertCircle, Zap, ArrowRight } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const CLOUD_FUNCTION_URL = 'https://buscarleads-35yar6pipq-uc.a.run.app';

interface ProspectingPageProps {
  onLeadsAdded?: () => void;
  onGoToPipeline?: () => void;
}

export function ProspectingPage({ onLeadsAdded, onGoToPipeline }: ProspectingPageProps) {
  const [nicho, setNicho]         = useState('');
  const [cidade, setCidade]       = useState('');
  const [estado, setEstado]       = useState('PA');
  const [maxLeads, setMaxLeads]   = useState('20');
  const [loading, setLoading]     = useState(false);
  const [resultado, setResultado] = useState<{ total: number; message: string } | null>(null);
  const { toast } = useToast();

  const handleBuscar = async () => {
    if (!nicho || !cidade) {
      toast({ title: 'Preencha o nicho e a cidade', variant: 'destructive' });
      return;
    }

    setLoading(true);
    setResultado(null);

    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) throw new Error('Você precisa estar logado');
      const idToken = await user.getIdToken();

      const response = await fetch(CLOUD_FUNCTION_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nicho, cidade, estado, maxLeads: Number(maxLeads), idToken }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Erro na busca');

      setResultado({ total: data.total, message: data.message });
      toast({ title: '✅ Busca concluída!', description: data.message });

      // Notifica o Index para recarregar os leads automaticamente
      onLeadsAdded?.();

    } catch (error: any) {
      toast({
        title: 'Erro na busca',
        description: error.message || 'Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Prospecção Automática</h1>
        <p className="text-muted-foreground mt-1">Encontre leads no Google Maps com um clique</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            Configurar Busca
          </CardTitle>
          <CardDescription>
            Os leads encontrados vão direto para o seu Pipeline
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Search className="w-4 h-4" />Nicho *
              </Label>
              <Select value={nicho} onValueChange={setNicho}>
                <SelectTrigger><SelectValue placeholder="Selecione o nicho" /></SelectTrigger>
                <SelectContent>
                  {NICHES.map(n => <SelectItem key={n} value={n}>{n}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />Cidade *
              </Label>
              <Input
                placeholder="Ex: Belém, São Paulo..."
                value={cidade}
                onChange={e => setCidade(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Estado</Label>
              <Input
                placeholder="Ex: PA"
                value={estado}
                onChange={e => setEstado(e.target.value.toUpperCase())}
                maxLength={2}
              />
            </div>

            <div className="space-y-2">
              <Label>Quantidade de leads</Label>
              <Select value={maxLeads} onValueChange={setMaxLeads}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 leads</SelectItem>
                  <SelectItem value="20">20 leads</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={handleBuscar}
            disabled={!nicho || !cidade || loading}
            className="w-full gap-2"
            size="lg"
          >
            {loading
              ? <><Loader2 className="w-4 h-4 animate-spin" />Buscando leads...</>
              : <><Search className="w-4 h-4" />Buscar Leads Agora</>
            }
          </Button>

          {loading && (
            <Alert>
              <Loader2 className="h-4 w-4 animate-spin" />
              <AlertDescription>
                Buscando <strong>{nicho}</strong> em <strong>{cidade}, {estado}</strong>...
                Isso pode levar até 30 segundos.
              </AlertDescription>
            </Alert>
          )}

          {resultado && (
            <Alert className="border-green-200 bg-green-50 dark:bg-green-950/20">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700 dark:text-green-400">
                <strong>{resultado.message}</strong>
                <br />
                <button
                  onClick={onGoToPipeline}
                  className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-green-700 dark:text-green-400 hover:underline"
                >
                  Ver no Pipeline <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Como funciona</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-sm">
            {[
              { n: '1', label: 'Escolha o nicho',    desc: 'e a cidade alvo' },
              { n: '2', label: 'Clique em Buscar',   desc: 'o servidor trabalha por você' },
              { n: '3', label: 'Google Maps API',    desc: 'encontra as empresas' },
              { n: '4', label: 'Leads no Pipeline',  desc: 'prontos para contato', ok: true },
            ].map(({ n, label, desc, ok }) => (
              <div key={n} className="space-y-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto font-bold text-sm ${ok ? 'bg-green-100 text-green-700 dark:bg-green-900/30' : 'bg-primary/10 text-primary'}`}>
                  {n}
                </div>
                <p className="font-medium">{label}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>

          <Alert className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              A busca usa a Google Maps API oficial — dados mais confiáveis que scraping.
              Cada usuário vê apenas os leads da sua própria busca.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}