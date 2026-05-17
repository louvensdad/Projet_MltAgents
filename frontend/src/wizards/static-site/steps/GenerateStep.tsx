"use client";

import { Loader2, CheckCircle, AlertTriangle } from "lucide-react";

interface Props {
  generating: boolean;
  generateError: string | null;
  generateSuccess: boolean;
  onGenerate: () => void;
  onPrev: () => void;
  isValid: boolean;
  missingFields: string[];
  aiMode: "local_build_90" | "agent_boost_100";
  onAiModeChange: (mode: "local_build_90" | "agent_boost_100") => void;
  promptReady: boolean;
  t: (k: string) => string;
}

const CAPABILITIES = ["Prompt Master", "SEO", "Accessibility", "Analytics"];

export default function GenerateStep({
  generating,
  generateError,
  generateSuccess,
  onGenerate,
  onPrev,
  isValid,
  missingFields,
  aiMode,
  onAiModeChange,
  promptReady,
  t,
}: Props) {
  return (
    <div className="space-y-4 animate-in slide-in-from-right-4">
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-cyan-300">Final step</p>
            <h2 className="text-xl font-bold text-white">{t("wizard.static.generate_title")}</h2>
            <p className="max-w-2xl text-sm text-gray-400">{t("wizard.static.generate_subtitle")}</p>
          </div>
          <div className="flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-300">
            {CAPABILITIES.map((cap) => (
              <span key={cap} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1">
                {cap}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <button
          type="button"
          onClick={() => onAiModeChange("local_build_90")}
          className={`rounded-2xl border p-4 text-left transition-all ${aiMode === "local_build_90" ? "border-emerald-400/40 bg-emerald-500/10" : "border-white/10 bg-white/[0.02]"}`}
        >
          <p className="text-sm font-bold text-emerald-300">Local Build 90%</p>
          <p className="mt-1 text-xs leading-relaxed text-gray-400">Local flow with gatekeepers, preview and no key exposure.</p>
        </button>
        <button
          type="button"
          onClick={() => onAiModeChange("agent_boost_100")}
          className={`rounded-2xl border p-4 text-left transition-all ${aiMode === "agent_boost_100" ? "border-violet-400/40 bg-violet-500/10" : "border-white/10 bg-white/[0.02]"}`}
        >
          <p className="text-sm font-bold text-violet-300">Agent Boost 100%</p>
          <p className="mt-1 text-xs leading-relaxed text-gray-400">Premium AI on the backend. Checkout unlocks the paid mode.</p>
        </button>
      </div>

      <div className={`rounded-xl border p-4 ${promptReady ? "border-cyan-500/30 bg-cyan-500/10" : "border-amber-500/30 bg-amber-500/10"}`}>
        <p className={`text-sm font-semibold ${promptReady ? "text-cyan-200" : "text-amber-200"}`}>
          {promptReady ? "Prompt Master ready to act as the source of truth." : "Fill the required fields to validate the Prompt Master."}
        </p>
      </div>

      {!isValid && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-400" />
            <div>
              <p className="font-semibold text-amber-300">{t("wizard.static.generate_missing_fields")}</p>
              <ul className="mt-2 list-inside list-disc text-sm text-amber-200">
                {missingFields.map((f) => <li key={f}>{f}</li>)}
              </ul>
            </div>
          </div>
        </div>
      )}

      {isValid && !generateSuccess && !generating && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-emerald-400" />
            <span className="font-semibold text-emerald-300">{t("wizard.static.generate_ready")}</span>
          </div>
        </div>
      )}

      {generateError && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 text-rose-400" />
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-rose-200">{generateError}</p>
          </div>
        </div>
      )}

      {generateSuccess && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-center">
          <CheckCircle className="mx-auto mb-3 h-10 w-10 text-emerald-400" />
          <p className="text-lg font-bold text-emerald-300">{t("wizard.static.generate_success")}</p>
          <p className="mt-1 text-sm text-gray-400">{t("wizard.static.generate_redirecting")}</p>
        </div>
      )}

      {generating && (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] py-8">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm font-medium text-gray-300">{t("wizard.static.generating")}</p>
        </div>
      )}

      {!generating && !generateSuccess && (
        <div className="flex flex-col items-center justify-center gap-3 pt-2 sm:flex-row">
          <button
            type="button"
            onClick={onPrev}
            className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-semibold text-gray-200 transition-all hover:border-white/20 hover:bg-white/[0.06]"
          >
            Back
          </button>
          <button
            type="button"
            onClick={onGenerate}
            disabled={!isValid || !promptReady}
            className="flex items-center gap-2 rounded-xl bg-emerald-500 px-8 py-3 font-bold text-black shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-400 disabled:opacity-40"
          >
            <SparklesIcon className="h-5 w-5" />
            {t("wizard.static.generate_button")}
          </button>
        </div>
      )}
    </div>
  );
}

function SparklesIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  );
}
