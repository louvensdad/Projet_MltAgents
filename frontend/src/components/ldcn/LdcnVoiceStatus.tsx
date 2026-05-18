"use client";

import type { AudioPermissionState } from "@/ldcn/voice/useAudioLevel";
import type { LdcnVoiceState } from "@/ldcn/voice/voiceStateMachine";

export default function LdcnVoiceStatus({
  state,
  volumeLevel,
  permissionState,
  supported,
  noAudioDetected,
  error,
  textOnly,
}: {
  state: LdcnVoiceState;
  volumeLevel: number;
  permissionState: AudioPermissionState;
  supported: boolean;
  noAudioDetected: boolean;
  error: string;
  textOnly: boolean;
}) {
  const labelByState: Record<LdcnVoiceState, string> = {
    idle: "Pronto",
    listening: "Estou te ouvindo",
    transcribing: "Convertendo fala",
    thinking: "Pensando",
    speaking: "Falando",
    error: "Erro",
  };

  const bars = Array.from({ length: 7 }, (_, index) => {
    const normalized = Math.max(0, Math.min(100, volumeLevel));
    return Math.max(10, 10 + normalized / 4 + index * 1.4);
  });

  return (
    <div className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-cyan-200">Voz</p>
          <h3 className="text-sm font-semibold text-white">{labelByState[state]}</h3>
        </div>
        <span className="text-[11px] uppercase tracking-[0.2em] text-slate-500">{permissionState}</span>
      </div>
      <div className="flex items-end gap-1 rounded-full border border-white/10 bg-white/[0.03] px-3 py-2">
        {bars.map((height, index) => (
          <span
            key={index}
            className={`w-1.5 rounded-full ${state === "error" ? "bg-rose-400" : "bg-cyan-300"}`}
            style={{ height: `${height}px`, opacity: Math.max(0.3, volumeLevel / 100) }}
          />
        ))}
      </div>
      <p className="text-sm text-slate-300">
        {textOnly
          ? "Modo texto ativo. A voz fica desligada."
          : state === "listening"
            ? "Fale agora. Eu vou captar numa voz normal, sem gritar."
            : state === "speaking"
              ? "A resposta está saindo. O microfone fica desligado enquanto eu falo."
              : noAudioDetected
                ? "Nao detectei áudio. Seu microfone pode estar muito baixo."
                : supported
                  ? "Estou pronto para ouvir."
                  : "Seu navegador nao suporta voz. Use o chat textual."}
      </p>
      {!!error && <p className="text-sm text-rose-200">{error}</p>}
    </div>
  );
}
