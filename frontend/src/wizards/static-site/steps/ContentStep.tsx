"use client";

interface Props {
  siteName: string;
  slogan: string;
  companyDescription: string;
  mainTexts: string;
  ctas: string;
  targetAudience: string;
  onChange: (field: string, value: string) => void;
  t: (k: string) => string;
}

export default function ContentStep({ siteName, slogan, companyDescription, mainTexts, ctas, targetAudience, onChange, t }: Props) {
  const inputClass = "w-full bg-black/20 border-2 border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-primary transition-all shadow-inner placeholder:text-gray-700";
  const labelClass = "block text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] ml-1";

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4">
      <div>
        <label className={labelClass}>{t("wizard.static.site_name")}</label>
        <input type="text" className={inputClass} value={siteName} onChange={e => onChange("site_name", e.target.value)} />
      </div>
      <div>
        <label className={labelClass}>{t("wizard.static.slogan")}</label>
        <input type="text" className={inputClass} value={slogan} onChange={e => onChange("slogan", e.target.value)} />
      </div>
      <div>
        <label className={labelClass}>{t("wizard.static.company_description")}</label>
        <textarea rows={4} className={inputClass} value={companyDescription} onChange={e => onChange("company_description", e.target.value)} />
      </div>
      <div>
        <label className={labelClass}>{t("wizard.static.main_texts")}</label>
        <textarea rows={4} className={inputClass} value={mainTexts} onChange={e => onChange("main_texts", e.target.value)} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className={labelClass}>{t("wizard.static.ctas")}</label>
          <input type="text" className={inputClass} value={ctas} onChange={e => onChange("ctas", e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>{t("wizard.static.target_audience")}</label>
          <input type="text" className={inputClass} value={targetAudience} onChange={e => onChange("target_audience", e.target.value)} />
        </div>
      </div>
    </div>
  );
}
