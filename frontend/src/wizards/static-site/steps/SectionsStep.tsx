"use client";

import type { OptionItem } from "../staticSiteConfig";

interface Props {
  sections: string[];
  onToggle: (key: string) => void;
  options: OptionItem[];
}

export default function SectionsStep({ sections, onToggle, options }: Props) {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-semibold text-gray-200">Choose the sections</p>
        <p className="text-xs text-gray-500">Only selected sections will be previewed and generated.</p>
      </div>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {options.map((option) => {
          const selected = sections.includes(option.value);
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onToggle(option.value)}
              className={`rounded-2xl border p-4 text-left transition-all ${
                selected
                  ? "border-cyan-400/40 bg-cyan-500/10 text-cyan-100"
                  : "border-white/10 bg-white/[0.03] text-gray-300 hover:border-white/20 hover:bg-white/[0.05]"
              }`}
            >
              <span className="text-sm font-semibold">{option.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
