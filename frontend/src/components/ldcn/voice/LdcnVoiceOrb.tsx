"use client";

import type { LdcnVoiceState } from "@/components/ldcn/voice/LdcnVoiceWave";

const VOICE_AVATAR_NAME = "Vens";

export default function LdcnVoiceOrb({ state }: { state: LdcnVoiceState }) {
  const tone = {
    idle: "from-cyan-400 via-blue-500 to-violet-500",
    listening: "from-blue-300 via-cyan-400 to-blue-600",
    transcribing: "from-blue-300 via-cyan-300 to-violet-400",
    thinking: "from-violet-400 via-cyan-400 to-fuchsia-500",
    speaking: "from-emerald-300 via-cyan-400 to-teal-500",
    error: "from-rose-400 via-red-500 to-orange-400",
  }[state];

  return (
    <div className="relative mx-auto flex h-28 w-28 items-center justify-center rounded-full">
      <span className={`absolute inset-0 rounded-full bg-gradient-to-br ${tone} opacity-70 blur-sm ${state !== "idle" ? "animate-pulse" : ""}`} />
      <span className="absolute inset-3 rounded-full border border-white/20 bg-slate-950/75 backdrop-blur-xl" />
      <span className={`absolute inset-7 rounded-full bg-gradient-to-br ${tone} shadow-2xl shadow-cyan-950/60`} />
      <span className="relative text-sm font-bold tracking-[0.22em] text-white">{VOICE_AVATAR_NAME}</span>
    </div>
  );
}
