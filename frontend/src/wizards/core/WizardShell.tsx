"use client";

import { useEffect, type ReactNode } from "react";
import Stepper from "./Stepper";
import WizardActions from "./WizardActions";
import type { WizardStep } from "../types";
import LiveProjectBuilder from "@/components/live-builder/LiveProjectBuilder";
import { CinematicTransition } from "@/components/motion";
import { dispatchLdcnAvatarEvent } from "@/components/ldcn/avatar/ldcnAvatarEvents";

interface WizardShellProps {
  title: string;
  subtitle?: string;
  step: number;
  totalSteps: number;
  steps: WizardStep[];
  loading: boolean;
  canProceed: boolean;
  errors: string[];
  warnings: string[];
  onStepClick: (s: number) => void;
  onPrev: () => void;
  onNext: () => void;
  onGenerate: () => void;
  t: (key: string) => string;
  accent?: string;
  children: ReactNode;
}

export default function WizardShell({
  title, subtitle, step, totalSteps, steps, loading, canProceed,
  errors, warnings,
  onStepClick, onPrev, onNext, onGenerate,
  t, accent, children
}: WizardShellProps) {
  useEffect(() => {
    dispatchLdcnAvatarEvent({
      type: "wizard_step_changed",
      route: "/wizard",
      source: "wizard-shell",
      message: `Etapa ${step} de ${totalSteps}.`,
    });
  }, [step, totalSteps]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-blue-100 to-indigo-200 bg-clip-text text-transparent">
              {title}
            </h1>
            <span className="rounded-full bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary border border-primary/20">
              {t("wizard.step")} {step}/{totalSteps}
            </span>
          </div>
          {subtitle && <p className="text-sm text-gray-400 mt-1.5">{subtitle}</p>}
        </div>
      </div>

      <Stepper steps={steps} currentStep={step} onStepClick={onStepClick} accent={accent} t={t} />

      <div className="flex flex-col gap-4 xl:flex-row">
        <div className="min-w-0 flex-1">
          <div className="relative rounded-2xl border border-white/[0.08] bg-gradient-to-b from-surface/80 to-surface/40 backdrop-blur-xl p-6 shadow-xl shadow-black/20">
            {errors.length > 0 && (
              <div className="mb-4 rounded-xl border border-rose-500/30 bg-gradient-to-r from-rose-500/15 to-rose-500/5 p-4 text-sm text-rose-200 animate-in fade-in slide-in-from-top-2 duration-300">
                {errors.map((item, idx) => (
                  <p key={idx} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-rose-400 shrink-0" />
                    {item}
                  </p>
                ))}
              </div>
            )}
            {warnings.length > 0 && (
              <div className="mb-4 rounded-xl border border-amber-500/30 bg-gradient-to-r from-amber-500/15 to-amber-500/5 p-4 text-sm text-amber-200 animate-in fade-in slide-in-from-top-2 duration-300">
                {warnings.map((item, idx) => (
                  <p key={idx} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" />
                    {item}
                  </p>
                ))}
              </div>
            )}

            <CinematicTransition key={step}>
              {children}
            </CinematicTransition>
          </div>

          <WizardActions
            step={step} totalSteps={totalSteps}
            loading={loading} canProceed={canProceed}
            onPrev={onPrev} onNext={onNext} onGenerate={onGenerate}
            t={t}
          />
        </div>

        <div className="w-full xl:w-80 xl:shrink-0">
          <LiveProjectBuilder />
        </div>
      </div>
    </div>
  );
}
