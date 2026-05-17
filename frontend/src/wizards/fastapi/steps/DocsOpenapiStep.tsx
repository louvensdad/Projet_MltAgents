"use client";

import type { FastApiPayload } from "../fastApiPayload";
import { usePreferences } from "@/context/PreferencesContext";
import { DOCS_OPTIONS } from "../fastApiConfig";

interface Props {
  data: FastApiPayload;
  onChange: (updates: Partial<FastApiPayload>) => void;
}

export default function DocsOpenapiStep({ data, onChange }: Props) {
  const { t } = usePreferences();

  const toggle = (opt: string) => {
    const next = data.docs_options.includes(opt)
      ? data.docs_options.filter((o) => o !== opt)
      : [...data.docs_options, opt];
    onChange({ docs_options: next });
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
      <h2 className="text-2xl font-bold text-foreground">{t("wizard.fastapi.step7")}</h2>
      <div className="flex flex-wrap gap-3">
        {DOCS_OPTIONS.map((opt) => (
          <button
            key={opt}
            onClick={() => toggle(opt)}
            className={`px-5 py-3 rounded-xl border-2 text-sm font-semibold transition-all ${
              data.docs_options.includes(opt)
                ? "border-emerald-500 bg-emerald-500/10 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                : "border-border bg-black/20 text-gray-400 hover:border-white/20 hover:text-gray-200"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
