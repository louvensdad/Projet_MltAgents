"use client";

import type { VoiceGenderPreference, LdcnVoiceOption } from "@/ldcn/voice/useLdcnVoiceSelection";

export default function LdcnVoiceSettings({
  voiceGenderPreference,
  onVoiceGenderPreferenceChange,
  rate,
  onRateChange,
  pitch,
  onPitchChange,
  volume,
  onVolumeChange,
  voices,
  selectedVoiceName,
  onSelectedVoiceNameChange,
  warning,
  onTestVoice,
}: {
  voiceGenderPreference: VoiceGenderPreference;
  onVoiceGenderPreferenceChange: (value: VoiceGenderPreference) => void;
  rate: number;
  onRateChange: (value: number) => void;
  pitch: number;
  onPitchChange: (value: number) => void;
  volume: number;
  onVolumeChange: (value: number) => void;
  voices: LdcnVoiceOption[];
  selectedVoiceName: string;
  onSelectedVoiceNameChange: (value: string) => void;
  warning: string;
  onTestVoice: () => void;
}) {
  return (
    <section className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-cyan-200">Settings</p>
          <h3 className="text-sm font-semibold text-white">LDCN Voice</h3>
        </div>
        <button
          type="button"
          onClick={onTestVoice}
          className="rounded-full border border-cyan-400/25 bg-cyan-400/10 px-3 py-2 text-[11px] font-semibold text-cyan-50 transition hover:bg-cyan-400/15"
        >
          Testar voz
        </button>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <label className="space-y-1 text-xs text-slate-300">
          <span className="uppercase tracking-[0.18em] text-slate-500">Preferencia</span>
          <select
            value={voiceGenderPreference}
            onChange={(event) => onVoiceGenderPreferenceChange(event.target.value as VoiceGenderPreference)}
            className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none"
          >
            <option value="male">Masculino</option>
            <option value="female">Feminino</option>
            <option value="auto">Automatico</option>
          </select>
        </label>

        <label className="space-y-1 text-xs text-slate-300">
          <span className="uppercase tracking-[0.18em] text-slate-500">Velocidade</span>
          <input
            type="range"
            min="0.85"
            max="1.05"
            step="0.01"
            value={rate}
            onChange={(event) => onRateChange(Number(event.target.value))}
            className="w-full accent-cyan-300"
          />
          <span className="text-[11px] text-slate-500">{rate.toFixed(2)}</span>
        </label>

        <label className="space-y-1 text-xs text-slate-300">
          <span className="uppercase tracking-[0.18em] text-slate-500">Tom</span>
          <input
            type="range"
            min="0.7"
            max="1.1"
            step="0.01"
            value={pitch}
            onChange={(event) => onPitchChange(Number(event.target.value))}
            className="w-full accent-cyan-300"
          />
          <span className="text-[11px] text-slate-500">{pitch.toFixed(2)}</span>
        </label>
      </div>

      <label className="space-y-1 text-xs text-slate-300">
        <span className="uppercase tracking-[0.18em] text-slate-500">Volume</span>
        <input
          type="range"
          min="0.1"
          max="1"
          step="0.01"
          value={volume}
          onChange={(event) => onVolumeChange(Number(event.target.value))}
          className="w-full accent-cyan-300"
        />
      </label>

      <label className="space-y-1 text-xs text-slate-300">
        <span className="uppercase tracking-[0.18em] text-slate-500">Voz selecionada</span>
        <select
          value={selectedVoiceName}
          onChange={(event) => onSelectedVoiceNameChange(event.target.value)}
          className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none"
        >
          <option value="">Automatico pela melhor voz</option>
          {voices.map((voice) => (
            <option key={voice.name} value={voice.name}>
              {voice.label}
            </option>
          ))}
        </select>
      </label>

      {warning && <p className="text-xs leading-5 text-amber-200">{warning}</p>}
    </section>
  );
}

