"use client";

import type { FastApiPayload } from "../fastApiPayload";
import { usePreferences } from "@/context/PreferencesContext";
import { CheckCircle } from "lucide-react";

interface Props {
  data: FastApiPayload;
}

export default function PreviewStep({ data }: Props) {
  const { t } = usePreferences();

  const fields: { label: string; value: string | string[] }[] = [
    { label: t("wizard.fastapi.project_name_label"), value: data.project_name },
    { label: t("wizard.fastapi.python_version"), value: data.python_version },
    { label: t("wizard.fastapi.fastapi_version"), value: data.fastapi_version },
    { label: t("wizard.fastapi.architecture"), value: t(data.architecture) },
    { label: t("wizard.fastapi.database"), value: data.database },
    { label: t("wizard.fastapi.orm_options"), value: data.orm_options.join(", ") },
    { label: t("wizard.fastapi.auth_options"), value: data.auth_options.join(", ") },
    { label: t("wizard.fastapi.worker_options"), value: data.worker_options.join(", ") },
    { label: t("wizard.fastapi.docs_options"), value: data.docs_options.join(", ") },
    { label: t("wizard.fastapi.test_options"), value: data.test_options.join(", ") },
  ];

  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold text-foreground">{t("wizard.fastapi.step9")}</h2>
        <p className="text-gray-400 mt-1">{t("wizard.fastapi.preview_desc")}</p>
      </div>

      <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center gap-3">
        <CheckCircle size={20} className="text-emerald-400" />
        <span className="text-emerald-400 font-bold">{t("wizard.fastapi.preview_ready")}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fields.map((f) => (
          <div key={f.label} className="p-4 bg-surface rounded-lg border border-border">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-1">{f.label}</p>
            <p className="text-white font-medium">{f.value || "—"}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
