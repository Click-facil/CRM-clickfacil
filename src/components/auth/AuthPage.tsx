// src/components/auth/AuthPage.tsx
// Login real com Firebase Authentication

import { useState } from 'react';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
} from 'firebase/auth';
import app from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

type Tela = 'login' | 'cadastro' | 'recuperar';

const auth = getAuth(app);

interface AuthPageProps {
  onLogin: () => void;
}

export function AuthPage({ onLogin }: AuthPageProps) {
  const [tela, setTela]           = useState<Tela>('login');
  const [email, setEmail]         = useState('');
  const [senha, setSenha]         = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [mostrar, setMostrar]     = useState(false);
  const [loading, setLoading]     = useState(false);
  const [erro, setErro]           = useState('');
  const [sucesso, setSucesso]     = useState('');

  const limpar = () => { setErro(''); setSucesso(''); };

  const traduzirErro = (code: string) => {
    const erros: Record<string, string> = {
      'auth/user-not-found':      'Nenhuma conta encontrada com esse e-mail.',
      'auth/wrong-password':      'Senha incorreta.',
      'auth/invalid-email':       'E-mail inválido.',
      'auth/email-already-in-use':'Este e-mail já está cadastrado.',
      'auth/weak-password':       'A senha precisa ter pelo menos 6 caracteres.',
      'auth/too-many-requests':   'Muitas tentativas. Aguarde alguns minutos.',
      'auth/invalid-credential':  'E-mail ou senha incorretos.',
      'auth/network-request-failed': 'Sem conexão. Verifique sua internet.',
    };
    return erros[code] || 'Ocorreu um erro. Tente novamente.';
  };

  const handleLogin = async () => {
    if (!email || !senha) { setErro('Preencha e-mail e senha.'); return; }
    setLoading(true); limpar();
    try {
      await signInWithEmailAndPassword(auth, email, senha);
      onLogin();
    } catch (e: any) {
      setErro(traduzirErro(e.code));
    } finally {
      setLoading(false);
    }
  };

  const handleCadastro = async () => {
    if (!email || !senha || !confirmar) { setErro('Preencha todos os campos.'); return; }
    if (senha !== confirmar) { setErro('As senhas não coincidem.'); return; }
    if (senha.length < 6) { setErro('A senha precisa ter pelo menos 6 caracteres.'); return; }
    setLoading(true); limpar();
    try {
      await createUserWithEmailAndPassword(auth, email, senha);
      onLogin();
    } catch (e: any) {
      setErro(traduzirErro(e.code));
    } finally {
      setLoading(false);
    }
  };

  const handleRecuperar = async () => {
    if (!email) { setErro('Digite seu e-mail.'); return; }
    setLoading(true); limpar();
    try {
      await sendPasswordResetEmail(auth, email);
      setSucesso('E-mail de recuperação enviado! Verifique sua caixa de entrada.');
    } catch (e: any) {
      setErro(traduzirErro(e.code));
    } finally {
      setLoading(false);
    }
  };

  const handleEnter = (e: React.KeyboardEvent) => {
    if (e.key !== 'Enter') return;
    if (tela === 'login') handleLogin();
    else if (tela === 'cadastro') handleCadastro();
    else handleRecuperar();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">

        {/* Logo */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center mb-4">
            <img src="/ponteiro_clickfacil.ico" alt="Click Fácil" className="w-24 h-24 object-contain" />
          </div>
          <h1 className="text-4xl font-bold">Click Fácil</h1>
          <p className="text-muted-foreground">CRM de Prospecção Inteligente</p>
        </div>

        {/* Card */}
        <Card>
          <CardHeader>
            <CardTitle>
              {tela === 'login'    && 'Entrar na sua conta'}
              {tela === 'cadastro' && 'Criar conta'}
              {tela === 'recuperar'&& 'Recuperar senha'}
            </CardTitle>
            <CardDescription>
              {tela === 'login'    && 'Digite seu e-mail e senha para acessar o CRM'}
              {tela === 'cadastro' && 'Crie sua conta para acessar o CRM'}
              {tela === 'recuperar'&& 'Enviaremos um link para redefinir sua senha'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4" onKeyDown={handleEnter}>

            {/* Email */}
            <div className="space-y-1">
              <Label>E-mail</Label>
              <Input
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={e => { setEmail(e.target.value); limpar(); }}
                autoComplete="email"
              />
            </div>

            {/* Senha */}
            {tela !== 'recuperar' && (
              <div className="space-y-1">
                <Label>Senha</Label>
                <div className="relative">
                  <Input
                    type={mostrar ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={senha}
                    onChange={e => { setSenha(e.target.value); limpar(); }}
                    autoComplete={tela === 'login' ? 'current-password' : 'new-password'}
                  />
                  <button
                    type="button"
                    onClick={() => setMostrar(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {mostrar ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* Confirmar senha */}
            {tela === 'cadastro' && (
              <div className="space-y-1">
                <Label>Confirmar senha</Label>
                <Input
                  type={mostrar ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={confirmar}
                  onChange={e => { setConfirmar(e.target.value); limpar(); }}
                  autoComplete="new-password"
                />
              </div>
            )}

            {/* Erro */}
            {erro && (
              <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">
                {erro}
              </p>
            )}

            {/* Sucesso */}
            {sucesso && (
              <p className="text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg">
                {sucesso}
              </p>
            )}

            {/* Botão principal */}
            <Button
              className="w-full"
              size="lg"
              disabled={loading}
              onClick={tela === 'login' ? handleLogin : tela === 'cadastro' ? handleCadastro : handleRecuperar}
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {tela === 'login'    && (loading ? 'Entrando...'   : 'Entrar')}
              {tela === 'cadastro' && (loading ? 'Criando...'    : 'Criar conta')}
              {tela === 'recuperar'&& (loading ? 'Enviando...'   : 'Enviar e-mail')}
            </Button>

            {/* Links de navegação */}
            <div className="text-center text-sm space-y-2">
              {tela === 'login' && (
                <>
                  <button
                    onClick={() => { setTela('recuperar'); limpar(); }}
                    className="text-muted-foreground hover:text-foreground underline block w-full"
                  >
                    Esqueci minha senha
                  </button>
                  <button
                    onClick={() => { setTela('cadastro'); limpar(); }}
                    className="text-primary hover:underline block w-full"
                  >
                    Não tenho conta — Criar agora
                  </button>
                </>
              )}
              {(tela === 'cadastro' || tela === 'recuperar') && (
                <button
                  onClick={() => { setTela('login'); limpar(); }}
                  className="text-muted-foreground hover:text-foreground underline"
                >
                  Voltar para o login
                </button>
              )}
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          Sistema de gestão de leads • Click Fácil v2.0
        </p>
      </div>
    </div>
  );
}