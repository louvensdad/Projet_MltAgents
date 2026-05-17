"use client";

import { usePreferences } from "@/context/PreferencesContext";
import { Loader2, Sparkles } from "lucide-react";

interface Props {
  loading: boolean;
}

export default function GenerateStep({ loading }: Props) {
  const { t } = usePreferences();

  return (
    <div className="flex flex-col items-center justify-center py-16 animate-in fade-in duration-500">
      <div className="mb-6 rounded-full bg-primary/10 p-6">
        {loading ? (
          <Loader2 className="animate-spin text-primary" size={48} />
        ) : (
          <Sparkles className="text-primary" size={48} />
        )}
      </div>
      <h2 className="text-2xl font-bold text-foreground mb-2">
        {loading ? t("wizard.fastapi.generating_title") : t("wizard.fastapi.ready_title")}
      </h2>
      <p className="text-gray-400 text-center max-w-md">
        {loading ? t("wizard.fastapi.generating_desc") : t("wizard.fastapi.ready_desc")}
      </p>
    </div>
  );
}
