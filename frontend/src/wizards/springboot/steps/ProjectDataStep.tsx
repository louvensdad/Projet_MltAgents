"use client";

interface ProjectDataStepProps {
  value: string;
  onChange: (name: string) => void;
  t: (key: string) => string;
}

export default function ProjectDataStep({ value, onChange, t }: ProjectDataStepProps) {
  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
      <h2 className="text-2xl font-bold text-foreground">{t("wizard.springboot.step1")}</h2>
      <div className="space-y-2">
        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] ml-1">
          {t("wizard.springboot.project_name_label")} <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          placeholder={t("wizard.springboot.project_name_placeholder")}
          className="w-full bg-black/20 border-2 border-border rounded-xl px-5 py-4 text-white focus:outline-none focus:border-primary transition-all shadow-inner placeholder:text-gray-700"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        {!value && (
          <p className="text-[10px] font-bold text-red-500/80 uppercase tracking-widest ml-1">
            {t("wizard.springboot.project_name_required")}
          </p>
        )}
      </div>
    </div>
  );
}
