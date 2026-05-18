"use client";

import type { LdcnConversationTurn } from "@/ldcn/chat/conversationMemory";

export interface LdcnPageContextSnapshot {
  route: string;
  page_title: string;
  active_project_id: string | null;
  active_stack_id: string | null;
  wizard_step: string | null;
  last_error: string | null;
  last_generation_result: string | null;
  backend_status: string | null;
  download_status: string | null;
  selected_template: string | null;
  locale: string;
  mode: string;
}

export interface BuildLdcnChatPayloadOptions {
  message: string;
  conversationId: string;
  turnId: string;
  route: string;
  pageTitle: string;
  locale: string;
  mode: string;
  pageContext: LdcnPageContextSnapshot;
  history: LdcnConversationTurn[];
  source: "text" | "voice";
}

function readStoredString(key: string) {
  if (typeof window === "undefined") return null;
  return window.sessionStorage.getItem(key) || window.localStorage.getItem(key);
}

function safeJson<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function collectPageContext(route: string, locale: string, mode: string): LdcnPageContextSnapshot {
  const pageTitle = typeof document !== "undefined" ? document.title || route : route;
  return {
    route,
    page_title: pageTitle,
    active_project_id: readStoredString("ldcn_active_project") || readStoredString("ldcn_last_project_generated"),
    active_stack_id: readStoredString("ldcn_wizard_stack") || readStoredString("ldcn_selected_stack"),
    wizard_step: readStoredString("ldcn_wizard_step"),
    last_error: readStoredString("ldcn_last_error"),
    last_generation_result: readStoredString("ldcn_last_generation_result"),
    backend_status: readStoredString("ldcn_backend_status"),
    download_status: readStoredString("ldcn_download_status"),
    selected_template: readStoredString("ldcn_selected_template"),
    locale,
    mode,
  };
}

export function buildLdcnChatPayload(options: BuildLdcnChatPayloadOptions) {
  const history = options.history.slice(-12);
  const olderHistory = options.history.slice(0, Math.max(0, options.history.length - 10));
  const memorySummary = olderHistory.map((turn) => `${turn.role}: ${turn.message.slice(0, 80)}`).join(" | ");
  return {
    message: options.message,
    query: options.message,
    source: options.source,
    route: options.route,
    page: options.pageTitle,
    page_title: options.pageTitle,
    conversation_id: options.conversationId,
    turn_id: options.turnId,
    client_turn_id: options.turnId,
    active_project_id: options.pageContext.active_project_id,
    active_project: options.pageContext.active_project_id,
    active_stack_id: options.pageContext.active_stack_id,
    stack_id: options.pageContext.active_stack_id,
    wizard_step: options.pageContext.wizard_step,
    last_error: options.pageContext.last_error,
    last_generation_result: options.pageContext.last_generation_result,
    locale: options.locale,
    mode: options.mode,
    history,
    conversation_history: history,
    page_context: options.pageContext,
    context: {
      source: options.source,
      route: options.route,
      page: options.pageTitle,
      page_title: options.pageTitle,
      locale: options.locale,
      mode: options.mode,
      history,
      history_summary: memorySummary,
      page_context: options.pageContext,
      active_project: options.pageContext.active_project_id,
      active_stack_id: options.pageContext.active_stack_id,
      wizard_step: options.pageContext.wizard_step,
      last_error: options.pageContext.last_error,
      last_generation_result: options.pageContext.last_generation_result,
      backend_status: options.pageContext.backend_status,
      download_status: options.pageContext.download_status,
      selected_template: options.pageContext.selected_template,
      conversation_id: options.conversationId,
      turn_id: options.turnId,
      conversation_history: history,
    },
  };
}

export function readStoredConversationHistory(key = "ldcn_conversation_history") {
  if (typeof window === "undefined") return [] as LdcnConversationTurn[];
  const raw = window.sessionStorage.getItem(key) || window.localStorage.getItem(key);
  return safeJson<LdcnConversationTurn[]>(raw, []);
}
