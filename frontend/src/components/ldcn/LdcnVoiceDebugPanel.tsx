"use client";

import { useState } from "react";
import { Copy, Mic, MicOff, Square, RotateCcw } from "lucide-react";
import type { AudioPermissionState } from "@/ldcn/voice/useAudioLevel";
import type { LdcnVoiceState } from "@/ldcn/voice/voiceStateMachine";

export default function LdcnVoiceDebugPanel({
  state,
  supported,
  permissionState,
  volumeLevel,
  transcript,
  interimTranscript,
  noAudioDetected,
  error,
  textOnly,
  isListening,
  onStartVoice,
  onStopVoice,
  onToggleTextOnly,
}: {
  state: LdcnVoiceState;
  supported: boolean;
  permissionState: AudioPermissionState;
  volumeLevel: number;
  transcript: string;
  interimTranscript: string;
  noAudioDetected: boolean;
  error: string;
  textOnly: boolean;
  isListening: boolean;
  onStartVoice: () => Promise<boolean>;
  onStopVoice: () => void;
  onToggleTextOnly: (value: boolean) => void;
}) {
  const [copyLabel, setCopyLabel] = useState("Copiar diagnóstico");

  const canSpeak = supported && !textOnly && permissionState !== "denied";
  const statusText =
    textOnly
      ? "Modo texto ligado. O microfone fica desativado."
      : permissionState === "denied"
        ? "Permissao negada. Libere o microfone no navegador."
        : state === "listening"
          ? "Estou te ouvindo. Fale agora."
          : state === "transcribing"
            ? "Captando fala e convertendo em texto."
            : state === "speaking"
              ? "Falando. O microfone deve ficar desligado."
              : noAudioDetected
                ? "Nao detectei audio. Aproximar o microfone pode ajudar."
                : "Pronto para um teste de microfone.";

  const copyDebug = async () => {
    const payload = {
      state,
      supported,
      permissionState,
      volumeLevel,
      transcript,
      interimTranscript,
      noAudioDetected,
      error,
      textOnly,
      isListening,
      timestamp: new Date().toISOString(),
    };
    try {
      await navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
      setCopyLabel("Copiado");
      window.setTimeout(() => setCopyLabel("Copiar diagnóstico"), 1500);
    } catch {
      setCopyLabel("Falhou");
      window.setTimeout(() => setCopyLabel("Copiar diagnóstico"), 1500);
    }
  };

  return (
    <section className="space-y-3 rounded-2xl border border-cyan-400/15 bg-cyan-400/5 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.28em] text-cyan-200">Diagnóstico</p>
          <h3 className="text-sm font-semibold text-white">Microfone e voz</h3>
          <p className="mt-1 text-xs leading-5 text-slate-400">{statusText}</p>
        </div>
        <button
          type="button"
          onClick={copyDebug}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-[11px] font-semibold text-slate-200 transition hover:bg-white/[0.08]"
        >
          <Copy className="h-3.5 w-3.5" />
          {copyLabel}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
        <div className="rounded-xl border border-white/10 bg-black/20 p-3">
          <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Suporte</p>
          <p className="mt-1 font-semibold text-white">{supported ? "Disponivel" : "Indisponivel"}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-black/20 p-3">
          <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Permissao</p>
          <p className="mt-1 font-semibold text-white">{permissionState}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-black/20 p-3">
          <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Audio</p>
          <p className="mt-1 font-semibold text-white">{volumeLevel}%</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-black/20 p-3">
          <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Estado</p>
          <p className="mt-1 font-semibold text-white">{state}</p>
        </div>
      </div>

      <div className="space-y-2 rounded-xl border border-white/10 bg-black/20 p-3 text-xs">
        <p className="uppercase tracking-[0.2em] text-slate-500">Transcricao</p>
        <p className="text-slate-100">{transcript || "Nenhuma transcricao final ainda."}</p>
        {!!interimTranscript && <p className="text-cyan-200">Parcial: {interimTranscript}</p>}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => void onStartVoice()}
          disabled={!canSpeak || state === "speaking" || isListening}
          className="inline-flex items-center gap-2 rounded-full border border-cyan-400/25 bg-cyan-400/10 px-3 py-2 text-xs font-semibold text-cyan-50 transition hover:bg-cyan-400/15 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Mic className="h-3.5 w-3.5" />
          Iniciar teste
        </button>
        <button
          type="button"
          onClick={onStopVoice}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-white/[0.08]"
        >
          <Square className="h-3.5 w-3.5" />
          Parar
        </button>
        <button
          type="button"
          onClick={() => onToggleTextOnly(!textOnly)}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-white/[0.08]"
        >
          {textOnly ? <Mic className="h-3.5 w-3.5" /> : <MicOff className="h-3.5 w-3.5" />}
          {textOnly ? "Ativar voz" : "Usar só texto"}
        </button>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-white/[0.08]"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Recarregar
        </button>
      </div>

      {!!error && <p className="text-xs leading-5 text-rose-200">{error}</p>}
      {!supported && <p className="text-xs leading-5 text-amber-200">Este navegador nao suporta voz. Use o modo texto.</p>}
    </section>
  );
}
