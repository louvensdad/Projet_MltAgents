"use client";

import { BUILD_TOOLS } from "../springBootConfig";

interface BuildToolStepProps {
  value: string;
  onChange: (v: string) => void;
  t: (key: string) => string;
}

export default function BuildToolStep({ value, onChange, t }: BuildToolStepProps) {
  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
      <h2 className="text-2xl font-bold text-foreground">{t("wizard.springboot.step3")}</h2>
      <div className="flex flex-wrap gap-3">
        {BUILD_TOOLS.map((tool) => (
          <button
            key={tool}
            onClick={() => onChange(tool)}
            className={`rounded-xl border px-8 py-4 text-lg font-bold transition-all ${
              value === tool
                ? "border-primary bg-primary/10 text-primary shadow-[0_0_15px_rgba(59,130,246,0.2)]"
                : "border-white/10 bg-surface text-gray-400 hover:border-white/30 hover:text-gray-200"
            }`}
          >
            {tool}
          </button>
        ))}
      </div>
    </div>
  );
}
