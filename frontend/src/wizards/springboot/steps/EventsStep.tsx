"use client";

import { EVENT_OPTIONS } from "../springBootConfig";

interface EventsStepProps {
  selected: string[];
  onToggle: (v: string) => void;
  t: (key: string) => string;
}

export default function EventsStep({ selected, onToggle, t }: EventsStepProps) {
  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
      <h2 className="text-2xl font-bold text-foreground">{t("wizard.springboot.step7")}</h2>
      <div className="flex flex-wrap gap-2">
        {EVENT_OPTIONS.map((opt) => {
          const isSelected = selected.includes(opt);
          return (
            <button
              key={opt}
              onClick={() => onToggle(opt)}
              className={`rounded-lg border px-5 py-3 text-sm font-semibold transition-all ${
                isSelected
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-white/10 bg-surface text-gray-400 hover:border-white/30 hover:text-gray-200"
              }`}
            >
              {isSelected && <span className="mr-1.5">✓</span>}
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}
