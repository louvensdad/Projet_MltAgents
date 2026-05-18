"use client";

import { FormEvent, useState } from "react";
import { Send, X } from "lucide-react";
import LdcnActionButtons, { LdcnAction } from "@/components/ldcn/LdcnActionButtons";
import LdcnMessage, { LdcnMessageItem } from "@/components/ldcn/LdcnMessage";
import LdcnVoiceDebugPanel from "@/components/ldcn/LdcnVoiceDebugPanel";
import LdcnVoiceSettings from "@/components/ldcn/LdcnVoiceSettings";
import LdcnVoiceButton from "@/components/ldcn/LdcnVoiceButton";
import LdcnVoiceStatus from "@/components/ldcn/LdcnVoiceStatus";
import LdcnTranscript from "@/components/ldcn/LdcnTranscript";
import type { LdcnVoiceState } from "@/ldcn/voice/voiceStateMachine";
import type { AudioPermissionState } from "@/ldcn/voice/useAudioLevel";
import type { VoiceGenderPreference } from "@/ldcn/voice/useLdcnVoiceSelection";

export default function LdcnChatPanel({
  open,
  messages,
  actions,
  busy,
  assistantState,
  activeAgent,
  page,
  pageTitle,
  stackId,
  mode,
  transcript,
  interimTranscript,
  volumeLevel,
  isVoiceSupported,
  voiceError,
  permissionState,
  noAudioDetected,
  textError,
  textOnly,
  voiceUnlocked,
  voiceGenderPreference,
  voiceRate,
  voicePitch,
  voiceVolume,
  selectedVoiceName,
  availableVoices,
  voiceWarning,
  canRetry,
  onRetry,
  onCancel,
  onVoiceGenderPreferenceChange,
  onVoiceRateChange,
  onVoicePitchChange,
  onVoiceVolumeChange,
  onSelectedVoiceNameChange,
  onTestVoice,
  onUnlockVoice,
  onSpeakMessage,
  onClose,
  onSend,
  onAction,
  onStartVoice,
  onStopVoice,
  onToggleTextOnly,
}: {
  open: boolean;
  messages: LdcnMessageItem[];
  actions: LdcnAction[];
  busy: boolean;
  assistantState: LdcnVoiceState;
  activeAgent?: string | null;
  page: string;
  pageTitle: string;
  stackId?: string | null;
  mode: string;
  transcript: string;
  interimTranscript: string;
  volumeLevel: number;
  isVoiceSupported: boolean;
  voiceError: string;
  permissionState: AudioPermissionState;
  noAudioDetected: boolean;
  textError: string;
  textOnly: boolean;
  voiceUnlocked: boolean;
  voiceGenderPreference: VoiceGenderPreference;
  voiceRate: number;
  voicePitch: number;
  voiceVolume: number;
  selectedVoiceName: string;
  availableVoices: { name: string; lang: string; label: string; gender: "male" | "female" | "unknown"; default: boolean }[];
  voiceWarning: string;
  canRetry: boolean;
  onRetry: () => Promise<string | null>;
  onCancel: () => void;
  onVoiceGenderPreferenceChange: (value: VoiceGenderPreference) => void;
  onVoiceRateChange: (value: number) => void;
  onVoicePitchChange: (value: number) => void;
  onVoiceVolumeChange: (value: number) => void;
  onSelectedVoiceNameChange: (value: string) => void;
  onTestVoice: () => void;
  onUnlockVoice: () => Promise<boolean>;
  onSpeakMessage: (text: string) => Promise<boolean>;
  onClose: () => void;
  onSend: (message: string) => Promise<string | null>;
  onAction: (action: LdcnAction) => void;
  onStartVoice: () => Promise<boolean>;
  onStopVoice: () => void;
  onToggleTextOnly: (value: boolean) => void;
}) {
  const [text, setText] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    const value = text.trim();
    if (!value || busy) return;
    setText("");
    await onSend(value);
  }

  if (!open) return null;

  return (
    <aside className="fixed bottom-24 right-5 z-50 flex h-[min(760px,calc(100vh-7rem))] w-[min(460px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-white/12 bg-slate-950/95 shadow-2xl shadow-black/50 backdrop-blur-2xl">
      <header className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-cyan-200">Vens</p>
          <h2 className="text-base font-semibold text-white">Chat e voz em tempo real</h2>
          <p className="text-[11px] text-slate-400">
            {pageTitle || page} {stackId ? `· ${stackId}` : ""} {mode ? `· ${mode}` : ""}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-md border border-white/10 text-slate-300 transition hover:bg-white/10 hover:text-white"
          aria-label="Fechar painel"
        >
          <X className="h-4 w-4" />
        </button>
      </header>

      <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
        <LdcnVoiceDebugPanel
          state={assistantState}
          supported={isVoiceSupported}
          permissionState={permissionState}
          volumeLevel={volumeLevel}
          transcript={transcript}
          interimTranscript={interimTranscript}
          noAudioDetected={noAudioDetected}
          error={voiceError || textError}
          textOnly={textOnly}
          isListening={assistantState === "listening" || assistantState === "transcribing"}
          onStartVoice={onStartVoice}
          onStopVoice={onStopVoice}
          onToggleTextOnly={onToggleTextOnly}
        />

        <LdcnVoiceStatus
          state={assistantState}
          volumeLevel={volumeLevel}
          permissionState={permissionState}
          supported={isVoiceSupported}
          noAudioDetected={noAudioDetected}
          error={voiceError || textError}
          textOnly={textOnly}
        />

        <LdcnVoiceSettings
          voiceGenderPreference={voiceGenderPreference}
          onVoiceGenderPreferenceChange={onVoiceGenderPreferenceChange}
          rate={voiceRate}
          onRateChange={onVoiceRateChange}
          pitch={voicePitch}
          onPitchChange={onVoicePitchChange}
          volume={voiceVolume}
          onVolumeChange={onVoiceVolumeChange}
          voices={availableVoices}
          selectedVoiceName={selectedVoiceName}
          onSelectedVoiceNameChange={onSelectedVoiceNameChange}
          warning={voiceWarning}
          onTestVoice={onTestVoice}
        />

        <div className="flex items-center justify-between gap-3">
          <LdcnVoiceButton
            state={assistantState}
            disabled={busy || !isVoiceSupported || textOnly || assistantState === "speaking"}
            onStart={() => void onStartVoice()}
            onStop={onStopVoice}
          />
          <label className="inline-flex items-center gap-2 text-xs text-slate-300">
            <input
              type="checkbox"
              checked={textOnly}
              onChange={(event) => onToggleTextOnly(event.target.checked)}
              className="h-4 w-4 rounded border-white/20 bg-slate-900"
            />
            Usar so texto
          </label>
        </div>

        {!voiceUnlocked && !textOnly && (
          <button
            type="button"
            onClick={() => void onUnlockVoice()}
            className="w-full rounded-xl border border-cyan-400/25 bg-cyan-400/10 px-3 py-2 text-sm font-semibold text-cyan-50 transition hover:bg-cyan-400/15"
          >
            Ativar voz do LDCN
          </button>
        )}

        <LdcnTranscript transcript={transcript} interimTranscript={interimTranscript} />

        <div className="space-y-4">
          {messages.map((message) => (
            <LdcnMessage key={message.id} message={message} onSpeak={(text) => void onSpeakMessage(text)} />
          ))}
          {busy && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-cyan-200">
                <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-300" />
                Vens analisando contexto e agentes
              </div>
              <button
                type="button"
                onClick={onCancel}
                className="rounded-full border border-amber-300/25 bg-amber-300/10 px-3 py-1 text-xs font-semibold text-amber-100 transition hover:bg-amber-300/15"
              >
                Cancelar
              </button>
            </div>
          )}
          {textError && <p className="text-sm text-rose-200">{textError}</p>}
          {!busy && canRetry && (
            <button
              type="button"
              onClick={() => void onRetry()}
              className="rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-1 text-xs font-semibold text-cyan-50 transition hover:bg-cyan-300/15"
            >
              Tentar novamente
            </button>
          )}
        </div>
      </div>

      <div className="space-y-3 border-t border-white/10 p-4">
        <LdcnActionButtons actions={actions} onAction={onAction} />
        <form onSubmit={submit} className="flex gap-2">
          <input
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="Fale sobre seu projeto, stack, erro ou download"
            className="min-w-0 flex-1 rounded-md border border-white/10 bg-white/[0.04] px-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/40"
          />
          <button
            type="submit"
            disabled={busy || !text.trim()}
            className="flex h-10 w-10 items-center justify-center rounded-md border border-cyan-300/25 bg-cyan-300/10 text-cyan-50 transition hover:bg-cyan-300/20 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Enviar mensagem"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
        <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.2em] text-slate-500">
          <span>{assistantState}</span>
          <span>{activeAgent || "sem agente ativo"}</span>
        </div>
      </div>
    </aside>
  );
}
