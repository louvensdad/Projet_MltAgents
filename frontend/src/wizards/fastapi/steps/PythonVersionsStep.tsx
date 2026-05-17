"use client";

import type { FastApiPayload } from "../fastApiPayload";
import { usePreferences } from "@/context/PreferencesContext";
import { PYTHON_VERSIONS, FASTAPI_VERSIONS } from "../fastApiConfig";

interface Props {
  data: FastApiPayload;
  onChange: (updates: Partial<FastApiPayload>) => void;
}

export default function PythonVersionsStep({ data, onChange }: Props) {
  const { t } = usePreferences();

  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
      <h2 className="text-2xl font-bold text-foreground">{t("wizard.fastapi.step2")}</h2>

      <div className="space-y-3">
        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] ml-1">
          {t("wizard.fastapi.python_version")}
        </label>
        <div className="flex flex-wrap gap-3">
          {PYTHON_VERSIONS.map((v) => (
            <button
              key={v}
              onClick={() => onChange({ python_version: v })}
              className={`px-5 py-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                data.python_version === v
                  ? "border-primary bg-primary/10 text-primary shadow-[0_0_15px_rgba(59,130,246,0.2)]"
                  : "border-border bg-black/20 text-gray-400 hover:border-white/20 hover:text-gray-200"
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] ml-1">
          {t("wizard.fastapi.fastapi_version")}
        </label>
        <div className="flex flex-wrap gap-3">
          {FASTAPI_VERSIONS.map((v) => (
            <button
              key={v}
              onClick={() => onChange({ fastapi_version: v })}
              className={`px-5 py-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                data.fastapi_version === v
                  ? "border-primary bg-primary/10 text-primary shadow-[0_0_15px_rgba(59,130,246,0.2)]"
                  : "border-border bg-black/20 text-gray-400 hover:border-white/20 hover:text-gray-200"
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
