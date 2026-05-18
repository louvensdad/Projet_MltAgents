"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import LdcnActionButtons, { LdcnAction } from "@/components/ldcn/LdcnActionButtons";
import LdcnChatPanel from "@/components/ldcn/LdcnChatPanel";
import LdcnFloatingOrb, { LdcnAssistantState } from "@/components/ldcn/LdcnFloatingOrb";
import { dispatchLdcnAvatarEvent } from "@/components/ldcn/avatar/ldcnAvatarEvents";
import type { LdcnMessageItem } from "@/components/ldcn/LdcnMessage";
import { apiPost } from "@/lib/api";
import { usePreferences } from "@/context/PreferencesContext";

interface LdcnResponse {
  success: boolean;
  reply: string;
  intent: string;
  agents_used: string[];
  suggested_actions: LdcnAction[];
  ui_actions: LdcnAction[];
  context_summary?: Record<string, unknown>;
}

const greeting =
  "Ola, eu sou o LDCN. Posso te ajudar a criar, revisar ou melhorar seu projeto.";

function normalizeStackFromPath(pathname: string): string | null {
  const wizardMatch = pathname.match(/^\/wizard\/([^/]+)/);
  const createMatch = pathname.match(/^\/create\/([^/]+)/);
  const raw = wizardMatch?.[1] || createMatch?.[1];
  return raw ? raw.replace(/-/g, "_") : null;
}

function normalizeProjectFromPath(pathname: string): string | null {
  const match = pathname.match(/^\/projects\/([^/]+)/) || pathname.match(/^\/downloads\/([^/]+)/);
  return match?.[1] || null;
}

export default function LdcnAssistant() {
  const pathname = usePathname();
  const router = useRouter();
  const { localeFull } = usePreferences();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [state, setState] = useState<LdcnAssistantState>("idle");
  const [actions, setActions] = useState<LdcnAction[]>([]);
  const [activeAgent, setActiveAgent] = useState<string | null>(null);
  const [messages, setMessages] = useState<LdcnMessageItem[]>([
    { id: "ldcn-greeting", role: "assistant", content: greeting },
  ]);

  const pageContext = useMemo(() => {
    const stackId = normalizeStackFromPath(pathname);
    const projectId = normalizeProjectFromPath(pathname);
    const mode =
      typeof window !== "undefined"
        ? localStorage.getItem("ldcn_default_ai_mode") || localStorage.getItem("panel_ai_mode") || "local_build"
        : "local_build";
    return { stackId, projectId, mode };
  }, [pathname]);

  async function sendMessage(message: string, source: "chat" | "voice" = "chat"): Promise<string | null> {
    const trimmed = message.trim();
    if (!trimmed) return null;

    const userMessage: LdcnMessageItem = { id: crypto.randomUUID(), role: "user", content: trimmed };
    setMessages((current) => [...current, userMessage]);
    setBusy(true);
    setState(source === "voice" ? "thinking" : "thinking");

    const path = source === "voice" ? "/api/ldcn/voice" : "/api/ldcn/chat";
    const body =
      source === "voice"
        ? {
            transcript: trimmed,
            page: pathname,
            project_id: pageContext.projectId,
            stack_id: pageContext.stackId,
            locale: localeFull,
            mode: pageContext.mode,
            context: buildClientContext(),
          }
        : {
            message: trimmed,
            page: pathname,
            project_id: pageContext.projectId,
            stack_id: pageContext.stackId,
            locale: localeFull,
            mode: pageContext.mode,
            context: buildClientContext(),
          };

    const result = await apiPost<LdcnResponse>(path, body);
    setBusy(false);

    if (!result.ok || !result.data?.success) {
      const errorText = result.backendError?.message || result.networkError || "Nao consegui acessar o orquestrador LDCN agora.";
      setState("error");
      dispatchLdcnAvatarEvent({ type: "assistant_error", message: errorText, route: pathname, source: source });
      setMessages((current) => [...current, { id: crypto.randomUUID(), role: "assistant", content: errorText }]);
      return errorText;
    }

    const response = result.data;
    setState("idle");
    dispatchLdcnAvatarEvent({ type: "assistant_success", message: response.reply, route: pathname, source: source });
    setActions(response.suggested_actions || []);
    setActiveAgent(response.agents_used?.[0] || null);
    setMessages((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        role: "assistant",
        content: response.reply,
        agents: response.agents_used,
      },
    ]);
    return response.reply;
  }

  function buildClientContext() {
    if (typeof window === "undefined") return {};
    return {
      route: pathname,
      stack_id: pageContext.stackId,
      project_id: pageContext.projectId,
      mode: pageContext.mode,
      last_generation_payload: readSessionJson("ldcn_last_generation_payload"),
      wizard_prefill: readSessionJson("ldcn_wizard_prefill"),
      recent_errors: readSessionJson("ldcn_recent_errors") || [],
      downloads_available: pathname.startsWith("/downloads"),
    };
  }

  function handleAction(action: LdcnAction) {
    if (action.requires_confirmation && !window.confirm(`${action.label}?`)) return;

    if (action.type === "prefill_wizard") {
      sessionStorage.setItem("ldcn_wizard_prefill", JSON.stringify(action.payload || {}));
      dispatchLdcnAvatarEvent({
        type: "template_selected",
        message: "Preparei o preenchimento do wizard com essa ideia.",
        route: pathname,
        source: "assistant_action",
        payload: action.payload || {},
      });
      setMessages((current) => [
        ...current,
        { id: crypto.randomUUID(), role: "assistant", content: "Preparei o preenchimento do wizard com essa ideia." },
      ]);
      return;
    }

    if (action.href) {
      router.push(action.href);
      return;
    }

    if (action.type === "run_validation") {
      router.push("/validation-center");
    }
  }

  return (
    <>
      <LdcnChatPanel
        open={open}
        messages={messages}
        actions={actions}
        page={pathname}
        stackId={pageContext.stackId}
        activeAgent={activeAgent}
        mode={pageContext.mode}
        busy={busy}
        onClose={() => setOpen(false)}
        onSend={(message) => sendMessage(message, "chat").then(() => undefined)}
        onAction={handleAction}
        onVoiceTranscript={(transcript) => sendMessage(transcript, "voice")}
        onSpeak={() => setState("speaking")}
      />
      {!open && actions.length > 0 && (
        <div className="fixed bottom-24 right-5 z-40 w-[min(360px,calc(100vw-2rem))] rounded-lg border border-white/10 bg-slate-950/90 p-3 shadow-xl shadow-black/40 backdrop-blur-xl">
          <LdcnActionButtons actions={actions.slice(0, 2)} onAction={handleAction} />
        </div>
      )}
      <LdcnFloatingOrb state={state} open={open} onClick={() => setOpen((value) => !value)} />
    </>
  );
}

function readSessionJson(key: string) {
  try {
    const value = sessionStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}
