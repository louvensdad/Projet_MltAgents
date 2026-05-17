"use client";

import type { ToggleItem } from "../staticSiteConfig";

interface Props {
  lazyLoading: boolean;
  semanticHtml: boolean;
  altText: boolean;
  responsive: boolean;
  reducedMotion: boolean;
  accessibilityLevel: string;
  onToggle: (field: "lazy_loading" | "semantic_html" | "alt_text" | "responsive" | "reduced_motion", value: boolean) => void;
  onAccessibilityChange: (value: string) => void;
  options: ToggleItem[];
  accessibilityOptions: { value: string; label: string }[];
}

export default function SecurityStep({ lazyLoading, semanticHtml, altText, responsive, reducedMotion, accessibilityLevel, onToggle, onAccessibilityChange, options, accessibilityOptions }: Props) {
  const values = {
    lazy_loading: lazyLoading,
    semantic_html: semanticHtml,
    alt_text: altText,
    responsive: responsive,
    reduced_motion: reducedMotion,
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-semibold text-gray-200">Performance and accessibility</p>
        <p className="text-xs text-gray-500">These switches are validated before generation.</p>
      </div>
      <div className="space-y-3">
        {options.map((option) => {
          const active = values[option.key as keyof typeof values];
          return (
            <button
              key={option.key}
              type="button"
              onClick={() => onToggle(option.key as any, !active)}
              className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition-all ${
                active ? "border-cyan-400/40 bg-cyan-500/10 text-cyan-100" : "border-white/10 bg-white/[0.03] text-gray-300 hover:border-white/20"
              }`}
            >
              <div>
                <p className="text-sm font-semibold">{option.label}</p>
                <p className="text-xs text-gray-500">{option.description}</p>
              </div>
              <span className={`ml-4 h-5 w-10 rounded-full transition-all ${active ? "bg-cyan-400" : "bg-white/15"}`}>
                <span className={`block h-5 w-5 rounded-full bg-white transition-transform ${active ? "translate-x-5" : ""}`} />
              </span>
            </button>
          );
        })}
      </div>

      <div className="space-y-2 pt-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Accessibility level</p>
        <div className="grid gap-3 md:grid-cols-2">
          {accessibilityOptions.map((option) => {
            const active = accessibilityLevel === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onAccessibilityChange(option.value)}
                className={`rounded-2xl border px-4 py-3 text-left transition-all ${
                  active ? "border-cyan-400/40 bg-cyan-500/10 text-cyan-100" : "border-white/10 bg-white/[0.03] text-gray-300 hover:border-white/20"
                }`}
              >
                <span className="text-sm font-semibold">{option.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
