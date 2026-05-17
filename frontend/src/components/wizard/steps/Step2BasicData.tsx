"use client";

import { useWizard } from "@/context/WizardContext";
import { usePreferences } from "@/context/PreferencesContext";

export default function Step2BasicData() {
  const { data, updateData } = useWizard();
  const { t } = usePreferences();

  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
      <h2 className="text-2xl font-bold text-foreground">{t("wizard.steps.step2_title")}</h2>
      
      <div className="space-y-2">
        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] ml-1">
          {t("wizard.steps.step2_name_label")} <span className="text-red-500">*</span>
        </label>
        <input 
          type="text" 
          placeholder={t("wizard.steps.step2_name_placeholder")}
          className="w-full bg-black/20 border-2 border-border rounded-xl px-5 py-4 text-white focus:outline-none focus:border-primary transition-all shadow-inner placeholder:text-gray-700"
          value={data.project_name}
          onChange={e => updateData({ project_name: e.target.value })}
        />
        {!data.project_name && <p className="text-[10px] font-bold text-red-500/80 uppercase tracking-widest ml-1">{t("wizard.steps.step2_name_required")}</p>}
      </div>
      
      <div className="space-y-2">
        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] ml-1">
          {t("wizard.steps.step2_desc_label")} <span className="text-red-500">*</span>
        </label>
        <textarea 
          rows={6}
          placeholder={t("wizard.steps.step2_desc_placeholder")}
          className="w-full bg-black/20 border-2 border-border rounded-xl px-5 py-4 text-white focus:outline-none focus:border-primary transition-all shadow-inner placeholder:text-gray-700 leading-relaxed"
          value={data.user_idea}
          onChange={e => updateData({ user_idea: e.target.value })}
        />
        {!data.user_idea && <p className="text-[10px] font-bold text-red-500/80 uppercase tracking-widest ml-1">{t("wizard.steps.step2_desc_required")}</p>}
      </div>
    </div>
  );
}
