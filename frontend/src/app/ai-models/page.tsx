"use client";

import { useEffect, useState, useCallback } from "react";
import { apiGet, apiFallbacks } from "@/lib/api";
import AiModelDetailsDrawer from "@/components/ai-models/AiModelDetailsDrawer";
import { Cpu, Zap, Shield, Sparkles, Brain, AlertTriangle, Clock, Rocket, ChevronRight } from "lucide-react";
import { usePreferences } from "@/context/PreferencesContext";
import AnimatedBadge from "@/components/premium/AnimatedBadge";
import HolographicCard from "@/components/premium/HolographicCard";
import SectionHeader from "@/components/premium/SectionHeader";

const ICON_MAP: Record<string, React.ElementType> = {
  "Agent Boost": Sparkles,
  "Local Engine": Cpu,
  "Recommendation Engine": Brain,
  "Security AI": Shield,
  "UX AI": Zap,
};

const BADGE_COLORS: Record<string, string> = {
  active: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  mock: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  offline: "bg-rose-500/20 text-rose-300 border-rose-500/30",
  planned: "bg-blue-500/20 text-blue-300 border-blue-500/30",
};

const MODE_COLORS: Record<string, string> = {
  GEMINI_CONNECTED: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  MOCK_MODE: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  GEMINI_ERROR: "bg-rose-500/20 text-rose-300 border-rose-500/30",
  ACTIVE: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  OFFLINE: "bg-gray-500/20 text-gray-400 border-gray-500/30",
};

function safeArray(arr: any): any[] {
  if (Array.isArray(arr)) return arr;
  if (arr && typeof arr === "object") return Object.values(arr);
  return [];
}

function cn(...classes: (string | false | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

function StatusBadge({ status }: { status: string }) {
  const c = BADGE_COLORS[status] || "bg-gray-500/20 text-gray-400 border-gray-500/30";
  return (
    <span className={`rounded-md border px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider ${c}`}>
      {status}
    </span>
  );
}

function ModeBadge({ mode }: { mode: string }) {
  const c = MODE_COLORS[mode] || "bg-gray-500/20 text-gray-400 border-gray-500/30";
  return (
    <span className={`rounded-md border px-2 py-0.5 text-[10px] font-mono ${c}`}>
      {mode}
    </span>
  );
}

function PlannedCard({ m, onSelect, t: T }: { m: any; onSelect: (m: any) => void; t?: (k: string) => string }) {
  const Icon = ICON_MAP[m.name] || Clock;
  const fn = T || ((k: string) => k);
  return (
    <button
      onClick={() => onSelect(m)}
      className="w-full text-left rounded-xl border border-blue-500/20 bg-gradient-to-br from-blue-500/[0.03] to-indigo-500/[0.03] p-5 transition-all hover:border-blue-500/40 hover:shadow-[0_0_24px_rgba(59,130,246,0.08)] active:scale-[0.98] cursor-pointer group"
      aria-label={`${fn("ai_models.roadmap")} ${m.name}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-blue-500/10 p-2 text-blue-400">
            <Icon size={20} />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-200">{m.name}</p>
            <p className="text-[11px] text-gray-500">{m.provider}</p>
          </div>
        </div>
        <ChevronRight size={16} className="text-blue-500/0 group-hover:text-blue-500/50 transition-all" />
      </div>
      <div className="flex items-center gap-2 mb-3">
        <span className="rounded-md border border-blue-500/20 bg-blue-500/10 px-2 py-0.5 text-[10px] font-mono text-blue-300">
          {fn("ai_models.roadmap")}
        </span>
        {m.availability && (
          <span className="flex items-center gap-1 text-[10px] text-gray-500">
            <Clock size={10} /> {m.availability}
          </span>
        )}
      </div>
      {m.description && (
        <p className="text-sm text-gray-400 leading-relaxed">{m.description}</p>
      )}
    </button>
  );
}

function ActiveCard({ m, onSelect, t: T }: { m: any; onSelect: (m: any) => void; t?: (k: string) => string }) {
  const Icon = ICON_MAP[m.name] || Cpu;
  const fn = T || ((k: string) => k);
  const iconColor = m.status === "active"
    ? "bg-emerald-500/10 text-emerald-400"
    : m.status === "mock"
      ? "bg-amber-500/10 text-amber-400"
      : "bg-gray-500/10 text-gray-500";

  return (
    <button
      onClick={() => onSelect(m)}
      className="w-full text-left rounded-xl border border-white/10 bg-surface p-5 transition-all hover:border-white/25 hover:shadow-[0_0_24px_rgba(255,255,255,0.04)] active:scale-[0.98] cursor-pointer group"
      aria-label={`${fn("ai_models.title")} ${m.name}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`rounded-lg p-2 ${iconColor}`}>
            <Icon size={20} />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-200">{m.name}</p>
            <p className="text-[11px] text-gray-500">{m.provider}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={m.status} />
          <ChevronRight size={16} className="text-white/0 group-hover:text-white/30 transition-all" />
        </div>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <ModeBadge mode={m.mode} />
        {m.model && (
          <span className="text-[10px] font-mono text-gray-600">{m.model}</span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="rounded-md bg-white/[0.03] px-2 py-1.5">
          <p className="text-[10px] uppercase tracking-widest text-gray-500">{fn("ai_models.memory")}</p>
          <p className="text-gray-300 font-medium">{m.memory_usage || "Indisponível"}</p>
        </div>
        <div className="rounded-md bg-white/[0.03] px-2 py-1.5">
          <p className="text-[10px] uppercase tracking-widest text-gray-500">{fn("ai_models.requests")}</p>
          <p className="text-gray-300 font-medium">{m.request_limit || "Indisponível"}</p>
        </div>
        <div className="rounded-md bg-white/[0.03] px-2 py-1.5 col-span-2">
          <p className="text-[10px] uppercase tracking-widest text-gray-500">{fn("ai_models.price_label")}</p>
          <p className="text-gray-300 font-medium">{m.pricing}</p>
        </div>
      </div>

      {m.notes && (
        <p className="mt-2 text-[11px] text-gray-500 leading-relaxed">{m.notes}</p>
      )}
    </button>
  );
}

export default function AIModelsPage() {
  const { t: T } = usePreferences();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedModel, setSelectedModel] = useState<any>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    setError("");
    apiGet<any[]>("/api/ai-models", apiFallbacks["/api/ai-models"] as any)
      .then((r) => {
        if (r.status === "offline") {
          setData({ models: r.data });
        } else {
          const raw = (r as any).data ?? r.data ?? [];
          setData({ models: raw });
        }
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : String(err);
        setError(`Erro ao carregar modelos: ${msg}`);
        if (process.env.NODE_ENV === "development") console.error(err);
      })
      .finally(() => setLoading(false));
  }, []);

  const models = safeArray(data?.models);

  const activeModels = models.filter((m: any) => m.show_metrics !== false);
  const plannedModels = models.filter((m: any) => m.show_metrics === false || m.status === "planned");

  const handleSelectModel = useCallback((m: any) => {
    setSelectedModel(m);
    setDrawerOpen(true);
  }, []);

  const handleCloseDrawer = useCallback(() => {
    setDrawerOpen(false);
  }, []);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <section className="rounded-[32px] border border-white/10 bg-[linear-gradient(135deg,rgba(3,7,18,0.96),rgba(8,12,24,0.92),rgba(3,7,18,0.98))] p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-3">
            <AnimatedBadge tone="violet">inteligência de IA</AnimatedBadge>
            <h1 className="text-4xl font-semibold tracking-tight text-white md:text-5xl">{T("ai_models.title")}</h1>
            <p className="max-w-2xl text-sm leading-7 text-slate-300 md:text-base">{T("ai_models.subtitle")}</p>
          </div>
          <SectionHeader eyebrow="runtime" title="Plano de controle dos modelos" subtitle="Agent Boost, fallback local e status de execução em um único cockpit." />
        </div>
      </section>

      {loading && (
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-36 animate-pulse rounded-xl bg-white/5" />
          ))}
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 flex items-start gap-3">
          <AlertTriangle size={20} className="text-rose-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-rose-200">{T("ai_models.error_title")}</p>
            <p className="text-xs text-rose-300/80 mt-1">{error}</p>
          </div>
        </div>
      )}

      {!loading && models.length === 0 && !error && (
        <div className="rounded-xl border border-white/10 bg-surface p-10 text-center">
          <Cpu size={40} className="mx-auto text-gray-600 mb-3" />
          <p className="text-gray-400 text-sm">{T("ai_models.no_models")}</p>
          <p className="text-xs text-gray-600 mt-1">{T("ai_models.no_models_desc")}</p>
        </div>
      )}

      {activeModels.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500">{T("ai_models.available")}</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {activeModels.map((m: any) => (
              <HolographicCard key={m.name} className="overflow-hidden">
                <ActiveCard m={m} onSelect={handleSelectModel} t={T} />
              </HolographicCard>
            ))}
          </div>
        </div>
      )}

      {plannedModels.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500">{T("ai_models.planned")}</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {plannedModels.map((m: any) => (
              <HolographicCard key={m.name} className="overflow-hidden">
                <PlannedCard m={m} onSelect={handleSelectModel} t={T} />
              </HolographicCard>
            ))}
          </div>
        </div>
      )}

      <AiModelDetailsDrawer
        model={selectedModel}
        isOpen={drawerOpen}
        onClose={handleCloseDrawer}
      />
    </div>
  );
}
