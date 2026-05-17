"use client";

import type { FastApiPayload } from "../fastApiPayload";
import { usePreferences } from "@/context/PreferencesContext";
import { DATABASES, ORM_OPTIONS } from "../fastApiConfig";

interface Props {
  data: FastApiPayload;
  onChange: (updates: Partial<FastApiPayload>) => void;
}

export default function DatabaseOrmStep({ data, onChange }: Props) {
  const { t } = usePreferences();

  const toggleOrm = (opt: string) => {
    const next = data.orm_options.includes(opt)
      ? data.orm_options.filter((o) => o !== opt)
      : [...data.orm_options, opt];
    onChange({ orm_options: next });
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
      <h2 className="text-2xl font-bold text-foreground">{t("wizard.fastapi.step4")}</h2>

      <div className="space-y-3">
        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] ml-1">
          {t("wizard.fastapi.database")}
        </label>
        <div className="flex flex-wrap gap-3">
          {DATABASES.map((db) => (
            <button
              key={db}
              onClick={() => onChange({ database: db })}
              className={`px-5 py-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                data.database === db
                  ? "border-primary bg-primary/10 text-primary shadow-[0_0_15px_rgba(59,130,246,0.2)]"
                  : "border-border bg-black/20 text-gray-400 hover:border-white/20 hover:text-gray-200"
              }`}
            >
              {db}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] ml-1">
          {t("wizard.fastapi.orm_options")}
        </label>
        <div className="flex flex-wrap gap-3">
          {ORM_OPTIONS.map((opt) => (
            <button
              key={opt}
              onClick={() => toggleOrm(opt)}
              className={`px-5 py-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                data.orm_options.includes(opt)
                  ? "border-emerald-500 bg-emerald-500/10 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                  : "border-border bg-black/20 text-gray-400 hover:border-white/20 hover:text-gray-200"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
