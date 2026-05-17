"use client";

import { ARCHITECTURES } from "../springBootConfig";

interface ArchitectureStepProps {
  value: string;
  onChange: (v: string) => void;
  t: (key: string) => string;
}

export default function ArchitectureStep({ value, onChange, t }: ArchitectureStepProps) {
  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
      <h2 className="text-2xl font-bold text-foreground">{t("wizard.springboot.step4")}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ARCHITECTURES.map((arch) => {
          const isSelected = value === arch;
          return (
            <div
              key={arch}
              onClick={() => onChange(arch)}
              className={`p-5 rounded-xl border cursor-pointer transition-all ${
                isSelected
                  ? "bg-primary/10 border-primary shadow-[0_0_15px_rgba(59,130,246,0.2)]"
                  : "bg-surface border-white/10 hover:bg-white/5"
              }`}
            >
              <h3 className={`font-semibold text-lg ${isSelected ? "text-primary" : "text-gray-200"}`}>{t(arch)}</h3>
            </div>
          );
        })}
      </div>
    </div>
  );
}
