"use client";

import { Check } from "lucide-react";
import type { WizardStep } from "../types";

interface StepperProps {
  steps: WizardStep[];
  currentStep: number;
  onStepClick: (step: number) => void;
  t: (key: string) => string;
  accent?: string;
}

export default function Stepper({ steps, currentStep, onStepClick, t, accent = "from-blue-500 to-indigo-500" }: StepperProps) {
  const total = steps.length;
  return (
    <div className="mb-10">
      <div className="relative h-2 overflow-hidden rounded-full bg-white/[0.04] border border-white/[0.06]">
        <div
          className={`absolute inset-y-0 left-0 h-full bg-gradient-to-r ${accent} transition-all duration-1000 ease-out`}
          style={{ width: `${((currentStep - 1) / Math.max(total - 1, 1)) * 100}%` }}
        />
        <div
          className="absolute inset-y-0 left-0 h-full rounded-full bg-gradient-to-r from-blue-500/30 to-indigo-500/30 blur-md transition-all duration-1000 ease-out"
          style={{ width: `${((currentStep - 1) / Math.max(total - 1, 1)) * 100}%` }}
        />
        {steps.map((s) => {
          const pct = ((s.number - 1) / Math.max(total - 1, 1)) * 100;
          return (
            <div
              key={s.number}
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 transition-all duration-500"
              style={{
                left: `calc(${pct}% - 6px)`,
                borderColor: s.number <= currentStep ? "rgb(59,130,246)" : "rgba(255,255,255,0.1)",
                backgroundColor: s.number < currentStep ? "rgb(59,130,246)" : s.number === currentStep ? "rgba(59,130,246,0.3)" : "transparent",
                boxShadow: s.number <= currentStep ? "0 0 12px rgba(59,130,246,0.3)" : "none",
              }}
            />
          );
        })}
      </div>
      <div className="mt-6 flex flex-wrap gap-2">
        {steps.map((s) => {
          const isActive = currentStep === s.number;
          const isCompleted = currentStep > s.number;

          return (
            <button
              key={s.number}
              onClick={() => onStepClick(s.number)}
              className={`group relative flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-xs font-medium transition-all duration-300 ${
                isActive
                  ? "bg-gradient-to-br from-blue-500/15 to-indigo-500/10 text-blue-300 shadow-lg shadow-blue-500/10 ring-1 ring-blue-500/30"
                  : isCompleted
                  ? "bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-500/20 hover:bg-emerald-500/15 hover:ring-emerald-500/30"
                  : "bg-white/[0.03] text-gray-500 ring-1 ring-white/5 hover:bg-white/[0.06] hover:text-gray-300"
              }`}
            >
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold transition-all duration-300 ${
                  isActive
                    ? "bg-gradient-to-br from-blue-500 to-indigo-500 text-white shadow-md shadow-blue-500/30"
                    : isCompleted
                    ? "bg-emerald-500 text-white shadow-sm shadow-emerald-500/20"
                    : "bg-white/10 text-gray-500"
                }`}
              >
                {isCompleted ? <Check className="h-3.5 w-3.5" /> : s.number}
              </span>
              <span className="hidden sm:inline">{t(s.labelKey)}</span>
              {s.descKey && (
                <span className="hidden md:ml-1 md:inline text-[10px] text-gray-500 group-hover:text-gray-400 transition-colors">
                  {t(s.descKey)}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
