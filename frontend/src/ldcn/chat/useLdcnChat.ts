"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { apiPost } from "@/lib/api";
import { usePreferences } from "@/context/PreferencesContext";
import { useLdcnContext } from "@/ldcn/context/LdcnContextProvider";
import { buildConversationMemorySnapshot, type LdcnConversationTurn } from "@/ldcn/chat/conversationMemory";
import { buildLdcnChatPayload, collectPageContext } from "@/ldcn/chat/contextCollector";
import { useVoiceTurnManager } from "@/ldcn/chat/useVoiceTurnManager";
import { useLdcnVoice } from "@/ldcn/voice/LdcnVoiceProvider";
import { useMicrophoneDiagnostics } from "@/ldcn/voice/useMicrophoneDiagnostics";
import { extractWakeWordCommand, wakeWordReply } from "@/ldcn/voice/wakeWords";
import type { LdcnState } from "@/ldcn/state/LdcnStateMachine";
import { dispatchLdcnAvatarEvent } from "@/components/ldcn/avatar/ldcnAvatarEvents";
import type { LdcnAction } from "@/components/ldcn/LdcnActionButtons";
import type { LdcnMessageItem } from "@/components/ldcn/LdcnMessage";

interface LdcnResponsePayload {
  success: boolean;
  status?: "success" | "partial" | "fallback";
  partial?: boolean;
  fallback_used?: boolean;
  reply: string;
  intent: string;
  agents_used: string[];
  actions?: LdcnAction[];
  ui_actions?: LdcnAction[];
  suggested_actions?: LdcnAction[];
  context_summary?: Record<string, unknown>;
  conversation_turn_id?: string;
  should_pause_listening?: boolean;
  source?: "chat" | "voice";
  warnings?: string[];
  quick_reply?: string | null;
}

const LDCN_REQUEST_TIMEOUT_MS = 15000;
const LDCN_TIMEOUT_FALLBACK =
  "Analisei o contexto, mas o modelo demorou demais. Posso continuar no modo local e te guiar por etapas.";

function readConversationId() {
  if (typeof window === "undefined") return "server";
  const saved = window.localStorage.getItem("ldcn_session_id");
  if (saved) return saved;
  const created = crypto.randomUUID();
  window.localStorage.setItem("ldcn_session_id", created);
  return created;
}

export function useLdcnChat() {
  const pathname = usePathname();
  const router = useRouter();
  const { localeFull } = usePreferences();
  const ldcnContext = useLdcnContext();
  const turnManager = useVoiceTurnManager();

  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<LdcnMessageItem[]>([
    {
      id: "ldcn-greeting",
      role: "assistant",
      content: "Oi, sou o Vens. Me fala o que voce quer criar, corrigir ou entender.",
    },
  ]);
  const [actions, setActions] = useState<LdcnAction[]>([]);
  const [activeAgent, setActiveAgent] = useState<string | null>(null);
  const [textOnly, setTextOnly] = useState(false);
  const [textError, setTextError] = useState("");
  const [lastUserMessage, setLastUserMessage] = useState("");
  const activeAbortControllerRef = useRef<AbortController | null>(null);
  const activeAssistantMessageIdRef = useRef<string | null>(null);
  const stopMicrophoneRef = useRef<() => void>(() => undefined);
  const finalTranscriptHandlerRef = useRef<(transcript: string) => void>(() => undefined);

  const updateAssistantPlaceholder = useCallback((messageId: string, content: string, agents?: string[]) => {
    setMessages((current) =>
      current.map((message) => (message.id === messageId ? { id: message.id, role: "assistant", content, agents } : message))
    );
  }, []);

  const extractErrorText = useCallback((result: Awaited<ReturnType<typeof apiPost<LdcnResponsePayload>>>) => {
    const raw = `${result.backendError?.message || result.networkError || ""}`.toLowerCase();
    if (raw.includes("timeout") || raw.includes("abort")) {
      return LDCN_TIMEOUT_FALLBACK;
    }
    return result.backendError?.message || result.networkError || "Meu cerebro remoto deu uma travada.";
  }, []);

  const conversationId = useMemo(() => ldcnContext.sessionId || readConversationId(), [ldcnContext.sessionId]);
  const conversationHistory = useMemo(() => ldcnContext.conversationHistory as LdcnConversationTurn[], [ldcnContext.conversationHistory]);

  const pageContext = useMemo(() => collectPageContext(pathname || "/", localeFull || "pt-BR", ldcnContext.pageContext.mode), [ldcnContext.pageContext.mode, localeFull, pathname]);
  const memorySnapshot = useMemo(() => buildConversationMemorySnapshot(conversationId, conversationHistory), [conversationHistory, conversationId]);

  const voice = useLdcnVoice();

  const handleWakeWord = useCallback((transcript: string) => {
    const wake = extractWakeWordCommand(transcript);
    if (!wake.matched) return transcript;

    setOpen(true);
    dispatchLdcnAvatarEvent({
      type: "voice_wake_word",
      message: wakeWordReply(wake.wakeWord),
      route: pathname || "/",
      source: "voice",
      payload: {
        transcript,
        command: wake.command,
        wakeWord: wake.wakeWord,
      },
    });

    return wake.command || wake.wakeWord || transcript;
  }, [pathname]);

  const processTranscript = useCallback(async (transcript: string) => {
    const normalized = transcript.trim();
    const nextRequestId = crypto.randomUUID();
    const canSend = turnManager.canSend(normalized, nextRequestId);
    if (!canSend.ok) return null;

    stopMicrophoneRef.current();
    turnManager.beginTranscribing();
    turnManager.registerUserTranscript(normalized, nextRequestId);
    if (!voice.isSpeaking) {
      turnManager.beginThinking(nextRequestId);
    }

    const userTurnId = turnManager.turnId || crypto.randomUUID();
    const assistantAckId = crypto.randomUUID();
    activeAssistantMessageIdRef.current = assistantAckId;
    setBusy(true);
    setTextError("");
    setLastUserMessage(normalized);
    setMessages((current) => [
      ...current,
      { id: userTurnId, role: "user", content: normalized },
      { id: assistantAckId, role: "assistant", content: "Entendi. Estou analisando isso com os agentes certos." },
    ]);
    ldcnContext.recordConversationTurn({
      turn_id: userTurnId,
      role: "user",
      message: normalized,
      route: pathname || "/",
      page: pathname || "/",
    });

    const payload = buildLdcnChatPayload({
      message: normalized,
      conversationId,
      turnId: userTurnId,
      route: pathname || "/",
      pageTitle: pageContext.page_title,
      locale: localeFull || "pt-BR",
      mode: pageContext.mode,
      pageContext,
      history: memorySnapshot.history,
      source: "voice",
    });

    const controller = new AbortController();
    activeAbortControllerRef.current = controller;
    const result = await apiPost<LdcnResponsePayload>("/api/ldcn/chat", payload, {
      timeoutMs: LDCN_REQUEST_TIMEOUT_MS,
      signal: controller.signal,
    });
    activeAbortControllerRef.current = null;
    setBusy(false);

    if (!result.ok || !result.data?.success) {
      const errorText = extractErrorText(result);
      turnManager.fail(errorText);
      ldcnContext.setLastError(errorText);
      setTextError(errorText);
      updateAssistantPlaceholder(assistantAckId, errorText);
      dispatchLdcnAvatarEvent({ type: "assistant_error", message: errorText, route: pathname || "/", source: "voice" });
      return errorText;
    }

    const response = result.data;
    const reply = response.reply?.trim() || "Nao consegui montar uma resposta agora.";
    const turnKey = response.conversation_turn_id || userTurnId;
    turnManager.registerAssistantReply(reply);
    setActions(response.actions || response.ui_actions || response.suggested_actions || []);
    setActiveAgent(response.agents_used?.[0] || null);
    setMessages((current) =>
      current.map((message) => (message.id === assistantAckId ? { id: turnKey, role: "assistant", content: reply, agents: response.agents_used } : message))
    );
    ldcnContext.recordConversationTurn({
      turn_id: turnKey,
      role: "assistant",
      message: reply,
      intent: response.intent,
      agents_used: response.agents_used,
      route: pathname || "/",
      page: pathname || "/",
    });
    ldcnContext.setLastError(null);
    dispatchLdcnAvatarEvent({
      type: "assistant_success",
      message: reply,
      route: pathname || "/",
      source: "voice",
      payload: {
        intent: response.intent,
        agents_used: response.agents_used,
        turn_id: turnKey,
      },
    });

    if (!textOnly && voice.voiceUnlocked && response.should_pause_listening !== false) {
      turnManager.beginSpeaking();
      const spoken = await voice.speak(reply);
      if (!spoken) {
        setTextError(voice.error || "A voz falhou. Use o botao Ouvir para disparar manualmente.");
      }
      turnManager.finishSpeaking();
    } else {
      turnManager.finishSpeaking();
    }

    return reply;
  }, [conversationId, extractErrorText, ldcnContext, localeFull, memorySnapshot.history, pathname, pageContext, textOnly, turnManager, updateAssistantPlaceholder, voice]);

  useEffect(() => {
    if (textOnly && voice.isSpeaking) {
      voice.stop();
      turnManager.finishSpeaking();
    }
  }, [textOnly, turnManager, voice]);

  const mic = useMicrophoneDiagnostics(localeFull || "pt-BR", {
    onFinalTranscript: (transcript) => {
      if (turnManager.state === "speaking" || busy || textOnly) return;
      const command = handleWakeWord(transcript);
      void finalTranscriptHandlerRef.current(command);
    },
  });

  useEffect(() => {
    finalTranscriptHandlerRef.current = processTranscript;
  }, [processTranscript]);

  useEffect(() => {
    stopMicrophoneRef.current = mic.stopTest;
  }, [mic.stopTest]);

  const startVoice = useCallback(async () => {
    const turnId = turnManager.beginListening();
    if (!turnId) return false;
    const started = await mic.startTest();
    if (!started) {
      turnManager.fail(mic.error || "Nao consegui iniciar a escuta.");
      return false;
    }
    return true;
  }, [mic, turnManager]);

  const stopVoice = useCallback(() => {
    mic.stopTest();
    voice.stop();
    turnManager.reset();
  }, [mic, turnManager, voice]);

  useEffect(() => {
    if (turnManager.state === "speaking") {
      mic.stopTest();
    }
  }, [mic, turnManager.state]);

  const sendText = useCallback(async (message: string) => {
    const normalized = message.trim();
    if (!normalized) return null;
    const nextRequestId = crypto.randomUUID();
    const canSend = turnManager.canSend(normalized, nextRequestId);
    if (!canSend.ok) return null;

    turnManager.beginThinking(nextRequestId);
    turnManager.registerUserTranscript(normalized, nextRequestId);
    const userTurnId = crypto.randomUUID();
    const assistantAckId = crypto.randomUUID();
    activeAssistantMessageIdRef.current = assistantAckId;
    setBusy(true);
    setTextError("");
    setLastUserMessage(normalized);
    setMessages((current) => [
      ...current,
      { id: userTurnId, role: "user", content: normalized },
      { id: assistantAckId, role: "assistant", content: "Entendi. Estou analisando isso com os agentes certos." },
    ]);
    ldcnContext.recordConversationTurn({
      turn_id: userTurnId,
      role: "user",
      message: normalized,
      route: pathname || "/",
      page: pathname || "/",
    });

    const payload = buildLdcnChatPayload({
      message: normalized,
      conversationId,
      turnId: userTurnId,
      route: pathname || "/",
      pageTitle: pageContext.page_title,
      locale: localeFull || "pt-BR",
      mode: pageContext.mode,
      pageContext,
      history: memorySnapshot.history,
      source: "text",
    });

    const controller = new AbortController();
    activeAbortControllerRef.current = controller;
    const result = await apiPost<LdcnResponsePayload>("/api/ldcn/chat", payload, {
      timeoutMs: LDCN_REQUEST_TIMEOUT_MS,
      signal: controller.signal,
    });
    activeAbortControllerRef.current = null;
    setBusy(false);

    if (!result.ok || !result.data?.success) {
      const errorText = extractErrorText(result);
      turnManager.fail(errorText);
      ldcnContext.setLastError(errorText);
      setTextError(errorText);
      updateAssistantPlaceholder(assistantAckId, errorText);
      dispatchLdcnAvatarEvent({ type: "assistant_error", message: errorText, route: pathname || "/", source: "chat" });
      return errorText;
    }

    const response = result.data;
    const reply = response.reply?.trim() || "Nao consegui montar uma resposta agora.";
    const turnKey = response.conversation_turn_id || userTurnId;
    turnManager.registerAssistantReply(reply);
    setActions(response.actions || response.ui_actions || response.suggested_actions || []);
    setActiveAgent(response.agents_used?.[0] || null);
    setMessages((current) =>
      current.map((message) => (message.id === assistantAckId ? { id: turnKey, role: "assistant", content: reply, agents: response.agents_used } : message))
    );
    ldcnContext.recordConversationTurn({
      turn_id: turnKey,
      role: "assistant",
      message: reply,
      intent: response.intent,
      agents_used: response.agents_used,
      route: pathname || "/",
      page: pathname || "/",
    });
    ldcnContext.setLastError(null);
    dispatchLdcnAvatarEvent({
      type: "assistant_success",
      message: reply,
      route: pathname || "/",
      source: "chat",
      payload: {
        intent: response.intent,
        agents_used: response.agents_used,
        turn_id: turnKey,
      },
    });

    if (!textOnly && voice.voiceUnlocked && response.should_pause_listening !== false) {
      turnManager.beginSpeaking();
      const spoken = await voice.speak(reply);
      if (!spoken) {
        setTextError(voice.error || "A voz falhou. Use o botao Ouvir para disparar manualmente.");
      }
      turnManager.finishSpeaking();
    } else {
      turnManager.finishSpeaking();
    }

    return reply;
  }, [conversationId, extractErrorText, ldcnContext, localeFull, memorySnapshot.history, pathname, pageContext, textOnly, turnManager, updateAssistantPlaceholder, voice]);

  const handleAction = useCallback((action: LdcnAction) => {
    if (action.requires_confirmation && !window.confirm(`${action.label}?`)) return;
    if (action.type === "prefill_wizard") {
      window.sessionStorage.setItem("ldcn_wizard_prefill", JSON.stringify(action.payload || {}));
      window.dispatchEvent(new Event("ldcn:context-update"));
      dispatchLdcnAvatarEvent({
        type: "template_selected",
        message: "Preparei o preenchimento do wizard com essa ideia.",
        route: pathname || "/",
        source: "assistant_action",
        payload: action.payload || {},
      });
      setMessages((current) => [...current, { id: crypto.randomUUID(), role: "assistant", content: "Preparei o preenchimento do wizard com essa ideia." }]);
      return;
    }
    if (action.type === "generate_project") {
      turnManager.reset();
      router.push(action.href || "/create");
      return;
    }
    if (action.href) {
      router.push(action.href);
      return;
    }
    if (action.type === "run_validation") {
      router.push("/validation-center");
    }
  }, [pathname, router, turnManager]);

  const orbState = useMemo<LdcnState>(() => {
    if (voice.isSpeaking) {
      return "speaking";
    }
    if (voice.error && turnManager.state === "idle") {
      return "error";
    }
    switch (turnManager.state) {
      case "listening":
        return "listening";
      case "transcribing":
        return "transcribing";
      case "thinking":
        return "thinking";
      case "speaking":
        return "speaking";
      case "error":
        return "error";
      default:
        return "idle";
    }
  }, [turnManager.state, voice.error, voice.isSpeaking]);

  const assistantState = voice.isSpeaking ? "speaking" : voice.error && turnManager.state === "idle" ? "error" : turnManager.state;

  const cancelActiveRequest = useCallback(() => {
    activeAbortControllerRef.current?.abort();
    activeAbortControllerRef.current = null;
    setBusy(false);
    setTextError(LDCN_TIMEOUT_FALLBACK);
    const assistantId = activeAssistantMessageIdRef.current;
    if (assistantId) {
      updateAssistantPlaceholder(assistantId, LDCN_TIMEOUT_FALLBACK);
    }
    turnManager.fail(LDCN_TIMEOUT_FALLBACK);
  }, [turnManager, updateAssistantPlaceholder]);

  const retryLastMessage = useCallback(async () => {
    if (!lastUserMessage || busy) return null;
    return sendText(lastUserMessage);
  }, [busy, lastUserMessage, sendText]);

  return {
    open,
    setOpen,
    busy,
    messages,
    actions,
    activeAgent,
    assistantState,
    orbState,
    textOnly,
    setTextOnly,
    textError,
    canRetry: !busy && !!lastUserMessage,
    page: pathname || "/",
    pageTitle: pageContext.page_title,
    stackId: pageContext.active_stack_id,
    mode: pageContext.mode,
    transcript: mic.transcript,
    interimTranscript: mic.interimTranscript,
    volumeLevel: mic.volumeLevel,
    hasAudio: mic.streamActive,
    noAudioDetected: mic.noAudioDetected,
    isVoiceSupported: mic.hasMediaDevices,
    voiceError: mic.error,
    permissionState: mic.permissionState,
    isListening: mic.isRecognizing,
    voiceUnlocked: voice.voiceUnlocked,
    unlockVoice: voice.unlockVoice,
    voiceStatus: voice.status,
    voiceGenderPreference: voice.voiceGenderPreference,
    setVoiceGenderPreference: voice.setVoiceGenderPreference,
    voiceRate: voice.voiceRate,
    setVoiceRate: voice.setVoiceRate,
    voicePitch: voice.voicePitch,
    setVoicePitch: voice.setVoicePitch,
    voiceVolume: voice.voiceVolume,
    setVoiceVolume: voice.setVoiceVolume,
    voiceWarning: voice.voiceWarning,
    selectedVoiceName: voice.selectedVoiceName,
    preferredVoiceName: voice.selectedVoiceName,
    setPreferredVoiceName: voice.setSelectedVoiceName,
    availableVoices: voice.voices,
    voiceAvailable: voice.supported,
    testVoice: () => voice.speak("Teste de voz do LDCN."),
    speakMessage: (text: string) => voice.speak(text),
    startVoice,
    stopVoice,
    sendText,
    retryLastMessage,
    cancelActiveRequest,
    handleAction,
    toggleOpen: () => setOpen((current) => !current),
  };
}
