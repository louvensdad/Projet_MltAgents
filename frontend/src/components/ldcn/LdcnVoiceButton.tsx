"use client";

import { Mic, MicOff, Square } from "lucide-react";
import type { LdcnVoiceState } from "@/ldcn/voice/voiceStateMachine";

export default function LdcnVoiceButton({
  state,
  disabled,
  onStart,
  onStop,
}: {
  state: LdcnVoiceState;
  disabled?: boolean;
  onStart: () => void;
  onStop: () => void;
}) {
  const active = state === "listening" || state === "transcribing";
  const Icon = active ? Square : disabled ? MicOff : Mic;

  return (
    <button
      type="button"
      onClick={active ? onStop : onStart}
      disabled={disabled}
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${
        active ? "border-cyan-400/35 bg-cyan-400/10 text-cyan-50" : "border-white/10 bg-white/[0.04] text-slate-200 hover:bg-white/[0.08]"
      } disabled:cursor-not-allowed disabled:opacity-50`}
    >
      <Icon className="h-4 w-4" />
      {active ? "Parar" : "Falar"}
    </button>
  );
}
