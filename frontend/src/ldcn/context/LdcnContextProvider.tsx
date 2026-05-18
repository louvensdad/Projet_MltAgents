"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { usePreferences } from "@/context/PreferencesContext";
import { useLiveBuilder } from "@/context/LiveBuilderContext";

export interface LdcnConversationEntry {
  turn_id: string;
  role: "user" | "assistant";
  message: string;
  intent?: string;
  agents_used?: string[];
  route?: string;
  page?: string;
}

export interface LdcnPageContext {
  route: string;
  page: string;
  wizard_step: string | null;
  stack_id: string | null;
  selected_template: string | null;
  active_project: string | null;
  last_error: string | null;
  backend_status: string | null;
  download_status: string | null;
  mode: string;
  locale: string;
}

export interface LdcnRequestPayload {
  message: string;
  route: string;
  page_context: LdcnPageContext;
  conversation_history: LdcnConversationEntry[];
  last_error: string | null;
  active_project: string | null;
  locale: string;
  mode: string;
  stack_id: string | null;
  project_id: string | null;
  client_turn_id: string;
  context: Record<string, unknown>;
}

interface LdcnContextValue {
  route: string;
  pageContext: LdcnPageContext;
  conversationHistory: LdcnConversationEntry[];
  sessionId: string;
  buildRequest: (message: string, source: "chat" | "voice", options?: { clientTurnId?: string }) => LdcnRequestPayload;
  recordConversationTurn: (entry: LdcnConversationEntry) => void;
  setLastError: (value: string | null) => void;
  setBackendStatus: (value: string | null) => void;
  setDownloadStatus: (value: string | null) => void;
  setActiveProject: (value: string | null) => void;
}

const LdcnContext = createContext<LdcnContextValue | null>(null);

const SESSION_KEY = "ldcn_session_id";
const HISTORY_KEY = "ldcn_conversation_history";

function readStoredJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.sessionStorage.getItem(key) || window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function readStoredString(key: string): string | null {
  if (typeof window === "undefined") return null;
  return window.sessionStorage.getItem(key) || window.localStorage.getItem(key);
}

function getOrCreateSessionId() {
  if (typeof window === "undefined") return "server";
  const saved = window.localStorage.getItem(SESSION_KEY);
  if (saved) return saved;
  const created = crypto.randomUUID();
  window.localStorage.setItem(SESSION_KEY, created);
  return created;
}

function getDefaultMode() {
  if (typeof window === "undefined") return "local_build";
  return window.localStorage.getItem("ldcn_default_ai_mode") || window.localStorage.getItem("panel_ai_mode") || "local_build";
}

export function LdcnContextProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { localeFull } = usePreferences();
  const { state: liveBuilderState } = useLiveBuilder();
  const [sessionId, setSessionId] = useState("server");
  const [conversationHistory, setConversationHistory] = useState<LdcnConversationEntry[]>([]);
  const [lastError, setLastError] = useState<string | null>(null);
  const [backendStatus, setBackendStatus] = useState<string | null>(null);
  const [downloadStatus, setDownloadStatus] = useState<string | null>(null);
  const [activeProject, setActiveProject] = useState<string | null>(null);
  const [wizardStep, setWizardStep] = useState<string | null>(null);
  const [stackId, setStackId] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const created = getOrCreateSessionId();
    setSessionId(created);
    setConversationHistory(readStoredJson<LdcnConversationEntry[]>(HISTORY_KEY, []).slice(-12));
    setLastError(readStoredString("ldcn_last_error"));
    setBackendStatus(readStoredString("ldcn_backend_status"));
    setDownloadStatus(readStoredString("ldcn_download_status"));
    setActiveProject(readStoredString("ldcn_last_project_generated") || readStoredString("ldcn_active_project"));
    setWizardStep(readStoredString("ldcn_wizard_step"));
    setStackId(readStoredString("ldcn_wizard_stack") || readStoredString("ldcn_selected_stack") || (liveBuilderState.projectType as string | null));
    setSelectedTemplate(readStoredString("ldcn_selected_template") || readStoredString("template_context"));
  }, [liveBuilderState.projectType, pathname]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const sync = () => {
      setLastError(readStoredString("ldcn_last_error"));
      setBackendStatus(readStoredString("ldcn_backend_status"));
      setDownloadStatus(readStoredString("ldcn_download_status"));
      setActiveProject(readStoredString("ldcn_last_project_generated") || readStoredString("ldcn_active_project"));
      setWizardStep(readStoredString("ldcn_wizard_step"));
      setStackId(readStoredString("ldcn_wizard_stack") || readStoredString("ldcn_selected_stack") || (liveBuilderState.projectType as string | null));
      setSelectedTemplate(readStoredString("ldcn_selected_template") || readStoredString("template_context"));
      setConversationHistory(readStoredJson<LdcnConversationEntry[]>(HISTORY_KEY, []).slice(-12));
    };
    window.addEventListener("storage", sync);
    window.addEventListener("ldcn:context-update", sync as EventListener);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("ldcn:context-update", sync as EventListener);
    };
  }, [liveBuilderState.projectType]);

  const pageContext = useMemo<LdcnPageContext>(() => {
    const route = pathname || "/";
    return {
      route,
      page: route,
      wizard_step: wizardStep,
      stack_id: stackId,
      selected_template: selectedTemplate,
      active_project: activeProject || liveBuilderState.projectName || null,
      last_error: lastError,
      backend_status: backendStatus,
      download_status: downloadStatus,
      mode: getDefaultMode(),
      locale: localeFull || "pt-BR",
    };
  }, [activeProject, backendStatus, downloadStatus, lastError, localeFull, pathname, selectedTemplate, stackId, wizardStep, liveBuilderState.projectName]);

  const persistHistory = useCallback((entries: LdcnConversationEntry[]) => {
    if (typeof window === "undefined") return;
    window.sessionStorage.setItem(HISTORY_KEY, JSON.stringify(entries.slice(-12)));
    window.dispatchEvent(new Event("ldcn:context-update"));
  }, []);

  const recordConversationTurn = useCallback(
    (entry: LdcnConversationEntry) => {
      setConversationHistory((current) => {
        const next = [...current, entry].slice(-12);
        persistHistory(next);
        return next;
      });
    },
    [persistHistory]
  );

  const buildRequest = useCallback(
    (message: string, source: "chat" | "voice", options?: { clientTurnId?: string }): LdcnRequestPayload => {
      const turnId = options?.clientTurnId || crypto.randomUUID();
      return {
        message,
        route: pathname || "/",
        page_context: pageContext,
        conversation_history: conversationHistory,
        last_error: lastError,
        active_project: pageContext.active_project,
        locale: pageContext.locale,
        mode: pageContext.mode,
        stack_id: pageContext.stack_id,
        project_id: pageContext.active_project,
        client_turn_id: turnId,
        context: {
          source,
          session_id: sessionId,
          page_context: pageContext,
          route: pathname || "/",
          conversation_history: conversationHistory,
          last_error: lastError,
          active_project: pageContext.active_project,
          backend_status: backendStatus,
          download_status: downloadStatus,
          wizard_step: pageContext.wizard_step,
          selected_template: pageContext.selected_template,
          ai_mode: liveBuilderState.aiMode,
        },
      };
    },
    [backendStatus, conversationHistory, downloadStatus, lastError, liveBuilderState.aiMode, pageContext, pathname, sessionId]
  );

  const updateStoredValue = useCallback((key: string, value: string | null) => {
    if (typeof window === "undefined") return;
    if (value === null) {
      window.localStorage.removeItem(key);
      window.sessionStorage.removeItem(key);
      return;
    }
    window.localStorage.setItem(key, value);
    window.dispatchEvent(new Event("ldcn:context-update"));
  }, []);

  const value = useMemo<LdcnContextValue>(
    () => ({
      route: pathname || "/",
      pageContext,
      conversationHistory,
      sessionId,
      buildRequest,
      recordConversationTurn,
      setLastError: (value) => {
        setLastError(value);
        updateStoredValue("ldcn_last_error", value);
      },
      setBackendStatus: (value) => {
        setBackendStatus(value);
        updateStoredValue("ldcn_backend_status", value);
      },
      setDownloadStatus: (value) => {
        setDownloadStatus(value);
        updateStoredValue("ldcn_download_status", value);
      },
      setActiveProject: (value) => {
        setActiveProject(value);
        updateStoredValue("ldcn_active_project", value);
      },
    }),
    [buildRequest, conversationHistory, pageContext, pathname, recordConversationTurn, sessionId, updateStoredValue]
  );

  return <LdcnContext.Provider value={value}>{children}</LdcnContext.Provider>;
}

export function useLdcnContext() {
  const context = useContext(LdcnContext);
  if (!context) {
    throw new Error("useLdcnContext must be used within LdcnContextProvider");
  }
  return context;
}
