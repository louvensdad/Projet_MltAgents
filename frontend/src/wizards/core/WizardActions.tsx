"use client";

import { ArrowLeft, ArrowRight, Loader2, Sparkles } from "lucide-react";

interface WizardActionsProps {
  step: number;
  totalSteps: number;
  loading: boolean;
  canProceed: boolean;
  onPrev: () => void;
  onNext: () => void;
  onGenerate: () => void;
  t: (key: string) => string;
}

export default function WizardActions({ step, totalSteps, loading, canProceed, onPrev, onNext, onGenerate, t }: WizardActionsProps) {
  return (
    <div className="mt-6 flex items-center justify-between">
      <button
        onClick={onPrev}
        disabled={loading}
        className="flex items-center gap-2 rounded-lg px-4 py-2 text-gray-300 transition-colors hover:text-white disabled:opacity-40 disabled:pointer-events-none"
      >
        <ArrowLeft size={16} /> {step === 1 ? t("wizard.back_to_selector") : t("wizard.prev")}
      </button>
      {step < totalSteps ? (
        <button
          onClick={onNext}
          disabled={!canProceed || loading}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-semibold text-white shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all disabled:opacity-40"
        >
          {t("wizard.next")} <ArrowRight size={16} />
        </button>
      ) : (
        <button
          onClick={onGenerate}
          disabled={!canProceed || loading}
          className="flex items-center gap-2 rounded-lg bg-emerald-500 px-5 py-2 font-semibold text-black shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 transition-all disabled:opacity-40"
        >
          {loading ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
          {loading ? t("wizard.generating") : t("wizard.generate")}
        </button>
      )}
    </div>
  );
}
