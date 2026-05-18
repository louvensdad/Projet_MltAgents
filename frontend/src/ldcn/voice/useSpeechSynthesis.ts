"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLdcnVoiceSelection, type VoiceGenderPreference } from "@/ldcn/voice/useLdcnVoiceSelection";

export interface VoiceSpeakOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
  voiceName?: string;
  voiceGenderPreference?: VoiceGenderPreference;
  locale?: string;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (message: string) => void;
}

export function useSpeechSynthesis(initialLocale = "pt-BR") {
  const [voiceMode, setVoiceMode] = useState<"voice" | "text">("voice");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState("");

  const lastTextRef = useRef("");
  const sequenceRef = useRef(0);

  const voiceSelection = useLdcnVoiceSelection({ locale: initialLocale });

  const available = useMemo(() => voiceSelection.voices.length > 0, [voiceSelection.voices.length]);

  const splitIntoChunks = useCallback((text: string) => {
    const normalized = text
      .replace(/\s+/g, " ")
      .replace(/([.!?])\s+/g, "$1|")
      .replace(/\n+/g, "|")
      .split("|")
      .map((chunk) => chunk.trim())
      .filter(Boolean);
    if (normalized.length <= 1) return normalized.length ? normalized : [text.trim()];
    return normalized;
  }, []);

  const pickVoice = useCallback(
    (locale = initialLocale, voiceName = voiceSelection.selectedVoiceName, voiceGenderPreference = voiceSelection.voiceGenderPreference) => {
      return voiceSelection.pickVoice(locale, voiceGenderPreference, voiceName);
    },
    [initialLocale, voiceSelection]
  );

  const stop = useCallback(() => {
    if (typeof window === "undefined") return;
    sequenceRef.current += 1;
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
  }, []);

  const speak = useCallback(
    (text: string, options: VoiceSpeakOptions = {}) => {
      const content = text.trim();
      if (!content) return false;
      lastTextRef.current = content;
      if (typeof window === "undefined" || !window.speechSynthesis || voiceMode === "text") {
        options.onEnd?.();
        return false;
      }

      setError("");
      window.speechSynthesis.cancel();
      const selectedVoice = pickVoice(options.locale, options.voiceName, options.voiceGenderPreference);
      const chunks = splitIntoChunks(content);
      const sequenceId = ++sequenceRef.current;

      const speakChunk = (index: number) => {
        if (sequenceId !== sequenceRef.current) return;
        if (index >= chunks.length) {
          setIsSpeaking(false);
          options.onEnd?.();
          return;
        }

        const utterance = new SpeechSynthesisUtterance(chunks[index]);
        utterance.lang = selectedVoice?.lang || options.locale || initialLocale;
        if (selectedVoice) utterance.voice = selectedVoice;
        utterance.rate = Math.min(1.05, Math.max(0.85, options.rate ?? voiceSelection.rate));
        utterance.pitch = options.pitch ?? voiceSelection.pitch;
        utterance.volume = options.volume ?? voiceSelection.volume;
        utterance.onstart = () => {
          if (index === 0) {
            setIsSpeaking(true);
            options.onStart?.();
          }
        };
        utterance.onend = () => {
          if (sequenceId !== sequenceRef.current) return;
          if (index < chunks.length - 1) {
            window.setTimeout(() => speakChunk(index + 1), 140);
            return;
          }
          setIsSpeaking(false);
          options.onEnd?.();
        };
        utterance.onerror = () => {
          if (sequenceId !== sequenceRef.current) return;
          setIsSpeaking(false);
          const message = "A fala sintetizada falhou. Vou manter a resposta em texto.";
          setError(message);
          options.onError?.(message);
          options.onEnd?.();
        };
        window.speechSynthesis.speak(utterance);
      };

      speakChunk(0);
      return true;
    },
    [initialLocale, pickVoice, splitIntoChunks, voiceMode, voiceSelection.pitch, voiceSelection.rate, voiceSelection.volume]
  );

  return {
    voices: voiceSelection.voices,
    available,
    isSpeaking,
    error,
    voiceMode,
    setVoiceMode,
    voiceGenderPreference: voiceSelection.voiceGenderPreference,
    setVoiceGenderPreference: voiceSelection.setVoiceGenderPreference,
    selectedVoiceName: voiceSelection.selectedVoiceName,
    setPreferredVoiceName: voiceSelection.setSelectedVoiceName,
    voiceRate: voiceSelection.rate,
    setVoiceRate: voiceSelection.setRate,
    voicePitch: voiceSelection.pitch,
    setVoicePitch: voiceSelection.setPitch,
    voiceVolume: voiceSelection.volume,
    setVoiceVolume: voiceSelection.setVolume,
    voiceWarning: voiceSelection.warning,
    pickVoice,
    speak,
    stop,
    lastText: lastTextRef.current,
    clearError: () => setError(""),
    testVoice: (text = "Estou aqui. O que vamos construir hoje?") =>
      speak(text, {
        locale: initialLocale,
        voiceGenderPreference: voiceSelection.voiceGenderPreference,
      }),
  };
}
