"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { FolderGit2, Cpu, ShieldCheck, Brain, ArrowRight, Zap, FileText, Download, Sparkles, LayoutGrid, WalletCards, Server, Database, Activity } from "lucide-react";
import { apiGet, apiFallbacks } from "@/lib/api";
import { API_BASE } from "@/lib/config";
import StatusBadge from "@/components/common/StatusBadge";
import { usePreferences } from "@/context/PreferencesContext";
import { AnimatedCounter, PulseStatus } from "@/components/motion";
import { EngineNodeGraph, FloatingActionCard, HolographicCard, LiveArchitecturePanel, MetricOrb, SectionHeader, EmptyState3D, AnimatedBadge } from "@/components/premium";

type Service = { name: string; status: string; updated_at: string };
type Project = { id: string; name: string; type: string; stack: string; payment_status: string; created_at: string; template_name?: string; download_status?: string };

export default function Dashboard() {
  const { t } = usePreferences();
  const [data, setData] = useState<any>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [aiStatus, setAiStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    apiGet<any>("/api/system/status", apiFallbacks["/api/system/status"] as any)
      .then((d) => mounted && setData(d.data))
      .catch(() => mounted && setData(apiFallbacks["/api/system/status"]))
      .finally(() => mounted && setLoading(false));
    fetch(`${API_BASE}/api/projects`)
      .then((r) => r.json())
      .then((d) => mounted && setProjects((d.projects || []).slice(0, 3)))
      .catch(() => {});
    fetch(`${API_BASE}/api/ai/status`)
      .then((r) => r.json())
      .then((d) => mounted && setAiStatus(d))
      .catch(() => {});
    return () => { mounted = false; };
  }, []);

  const services: Service[] = useMemo(() => (data?.services || []).slice(0, 5), [data]);
  const generators = useMemo(() => data?.generators?.generators || [], [data]);
  const stableCount = generators.filter((g: any) => g.support_level === "stable" || g.support_level === "enterprise").length;
  const totalGenerators = generators.length;
  const securityScore = 94;
  const aiMode = aiStatus?.generation_quality_mode === "agent_boost_100" ? "Agent Boost 100%" : "Local Build 90%";
  const kpiGeneratorsStatus = stableCount === totalGenerators ? "stable" : stableCount > 0 ? "active" : "offline";

  const engineNodes = [
    { name: "Validation Engine", status: "online", hint: "Prompt validator + stack checks" },
    { name: "Security Gate", status: "online", hint: "Secrets, auth and rate limit" },
    { name: "Documentation Engine", status: "online", hint: "Blueprint and docs sync" },
    { name: "AI Engine", status: aiStatus?.agent_boost_available ? "boosted" : "fallback", hint: aiMode },
    { name: "Download Service", status: "online", hint: "ZIP and artifact pipeline" },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <section className="relative overflow-hidden rounded-[32px] border border-white/10 bg-[linear-gradient(135deg,rgba(3,7,18,0.96),rgba(8,12,24,0.92),rgba(3,7,18,0.98))] p-6 shadow-[0_18px_80px_rgba(0,0,0,0.35)] md:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(94,160,255,0.16),transparent_30%),radial-gradient(circle_at_top_right,rgba(124,92,255,0.12),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(34,211,238,0.06),transparent_24%)]" />
        <motion.div
          className="absolute -right-16 -top-16 h-72 w-72 rounded-full bg-cyan-500/10 blur-[120px]"
          animate={{ opacity: [0.45, 0.8, 0.45], scale: [1, 1.08, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="relative z-10 grid gap-6 xl:grid-cols-[1.15fr_0.85fr] xl:items-center">
          <div className="space-y-5">
            <AnimatedBadge tone="cyan">Enterprise cockpit</AnimatedBadge>
            <div className="space-y-3">
              <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-white md:text-5xl">
                {t("dashboard.enterprise_title")}
              </h1>
              <p className="max-w-2xl text-sm leading-7 text-slate-300 md:text-base">
                {t("dashboard.enterprise_desc")}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link href="/wizard" className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90">
                <Zap size={16} /> {t("dashboard.create_button")}
              </Link>
              <Link href="/templates" className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-medium text-slate-200 transition-all hover:bg-white/10">
                <LayoutGrid size={16} /> Templates
              </Link>
              <Link href="/ai-models" className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-medium text-slate-200 transition-all hover:bg-white/10">
                <Brain size={16} /> {t("dashboard.test_gemini")}
              </Link>
            </div>

            <div className="flex flex-wrap gap-3">
              <AnimatedBadge tone="emerald">{aiMode}</AnimatedBadge>
              <AnimatedBadge tone="violet">Security {securityScore}%</AnimatedBadge>
              <AnimatedBadge tone="cyan">{stableCount}/{totalGenerators || 0} generators</AnimatedBadge>
            </div>
          </div>

          <HolographicCard className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.35em] text-slate-500">Live architecture</p>
                <p className="mt-1 text-sm text-slate-300">User → Gateway → API → Redis → Queue → Workers → DB</p>
              </div>
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-[11px] uppercase tracking-[0.2em] text-emerald-200">
                live
              </div>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              {[
                { label: "User", icon: <Sparkles size={16} /> },
                { label: "Gateway", icon: <Server size={16} /> },
                { label: "API", icon: <LayoutGrid size={16} /> },
                { label: "Redis", icon: <Cpu size={16} /> },
                { label: "Queue", icon: <Activity size={16} /> },
                { label: "Workers", icon: <FolderGit2 size={16} /> },
                { label: "Database", icon: <Database size={16} /> },
                { label: "Monitoring", icon: <ShieldCheck size={16} /> },
              ].map((node) => (
                <div key={node.label} className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                  <div className="flex items-center gap-2 text-slate-200">
                    {node.icon}
                    <span className="text-sm font-medium">{node.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </HolographicCard>
        </div>
      </section>

      <motion.section
        className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"
        initial="hidden"
        animate="show"
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
      >
        <motion.div variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}>
          <MetricOrb icon={<FolderGit2 size={18} />} value={<AnimatedCounter value={data?.projects_total || 0} />} label={t("dashboard.stats_projects")} />
        </motion.div>
        <motion.div variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}>
          <MetricOrb icon={<Cpu size={18} />} value={`${stableCount}/${totalGenerators}`} label={t("dashboard.generators_active")} accent="violet" />
        </motion.div>
        <motion.div variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}>
          <MetricOrb icon={<ShieldCheck size={18} />} value={<AnimatedCounter value={securityScore} formatter={(v) => `${v}%`} />} label={t("dashboard.security_score")} accent="emerald" />
        </motion.div>
        <motion.div variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}>
          <MetricOrb icon={<Brain size={18} />} value={aiMode} label={t("dashboard.ai_mode")} />
        </motion.div>
      </motion.section>

      <section className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2 space-y-6">
          <HolographicCard className="p-5">
            <SectionHeader
              eyebrow="engine mesh"
              title={t("dashboard.engine_health")}
              subtitle="Rede viva dos motores de validação, segurança, docs e download."
              action={(
                <Link href="/validation-center" className="inline-flex items-center gap-1 text-xs text-cyan-300 transition-colors hover:text-cyan-200">
                  {t("dashboard.view_details")} <ArrowRight size={12} />
                </Link>
              )}
            />
            <div className="mt-5 grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
              <EngineNodeGraph nodes={engineNodes} />
              <div className="space-y-3">
                {services.map((service) => (
                  <div key={service.name} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-white">{service.name}</p>
                        <p className="mt-1 text-xs text-slate-500">{service.updated_at}</p>
                      </div>
                      <PulseStatus status={service.status as "online" | "offline" | "warning"} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </HolographicCard>

          <HolographicCard className="p-5">
            <SectionHeader
              eyebrow="projects"
              title={t("dashboard.recent_projects")}
              subtitle="Projetos recentes com preview e status real."
              action={(
                <Link href="/projects" className="inline-flex items-center gap-1 text-xs text-cyan-300 transition-colors hover:text-cyan-200">
                  {t("dashboard.view_all")} <ArrowRight size={12} />
                </Link>
              )}
            />
            <div className="mt-5">
              {projects.length === 0 ? (
                <EmptyState3D
                  title="Nenhum projeto gerado ainda"
                  description="Crie o primeiro projeto no wizard para ativar o histórico, downloads e o painel de live generation."
                  actionHref="/wizard"
                  actionLabel={t("dashboard.create_button")}
                />
              ) : (
                <div className="space-y-3">
                  {projects.map((project) => (
                    <div key={project.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition-all hover:border-cyan-500/25">
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="truncate text-sm font-semibold text-white">{project.name}</p>
                            <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-0.5 text-[10px] uppercase tracking-[0.2em] text-slate-400">
                              {project.type}
                            </span>
                            {project.download_status && (
                              <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2.5 py-0.5 text-[10px] uppercase tracking-[0.2em] text-cyan-200">
                                {project.download_status}
                              </span>
                            )}
                          </div>
                          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                            <span>{project.stack}</span>
                            {project.template_name && <span>• {project.template_name}</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <StatusBadge status={project.payment_status === "paid" ? "paid" : project.payment_status === "pending_payment" ? "pending" : "draft"} />
                          <Link href={`/projects/${project.id}`} className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-slate-200 transition-all hover:bg-white/10">
                            {t("dashboard.view_details")}
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </HolographicCard>
        </div>

        <div className="space-y-6">
          <HolographicCard className="p-5">
            <SectionHeader eyebrow="quick launch" title={t("dashboard.quick_actions")} subtitle="Ações de comando para navegar no fluxo principal." />
            <div className="mt-5 space-y-3">
              <FloatingActionCard href="/wizard" title={t("dashboard.create_new")} description="Abrir criação guiada com preview ao vivo." icon={<Zap size={18} />} />
              <FloatingActionCard href="/templates" title="Templates premium" description="Explorar marketplace real e gerar por template." icon={<LayoutGrid size={18} />} />
              <FloatingActionCard href="/documentation" title={t("dashboard.view_docs")} description="Regras, fontes e contratos por stack." icon={<FileText size={18} />} />
              <FloatingActionCard href="/downloads" title={t("dashboard.view_downloads")} description="Baixar artefatos e ZIPs gerados." icon={<Download size={18} />} />
            </div>
          </HolographicCard>

          <HolographicCard className="p-5">
            <SectionHeader eyebrow="system" title="Engine snapshot" subtitle="Visão consolidada do estado operacional." />
            <div className="mt-5 space-y-3 text-sm text-slate-300">
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                <span>Security score</span>
                <span className="font-semibold text-white">{securityScore}%</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                <span>AI mode</span>
                <span className="font-semibold text-white">{aiMode}</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                <span>Generators</span>
                <span className="font-semibold text-white">{stableCount}/{totalGenerators}</span>
              </div>
            </div>
          </HolographicCard>
        </div>
      </section>
    </div>
  );
}
