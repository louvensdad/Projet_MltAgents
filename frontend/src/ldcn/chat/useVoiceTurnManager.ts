"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { createAntiLoopGuard } from "@/ldcn/chat/antiLoopGuard";
import { transitionVoiceState, type LdcnVoiceState } from "@/ldcn/voice/voiceStateMachine";

export function useVoiceTurnManager() {
  const guardRef = useRef(createAntiLoopGuard());
  const [state, setState] = useState<LdcnVoiceState>("idle");
  const [turnId, setTurnId] = useState(() => guardRef.current.turnId);
  const [requestId, setRequestId] = useState("");

  const updateState = useCallback((next: LdcnVoiceState) => {
    setState((current) => {
      const resolved = transitionVoiceState(current, next);
      guardRef.current.setState(resolved);
      return resolved;
    });
  }, []);

  const beginListening = useCallback(() => {
    if (state !== "idle" && state !== "error") return null;
    const nextTurnId = guardRef.current.nextTurn();
    setTurnId(nextTurnId);
    updateState("listening");
    return nextTurnId;
  }, [state, updateState]);

  const beginTranscribing = useCallback(() => {
    updateState("transcribing");
  }, [updateState]);

  const beginThinking = useCallback((nextRequestId?: string) => {
    const id = nextRequestId || crypto.randomUUID();
    setRequestId(id);
    updateState("thinking");
    return id;
  }, [updateState]);

  const beginSpeaking = useCallback(() => {
    updateState("speaking");
  }, [updateState]);

  const finishSpeaking = useCallback(() => {
    setRequestId("");
    updateState("idle");
  }, [updateState]);

  const fail = useCallback((reason?: string) => {
    if (reason) {
      guardRef.current.registerAssistantReply(reason);
    }
    updateState("error");
  }, [updateState]);

  const registerUserTranscript = useCallback((transcript: string, nextRequestId: string) => {
    guardRef.current.registerUserTranscript(transcript, nextRequestId);
  }, []);

  const registerAssistantReply = useCallback((reply: string) => {
    guardRef.current.registerAssistantReply(reply);
  }, []);

  const canSend = useCallback((transcript: string, nextRequestId: string) => {
    return guardRef.current.canSend(transcript, nextRequestId);
  }, []);

  const value = useMemo(() => ({
    state,
    turnId,
    requestId,
    beginListening,
    beginTranscribing,
    beginThinking,
    beginSpeaking,
    finishSpeaking,
    fail,
    registerUserTranscript,
    registerAssistantReply,
    canSend,
    reset: () => {
      setRequestId("");
      updateState("idle");
    },
  }), [
    beginListening,
    beginSpeaking,
    beginThinking,
    beginTranscribing,
    canSend,
    fail,
    finishSpeaking,
    registerAssistantReply,
    registerUserTranscript,
    requestId,
    state,
    turnId,
    updateState,
  ]);

  return value;
}
