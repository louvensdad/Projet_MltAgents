"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLdcnVoiceSelection, type VoiceGenderPreference } from "@/ldcn/voice/useLdcnVoiceSelection";

export type LdcnSpeechStatus = "idle" | "loading_voices" | "speaking" | "ended" | "error";

export interface LdcnSpeakOptions {
  locale?: string;
  voiceName?: string;
  voiceGenderPreference?: VoiceGenderPreference;
  rate?: number;
  pitch?: number;
  volume?: number;
}

function splitSpeechChunks(text: string) {
  return text
    .replace(/\s+/g, " ")
    .replace(/([.!?])\s+/g, "$1|")
    .replace(/\n+/g, "|")
    .split("|")
    .map((chunk) => chunk.trim())
    .filter(Boolean);
}

export function useLdcnSpeechSynthesis(initialLocale = "pt-BR") {
  const [status, setStatus] = useState<LdcnSpeechStatus>("loading_voices");
  const [error, setError] = useState("");
  const [supported, setSupported] = useState(false);
  const sequenceRef = useRef(0);
  const voiceSelection = useLdcnVoiceSelection({ locale: initialLocale });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const available = Boolean(window.speechSynthesis && window.SpeechSynthesisUtterance);
    setSupported(available);
    console.log("[LDCN Voice] supported", available);
  }, []);

  useEffect(() => {
    const nextStatus = voiceSelection.voices.length > 0 ? "idle" : "loading_voices";
    setStatus((current) => (current === "speaking" ? current : nextStatus));
    console.log("[LDCN Voice] voices", voiceSelection.voices);
  }, [voiceSelection.voices]);

  const loadVoices = useCallback(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return [];
    const voices = window.speechSynthesis.getVoices();
    console.log("[LDCN Voice] voices", voices);
    return voices;
  }, []);

  const selectedVoice = useMemo(() => {
    return voiceSelection.pickVoice(initialLocale, voiceSelection.voiceGenderPreference, voiceSelection.selectedVoiceName);
  }, [initialLocale, voiceSelection]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    console.log("[LDCN Voice] selectedVoice", selectedVoice);
  }, [selectedVoice]);

  const stop = useCallback(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    sequenceRef.current += 1;
    window.speechSynthesis.cancel();
    setStatus("idle");
  }, []);

  const speak = useCallback(
    async (text: string, options: LdcnSpeakOptions = {}) => {
      const content = text.trim();
      console.log("[LDCN Voice] speak called", content);
      if (!content) {
        return false;
      }
      if (typeof window === "undefined" || !window.speechSynthesis || !supported) {
        const message = "SpeechSynthesis nao suportado neste navegador.";
        console.log("[LDCN Voice] onerror", message);
        setError(message);
        setStatus("error");
        return false;
      }

      setError("");
      window.speechSynthesis.cancel();
      const voice = voiceSelection.pickVoice(
        options.locale || initialLocale,
        options.voiceGenderPreference || voiceSelection.voiceGenderPreference,
        options.voiceName || voiceSelection.selectedVoiceName
      );
      const chunks = splitSpeechChunks(content);
      if (!chunks.length) {
        return false;
      }

      const sequenceId = ++sequenceRef.current;

      return await new Promise<boolean>((resolve) => {
        const speakChunk = (index: number) => {
          if (sequenceId !== sequenceRef.current) {
            resolve(false);
            return;
          }
          if (index >= chunks.length) {
            setStatus("ended");
            window.setTimeout(() => setStatus("idle"), 120);
            resolve(true);
            return;
          }

          const utterance = new SpeechSynthesisUtterance(chunks[index]);
          utterance.lang = voice?.lang || options.locale || initialLocale;
          if (voice) {
            utterance.voice = voice;
          }
          utterance.rate = options.rate ?? voiceSelection.rate;
          utterance.pitch = options.pitch ?? voiceSelection.pitch;
          utterance.volume = options.volume ?? voiceSelection.volume;
          utterance.onstart = () => {
            console.log("[LDCN Voice] onstart");
            setStatus("speaking");
          };
          utterance.onend = () => {
            console.log("[LDCN Voice] onend");
            if (sequenceId !== sequenceRef.current) {
              resolve(false);
              return;
            }
            if (index < chunks.length - 1) {
              window.setTimeout(() => speakChunk(index + 1), 140);
              return;
            }
            setStatus("ended");
            window.setTimeout(() => setStatus("idle"), 120);
            resolve(true);
          };
          utterance.onerror = (event) => {
            const message = event.error || "Falha desconhecida no speechSynthesis.";
            console.log("[LDCN Voice] onerror", message);
            setError(message);
            setStatus("error");
            resolve(false);
          };

          window.speechSynthesis.speak(utterance);
        };

        speakChunk(0);
      });
    },
    [initialLocale, supported, voiceSelection]
  );

  return {
    loadVoices,
    speak,
    stop,
    isSpeaking: status === "speaking",
    status,
    selectedVoice,
    voices: voiceSelection.voices,
    error,
    supported,
    voiceGenderPreference: voiceSelection.voiceGenderPreference,
    setVoiceGenderPreference: voiceSelection.setVoiceGenderPreference,
    selectedVoiceName: voiceSelection.selectedVoiceName,
    setSelectedVoiceName: voiceSelection.setSelectedVoiceName,
    voiceRate: voiceSelection.rate,
    setVoiceRate: voiceSelection.setRate,
    voicePitch: voiceSelection.pitch,
    setVoicePitch: voiceSelection.setPitch,
    voiceVolume: voiceSelection.volume,
    setVoiceVolume: voiceSelection.setVolume,
    voiceWarning: voiceSelection.warning,
  };
}
