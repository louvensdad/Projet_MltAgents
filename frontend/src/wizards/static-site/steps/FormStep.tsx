"use client";

import type { OptionItem } from "../staticSiteConfig";

interface Props {
  contactMethod: string;
  onSelect: (value: string) => void;
  options: OptionItem[];
}

export default function FormStep({ contactMethod, onSelect, options }: Props) {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-semibold text-gray-200">Contact method</p>
        <p className="text-xs text-gray-500">Choose how visitors should reach the business.</p>
      </div>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        {options.map((option) => {
          const selected = contactMethod === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onSelect(option.value)}
              className={`rounded-2xl border p-4 text-left transition-all ${
                selected
                  ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-100"
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
