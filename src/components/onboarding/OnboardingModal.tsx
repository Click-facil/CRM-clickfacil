// src/components/onboarding/OnboardingModal.tsx

import { useState } from 'react';
import { X, Zap, Users, FileText, Search, ArrowRight, CheckCircle } from 'lucide-react';

interface OnboardingModalProps {
  userName: string;
  onClose: () => void;
  onGoTo: (tab: string) => void;
}

const steps = [
  {
    icon: Search,
    color: 'text-blue-500',
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    title: 'Buscar Leads',
    desc: 'Encontre empresas no Google Maps com um clique. Escolha o nicho e a cidade.',
    tab: 'prospecting',
    cta: 'Ir para Prospecção',
  },
  {
    icon: Users,
    color: 'text-purple-500',
    bg: 'bg-purple-50 dark:bg-purple-950/30',
    title: 'Gerenciar Pipeline',
    desc: 'Arraste os leads pelo funil de vendas. Acompanhe cada etapa do processo.',
    tab: 'pipeline',
    cta: 'Ver Pipeline',
  },
  {
    icon: FileText,
    color: 'text-amber-500',
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    title: 'Criar Roteiros',
    desc: 'Monte roteiros de abordagem personalizados para cada nicho.',
    tab: 'scripts',
    cta: 'Ver Roteiros',
  },
  {
    icon: Zap,
    color: 'text-emerald-500',
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    title: 'Gerar Propostas',
    desc: 'Gere propostas profissionais em docx com um clique direto do roteiro.',
    tab: 'scripts',
    cta: 'Começar agora',
  },
];

export function OnboardingModal({ userName, onClose, onGoTo }: OnboardingModalProps) {
  const [step, setStep] = useState(0);
  const isLast  = step === steps.length - 1;
  const current = steps[step];
  const Icon    = current.icon;

  const handleCta = () => {
    onGoTo(current.tab);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal — bottom sheet no mobile, centered no desktop */}
      <div className="relative w-full sm:max-w-md bg-card rounded-t-2xl sm:rounded-2xl shadow-2xl border-t sm:border border-border overflow-hidden">

        {/* Header colorido */}
        <div className="bg-primary px-6 py-5">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <span className="text-xl">⚡</span>
            </div>
            <div>
              <p className="text-white/80 text-sm">Bem-vindo ao</p>
              <h2 className="text-white font-bold text-lg leading-tight">Click Fácil CRM</h2>
            </div>
          </div>
          {step === 0 && (
            <p className="text-white/90 text-sm mt-3">
              Olá, <strong>{userName || 'usuário'}</strong>! Veja o que você pode fazer em menos de 1 minuto.
            </p>
          )}
        </div>

        {/* Indicador de progresso */}
        <div className="flex gap-1.5 px-6 pt-4">
          {steps.map((_, i) => (
            <button
              key={i}
              onClick={() => setStep(i)}
              className={`h-1.5 rounded-full flex-1 transition-all duration-300 ${
                i === step ? 'bg-primary' : i < step ? 'bg-primary/40' : 'bg-muted'
              }`}
            />
          ))}
        </div>

        {/* Conteúdo */}
        <div className="px-6 py-5">
          <div className={`w-14 h-14 rounded-2xl ${current.bg} flex items-center justify-center mb-4`}>
            <Icon className={`w-7 h-7 ${current.color}`} />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">{current.title}</h3>
          <p className="text-muted-foreground text-sm leading-relaxed">{current.desc}</p>
        </div>

        {/* Mini nav dos steps */}
        <div className="px-6 pb-2">
          <div className="grid grid-cols-4 gap-2">
            {steps.map((s, i) => {
              const SIcon = s.icon;
              return (
                <button
                  key={i}
                  onClick={() => setStep(i)}
                  className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
                    i === step
                      ? 'bg-primary/10 border border-primary/30'
                      : 'hover:bg-muted border border-transparent'
                  }`}
                >
                  <SIcon className={`w-4 h-4 ${i === step ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className={`text-xs font-medium leading-tight text-center line-clamp-1 ${
                    i === step ? 'text-primary' : 'text-muted-foreground'
                  }`}>{s.title}</span>
                  {i < step && <CheckCircle className="w-3 h-3 text-emerald-500" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border flex items-center gap-3">
          {step > 0 && (
            <button
              onClick={() => setStep(s => s - 1)}
              className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors"
            >
              Anterior
            </button>
          )}
          {!isLast ? (
            <button
              onClick={() => setStep(s => s + 1)}
              className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
            >
              Próximo <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleCta}
              className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
            >
              {current.cta} <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Skip + safe area iOS */}
        <div className="pb-4 sm:pb-2 text-center">
          <button onClick={onClose} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            Pular introdução
          </button>
        </div>
      </div>
    </div>
  );
}