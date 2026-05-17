"use client";

import type { OptionItem } from "../staticSiteConfig";

interface Props {
  visualStyle: string;
  brandColors: string[];
  onVisualStyle: (value: string) => void;
  onToggleColor: (value: string) => void;
  visualStyles: OptionItem[];
  brandColorsOptions: OptionItem[];
}

export default function VisualIdentityStep({
  visualStyle,
  brandColors,
  onVisualStyle,
  onToggleColor,
  visualStyles,
  brandColorsOptions,
}: Props) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold text-gray-200">Visual identity</p>
        <p className="text-xs text-gray-500">Choose a style and optional brand colors.</p>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {visualStyles.map((option) => {
          const selected = visualStyle === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onVisualStyle(option.value)}
              className={`rounded-2xl border p-4 text-left transition-all ${
                selected
                  ? "border-violet-400/40 bg-violet-500/10 text-violet-100"
                  : "border-white/10 bg-white/[0.03] text-gray-300 hover:border-white/20 hover:bg-white/[0.05]"
              }`}
            >
              <span className="text-sm font-semibold">{option.label}</span>
            </button>
          );
        })}
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Brand colors</p>
        <div className="flex flex-wrap gap-2">
          {brandColorsOptions.map((option) => {
            const selected = brandColors.includes(option.value);
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onToggleColor(option.value)}
                className={`rounded-full border px-4 py-2 text-sm transition-all ${
                  selected
                    ? "border-cyan-400/40 bg-cyan-500/15 text-cyan-100"
                    : "border-white/10 bg-white/[0.03] text-gray-300 hover:border-white/20"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
