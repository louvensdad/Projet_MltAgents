"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { API_URL } from "@/lib/api";
import { getAuthToken } from "@/lib/auth";
import { useLdcnSpeechSynthesis } from "@/ldcn/voice/useLdcnSpeechSynthesis";

const STORAGE_KEY = "ldcn_voice_unlocked";
const SILENT_AUDIO_DATA_URI =
  "data:audio/mp3;base64,SUQzAwAAAAAAF1RTU0UAAAAPAAADTGF2ZjU4LjI5LjEwMAAAAAAAAAAAAAAA//tQxAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAACAAABNgD//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////8AAAAATGF2YzU4LjU0AAAAAAAAAAAAAAAAJAYAAAAAAAAAATY5+0cAAAAAAAAAAAAAAAAAAAAA//tQxAADBwgA";

interface LdcnVoiceContextValue {
  speak: (text: string) => Promise<boolean>;
  stop: () => void;
  unlockVoice: () => Promise<boolean>;
  voiceUnlocked: boolean;
  isSpeaking: boolean;
  status: "idle" | "loading_voices" | "speaking" | "ended" | "error";
  selectedVoice: SpeechSynthesisVoice | null;
  voices: SpeechSynthesisVoice[];
  error: string;
  supported: boolean;
  voiceGenderPreference: "auto" | "male" | "female";
  setVoiceGenderPreference: (value: "auto" | "male" | "female") => void;
  selectedVoiceName: string;
  setSelectedVoiceName: (value: string) => void;
  voiceRate: number;
  setVoiceRate: (value: number) => void;
  voicePitch: number;
  setVoicePitch: (value: number) => void;
  voiceVolume: number;
  setVoiceVolume: (value: number) => void;
  voiceWarning: string;
}

const LdcnVoiceContext = createContext<LdcnVoiceContextValue | null>(null);

export function LdcnVoiceProvider({ children }: { children: React.ReactNode }) {
  const synthesis = useLdcnSpeechSynthesis("pt-BR");
  const [voiceUnlocked, setVoiceUnlocked] = useState(false);
  const [backendError, setBackendError] = useState("");
  const [premiumSpeaking, setPremiumSpeaking] = useState(false);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const audio = new Audio();
    audio.preload = "auto";
    audioElementRef.current = audio;
    return () => {
      audio.pause();
      audio.src = "";
      audioElementRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setVoiceUnlocked(window.localStorage.getItem(STORAGE_KEY) === "true");
  }, []);

  useEffect(() => {
    console.log("[LDCN Voice] unlocked", voiceUnlocked);
  }, [voiceUnlocked]);

  const stop = useCallback(() => {
    const audio = audioElementRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    setPremiumSpeaking(false);
    synthesis.stop();
  }, [synthesis]);

  const unlockPremiumAudio = useCallback(async () => {
    const audio = audioElementRef.current;
    if (!audio) return false;
    try {
      audio.src = SILENT_AUDIO_DATA_URI;
      audio.muted = true;
      await audio.play();
      audio.pause();
      audio.currentTime = 0;
      audio.muted = false;
      audio.src = "";
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Falha ao destravar audio premium.";
      console.log("[LDCN Voice] onerror", message);
      setBackendError(message);
      audio.muted = false;
      audio.src = "";
      return false;
    }
  }, []);

  const speak = useCallback(async (text: string) => {
    const cleanText = text.trim();
    if (!cleanText) return false;
    console.log("[LDCN Voice] speak called", cleanText);
    setBackendError("");
    stop();

    const token = typeof window === "undefined" ? null : getAuthToken();
    try {
      const response = await fetch(`${API_URL}/api/ldcn/tts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ text: cleanText, locale: "pt-BR" }),
      });
      const payload = await response.json().catch(() => null);
      if (response.ok && payload?.success && payload?.audio_base64) {
        const audio = audioElementRef.current ?? new Audio();
        audioElementRef.current = audio;
        audio.src = `data:${payload.content_type || "audio/mpeg"};base64,${payload.audio_base64}`;
        audio.currentTime = 0;
        return await new Promise<boolean>((resolve) => {
          audio.onplay = () => {
            console.log("[LDCN Voice] onstart");
            setPremiumSpeaking(true);
          };
          audio.onended = () => {
            console.log("[LDCN Voice] onend");
            setPremiumSpeaking(false);
            resolve(true);
          };
          audio.onerror = () => {
            const message = "Falha ao tocar audio premium.";
            console.log("[LDCN Voice] onerror", message);
            setBackendError(message);
            setPremiumSpeaking(false);
            resolve(false);
          };
          void audio.play().catch((error) => {
            const message = error instanceof Error ? error.message : "Falha ao tocar audio premium.";
            console.log("[LDCN Voice] onerror", message);
            setBackendError(message);
            setPremiumSpeaking(false);
            resolve(false);
          });
        });
      }
      setBackendError(payload?.error || "premium_tts_not_configured");
    } catch (error) {
      setBackendError(error instanceof Error ? error.message : "Falha ao chamar o TTS premium.");
    }

    return await synthesis.speak(cleanText, {
      rate: synthesis.voiceRate,
      pitch: synthesis.voicePitch,
      volume: synthesis.voiceVolume,
      voiceGenderPreference: synthesis.voiceGenderPreference,
    });
  }, [stop, synthesis]);

  const unlockVoice = useCallback(async () => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, "true");
    }
    setVoiceUnlocked(true);
    console.log("[LDCN Voice] unlocked", true);
    const premiumUnlocked = await unlockPremiumAudio();
    if (premiumUnlocked) {
      return await speak("Voz ativada.");
    }
    return await synthesis.speak("Voz ativada.", {
      rate: 0.96,
      pitch: 0.88,
      volume: 1,
    });
  }, [speak, synthesis, unlockPremiumAudio]);

  const value = useMemo<LdcnVoiceContextValue>(
    () => ({
      speak,
      stop,
      unlockVoice,
      voiceUnlocked,
      isSpeaking: premiumSpeaking || synthesis.isSpeaking,
      status: premiumSpeaking ? "speaking" : synthesis.status,
      selectedVoice: synthesis.selectedVoice,
      voices: synthesis.voices,
      error: backendError || synthesis.error,
      supported: synthesis.supported,
      voiceGenderPreference: synthesis.voiceGenderPreference,
      setVoiceGenderPreference: synthesis.setVoiceGenderPreference,
      selectedVoiceName: synthesis.selectedVoiceName,
      setSelectedVoiceName: synthesis.setSelectedVoiceName,
      voiceRate: synthesis.voiceRate,
      setVoiceRate: synthesis.setVoiceRate,
      voicePitch: synthesis.voicePitch,
      setVoicePitch: synthesis.setVoicePitch,
      voiceVolume: synthesis.voiceVolume,
      setVoiceVolume: synthesis.setVoiceVolume,
      voiceWarning: synthesis.voiceWarning,
    }),
    [backendError, premiumSpeaking, speak, stop, synthesis, unlockVoice, voiceUnlocked]
  );

  return <LdcnVoiceContext.Provider value={value}>{children}</LdcnVoiceContext.Provider>;
}

export function useLdcnVoice() {
  const context = useContext(LdcnVoiceContext);
  if (!context) {
    throw new Error("useLdcnVoice must be used within LdcnVoiceProvider");
  }
  return context;
}
