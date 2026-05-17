"use client";

interface SectionOption {
  key: string;
  labelKey: string;
}

interface Props {
  sections: string[];
  onToggle: (key: string) => void;
  t: (k: string) => string;
  options: SectionOption[];
}

export default function SectionsStep({ sections, onToggle, t, options }: Props) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-gray-200">{t("wizard.static.sections_title")}</p>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {options.map((opt) => {
          const selected = sections.includes(opt.key);
          return (
            <button
              key={opt.key}
              onClick={() => onToggle(opt.key)}
              className={`rounded-xl border p-4 text-left transition-all ${
                selected
                  ? "border-primary bg-primary/10 text-primary shadow-[0_0_20px_rgba(59,130,246,0.1)]"
                  : "border-white/10 text-gray-300 hover:border-white/30"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`flex h-5 w-5 items-center justify-center rounded border transition-all ${
                  selected ? "border-primary bg-primary" : "border-white/30"
                }`}>
                  {selected && <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                </div>
                <span className="text-sm font-medium">{t(opt.labelKey)}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
