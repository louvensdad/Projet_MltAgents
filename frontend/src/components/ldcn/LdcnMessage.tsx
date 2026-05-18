"use client";

import { Bot, User, Volume2 } from "lucide-react";

export type LdcnRole = "assistant" | "user" | "system";

export interface LdcnMessageItem {
  id: string;
  role: LdcnRole;
  content: string;
  agents?: string[];
}

export default function LdcnMessage({ message, onSpeak }: { message: LdcnMessageItem; onSpeak?: (text: string) => void }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-cyan-400/25 bg-cyan-400/10 text-cyan-200">
          <Bot className="h-4 w-4" />
        </div>
      )}
      <div
        className={`max-w-[82%] rounded-lg border px-3 py-2 text-sm leading-relaxed ${
          isUser
            ? "border-blue-400/30 bg-blue-500/15 text-blue-50"
            : "border-white/10 bg-white/[0.04] text-slate-100"
        }`}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>
        {!isUser && !!onSpeak && (
          <button
            type="button"
            onClick={() => onSpeak(message.content)}
            className="mt-2 inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] font-semibold text-slate-200 transition hover:bg-white/[0.08]"
          >
            <Volume2 className="h-3 w-3" />
            Ouvir
          </button>
        )}
        {!!message.agents?.length && (
          <p className="mt-2 text-[10px] uppercase tracking-[0.18em] text-cyan-200/70">
            {message.agents.join(" + ")}
          </p>
        )}
      </div>
      {isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-blue-400/25 bg-blue-500/10 text-blue-100">
          <User className="h-4 w-4" />
        </div>
      )}
    </div>
  );
}
