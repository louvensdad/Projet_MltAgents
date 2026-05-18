"use client";

import { MessageCircle, Mic, Sparkles, ShieldAlert, SunMedium, Wand2, CheckCircle2, AlertTriangle } from "lucide-react";
import type { LdcnState } from "@/ldcn/state/LdcnStateMachine";

export default function LdcnFloatingOrb({
  state,
  open,
  onClick,
}: {
  state: LdcnState;
  open: boolean;
  onClick: () => void;
}) {
  const tone = {
    sleeping: "from-slate-500 via-slate-600 to-slate-700",
    idle: "from-cyan-400 via-blue-500 to-violet-500",
    waking: "from-cyan-300 via-sky-400 to-blue-500",
    listening: "from-blue-300 via-cyan-400 to-blue-600",
    transcribing: "from-blue-300 via-cyan-300 to-violet-400",
    thinking: "from-violet-400 via-cyan-400 to-fuchsia-500",
    speaking: "from-emerald-300 via-cyan-400 to-teal-500",
    waiting_confirmation: "from-amber-300 via-orange-400 to-amber-500",
    executing_action: "from-cyan-300 via-violet-400 to-fuchsia-500",
    success: "from-emerald-300 via-teal-400 to-cyan-500",
    warning: "from-amber-300 via-yellow-400 to-orange-500",
    error: "from-rose-400 via-red-500 to-orange-400",
  }[state];

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={open ? "Fechar Vens" : "Abrir Vens"}
      className="group fixed bottom-5 right-5 z-50 flex h-16 w-16 items-center justify-center rounded-full border border-white/20 bg-slate-950/85 shadow-2xl shadow-cyan-950/50 backdrop-blur-xl transition hover:scale-105"
    >
      <span className={`absolute inset-0 rounded-full bg-gradient-to-br ${tone} opacity-80 blur-[1px]`} />
      <span className="absolute inset-1 rounded-full bg-slate-950/80" />
      <span className={`absolute -inset-1 rounded-full bg-gradient-to-br ${tone} opacity-30 blur-md ${state !== "idle" ? "animate-pulse" : ""}`} />
      <span className="relative flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white">
        {state === "sleeping" ? (
          <SunMedium className="h-5 w-5" />
        ) : state === "waking" ? (
          <Wand2 className="h-5 w-5" />
        ) : state === "listening" || state === "transcribing" ? (
          <Mic className="h-5 w-5" />
        ) : state === "speaking" ? (
          <Sparkles className="h-5 w-5" />
        ) : state === "success" ? (
          <CheckCircle2 className="h-5 w-5" />
        ) : state === "warning" || state === "waiting_confirmation" ? (
          <ShieldAlert className="h-5 w-5" />
        ) : state === "error" ? (
          <AlertTriangle className="h-5 w-5" />
        ) : (
          <MessageCircle className="h-5 w-5" />
        )}
      </span>
      <span className="absolute right-1 top-1 h-3 w-3 rounded-full border border-slate-950 bg-emerald-400" />
    </button>
  );
}
