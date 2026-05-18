"use client";

export const LDCN_AVATAR_EVENT = "ldcn:avatar-event";

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

export function dispatchLdcnAvatarEvent(detail: LdcnAvatarEventDetail) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<LdcnAvatarEventDetail>(LDCN_AVATAR_EVENT, { detail }));
}
