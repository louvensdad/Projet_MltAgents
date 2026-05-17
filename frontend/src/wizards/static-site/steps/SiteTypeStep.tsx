"use client";

interface Props {
  value: string;
  onSelect: (v: string) => void;
  t: (k: string) => string;
  options: string[];
}

export default function SiteTypeStep({ value, onSelect, t, options }: Props) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-gray-200">{t("wizard.static.site_type_title")}</p>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {options.map((key) => (
          <button
            key={key}
            onClick={() => onSelect(key)}
            className={`rounded-xl border p-4 text-left transition-all ${
              value === key
                ? "border-primary bg-primary/10 text-primary shadow-[0_0_20px_rgba(59,130,246,0.1)]"
                : "border-white/10 text-gray-300 hover:border-white/30"
            }`}
          >
            <span className="text-sm font-medium">{t(key)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
