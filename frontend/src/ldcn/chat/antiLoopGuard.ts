"use client";

import { type LdcnVoiceState } from "@/ldcn/voice/voiceStateMachine";

function normalize(value: string) {
  return value.toLowerCase().replace(/[^\w\s]/g, " ").replace(/\s+/g, " ").trim();
}

export class LdcnAntiLoopGuard {
  lastUserTranscript = "";
  lastAssistantReply = "";
  lastRequestId = "";
  turnId = crypto.randomUUID();
  state: LdcnVoiceState = "idle";

  nextTurn() {
    this.turnId = crypto.randomUUID();
    this.lastRequestId = "";
    return this.turnId;
  }

  setState(state: LdcnVoiceState) {
    this.state = state;
  }

  canSend(transcript: string, requestId: string) {
    const normalized = normalize(transcript);
    if (this.state === "thinking" || this.state === "speaking") return { ok: false, reason: "busy" };
    if (normalized.length < 2) return { ok: false, reason: "too_short" };
    if (normalized === normalize(this.lastUserTranscript)) return { ok: false, reason: "duplicate_user" };
    if (normalized === normalize(this.lastAssistantReply)) return { ok: false, reason: "assistant_echo" };
    if (requestId && requestId === this.lastRequestId) return { ok: false, reason: "duplicate_request" };
    return { ok: true as const };
  }

  registerUserTranscript(transcript: string, requestId: string) {
    this.lastUserTranscript = transcript;
    this.lastRequestId = requestId;
  }

  registerAssistantReply(reply: string) {
    this.lastAssistantReply = reply;
  }
}

export function createAntiLoopGuard() {
  return new LdcnAntiLoopGuard();
}
