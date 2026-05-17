"use client";

import type { FastApiPayload } from "../fastApiPayload";
import { usePreferences } from "@/context/PreferencesContext";

interface Props {
  data: FastApiPayload;
  onChange: (updates: Partial<FastApiPayload>) => void;
  errors: string[];
}

export default function ProjectDataStep({ data, onChange, errors }: Props) {
  const { t } = usePreferences();

  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
      <h2 className="text-2xl font-bold text-foreground">{t("wizard.fastapi.step1")}</h2>
      <div className="space-y-2">
        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] ml-1">
          {t("wizard.fastapi.project_name_label")} <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          placeholder={t("wizard.fastapi.project_name_placeholder")}
          className="w-full bg-black/20 border-2 border-border rounded-xl px-5 py-4 text-white focus:outline-none focus:border-primary transition-all shadow-inner placeholder:text-gray-700"
          value={data.project_name}
          onChange={(e) => onChange({ project_name: e.target.value })}
        />
        {errors.includes("project_name") && (
          <p className="text-[10px] font-bold text-red-500/80 uppercase tracking-widest ml-1">{t("wizard.fastapi.project_name_required")}</p>
        )}
      </div>
    </div>
  );
}
