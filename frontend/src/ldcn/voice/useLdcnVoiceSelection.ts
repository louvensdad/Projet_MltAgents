"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { normalizeWakeWordText } from "@/ldcn/voice/wakeWords";

export type VoiceGenderPreference = "auto" | "male" | "female";

export interface LdcnVoiceOption {
  name: string;
  lang: string;
  label: string;
  gender: "male" | "female" | "unknown";
  default: boolean;
}

export interface UseLdcnVoiceSelectionOptions {
  locale?: string;
  storageKey?: string;
}

const DEFAULT_STORAGE_KEY = "ldcn_voice_selection";

const MALE_HINTS = [
  "male",
  "masculino",
  "homem",
  "daniel",
  "david",
  "john",
  "jose",
  "paul",
  "george",
  "mario",
  "marco",
  "henri",
  "pablo",
  "jorge",
  "bruno",
];

const FEMALE_HINTS = [
  "female",
  "feminino",
  "mulher",
  "woman",
  "susan",
  "alice",
  "helena",
  "lucia",
  "marie",
  "maria",
  "ana",
  "clara",
  "laura",
];

function classifyVoiceGender(name: string) {
  const normalized = normalizeWakeWordText(name);
  if (FEMALE_HINTS.some((token) => normalized.includes(token))) return "female";
  if (MALE_HINTS.some((token) => normalized.includes(token))) return "male";
  return "unknown";
}

function scoreVoice(voice: SpeechSynthesisVoice, locale: string, preference: VoiceGenderPreference) {
  const normalizedName = normalizeWakeWordText(voice.name);
  const normalizedLocale = locale.toLowerCase();
  const voiceGender = classifyVoiceGender(voice.name);
  let score = 0;

  if (voice.lang?.toLowerCase() === normalizedLocale.toLowerCase()) score += 8;
  if (voice.lang?.toLowerCase().startsWith(normalizedLocale.slice(0, 2))) score += 6;
  if (!voice.localService) score += 1;
  if (voice.default) score += 1;
  if (normalizedName.includes("natural")) score += 4;
  if (normalizedName.includes("neural")) score += 4;
  if (normalizedName.includes("premium")) score += 3;
  if (normalizedName.includes("enhanced")) score += 2;
  if (normalizedName.includes("google")) score += 1;
  if (normalizedName.includes("microsoft")) score += 1;

  if (preference === "male") {
    if (voiceGender === "male") score += 30;
    if (normalizedName.includes("daniel")) score += 10;
  } else if (preference === "female") {
    if (voiceGender === "female") score += 30;
  }

  if (normalizedLocale.startsWith("pt-br")) {
    if (normalizedName.includes("daniel")) score += 40;
    if (normalizedName.includes("microsoft") && normalizedName.includes("daniel")) score += 20;
  }

  return score;
}

function formatVoiceLabel(voice: SpeechSynthesisVoice) {
  return `${voice.name} (${voice.lang}${voice.default ? ", default" : ""})`;
}

export function useLdcnVoiceSelection(options: UseLdcnVoiceSelectionOptions = {}) {
  const locale = options.locale || "pt-BR";
  const storageKey = options.storageKey || DEFAULT_STORAGE_KEY;
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voiceGenderPreference, setVoiceGenderPreference] = useState<VoiceGenderPreference>("male");
  const [rate, setRate] = useState(0.96);
  const [pitch, setPitch] = useState(0.88);
  const [volume, setVolume] = useState(1);
  const [selectedVoiceName, setSelectedVoiceName] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem(storageKey);
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved) as Partial<{
        voiceGenderPreference: VoiceGenderPreference;
        rate: number;
        pitch: number;
        volume: number;
        selectedVoiceName: string;
      }>;
      if (parsed.voiceGenderPreference) setVoiceGenderPreference(parsed.voiceGenderPreference);
      if (typeof parsed.rate === "number") setRate(parsed.rate);
      if (typeof parsed.pitch === "number") setPitch(parsed.pitch);
      if (typeof parsed.volume === "number") setVolume(parsed.volume);
      if (typeof parsed.selectedVoiceName === "string") setSelectedVoiceName(parsed.selectedVoiceName);
    } catch {
      window.localStorage.removeItem(storageKey);
    }
  }, [storageKey]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const syncVoices = () => setVoices(window.speechSynthesis?.getVoices?.() || []);
    syncVoices();
    if (window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = syncVoices;
    }
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(
      storageKey,
      JSON.stringify({ voiceGenderPreference, rate, pitch, volume, selectedVoiceName })
    );
  }, [pitch, rate, selectedVoiceName, storageKey, voiceGenderPreference, volume]);

  const availableVoices = useMemo<LdcnVoiceOption[]>(
    () =>
      voices.map((voice) => ({
        name: voice.name,
        lang: voice.lang,
        label: formatVoiceLabel(voice),
        gender: classifyVoiceGender(voice.name),
        default: voice.default,
      })),
    [voices]
  );

  const selectedVoice = useMemo(() => {
    if (!voices.length) return null;
    if (selectedVoiceName) {
      const exact = voices.find((voice) => voice.name === selectedVoiceName);
      if (exact) return exact;
    }
    const pool = voices.filter((voice) => voice.lang?.toLowerCase().startsWith(locale.toLowerCase().slice(0, 2)));
    const candidates = pool.length ? pool : voices;
    const preference = voiceGenderPreference;
    const ordered = [...candidates].sort((a, b) => scoreVoice(b, locale, preference) - scoreVoice(a, locale, preference));
    return ordered[0] || null;
  }, [locale, selectedVoiceName, voiceGenderPreference, voices]);

  const warning = useMemo(() => {
    if (!voices.length) return "Nenhuma voz instalada no navegador.";
    if (voiceGenderPreference !== "male") return "";
    const hasMale = voices.some((voice) => {
      const gender = classifyVoiceGender(voice.name);
      return gender === "male" && voice.lang?.toLowerCase().startsWith(locale.toLowerCase().slice(0, 2));
    });
    if (!hasMale) {
      return "Nao encontrei voz masculina natural instalada neste navegador. Usando a melhor voz disponivel.";
    }
    return "";
  }, [locale, voiceGenderPreference, voices]);

  const pickVoice = useCallback(
    (targetLocale = locale, preference: VoiceGenderPreference = voiceGenderPreference, voiceName = selectedVoiceName) => {
      if (!voices.length) return null;
      if (voiceName) {
        const exact = voices.find((voice) => voice.name === voiceName);
        if (exact) return exact;
      }
      const pool = voices.filter((voice) => voice.lang?.toLowerCase().startsWith(targetLocale.toLowerCase().slice(0, 2)));
      const candidates = pool.length ? pool : voices;
      return [...candidates].sort((a, b) => scoreVoice(b, targetLocale, preference) - scoreVoice(a, targetLocale, preference))[0] || null;
    },
    [locale, selectedVoiceName, voiceGenderPreference, voices]
  );

  return {
    voices,
    availableVoices,
    selectedVoice,
    selectedVoiceName,
    setSelectedVoiceName,
    voiceGenderPreference,
    setVoiceGenderPreference,
    rate,
    setRate,
    pitch,
    setPitch,
    volume,
    setVolume,
    warning,
    pickVoice,
  };
}
