// src/components/prospecting/ProspectingPage.tsx — COMPACT

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
  const [resultado, setResultado] = useState<{ novos: number; atualizados: number; message: string } | null>(null);
  const { toast } = useToast();

  const handleBuscar = async () => {
    if (!nicho || !cidade) { toast({ title: 'Preencha o nicho e a cidade', variant: 'destructive' }); return; }
    setLoading(true); setResultado(null);
    try {
      const user = getAuth().currentUser;
      if (!user) throw new Error('Você precisa estar logado');
      const idToken = await user.getIdToken();
      const response = await fetch(CLOUD_FUNCTION_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nicho, cidade, estado, maxLeads: Number(maxLeads), idToken }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Erro na busca');
      setResultado({ novos: data.novos ?? data.total, atualizados: data.atualizados ?? 0, message: data.message });
      toast({ title: '✅ Busca concluída!', description: data.message });
      onLeadsAdded?.();
    } catch (error: any) {
      toast({ title: 'Erro na busca', description: error.message || 'Tente novamente.', variant: 'destructive' });
    } finally { setLoading(false); }
  };

  const estimarTempo = (n: number) => {
    if (n <= 20) return '~15s'; if (n <= 40) return '~30s';
    if (n <= 60) return '~45s'; if (n <= 80) return '~60s'; return '~90s';
  };

  const labelCls = "text-xs font-medium text-muted-foreground";
  const fieldCls = "h-8 text-sm";

  return (
    <div className="space-y-4">

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Zap className="w-4 h-4 text-primary" />Configurar Busca
          </CardTitle>
          <CardDescription className="text-xs">Os leads encontrados vão direto para o seu Pipeline</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className={labelCls}><Search className="w-3 h-3 inline mr-1" />Nicho *</Label>
              <Select value={nicho} onValueChange={setNicho}>
                <SelectTrigger className={fieldCls}><SelectValue placeholder="Selecione o nicho" /></SelectTrigger>
                <SelectContent>{NICHES.map(n => <SelectItem key={n} value={n}>{n}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className={labelCls}><MapPin className="w-3 h-3 inline mr-1" />Cidade *</Label>
              <Input className={fieldCls} placeholder="Ex: Belém, São Paulo..." value={cidade} onChange={e => setCidade(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label className={labelCls}>Estado</Label>
              <Input className={fieldCls} placeholder="Ex: PA" value={estado} maxLength={2}
                onChange={e => setEstado(e.target.value.toUpperCase())} />
            </div>
            <div className="space-y-1">
              <Label className={labelCls}>Quantidade de leads</Label>
              <Select value={maxLeads} onValueChange={setMaxLeads}>
                <SelectTrigger className={fieldCls}><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['20','40','60','80','100'].map(v => (
                    <SelectItem key={v} value={v}>{v} leads{Number(v) > 20 ? ` (${estimarTempo(Number(v))})` : ''}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={handleBuscar} disabled={!nicho || !cidade || loading} className="w-full gap-2" size="sm">
            {loading
              ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Buscando leads...</>
              : <><Search className="w-3.5 h-3.5" />Buscar {maxLeads} Leads Agora</>
            }
          </Button>

          {loading && (
            <Alert className="py-2">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <AlertDescription className="text-xs">
                Buscando <strong>{nicho}</strong> em <strong>{cidade}, {estado}</strong>...
                {Number(maxLeads) > 20 ? ` Múltiplas páginas — até ${estimarTempo(Number(maxLeads))}.` : ' Até 15s.'}
              </AlertDescription>
            </Alert>
          )}

          {resultado && (
            <Alert className="py-2 border-green-200 bg-green-50 dark:bg-green-950/20">
              <CheckCircle className="h-3.5 w-3.5 text-green-600" />
              <AlertDescription className="text-xs text-green-700 dark:text-green-400">
                <strong>{resultado.message}</strong>
                {resultado.novos > 0 && (
                  <button onClick={onGoToPipeline}
                    className="mt-1 flex items-center gap-1 text-xs font-semibold text-green-700 dark:text-green-400 hover:underline">
                    Ver no Pipeline <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Como funciona</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-3 text-center">
            {[
              { n: '1', label: 'Escolha o nicho',   desc: 'e a cidade alvo'            },
              { n: '2', label: 'Clique em Buscar',  desc: 'o servidor trabalha'        },
              { n: '3', label: 'Google Maps API',   desc: 'encontra as empresas'       },
              { n: '4', label: 'Leads no Pipeline', desc: 'prontos para contato', ok: true },
            ].map(({ n, label, desc, ok }) => (
              <div key={n} className="space-y-1.5">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto font-bold text-xs ${ok ? 'bg-green-100 text-green-700 dark:bg-green-900/30' : 'bg-primary/10 text-primary'}`}>
                  {n}
                </div>
                <p className="font-medium text-xs">{label}</p>
                <p className="text-[10px] text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
          <Alert className="mt-3 py-2">
            <AlertCircle className="h-3.5 w-3.5" />
            <AlertDescription className="text-[10px]">
              Usa a Google Maps API oficial. Buscas de 40+ leads percorrem múltiplas páginas automaticamente.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}