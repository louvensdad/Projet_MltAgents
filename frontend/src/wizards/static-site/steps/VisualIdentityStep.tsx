"use client";

interface Props {
  visualStyle: string;
  colorPalette: string;
  brandTone: string;
  hasLogo: boolean;
  darkMode: boolean;
  onVisualStyle: (v: string) => void;
  onColorPalette: (v: string) => void;
  onBrandTone: (v: string) => void;
  onHasLogo: (v: boolean) => void;
  onDarkMode: (v: boolean) => void;
  t: (k: string) => string;
  visualStyles: string[];
  colorPalettes: string[];
  brandTones: string[];
}

function Toggle({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <div
      onClick={onClick}
      className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-all ${
        active ? "border-primary bg-primary/10 text-primary" : "border-white/10 text-gray-400 hover:border-white/30"
      }`}
    >
      <div className={`h-5 w-10 rounded-full transition-colors ${active ? "bg-primary" : "bg-white/20"}`}>
        <div className={`h-5 w-5 rounded-full bg-white transition-transform ${active ? "translate-x-5" : ""}`} />
      </div>
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
}

function OptionGrid({ value, onChange, options, t }: { value: string; onChange: (v: string) => void; options: string[]; t: (k: string) => string }) {
  return (
    <div className="grid gap-2 md:grid-cols-3">
      {options.map((key) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={`rounded-lg border px-3 py-2 text-left text-sm transition-all ${
            value === key
              ? "border-primary bg-primary/10 text-primary"
              : "border-white/10 text-gray-400 hover:border-white/30"
          }`}
        >
          {t(key)}
        </button>
      ))}
    </div>
  );
}

export default function VisualIdentityStep(props: Props) {
  const { t, visualStyles, colorPalettes, brandTones } = props;
  return (
    <div className="space-y-6 animate-in slide-in-from-right-4">
      <div>
        <p className="mb-2 text-sm font-semibold text-gray-200">{t("wizard.static.visual_style")}</p>
        <OptionGrid value={props.visualStyle} onChange={props.onVisualStyle} options={visualStyles} t={t} />
      </div>
      <div>
        <p className="mb-2 text-sm font-semibold text-gray-200">{t("wizard.static.color_palette")}</p>
        <OptionGrid value={props.colorPalette} onChange={props.onColorPalette} options={colorPalettes} t={t} />
      </div>
      <div>
        <p className="mb-2 text-sm font-semibold text-gray-200">{t("wizard.static.brand_tone")}</p>
        <OptionGrid value={props.brandTone} onChange={props.onBrandTone} options={brandTones} t={t} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Toggle active={props.hasLogo} onClick={() => props.onHasLogo(!props.hasLogo)} label={t("wizard.static.has_logo")} />
        <Toggle active={props.darkMode} onClick={() => props.onDarkMode(!props.darkMode)} label={t("wizard.static.dark_mode")} />
      </div>
    </div>
  );
}
