"use client";

import { useWizard } from "@/context/WizardContext";
import { usePreferences } from "@/context/PreferencesContext";
import { Languages } from "lucide-react";

export default function Step3Language() {
  const { data, updateData } = useWizard();
  const { t } = usePreferences();

  const languages = [
    "Português",
    "Inglês",
    "Espanhol",
    "Alemão",
    "Japonês",
    "Francês"
  ];

  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-foreground">{t("wizard.steps.step3_title")}</h2>
        <p className="text-gray-500 text-sm font-medium">{t("wizard.steps.step3_desc")}</p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {languages.map((lang) => {
          const isSelected = data.project_language === lang;
          return (
            <div 
              key={lang}
              onClick={() => updateData({ project_language: lang })}
              className={`p-5 rounded-2xl border-2 flex items-center gap-4 cursor-pointer transition-all active:scale-[0.98] ${
                isSelected 
                  ? "bg-primary/10 border-primary text-primary shadow-lg shadow-primary/10 ring-1 ring-primary/20" 
                  : "bg-surface border-border text-gray-500 hover:text-gray-300 hover:bg-white/5 hover:border-gray-700"
              }`}
            >
              <div className={`p-2 rounded-lg ${isSelected ? "bg-primary text-white" : "bg-black/20"}`}>
                <Languages size={20} />
              </div>
              <span className="font-bold text-sm tracking-tight">{lang}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
