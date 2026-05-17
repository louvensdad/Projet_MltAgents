"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  Copy,
  FileJson,
  FileText,
  Layers3,
  Sparkles,
  Zap,
} from "lucide-react";
import { usePreferences } from "@/context/PreferencesContext";
import { getApiBaseUrl } from "@/lib/config";
import AnimatedBadge from "@/components/premium/AnimatedBadge";
import EngineNodeGraph from "@/components/premium/EngineNodeGraph";
import HolographicCard from "@/components/premium/HolographicCard";
import LiveArchitecturePanel from "@/components/premium/LiveArchitecturePanel";
import MetricOrb from "@/components/premium/MetricOrb";
import SectionHeader from "@/components/premium/SectionHeader";
import ProjectHealthCard from "@/components/project-health/ProjectHealthCard";

type ProjectDetailsData = {
  id: string;
  name: string;
  type?: string;
  stack?: string;
  path?: string;
  payment_status?: string;
  download_status?: string;
  created_at?: string;
  readme?: string;
  blueprint?: Record<string, any>;
};

type DetailTab = "readme" | "blueprint";

function safeArray(value: any): string[] {
  if (Array.isArray(value)) return value.filter(Boolean).map(String);
  if (value && typeof value === "object") return Object.values(value).filter(Boolean).map(String);
  return [];
}

function prettyValue(value: any, fallback = "Pendente") {
  if (Array.isArray(value)) return value.length ? value.length : fallback;
  if (typeof value === "string") return value || fallback;
  if (typeof value === "boolean") return value ? "Sim" : "Não";
  if (typeof value === "number") return value;
  if (value && typeof value === "object") return Object.keys(value).length || fallback;
  return fallback;
}

function getProjectNodes(details: ProjectDetailsData) {
  const stack = details.stack || details.type || "Project";
  const recommendations = safeArray(details.blueprint?.smart_recommendations);
  const presets = safeArray(details.blueprint?.selected_presets);
  return [
    { name: details.name || "Project", status: "online", hint: stack },
    { name: "Blueprint", status: "synced", hint: `${recommendations.length} recommendations` },
    { name: "Architecture", status: "live", hint: details.blueprint?.generated_architecture_summary ? "Resumo gerado disponível" : "Aguardando resumo" },
    { name: "Docs", status: details.readme ? "synced" : "draft", hint: details.readme ? "README pronto" : "Documentação pendente" },
    { name: "Delivery", status: details.download_status || "ready", hint: `${presets.length} presets applied` },
  ];
}

export default function ProjectDetailView({ projectId }: { projectId: string }) {
  const [details, setDetails] = useState<ProjectDetailsData | null>(null);
  const [loading, setCarregando] = useState(true);
  const [activeTab, setActiveTab] = useState<DetailTab>("readme");
  const { t } = usePreferences();

  useEffect(() => {
    let alive = true;

    const load = async () => {
      try {
        const response = await fetch(`${getApiBaseUrl()}/api/projects/${projectId}/details`);
        const data = await response.json();
        if (alive) setDetails(data);
      } catch (error) {
        console.error(error);
        if (alive) setDetails(null);
      } finally {
        if (alive) setCarregando(false);
      }
    };

    load();

    return () => {
      alive = false;
    };
  }, [projectId]);

  const analytics = useMemo(() => {
    const recommendations = safeArray(details?.blueprint?.smart_recommendations);
    const presets = safeArray(details?.blueprint?.selected_presets);
    const ux = safeArray(details?.blueprint?.ux_ai_preferences);
    const architectureValid = Boolean(details?.blueprint?.generated_architecture_summary || safeArray(details?.blueprint?.architecture_flow).length);
    const docsSynced = Boolean(details?.readme);
    const stackCompatible = Boolean(details?.stack || details?.type || details?.blueprint?.stack);
    const securityPassed = Boolean(details?.blueprint?.security_gate_passed ?? details?.blueprint?.security_passed ?? recommendations.length <= 1);

    return {
      architectureValid,
      docsSynced,
      stackCompatible,
      securityPassed,
      recommendationCount: recommendations.length,
      presetCount: presets.length,
      uxCount: ux.length,
      partialFeatures: Math.max(0, recommendations.length - 1),
    };
  }, [details]);

  if (loading) {
    return (
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-center px-4 py-20">
        <HolographicCard className="w-full max-w-md p-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/[0.04]">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
          </div>
          <p className="mt-5 text-xs uppercase tracking-[0.35em] text-slate-500">Carregando cockpit do projeto</p>
          <p className="mt-3 text-sm text-slate-300">{t("common.loading")}</p>
        </HolographicCard>
      </div>
    );
  }

  if (!details) {
    return (
      <div className="mx-auto flex max-w-4xl flex-col items-center justify-center px-4 py-20 text-center">
        <HolographicCard className="w-full max-w-lg p-8">
          <p className="text-[10px] uppercase tracking-[0.35em] text-slate-500">Projeto não encontrado</p>
          <h2 className="mt-3 text-2xl font-semibold text-white">{t("common.error")}</h2>
          <p className="mt-3 text-sm leading-7 text-slate-400">A visualização de detalhes do projeto não conseguiu carregar o registro solicitado.</p>
          <Link href="/projects" className="mt-6 inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-slate-200 transition-all hover:bg-white/[0.08]">
            <ArrowLeft size={16} />
            {t("common.back")}
          </Link>
        </HolographicCard>
      </div>
    );
  }

  const projectNodes = getProjectNodes(details);
  const intelligenceSummary = details.blueprint?.generated_architecture_summary || "Nenhum resumo gerado está disponível ainda. O painel de blueprint ainda expõe o sinal bruto de engenharia.";
  const tabs = [
    { id: "readme" as const, label: "README & Docs", icon: FileText },
    { id: "blueprint" as const, label: "Blueprint JSON", icon: FileJson },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 lg:py-10">
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]"
      >
        <HolographicCard className="p-6 md:p-8">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />
          <div className="flex flex-wrap items-center gap-2">
            <AnimatedBadge tone="cyan">Cockpit do projeto</AnimatedBadge>
            <AnimatedBadge tone="violet">{details.type || "enterprise"}</AnimatedBadge>
            <AnimatedBadge tone="emerald">{details.payment_status || "status: live"}</AnimatedBadge>
          </div>
          <div className="mt-6 max-w-3xl">
            <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-slate-500">ID do projeto</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white md:text-5xl">{details.name}</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 md:text-base">
              Cockpit de engenharia para projetos gerados. Inspecione o blueprint, valide a arquitetura e siga diretamente para o AI Boost ou fluxo de upgrade sem sair da tela.
            </p>
            <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.35em] text-slate-500">
              ID: <code className="text-cyan-200">{details.id}</code>
            </p>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href={`/projects/${details.id}/ai-boost`} className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-[0_16px_40px_rgba(34,211,238,0.18)] transition-all hover:translate-y-[-1px]">
              <Sparkles size={16} />
              AI Boost
            </Link>
            <Link href={`/projects/${details.id}/upgrade`} className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-slate-200 transition-all hover:bg-white/[0.08]">
              <Zap size={16} />
              {t("projects.upgrade")}
            </Link>
            <Link href="/projects" className="inline-flex items-center gap-2 rounded-2xl border border-white/10 px-5 py-3 text-sm font-semibold text-slate-400 transition-all hover:border-white/20 hover:text-white">
              <ArrowLeft size={16} />
              {t("common.back")}
            </Link>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <MetricOrb label="Architecture" value={analytics.architectureValid ? "Live" : "Draft"} icon={<Layers3 size={16} />} accent="cyan" />
            <MetricOrb label="Security" value={analytics.securityPassed ? "OK" : "Review"} icon={<Sparkles size={16} />} accent="violet" />
            <MetricOrb label="Docs" value={analytics.docsSynced ? "Synced" : "Pendente"} icon={<FileText size={16} />} accent="emerald" />
            <MetricOrb label="Guidance" value={analytics.recommendationCount} icon={<Zap size={16} />} accent="cyan" />
          </div>
        </HolographicCard>

        <div className="space-y-5">
          <ProjectHealthCard
            architectureValid={analytics.architectureValid}
            securityPassed={analytics.securityPassed}
            docsSynced={analytics.docsSynced}
            stackCompatible={analytics.stackCompatible}
            partialFeatures={analytics.partialFeatures}
          />
          <LiveArchitecturePanel
            title="Espinha de arquitetura ao vivo"
            graph={
              details.blueprint?.generated_architecture_summary
                ? details.blueprint.generated_architecture_summary
                : `Project: ${details.name}\nStack: ${details.stack || details.type || "unknown"}\nStatus: ${details.payment_status || "live"}`
            }
          />
        </div>
      </motion.section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-6">
          <HolographicCard className="p-6">
            <SectionHeader
              eyebrow="Engineering signal"
              title="Step 9 intelligence"
              subtitle="The project detail view surfaces generated architecture, presets, and recommendation traces in one place."
            />
            <p className="mt-4 text-sm leading-7 text-slate-300">{intelligenceSummary}</p>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">UX / AI decisions</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {safeArray(details.blueprint?.ux_ai_preferences).length ? (
                    safeArray(details.blueprint?.ux_ai_preferences).map((item) => (
                      <span key={item} className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-200">
                        {item}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-slate-500">Nenhuma decisao de UX registrada.</span>
                  )}
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">Presets applied</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {safeArray(details.blueprint?.selected_presets).length ? (
                    safeArray(details.blueprint?.selected_presets).map((item) => (
                      <span key={item} className="rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-xs text-violet-200">
                        {item}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-slate-500">Nenhum preset registrado.</span>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">Applied recommendations</p>
                <ul className="mt-3 space-y-2 text-sm text-emerald-200">
                  {safeArray(details.blueprint?.smart_recommendations).length ? (
                    safeArray(details.blueprint?.smart_recommendations).map((item) => <li key={item}>- {item}</li>)
                  ) : (
                    <li>Nenhuma recomendacao registrada.</li>
                  )}
                </ul>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">Pendente checks</p>
                <ul className="mt-3 space-y-2 text-sm text-amber-200">
                  <li>- Partial features detected: {analytics.partialFeatures}</li>
                  <li>- Generated blueprints: {prettyValue(details.blueprint?.generated_architecture_summary, "Missing")}</li>
                  <li>- Project path: {details.path || "N?o definido"}</li>
                </ul>
              </div>
            </div>
          </HolographicCard>

          <HolographicCard className="p-6">
            <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-4">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] transition-all ${
                      active ? "bg-white/10 text-white" : "text-slate-500 hover:bg-white/[0.04] hover:text-slate-200"
                    }`}
                  >
                    <Icon size={14} />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <div className="pt-5">
              <AnimatePresence mode="wait">
                {activeTab === "readme" ? (
                  <motion.div
                    key="readme"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.25 }}
                    className="rounded-3xl border border-white/10 bg-black/30 p-5"
                  >
                    {details.readme ? (
                      <pre className="max-h-[30rem] overflow-auto whitespace-pre-wrap font-mono text-sm leading-7 text-slate-300">
                        {details.readme}
                      </pre>
                    ) : (
                      <div className="py-8 text-center">
                        <p className="text-sm text-slate-500">Nenhum README encontrado para este projeto.</p>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="blueprint"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.25 }}
                    className="relative rounded-3xl border border-white/10 bg-black/30 p-5"
                  >
                    <button
                      onClick={() => navigator.clipboard.writeText(JSON.stringify(details.blueprint, null, 2))}
                      className="absolute right-5 top-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-400 transition-all hover:bg-white/[0.08] hover:text-white"
                    >
                      <Copy size={12} />
                      Copy
                    </button>
                    <pre className="max-h-[30rem] overflow-auto whitespace-pre-wrap rounded-2xl border border-white/10 bg-[#050505] p-4 font-mono text-xs leading-6 text-cyan-200">
                      {JSON.stringify(details.blueprint, null, 2)}
                    </pre>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </HolographicCard>
        </div>

        <div className="space-y-6">
          <HolographicCard className="p-6">
            <SectionHeader
              eyebrow="Live nodes"
              title="Project status mesh"
              subtitle="The detail page now behaves like a product cockpit instead of a plain record view."
            />
            <div className="mt-5">
              <EngineNodeGraph nodes={projectNodes} />
            </div>
          </HolographicCard>

          <HolographicCard className="p-6">
            <p className="text-[10px] uppercase tracking-[0.35em] text-slate-500">Quick signals</p>
            <div className="mt-4 grid gap-3">
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Stack</p>
                <p className="mt-2 text-sm text-white">{details.stack || details.type || "Unknown"}</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Created</p>
                <p className="mt-2 text-sm text-white">
                  {details.created_at ? new Date(details.created_at).toLocaleString() : "Nao disponivel"}
                </p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Download status</p>
                <p className="mt-2 text-sm text-white">{details.download_status || "ready"}</p>
              </div>
            </div>
          </HolographicCard>
        </div>
      </section>
    </div>
  );
}
