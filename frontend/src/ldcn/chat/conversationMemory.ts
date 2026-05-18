"use client";

export interface LdcnConversationTurn {
  turn_id: string;
  role: "user" | "assistant";
  message: string;
  intent?: string;
  agents_used?: string[];
  route?: string;
  page?: string;
  reply?: string;
}

export interface ConversationMemorySnapshot {
  conversation_id: string;
  history: LdcnConversationTurn[];
  summary: string;
}

export function trimConversationHistory(history: LdcnConversationTurn[], limit = 12) {
  return history.slice(-limit);
}

export function summarizeConversation(history: LdcnConversationTurn[]) {
  if (history.length <= 12) return "";
  return history
    .slice(-12)
    .map((turn) => `${turn.role}: ${turn.message.slice(0, 90)}`)
    .join(" | ")
    .slice(-800);
}

export function buildConversationMemorySnapshot(
  conversationId: string,
  history: LdcnConversationTurn[],
  limit = 12
): ConversationMemorySnapshot {
  const trimmed = trimConversationHistory(history, limit);
  return {
    conversation_id: conversationId,
    history: trimmed,
    summary: summarizeConversation(history),
  };
}
