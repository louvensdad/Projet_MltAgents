"use client";

export const LDCN_AVATAR_EVENT = "ldcn:avatar-event";
export const LDCN_VOICE_COMMAND_EVENT = "ldcn:voice-command";

export type LdcnAvatarEventType =
  | "page_loaded"
  | "project_generated"
  | "generation_failed"
  | "download_failed"
  | "agent_boost_active"
  | "validation_failed"
  | "template_selected"
  | "wizard_step_changed"
  | "voice_listening"
  | "voice_wake_word"
  | "voice_speaking"
  | "voice_idle"
  | "assistant_success"
  | "assistant_error";

export interface LdcnAvatarEventDetail {
  type: LdcnAvatarEventType;
  message?: string;
  route?: string;
  source?: string;
  payload?: Record<string, unknown>;
}

export interface LdcnVoiceCommandEventDetail {
  transcript: string;
  command: string;
  source: "wake_word" | "panel";
}

export function dispatchLdcnAvatarEvent(detail: LdcnAvatarEventDetail) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<LdcnAvatarEventDetail>(LDCN_AVATAR_EVENT, { detail }));
}

export function dispatchLdcnVoiceCommandEvent(detail: LdcnVoiceCommandEventDetail) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<LdcnVoiceCommandEventDetail>(LDCN_VOICE_COMMAND_EVENT, { detail }));
}
