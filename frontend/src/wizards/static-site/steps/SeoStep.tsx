"use client";

interface Props {
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  openGraph: boolean;
  sitemap: boolean;
  robotsTxt: boolean;
  lazyLoading: boolean;
  onChange: (field: string, value: any) => void;
  t: (k: string) => string;
}

function Toggle({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <div onClick={onClick} className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-all ${
      active ? "border-primary bg-primary/10 text-primary" : "border-white/10 text-gray-400 hover:border-white/30"
    }`}>
      <div className={`h-5 w-10 rounded-full transition-colors ${active ? "bg-primary" : "bg-white/20"}`}>
        <div className={`h-5 w-5 rounded-full bg-white transition-transform ${active ? "translate-x-5" : ""}`} />
      </div>
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
}

export default function SeoStep(props: Props) {
  const { t, onChange } = props;
  const inputClass = "w-full bg-black/20 border-2 border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-primary transition-all shadow-inner placeholder:text-gray-700";
  const labelClass = "block text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] ml-1";

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4">
      <div>
        <label className={labelClass}>{t("wizard.static.meta_title")}</label>
        <input type="text" className={inputClass} value={props.metaTitle} onChange={e => onChange("meta_title", e.target.value)} />
      </div>
      <div>
        <label className={labelClass}>{t("wizard.static.meta_description")}</label>
        <textarea rows={3} className={inputClass} value={props.metaDescription} onChange={e => onChange("meta_description", e.target.value)} />
      </div>
      <div>
        <label className={labelClass}>{t("wizard.static.keywords")}</label>
        <input type="text" className={inputClass} value={props.keywords} onChange={e => onChange("keywords", e.target.value)} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Toggle active={props.openGraph} onClick={() => onChange("open_graph", !props.openGraph)} label={t("wizard.static.open_graph")} />
        <Toggle active={props.sitemap} onClick={() => onChange("sitemap", !props.sitemap)} label={t("wizard.static.sitemap")} />
        <Toggle active={props.robotsTxt} onClick={() => onChange("robots_txt", !props.robotsTxt)} label={t("wizard.static.robots_txt")} />
        <Toggle active={props.lazyLoading} onClick={() => onChange("lazy_loading", !props.lazyLoading)} label={t("wizard.static.lazy_loading")} />
      </div>
    </div>
  );
}
