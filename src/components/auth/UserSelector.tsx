// src/components/auth/UserSelector.tsx - Seleção Simples de Usuário

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Building2, MapPin } from 'lucide-react';

interface UserSelectorProps {
  onSelectUser: (user: 'admin' | 'prospector', territory: string) => void;
}

export function UserSelector({ onSelectUser }: UserSelectorProps) {
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

        {/* Seleção de Usuário */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Admin - Você */}
          <Card className="cursor-pointer hover:shadow-lg transition-all hover:scale-105">
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
              <Button 
                onClick={() => onSelectUser('admin', 'all')}
                className="w-full gap-2"
                size="lg"
              >
                <Building2 className="w-4 h-4" />
                Acessar como Admin
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Você pode alternar entre Paragominas e Belém
              </p>
            </CardContent>
          </Card>

          {/* Prospectora - Belém */}
          <Card className="cursor-pointer hover:shadow-lg transition-all hover:scale-105">
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
              <Button 
                onClick={() => onSelectUser('prospector', 'Belém')}
                className="w-full gap-2"
                size="lg"
                variant="outline"
              >
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