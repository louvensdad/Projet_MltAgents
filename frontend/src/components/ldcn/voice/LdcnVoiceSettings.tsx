"use client";

import { SlidersHorizontal } from "lucide-react";

export interface LdcnVoiceSettingsValue {
  enabled: boolean;
  wakeWordEnabled: boolean;
  rate: number;
  pitch: number;
  locale: string;
}

export default function LdcnVoiceSettings({
  value,
  onChange,
}: {
  value: LdcnVoiceSettingsValue;
  onChange: (value: LdcnVoiceSettingsValue) => void;
}) {
  return (
    <div className="space-y-3 rounded-lg border border-white/10 bg-white/[0.03] p-3">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 text-sm font-semibold text-slate-100">
          <SlidersHorizontal className="h-4 w-4 text-cyan-300" />
          Voz
        </span>
        <label className="flex items-center gap-2 text-xs text-slate-300">
          <input
            type="checkbox"
            checked={value.enabled}
            onChange={(event) => onChange({ ...value, enabled: event.target.checked })}
            className="h-4 w-4 rounded border-white/20 bg-slate-900"
          />
          ativa
        </label>
      </div>
      <label className="flex items-center justify-between gap-3 rounded-md border border-white/10 bg-white/[0.02] px-3 py-2 text-xs text-slate-300">
        <span>escuta contínua com wake word</span>
        <input
          type="checkbox"
          checked={value.wakeWordEnabled}
          onChange={(event) => onChange({ ...value, wakeWordEnabled: event.target.checked })}
          className="h-4 w-4 rounded border-white/20 bg-slate-900"
        />
      </label>
      <label className="block text-xs text-slate-400">
        idioma
        <select
          value={value.locale}
          onChange={(event) => onChange({ ...value, locale: event.target.value })}
          className="mt-1 h-9 w-full rounded-md border border-white/10 bg-slate-950 px-2 text-sm text-slate-100"
        >
          <option value="pt-BR">pt-BR</option>
          <option value="en-US">en-US</option>
          <option value="es-ES">es-ES</option>
          <option value="fr-FR">fr-FR</option>
        </select>
      </label>
      <label className="block text-xs text-slate-400">
        velocidade {value.rate.toFixed(1)}
        <input
          type="range"
          min="0.7"
          max="1.3"
          step="0.1"
          value={value.rate}
          onChange={(event) => onChange({ ...value, rate: Number(event.target.value) })}
          className="mt-1 w-full"
        />
      </label>
      <label className="block text-xs text-slate-400">
        tom {value.pitch.toFixed(1)}
        <input
          type="range"
          min="0.7"
          max="1.3"
          step="0.1"
          value={value.pitch}
          onChange={(event) => onChange({ ...value, pitch: Number(event.target.value) })}
          className="mt-1 w-full"
        />
      </label>
    </div>
  );
}
