"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { LdcnState } from "@/ldcn/state/LdcnStateMachine";
import {
  dispatchLdcnAvatarEvent,
  dispatchLdcnVoiceCommandEvent,
  LDCN_AVATAR_EVENT,
  type LdcnAvatarEventDetail,
  type LdcnAvatarEventType,
} from "./ldcnAvatarEvents";
import { useLdcnVoice } from "@/ldcn/voice/LdcnVoiceProvider";
import { extractWakeWordCommand, wakeWordReply } from "@/ldcn/voice/wakeWords";

export type LdcnAvatarMood = LdcnState;
export type LdcnAvatarPosition = "bottom-right" | "bottom-left" | "sidebar-edge" | "hero-corner";
export type LdcnAvatarSize = "small" | "medium";
export type LdcnAvatarStyle = "holographic" | "minimalist";

export interface LdcnAvatarSettings {
  enabled: boolean;
  voiceEnabled: boolean;
  reducedMotion: boolean;
  positionPreference: LdcnAvatarPosition;
  size: LdcnAvatarSize;
  style: LdcnAvatarStyle;
  muted: boolean;
  paused: boolean;
  hidden: boolean;
}

export interface LdcnAvatarRuntimeState {
  mood: LdcnAvatarMood;
  position: LdcnAvatarPosition;
  message: string;
  visible: boolean;
  minimized: boolean;
  settings: LdcnAvatarSettings;
  pageVisible: boolean;
  setSetting: <K extends keyof LdcnAvatarSettings>(key: K, value: LdcnAvatarSettings[K]) => void;
  toggleMinimized: () => void;
  toggleHidden: () => void;
  toggleMuted: () => void;
  togglePaused: () => void;
  dispatchEvent: (detail: LdcnAvatarEventDetail) => void;
  acknowledgeMessage: () => void;
}

export const LDCN_AVATAR_STORAGE_KEY = "ldcn_avatar_settings";

const DEFAULT_SETTINGS: LdcnAvatarSettings = {
  enabled: true,
  voiceEnabled: true,
  reducedMotion: false,
  positionPreference: "bottom-right",
  size: "small",
  style: "holographic",
  muted: false,
  paused: false,
  hidden: false,
};

const TEMPORARY_MESSAGES: Record<LdcnAvatarEventType, string> = {
  page_loaded: "Posso te acompanhar nessa tela.",
  project_generated: "Boa, projeto gerado.",
  generation_failed: "Parece que encontrei um problema.",
  download_failed: "Esse erro parece vir do download.",
  agent_boost_active: "Seus agentes estao ativos.",
  validation_failed: "Preciso validar essa stack.",
  template_selected: "Quer que eu valide essa stack?",
  wizard_step_changed: "Estou ajustando a rota.",
  voice_listening: "Estou ouvindo o comando.",
  voice_wake_word: "Vens acionado.",
  voice_speaking: "Processando a resposta.",
  voice_idle: "Voltando ao modo discreto.",
  assistant_success: "Tudo certo por aqui.",
  assistant_error: "Houve uma falha na resposta.",
};

function readSettings(): LdcnAvatarSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  const saved = localStorage.getItem(LDCN_AVATAR_STORAGE_KEY);
  if (!saved) return DEFAULT_SETTINGS;
  try {
    return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } as LdcnAvatarSettings;
  } catch {
    localStorage.removeItem(LDCN_AVATAR_STORAGE_KEY);
    return DEFAULT_SETTINGS;
  }
}

function persistSettings(settings: LdcnAvatarSettings) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LDCN_AVATAR_STORAGE_KEY, JSON.stringify(settings));
}

function choosePosition(current: LdcnAvatarPosition, eventType: LdcnAvatarEventType, preferred: LdcnAvatarPosition) {
  if (preferred !== "bottom-right" && eventType !== "page_loaded") return preferred;
  switch (eventType) {
    case "page_loaded":
      return preferred;
    case "template_selected":
    case "wizard_step_changed":
      return current === "sidebar-edge" ? "bottom-left" : "sidebar-edge";
    case "project_generated":
      return "bottom-right";
    case "generation_failed":
    case "download_failed":
    case "validation_failed":
    case "assistant_error":
      return "bottom-left";
    case "voice_listening":
    case "voice_speaking":
      return "hero-corner";
    case "agent_boost_active":
      return "sidebar-edge";
    default:
      return current;
  }
}

export function useLdcnAvatarState(route: string) {
  const voice = useLdcnVoice();
  const [settings, setSettings] = useState<LdcnAvatarSettings>(DEFAULT_SETTINGS);
  const [pageVisible, setPageVisible] = useState(true);
  const [mood, setMood] = useState<LdcnAvatarMood>("sleeping");
  const [position, setPosition] = useState<LdcnAvatarPosition>(DEFAULT_SETTINGS.positionPreference);
  const [message, setMessage] = useState("");
  const [minimized, setMinimized] = useState(false);
  const clearTimer = useRef<number | null>(null);
  const idleTimer = useRef<number | null>(null);
  const wakeRecognitionRef = useRef<any>(null);
  const wakeRestartTimerRef = useRef<number | null>(null);
  const wakeSuspendedRef = useRef(false);
  const startWakeListenerRef = useRef<(() => void) | null>(null);
  const scheduleWakeListenerRef = useRef<((delay: number) => void) | null>(null);

  useEffect(() => {
    const loaded = readSettings();
    setSettings(loaded);
    setPosition(loaded.positionPreference);
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setSettings((current) => ({ ...current, reducedMotion: true }));
    }
    const wakeTimer = window.setTimeout(() => setMood("idle"), 1000);
    return () => window.clearTimeout(wakeTimer);
  }, []);

  useEffect(() => {
    if (!route) return;
    if (route.startsWith("/wizard") || route.startsWith("/templates") || route.startsWith("/downloads")) {
      setPosition(settings.positionPreference);
    }
  }, [route, settings.positionPreference]);

  useEffect(() => {
    persistSettings(settings);
  }, [settings]);

  useEffect(() => {
    const onVisibilityChange = () => setPageVisible(document.visibilityState !== "hidden");
    onVisibilityChange();
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, []);

  useEffect(() => {
    if (voice.isSpeaking) {
      setMood("speaking");
      if (!message) {
        setMessage("Falando.");
      }
      return;
    }
    if (voice.error) {
      setMood("error");
      setMessage(voice.error);
    }
  }, [message, voice.error, voice.isSpeaking]);

  useEffect(() => {
    const handleEvent = (event: Event) => {
      const detail = (event as CustomEvent<LdcnAvatarEventDetail>).detail;
      if (!detail?.type) return;
      if (detail.type === "voice_listening" || detail.type === "voice_speaking" || detail.type === "voice_idle") {
        if (!settings.voiceEnabled) return;
      }

      if (detail.type === "voice_listening" || detail.type === "voice_speaking") {
        wakeSuspendedRef.current = true;
        if (wakeRecognitionRef.current) {
          wakeRecognitionRef.current.abort?.();
        }
      }

      if (detail.type === "voice_idle") {
        wakeSuspendedRef.current = false;
        if (settings.voiceEnabled && settings.enabled && !settings.hidden && !settings.paused && pageVisible) {
          scheduleWakeListenerRef.current?.(400);
        }
      }

      const nextMood: LdcnAvatarMood =
        detail.type === "project_generated" ? "success" :
        detail.type === "generation_failed" ? "warning" :
        detail.type === "download_failed" ? "error" :
        detail.type === "validation_failed" ? "warning" :
        detail.type === "assistant_error" ? "error" :
        detail.type === "voice_listening" ? "listening" :
        detail.type === "voice_wake_word" ? "waking" :
        detail.type === "voice_speaking" ? "speaking" :
        detail.type === "template_selected" ? "waiting_confirmation" :
        detail.type === "wizard_step_changed" ? "executing_action" :
        detail.type === "agent_boost_active" ? "thinking" :
        detail.type === "page_loaded" ? "waking" :
        detail.type === "assistant_success" ? "success" : "idle";

      const nextMessage = detail.message || TEMPORARY_MESSAGES[detail.type];

      setMood(nextMood);
      setPosition((current) => choosePosition(current, detail.type, settings.positionPreference));
      setMessage(nextMessage);
      setMinimized(false);

      if (clearTimer.current) window.clearTimeout(clearTimer.current);
      if (idleTimer.current) window.clearTimeout(idleTimer.current);

      const hold = detail.type === "project_generated" ? 4200 : detail.type === "download_failed" || detail.type === "generation_failed" ? 4800 : detail.type === "voice_speaking" ? 2600 : 3200;
      clearTimer.current = window.setTimeout(() => {
        setMessage("");
        setMood("idle");
      }, hold);

      idleTimer.current = window.setTimeout(() => {
        setMood("idle");
      }, Math.max(hold - 1200, 1600));
    };

    window.addEventListener(LDCN_AVATAR_EVENT, handleEvent);
    return () => {
      window.removeEventListener(LDCN_AVATAR_EVENT, handleEvent);
      if (clearTimer.current) window.clearTimeout(clearTimer.current);
      if (idleTimer.current) window.clearTimeout(idleTimer.current);
    };
  }, [pageVisible, settings.enabled, settings.hidden, settings.paused, settings.positionPreference, settings.voiceEnabled]);

  const startWakeListener = useCallback(() => {
    if (wakeSuspendedRef.current) return;
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) return;
    if (wakeRecognitionRef.current) return;

    const recognition = new Recognition();
    recognition.lang = "pt-BR";
    recognition.interimResults = false;
    recognition.continuous = true;
    recognition.onresult = (event: any) => {
      const transcript = event.results[event.results.length - 1]?.[0]?.transcript?.trim();
      if (!transcript) return;
      const { matched, command, wakeWord } = extractWakeWordCommand(transcript);
      if (!matched) return;

      dispatchLdcnAvatarEvent({ type: "voice_wake_word", message: wakeWordReply(wakeWord), payload: { transcript, command, wakeWord } });
      dispatchLdcnVoiceCommandEvent({
        transcript,
        command,
        source: "wake_word",
      });

      if (wakeRecognitionRef.current) {
        wakeRecognitionRef.current.abort?.();
        wakeRecognitionRef.current = null;
      }
      wakeSuspendedRef.current = true;
    };
    recognition.onerror = () => {
      wakeRecognitionRef.current = null;
      if (!wakeSuspendedRef.current) {
        scheduleWakeListenerRef.current?.(1000);
      }
    };
    recognition.onend = () => {
      wakeRecognitionRef.current = null;
      if (!wakeSuspendedRef.current) {
        scheduleWakeListenerRef.current?.(500);
      }
    };
    wakeRecognitionRef.current = recognition;
    dispatchLdcnAvatarEvent({ type: "voice_listening", message: "Em escuta por wake word." });
    recognition.start();
  }, []);

  const scheduleWakeListener = useCallback((delay: number) => {
    if (wakeSuspendedRef.current) return;
    if (wakeRestartTimerRef.current) window.clearTimeout(wakeRestartTimerRef.current);
    wakeRestartTimerRef.current = window.setTimeout(() => {
      if (wakeSuspendedRef.current) return;
      startWakeListenerRef.current?.();
    }, delay);
  }, []);

  useEffect(() => {
    startWakeListenerRef.current = startWakeListener;
    scheduleWakeListenerRef.current = scheduleWakeListener;
  }, [scheduleWakeListener, startWakeListener]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!settings.enabled || !settings.voiceEnabled || settings.hidden || settings.paused || !pageVisible) {
      if (wakeRestartTimerRef.current) window.clearTimeout(wakeRestartTimerRef.current);
      wakeRecognitionRef.current?.abort?.();
      wakeRecognitionRef.current = null;
      return;
    }

    if (!window.SpeechRecognition && !window.webkitSpeechRecognition) return;

    scheduleWakeListener(0);

    return () => {
      if (wakeRestartTimerRef.current) window.clearTimeout(wakeRestartTimerRef.current);
      wakeRecognitionRef.current?.abort?.();
      wakeRecognitionRef.current = null;
    };
  }, [pageVisible, scheduleWakeListener, settings.enabled, settings.hidden, settings.paused, settings.voiceEnabled]);

  const setSetting = useCallback(<K extends keyof LdcnAvatarSettings>(key: K, value: LdcnAvatarSettings[K]) => {
    setSettings((current) => ({ ...current, [key]: value }));
  }, []);

  const toggleMinimized = useCallback(() => setMinimized((current) => !current), []);
  const toggleHidden = useCallback(() => setSetting("hidden", !settings.hidden), [setSetting, settings.hidden]);
  const toggleMuted = useCallback(() => setSetting("muted", !settings.muted), [setSetting, settings.muted]);
  const togglePaused = useCallback(() => setSetting("paused", !settings.paused), [setSetting, settings.paused]);
  const acknowledgeMessage = useCallback(() => setMessage(""), []);

  const visible = useMemo(() => settings.enabled && !settings.hidden, [settings.enabled, settings.hidden]);

  return {
    mood,
    position,
    message,
    visible,
    minimized,
    settings,
    pageVisible,
    setSetting,
    toggleMinimized,
    toggleHidden,
    toggleMuted,
    togglePaused,
    dispatchEvent: dispatchLdcnAvatarEvent,
    acknowledgeMessage,
  } satisfies LdcnAvatarRuntimeState;
}
