// src/components/auth/UserSelector.tsx

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Building2, MapPin, Lock, Eye, EyeOff } from 'lucide-react';

// ================================================================
// SENHAS — altere aqui quando quiser trocar
// ================================================================
const SENHA_ADMIN       = 'clickfacil@admin2026';
const SENHA_PROSPECTORA = 'belem@2026';
// ================================================================

interface UserSelectorProps {
  onSelectUser: (user: 'admin' | 'prospector', territory: string) => void;
}

export function UserSelector({ onSelectUser }: UserSelectorProps) {
  const [senhaAdmin, setSenhaAdmin]             = useState('');
  const [senhaProspectora, setSenhaProspectora] = useState('');
  const [erroAdmin, setErroAdmin]               = useState('');
  const [erroProspectora, setErroProspectora]   = useState('');
  const [mostrarAdmin, setMostrarAdmin]         = useState(false);
  const [mostrarProspectora, setMostrarProspectora] = useState(false);

  const handleAdmin = () => {
    if (senhaAdmin === SENHA_ADMIN) {
      setErroAdmin('');
      onSelectUser('admin', 'all');
    } else {
      setErroAdmin('Senha incorreta');
      setSenhaAdmin('');
    }
  };

  const handleProspectora = () => {
    if (senhaProspectora === SENHA_PROSPECTORA) {
      setErroProspectora('');
      onSelectUser('prospector', 'Belém');
    } else {
      setErroProspectora('Senha incorreta');
      setSenhaProspectora('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-background flex items-center justify-center p-4">
      <div className="max-w-4xl w-full space-y-8">

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-3xl">⚡</span>
            </div>
          </div>
          <h1 className="text-4xl font-bold">Click Fácil</h1>
          <p className="text-muted-foreground text-lg">CRM de Prospecção Inteligente</p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-2 gap-6">

          {/* Admin */}
          <Card className="hover:shadow-lg transition-all">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <User className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Administrador</CardTitle>
              <CardDescription>
                Acesso completo • Importar leads • Ver todos os territórios
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1">
                <Label className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Lock className="w-3 h-3" /> Senha
                </Label>
                <div className="relative">
                  <Input
                    type={mostrarAdmin ? 'text' : 'password'}
                    placeholder="Digite a senha"
                    value={senhaAdmin}
                    onChange={e => { setSenhaAdmin(e.target.value); setErroAdmin(''); }}
                    onKeyDown={e => e.key === 'Enter' && handleAdmin()}
                    className={erroAdmin ? 'border-destructive' : ''}
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarAdmin(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {mostrarAdmin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {erroAdmin && <p className="text-xs text-destructive">{erroAdmin}</p>}
              </div>

              <Button onClick={handleAdmin} className="w-full gap-2" size="lg">
                <Building2 className="w-4 h-4" />
                Acessar como Admin
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Você pode alternar entre Paragominas e Belém
              </p>
            </CardContent>
          </Card>

          {/* Prospectora */}
          <Card className="hover:shadow-lg transition-all">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center mb-4">
                <MapPin className="w-6 h-6 text-success" />
              </div>
              <CardTitle>Prospectora - Belém</CardTitle>
              <CardDescription>
                Trabalhar leads • Pipeline • Adicionar notas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1">
                <Label className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Lock className="w-3 h-3" /> Senha
                </Label>
                <div className="relative">
                  <Input
                    type={mostrarProspectora ? 'text' : 'password'}
                    placeholder="Digite a senha"
                    value={senhaProspectora}
                    onChange={e => { setSenhaProspectora(e.target.value); setErroProspectora(''); }}
                    onKeyDown={e => e.key === 'Enter' && handleProspectora()}
                    className={erroProspectora ? 'border-destructive' : ''}
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarProspectora(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {mostrarProspectora ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {erroProspectora && <p className="text-xs text-destructive">{erroProspectora}</p>}
              </div>

              <Button onClick={handleProspectora} className="w-full gap-2" size="lg" variant="outline">
                <MapPin className="w-4 h-4" />
                Acessar Belém
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Acesso apenas aos leads de Belém
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          <p>Sistema de gestão de leads com Firebase</p>
          <p className="text-xs mt-1">Versão 2.0 • 2025</p>
        </div>
      </div>
    </div>
  );
}