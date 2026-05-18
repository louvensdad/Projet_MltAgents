"use client";

import { FormEvent, useState } from "react";
import { Send, X } from "lucide-react";
import LdcnActionButtons, { LdcnAction } from "@/components/ldcn/LdcnActionButtons";
import LdcnContextBar from "@/components/ldcn/LdcnContextBar";
import LdcnMessage, { LdcnMessageItem } from "@/components/ldcn/LdcnMessage";
import LdcnVoicePanel from "@/components/ldcn/voice/LdcnVoicePanel";

export default function LdcnChatPanel({
  open,
  messages,
  actions,
  page,
  stackId,
  activeAgent,
  mode,
  busy,
  onClose,
  onSend,
  onAction,
  onVoiceTranscript,
  onSpeak,
}: {
  open: boolean;
  messages: LdcnMessageItem[];
  actions: LdcnAction[];
  page: string;
  stackId?: string | null;
  activeAgent?: string | null;
  mode: string;
  busy: boolean;
  onClose: () => void;
  onSend: (message: string) => Promise<void>;
  onAction: (action: LdcnAction) => void;
  onVoiceTranscript: (transcript: string) => Promise<string | null>;
  onSpeak: (text: string) => void;
}) {
  const [text, setText] = useState("");
  const [view, setView] = useState<"text" | "voice">("text");

  async function submit(event: FormEvent) {
    event.preventDefault();
    const value = text.trim();
    if (!value || busy) return;
    setText("");
    await onSend(value);
  }

  if (!open) return null;

  return (
    <aside className="fixed bottom-24 right-5 z-50 flex h-[min(760px,calc(100vh-7rem))] w-[min(440px,calc(100vw-2rem))] flex-col overflow-hidden rounded-xl border border-white/12 bg-slate-950/95 shadow-2xl shadow-black/50 backdrop-blur-2xl">
      <header className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-cyan-200">Vens</p>
          <h2 className="text-base font-semibold text-white">Global AI Orchestrator</h2>
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

      <LdcnContextBar page={page} stackId={stackId} activeAgent={activeAgent} mode={mode} />

      <div className="flex border-b border-white/10 p-2">
        {(["text", "voice"] as const).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setView(item)}
            className={`h-9 flex-1 rounded-md text-sm font-semibold transition ${
              view === item ? "bg-cyan-300/15 text-cyan-50" : "text-slate-400 hover:bg-white/5 hover:text-slate-100"
            }`}
          >
            {item === "text" ? "Texto" : "Voz"}
          </button>
        ))}
      </div>

      {view === "voice" ? (
        <LdcnVoicePanel busy={busy} onTranscript={onVoiceTranscript} onSpeak={onSpeak} />
      ) : (
        <>
          <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
            {messages.map((message) => (
              <LdcnMessage key={message.id} message={message} />
            ))}
            {busy && (
              <div className="flex items-center gap-2 text-sm text-cyan-200">
                <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-300" />
                Vens analisando contexto e agentes
              </div>
            )}
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
          </div>
        </>
      )}
    </aside>
  );
}
