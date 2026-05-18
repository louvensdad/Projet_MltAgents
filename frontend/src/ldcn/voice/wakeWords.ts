"use client";

export const LDCN_WAKE_WORDS = ["ldcn", "vens", "ei ldcn", "ei vens", "jarvis", "javis"];

export function normalizeWakeWordText(value: string) {
  return (value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function extractWakeWordCommand(transcript: string, wakeWords: string[] = LDCN_WAKE_WORDS) {
  const normalized = normalizeWakeWordText(transcript);
  for (const wakeWord of wakeWords) {
    const wake = normalizeWakeWordText(wakeWord);
    if (!wake) continue;
    if (normalized === wake) {
      return { matched: true, wakeWord: wakeWord, command: "" };
    }
    if (normalized.startsWith(`${wake} `)) {
      return { matched: true, wakeWord: wakeWord, command: normalized.slice(wake.length).trim() };
    }
  }

  const compact = normalized.replace(/\s+/g, "");
  if (compact.startsWith("ldcn")) {
    const remainder = normalized.slice(normalized.indexOf("ldcn") + 4).trim();
    return { matched: true, wakeWord: "ldcn", command: remainder };
  }
  return { matched: false, wakeWord: "", command: transcript.trim() };
}

export function wakeWordReply(wakeWord: string) {
  const normalized = normalizeWakeWordText(wakeWord);
  if (normalized === "ldcn" || normalized === "ei ldcn") {
    return "Estou aqui. O que vamos construir hoje?";
  }
  if (normalized === "vens" || normalized === "ei vens") {
    return "Fala comigo. Quer criar, revisar ou corrigir alguma coisa?";
  }
  if (normalized === "jarvis" || normalized === "javis") {
    return "Quase isso. Aqui e o LDCN, mas posso te ajudar como um copiloto de engenharia.";
  }
  return "Estou ouvindo.";
}
