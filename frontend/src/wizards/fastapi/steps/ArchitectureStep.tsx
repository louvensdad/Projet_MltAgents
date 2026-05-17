"use client";

import type { FastApiPayload } from "../fastApiPayload";
import { usePreferences } from "@/context/PreferencesContext";
import { ARCHITECTURES } from "../fastApiConfig";

interface Props {
  data: FastApiPayload;
  onChange: (updates: Partial<FastApiPayload>) => void;
}

export default function ArchitectureStep({ data, onChange }: Props) {
  const { t } = usePreferences();

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
      <h2 className="text-2xl font-bold text-foreground">{t("wizard.fastapi.step3")}</h2>
      <div className="flex flex-col gap-3">
        {ARCHITECTURES.map((arch) => (
          <button
            key={arch}
            onClick={() => onChange({ architecture: arch })}
            className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
              data.architecture === arch
                ? "border-primary bg-primary/10 text-primary shadow-[0_0_15px_rgba(59,130,246,0.2)]"
                : "border-border bg-black/20 text-gray-400 hover:border-white/20 hover:text-gray-200"
            }`}
          >
            <span className="font-semibold">{t(arch)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
