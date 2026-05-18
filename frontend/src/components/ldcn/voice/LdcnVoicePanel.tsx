"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { RotateCcw, VolumeX } from "lucide-react";
import LdcnMicButton from "@/components/ldcn/voice/LdcnMicButton";
import LdcnSpeakingIndicator from "@/components/ldcn/voice/LdcnSpeakingIndicator";
import LdcnTranscript, { LdcnTranscriptEntry } from "@/components/ldcn/voice/LdcnTranscript";
import LdcnVoiceOrb from "@/components/ldcn/voice/LdcnVoiceOrb";
import LdcnVoiceSettings, { LdcnVoiceSettingsValue } from "@/components/ldcn/voice/LdcnVoiceSettings";
import LdcnVoiceWave, { LdcnVoiceState } from "@/components/ldcn/voice/LdcnVoiceWave";
import { dispatchLdcnAvatarEvent } from "@/components/ldcn/avatar/ldcnAvatarEvents";

type SpeechRecognitionConstructor = new () => SpeechRecognition;

interface SpeechRecognition extends EventTarget {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

interface SpeechRecognitionEvent {
  results: ArrayLike<ArrayLike<{ transcript: string }>>;
}

interface SpeechRecognitionErrorEvent extends Event {
  error?: string;
}

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

export default function LdcnVoicePanel({
  busy,
  onTranscript,
  onSpeak,
}: {
  busy: boolean;
  onTranscript: (transcript: string) => Promise<string | null>;
  onSpeak: (text: string) => void;
}) {
  const [state, setState] = useState<LdcnVoiceState>("idle");
  const [error, setError] = useState("");
  const [entries, setEntries] = useState<LdcnTranscriptEntry[]>([]);
  const [lastReply, setLastReply] = useState("");
  const [settings, setSettings] = useState<LdcnVoiceSettingsValue>({
    enabled: true,
    wakeWordEnabled: true,
    rate: 1,
    pitch: 1,
    locale: "pt-BR",
  });
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const listeningSessionRef = useRef(0);
  const listeningStoppedRef = useRef(false);
  const capturedTranscriptRef = useRef(false);
  const restartTimerRef = useRef<number | null>(null);
  const listenTimeoutRef = useRef<number | null>(null);

  const supported = useMemo(() => {
    if (typeof window === "undefined") return false;
    return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem("ldcn_voice_settings");
    if (saved) {
      try {
        setSettings((current) => ({ ...current, ...JSON.parse(saved) }));
      } catch {
        localStorage.removeItem("ldcn_voice_settings");
      }
    }
    return () => window.speechSynthesis?.cancel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("ldcn_voice_settings", JSON.stringify(settings));
    }
  }, [settings]);

  useEffect(() => {
    return () => {
      clearListenTimers();
      recognitionRef.current?.abort();
      recognitionRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function clearListenTimers() {
    if (restartTimerRef.current) {
      window.clearTimeout(restartTimerRef.current);
      restartTimerRef.current = null;
    }
    if (listenTimeoutRef.current) {
      window.clearTimeout(listenTimeoutRef.current);
      listenTimeoutRef.current = null;
    }
  }

  function speak(text: string) {
    setLastReply(text);
    if (!settings.enabled || typeof window === "undefined" || !window.speechSynthesis) return;
    recognitionRef.current?.abort();
    recognitionRef.current = null;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = settings.locale;
    utterance.rate = settings.rate;
    utterance.pitch = settings.pitch;
    utterance.onstart = () => {
      setState("speaking");
      dispatchLdcnAvatarEvent({ type: "voice_speaking", message: "Respondendo por voz." });
    };
    utterance.onend = () => {
      setState("idle");
      dispatchLdcnAvatarEvent({ type: "voice_idle", message: "Modo discreto reativado." });
    };
    utterance.onerror = () => setState("error");
    window.speechSynthesis.speak(utterance);
    onSpeak(text);
  }

  function createRecognition(sessionId: number) {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) return null;

    const recognition = new Recognition();
    recognition.lang = settings.locale;
    recognition.interimResults = false;
    recognition.continuous = true;

    recognition.onresult = async (event) => {
      if (sessionId !== listeningSessionRef.current || listeningStoppedRef.current) return;
      const transcript = event.results[event.results.length - 1]?.[0]?.transcript?.trim();
      if (!transcript) return;
      capturedTranscriptRef.current = true;
      clearListenTimers();
      recognitionRef.current?.abort();
      recognitionRef.current = null;
      setState("thinking");
      setEntries((current) => [...current, { id: crypto.randomUUID(), speaker: "user", text: transcript }]);
      const reply = await onTranscript(transcript);
      if (reply) {
        setEntries((current) => [...current, { id: crypto.randomUUID(), speaker: "ldcn", text: reply }]);
        speak(reply);
      } else {
        setState("idle");
      }
    };

    recognition.onerror = (event) => {
      if (sessionId !== listeningSessionRef.current || listeningStoppedRef.current) return;
      if (event.error === "aborted") return;
      if (event.error === "no-speech") {
        setError("Nao ouvi fala suficiente. Tente novamente com o microfone mais perto.");
        if (restartTimerRef.current) {
          window.clearTimeout(restartTimerRef.current);
          restartTimerRef.current = null;
        }
        restartTimerRef.current = window.setTimeout(() => restartRecognition(sessionId), 250);
        return;
      }
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        setError("Permissao de microfone bloqueada. Libere o acesso no navegador.");
        setState("error");
        listeningStoppedRef.current = true;
        clearListenTimers();
        return;
      }
      if (event.error === "network") {
        setError("Falha de rede no reconhecimento de voz. Tente novamente.");
        setState("error");
        return;
      }
      setError("Nao consegui captar a fala. Tente novamente ou use texto.");
      setState("error");
    };

    recognition.onend = () => {
      if (sessionId !== listeningSessionRef.current || listeningStoppedRef.current) return;
      if (capturedTranscriptRef.current) {
        dispatchLdcnAvatarEvent({ type: "voice_idle", message: "Conversa por voz concluída." });
        return;
      }
      if (restartTimerRef.current) {
        window.clearTimeout(restartTimerRef.current);
        restartTimerRef.current = null;
      }
      restartTimerRef.current = window.setTimeout(() => restartRecognition(sessionId), 200);
    };

    return recognition;
  }

  function restartRecognition(sessionId: number) {
    if (listeningStoppedRef.current || sessionId !== listeningSessionRef.current || capturedTranscriptRef.current) return;
    const recognition = createRecognition(sessionId);
    if (!recognition) return;
    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch {
      setError("Nao consegui manter a escuta ativa. Tente novamente.");
      setState("error");
      listeningStoppedRef.current = true;
      clearListenTimers();
      recognitionRef.current = null;
    }
  }

  function stopSpeech() {
    window.speechSynthesis?.cancel();
    listeningStoppedRef.current = true;
    capturedTranscriptRef.current = false;
    clearListenTimers();
    recognitionRef.current?.abort();
    recognitionRef.current = null;
    setState("idle");
  }

  function startListening() {
    if (!supported) {
      setError("Seu navegador nao suporta reconhecimento de voz. Use entrada por texto.");
      setState("error");
      return;
    }
    setError("");
    listeningStoppedRef.current = false;
    capturedTranscriptRef.current = false;
    listeningSessionRef.current += 1;
    clearListenTimers();
    const sessionId = listeningSessionRef.current;
    const recognition = createRecognition(sessionId);
    if (!recognition) return;

    dispatchLdcnAvatarEvent({ type: "voice_listening", message: "Estou ouvindo o comando." });
    recognitionRef.current = recognition;
    setState("listening");
    listenTimeoutRef.current = window.setTimeout(() => {
      if (sessionId !== listeningSessionRef.current || listeningStoppedRef.current || capturedTranscriptRef.current) return;
      setError("Nao consegui captar a fala. Tente novamente ou use texto.");
      listeningStoppedRef.current = true;
      recognitionRef.current?.abort();
      recognitionRef.current = null;
      setState("idle");
    }, 15000);

    try {
      recognition.start();
    } catch {
      setError("Nao consegui iniciar o microfone. Tente novamente.");
      setState("error");
      listeningStoppedRef.current = true;
      clearListenTimers();
      recognitionRef.current = null;
    }
  }

  function stopListening() {
    listeningStoppedRef.current = true;
    capturedTranscriptRef.current = false;
    clearListenTimers();
    recognitionRef.current?.abort();
    recognitionRef.current = null;
    setState("idle");
    dispatchLdcnAvatarEvent({ type: "voice_idle", message: "Fala interrompida." });
  }

  return (
    <div className="flex-1 space-y-4 overflow-y-auto p-4">
      <div className="space-y-3 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-center">
        <LdcnVoiceOrb state={busy ? "thinking" : state} />
        <LdcnVoiceWave state={busy ? "thinking" : state} />
        <LdcnSpeakingIndicator state={busy ? "thinking" : state} />
        {error && <p className="text-sm text-rose-200">{error}</p>}
        {!supported && <p className="text-sm text-amber-200">Seu navegador nao suporta reconhecimento de voz. Use entrada por texto.</p>}
        <div className="flex items-center justify-center gap-3">
          <LdcnMicButton state={state} disabled={busy || !supported} onStart={startListening} onStop={stopListening} />
          <button
            type="button"
            onClick={stopSpeech}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 text-slate-300 transition hover:bg-white/10 hover:text-white"
            aria-label="Interromper voz"
          >
            <VolumeX className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => lastReply && speak(lastReply)}
            disabled={!lastReply}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 text-slate-300 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Repetir resposta"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>
      <LdcnTranscript entries={entries} />
      <LdcnVoiceSettings value={settings} onChange={setSettings} />
    </div>
  );
}
