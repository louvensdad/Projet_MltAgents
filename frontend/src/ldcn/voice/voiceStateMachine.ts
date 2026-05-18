"use client";

export type LdcnVoiceState = "idle" | "listening" | "transcribing" | "thinking" | "speaking" | "error";

export const LDCN_VOICE_TRANSITIONS: Record<LdcnVoiceState, LdcnVoiceState[]> = {
  idle: ["listening", "thinking", "error"],
  listening: ["transcribing", "thinking", "idle", "error"],
  transcribing: ["thinking", "idle", "error"],
  thinking: ["speaking", "idle", "error"],
  speaking: ["idle", "error"],
  error: ["idle", "listening"],
};

export function transitionVoiceState(current: LdcnVoiceState, next: LdcnVoiceState): LdcnVoiceState {
  if (current === next) return current;
  if (next === "error") return "error";
  if (LDCN_VOICE_TRANSITIONS[current]?.includes(next)) return next;
  if (current === "error" && next === "idle") return "idle";
  return current;
}
