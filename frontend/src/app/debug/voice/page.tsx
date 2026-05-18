"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mic, PlayCircle, RotateCcw, Square } from "lucide-react";
import LdcnVoiceSettings from "@/components/ldcn/LdcnVoiceSettings";
import { dispatchLdcnAvatarEvent } from "@/components/ldcn/avatar/ldcnAvatarEvents";
import { extractWakeWordCommand, wakeWordReply } from "@/ldcn/voice/wakeWords";
import { useMicrophoneDiagnostics } from "@/ldcn/voice/useMicrophoneDiagnostics";
import { useSpeechSynthesis } from "@/ldcn/voice/useSpeechSynthesis";
import type { LdcnState } from "@/ldcn/state/LdcnStateMachine";

export default function VoiceDebugPage() {
  const speech = useSpeechSynthesis("pt-BR");
  const [wakeWordMatch, setWakeWordMatch] = useState("");
  const [wakeCommand, setWakeCommand] = useState("");
  const [avatarState, setAvatarState] = useState<LdcnState>("sleeping");

  const handleTranscript = async (value: string) => {
    const result = extractWakeWordCommand(value);
    if (!result.matched) return;
    setWakeWordMatch(result.wakeWord);
    setWakeCommand(result.command);
    setAvatarState("waking");
    dispatchLdcnAvatarEvent({
      type: "voice_wake_word",
      message: wakeWordReply(result.wakeWord),
      payload: { transcript: value, command: result.command, wakeWord: result.wakeWord },
    });
    window.setTimeout(() => setAvatarState("listening"), 250);
    speech.speak(result.command || wakeWordReply(result.wakeWord), {
      locale: "pt-BR",
      voiceGenderPreference: speech.voiceGenderPreference,
      rate: speech.voiceRate,
      pitch: speech.voicePitch,
      volume: speech.voiceVolume,
      onStart: () => setAvatarState("speaking"),
      onEnd: () => setAvatarState("idle"),
    });
  };

  const mic = useMicrophoneDiagnostics("pt-BR", { onFinalTranscript: handleTranscript });
  const { refreshDevices } = mic;

  useEffect(() => {
    void refreshDevices();
  }, [refreshDevices]);

  const diagnosis = useMemo(
    () => ({
      voices: speech.voices.map((voice) => ({
        name: voice.name,
        lang: voice.lang,
        default: voice.default,
      })),
      selectedVoiceName: speech.selectedVoiceName,
      voiceGenderPreference: speech.voiceGenderPreference,
      voiceWarning: speech.voiceWarning,
      transcript: mic.transcript,
      interimTranscript: mic.interimTranscript,
      wakeWordMatch,
      wakeCommand,
      avatarState,
      permissionState: mic.permissionState,
    }),
    [avatarState, mic.interimTranscript, mic.permissionState, mic.transcript, speech.selectedVoiceName, speech.voiceGenderPreference, speech.voiceWarning, speech.voices, wakeCommand, wakeWordMatch]
  );

  const startTest = async () => {
    setAvatarState("listening");
    await mic.startTest();
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.14),transparent_30%),linear-gradient(180deg,#020617,#0f172a)] px-4 py-8 text-white">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-200">Debug</p>
            <h1 className="text-3xl font-semibold">Teste de voz</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
              Esta tela testa voz masculina, seleção de voz, wake word e resposta do avatar sem depender do painel principal.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Link>
        </div>

        <section className="grid gap-4 rounded-3xl border border-white/10 bg-white/[0.03] p-5 shadow-2xl shadow-black/30 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-4">
            <div className="rounded-2xl border border-cyan-400/15 bg-cyan-400/5 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-cyan-200">Wake word</p>
                  <h2 className="text-lg font-semibold">{wakeWordMatch ? `Detectado: ${wakeWordMatch}` : "Pronto para detectar"}</h2>
                </div>
                <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-slate-300">
                  {avatarState}
                </span>
              </div>

              <p className="mt-3 text-sm text-slate-300">
                {wakeCommand
                  ? `Comando capturado: ${wakeCommand}`
                  : "Fale LDCN, Vens, Jarvis, Ei LDCN ou Ei Vens para testar a ativação."}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => void startTest()}
                className="inline-flex items-center gap-2 rounded-full border border-cyan-400/25 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-50 transition hover:bg-cyan-400/15"
              >
                <PlayCircle className="h-4 w-4" />
                Iniciar teste
              </button>
              <button
                type="button"
                onClick={mic.stopTest}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/[0.08]"
              >
                <Square className="h-4 w-4" />
                Parar
              </button>
              <button
                type="button"
                onClick={() => speech.testVoice("Estou aqui. O que vamos construir hoje?")}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/[0.08]"
              >
                <Mic className="h-4 w-4" />
                Testar voz
              </button>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/[0.08]"
              >
                <RotateCcw className="h-4 w-4" />
                Recarregar
              </button>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold">Transcrição e áudio</h3>
                <span className="text-[11px] uppercase tracking-[0.2em] text-slate-500">{mic.permissionState}</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full border border-white/10 bg-black/20">
                <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-sky-400 to-emerald-400" style={{ width: `${Math.max(4, mic.volumeLevel)}%` }} />
              </div>
              <p className="mt-3 min-h-12 whitespace-pre-wrap text-sm text-cyan-50">{mic.transcript || "Nenhuma transcrição final."}</p>
              {!!mic.interimTranscript && <p className="mt-2 text-sm text-slate-300">Parcial: {mic.interimTranscript}</p>}
            </div>

            <LdcnVoiceSettings
              voiceGenderPreference={speech.voiceGenderPreference}
              onVoiceGenderPreferenceChange={speech.setVoiceGenderPreference}
              rate={speech.voiceRate}
              onRateChange={speech.setVoiceRate}
              pitch={speech.voicePitch}
              onPitchChange={speech.setVoicePitch}
              volume={speech.voiceVolume}
              onVolumeChange={speech.setVoiceVolume}
              voices={speech.voices.map((voice) => ({
                name: voice.name,
                lang: voice.lang,
                label: `${voice.name} (${voice.lang}${voice.default ? ", padrao" : ""})`,
                gender: "unknown",
                default: voice.default,
              }))}
              selectedVoiceName={speech.selectedVoiceName}
              onSelectedVoiceNameChange={speech.setPreferredVoiceName}
              warning={speech.voiceWarning}
              onTestVoice={() => speech.testVoice("Estou aqui. O que vamos construir hoje?")}
            />
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Vozes encontradas</p>
              <div className="mt-3 space-y-2">
                {speech.voices.map((voice) => (
                  <div key={voice.name} className={`rounded-xl border px-3 py-2 ${voice.name === speech.selectedVoiceName ? "border-cyan-400/30 bg-cyan-400/10 text-cyan-50" : "border-white/10 bg-white/[0.03] text-slate-300"}`}>
                    <div className="font-medium">{voice.name}</div>
                    <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">{voice.lang}</div>
                  </div>
                ))}
                {speech.voices.length === 0 && <p className="text-slate-400">Nenhuma voz carregada ainda. Clique em testar voz ou recarregue.</p>}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Resumo</p>
              <pre className="mt-3 overflow-auto rounded-xl border border-white/10 bg-black/30 p-3 text-[11px] leading-5 text-slate-300">
                {JSON.stringify(diagnosis, null, 2)}
              </pre>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
