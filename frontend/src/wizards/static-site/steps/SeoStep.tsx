"use client";

interface Props {
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  openGraphTitle: string;
  openGraphDescription: string;
  analytics: boolean;
  onChange: (field: "seo_title" | "seo_description" | "seo_keywords" | "open_graph_title" | "open_graph_description" | "analytics", value: string | boolean) => void;
}

function Toggle({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-left transition-all ${
        active ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-100" : "border-white/10 bg-white/[0.03] text-gray-300 hover:border-white/20"
      }`}
    >
      <span className="text-sm font-semibold">{label}</span>
      <span className={`ml-4 h-5 w-10 rounded-full transition-all ${active ? "bg-emerald-400" : "bg-white/15"}`}>
        <span className={`block h-5 w-5 rounded-full bg-white transition-transform ${active ? "translate-x-5" : ""}`} />
      </span>
    </button>
  );
}

function Field({ label, value, onChange, placeholder, multiline = false }: { label: string; value: string; onChange: (value: string) => void; placeholder: string; multiline?: boolean }) {
  const className = "w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder:text-gray-600 outline-none transition focus:border-cyan-400/40 focus:bg-white/[0.05]";
  return (
    <label className="space-y-2">
      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">{label}</span>
      {multiline ? (
        <textarea className={`${className} min-h-24`} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
      ) : (
        <input className={className} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
      )}
    </label>
  );
}

export default function SeoStep({ seoTitle, seoDescription, seoKeywords, openGraphTitle, openGraphDescription, analytics, onChange }: Props) {
  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-semibold text-gray-200">SEO and Open Graph</p>
        <p className="text-xs text-gray-500">The backend uses this to validate the static site prompt master.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="SEO title" value={seoTitle} onChange={(value) => onChange("seo_title", value)} placeholder="Acme Studio - Modern landing page" />
        <Field label="Open Graph title" value={openGraphTitle} onChange={(value) => onChange("open_graph_title", value)} placeholder="Acme Studio" />
      </div>
      <Field label="SEO description" value={seoDescription} onChange={(value) => onChange("seo_description", value)} placeholder="Short description for search engines" multiline />
      <Field label="SEO keywords" value={seoKeywords} onChange={(value) => onChange("seo_keywords", value)} placeholder="design, landing page, conversion, seo" />
      <Field label="Open Graph description" value={openGraphDescription} onChange={(value) => onChange("open_graph_description", value)} placeholder="Social media preview description" multiline />
      <Toggle active={analytics} onClick={() => onChange("analytics", !analytics)} label="Enable analytics" />
    </div>
  );
}
