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
  onerror: (() => void) | null;
  onend: (() => void) | null;
}

interface SpeechRecognitionEvent {
  results: ArrayLike<ArrayLike<{ transcript: string }>>;
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
  const passiveWakeActiveRef = useRef(false);
  const manualStopRef = useRef(false);
  const restartTimerRef = useRef<number | null>(null);

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

  function scheduleWakeRestart(delay = 250) {
    if (typeof window === "undefined") return;
    if (restartTimerRef.current) window.clearTimeout(restartTimerRef.current);
    restartTimerRef.current = window.setTimeout(() => {
      if (passiveWakeActiveRef.current && !manualStopRef.current) {
        startPassiveWakeListening();
      }
    }, delay);
  }

  function extractWakeCommand(transcript: string) {
    const normalized = transcript.toLowerCase().replace(/[^\w\s]/g, " ").replace(/\s+/g, " ").trim();
    const wakeVariants = ["ldcn", "el de ce ene", "el de ce en", "el de ce ene"];
    for (const wake of wakeVariants) {
      if (normalized === wake) {
        return { matched: true, command: "" };
      }
      if (normalized.startsWith(`${wake} `)) {
        return { matched: true, command: normalized.slice(wake.length).trim() };
      }
    }
    const compact = normalized.replace(/\s+/g, "");
    if (compact.startsWith("ldcn")) {
      return { matched: true, command: normalized.slice(normalized.indexOf("ldcn") + 4).trim() };
    }
    return { matched: false, command: transcript.trim() };
  }

  function speak(text: string, resumePassive = false) {
    setLastReply(text);
    if (!settings.enabled || typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    recognitionRef.current?.abort();
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
      if (resumePassive) {
        scheduleWakeRestart();
      }
    };
    utterance.onerror = () => setState("error");
    window.speechSynthesis.speak(utterance);
    onSpeak(text);
  }

  function stopSpeech() {
    window.speechSynthesis?.cancel();
    recognitionRef.current?.abort();
    manualStopRef.current = true;
    passiveWakeActiveRef.current = false;
    setState("idle");
  }

  function startPassiveWakeListening() {
    if (!supported || !settings.enabled || !settings.wakeWordEnabled) return;
    if (passiveWakeActiveRef.current || busy) return;
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) return;
    passiveWakeActiveRef.current = true;
    manualStopRef.current = false;
    dispatchLdcnAvatarEvent({ type: "voice_listening", message: "Em escuta por wake word." });

    const recognition = new Recognition();
    recognition.lang = settings.locale;
    recognition.interimResults = false;
    recognition.continuous = true;
    recognition.onresult = async (event) => {
      const transcript = event.results[event.results.length - 1]?.[0]?.transcript?.trim();
      if (!transcript) return;
      const { matched, command } = extractWakeCommand(transcript);
      if (!matched) return;

      dispatchLdcnAvatarEvent({ type: "voice_wake_word", message: "LDCN acionado." });
      setEntries((current) => [...current, { id: crypto.randomUUID(), speaker: "user", text: transcript }]);

      if (!command) {
        recognition.abort();
        speak("Sim, estou ouvindo.", true);
        return;
      }

      setState("thinking");
      const reply = await onTranscript(command);
      if (reply) {
        setEntries((current) => [...current, { id: crypto.randomUUID(), speaker: "ldcn", text: reply }]);
        speak(reply, true);
      } else {
        setState("idle");
        scheduleWakeRestart();
      }
    };
    recognition.onerror = () => {
      setError("Nao consegui captar a fala. Tente novamente ou use texto.");
      setState("error");
      passiveWakeActiveRef.current = false;
    };
    recognition.onend = () => {
      if (manualStopRef.current) return;
      passiveWakeActiveRef.current = false;
      scheduleWakeRestart(350);
    };
    recognitionRef.current = recognition;
    setState("listening");
    recognition.start();
  }

  function startListening() {
    if (!supported) {
      setError("Seu navegador nao suporta reconhecimento de voz. Use entrada por texto.");
      setState("error");
      return;
    }
    setError("");
    manualStopRef.current = false;
    passiveWakeActiveRef.current = false;
    if (restartTimerRef.current) window.clearTimeout(restartTimerRef.current);
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) return;
    dispatchLdcnAvatarEvent({ type: "voice_listening", message: "Estou ouvindo o comando." });
    const recognition = new Recognition();
    recognition.lang = settings.locale;
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.onresult = async (event) => {
      const transcript = event.results[0]?.[0]?.transcript?.trim();
      if (!transcript) return;
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
    recognition.onerror = () => {
      setError("Nao consegui captar a fala. Tente novamente ou use texto.");
      setState("error");
    };
    recognition.onend = () => {
      setState((current) => (current === "listening" || current === "transcribing" ? "idle" : current));
      dispatchLdcnAvatarEvent({ type: "voice_idle", message: "Conversa por voz concluída." });
    };
    recognitionRef.current = recognition;
    setState("listening");
    recognition.start();
  }

  function stopListening() {
    setState("transcribing");
    manualStopRef.current = true;
    passiveWakeActiveRef.current = false;
    if (restartTimerRef.current) window.clearTimeout(restartTimerRef.current);
    recognitionRef.current?.stop();
    dispatchLdcnAvatarEvent({ type: "voice_idle", message: "Fala interrompida." });
  }

  useEffect(() => {
    if (!supported || busy || !settings.enabled || !settings.wakeWordEnabled) {
      passiveWakeActiveRef.current = false;
      if (restartTimerRef.current) window.clearTimeout(restartTimerRef.current);
      recognitionRef.current?.abort();
      return;
    }

    if (!document.hidden) {
      startPassiveWakeListening();
    }

    const handleVisibility = () => {
      if (document.hidden) {
        recognitionRef.current?.abort();
        passiveWakeActiveRef.current = false;
      } else if (!manualStopRef.current) {
        startPassiveWakeListening();
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      passiveWakeActiveRef.current = false;
      if (restartTimerRef.current) window.clearTimeout(restartTimerRef.current);
      recognitionRef.current?.abort();
    };
  // Mantemos o listener passivo por refs para evitar reinicialização excessiva.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busy, settings.enabled, settings.locale, settings.wakeWordEnabled, supported]);

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
