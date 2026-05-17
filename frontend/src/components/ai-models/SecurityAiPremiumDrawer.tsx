"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Shield, AlertTriangle, CheckCircle, Loader2, Clock, Globe,
  BookOpen, Play, Settings, Power, BarChart3, ExternalLink,
  ChevronDown, ChevronRight, Activity, RefreshCw, Shield as ShieldIcon,
  Bug, FileCheck, Search, Lock, Server, Wifi, WifiOff,
  Database, Timer, Hash, TrendingUp, Users, Terminal,
  Zap, Target, Eye, Map, Flag, Layers, Route, Cpu,
  FileText, Gauge, Star, Smartphone, Monitor, Palette, Layout,
  ScanLine, Siren, Radar, Fingerprint, KeyRound,
} from "lucide-react";
import { apiPost } from "@/lib/api";
import AiModelStatusBadge from "./AiModelStatusBadge";
import AiModelHealthScore from "./AiModelHealthScore";

function cn(...classes: (string | false | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

const stagger = {
  animate: { transition: { staggerChildren: 0.05 } },
} as const;

const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
} as const;

const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
} as const;

const runtimeEngines = [
  { name: "OWASP Engine", coverage: 82, status: "Beta", icon: Bug, color: "text-emerald-400", bg: "bg-emerald-500/10" },
  { name: "JWT Analyzer", coverage: 76, status: "Beta", icon: KeyRound, color: "text-cyan-400", bg: "bg-cyan-500/10" },
  { name: "Dependency Scanner", coverage: 68, status: "Planned", icon: Search, color: "text-blue-400", bg: "bg-blue-500/10" },
  { name: "Secrets Detector", coverage: 91, status: "Experimental", icon: Fingerprint, color: "text-violet-400", bg: "bg-violet-500/10" },
  { name: "Docker Shield", coverage: 54, status: "Future", icon: ShieldIcon, color: "text-orange-400", bg: "bg-orange-500/10" },
];

const roadmapItems = [
  { phase: "Beta", date: "Q2 2026", title: "OWASP Top 10 Scanner", desc: "Varredura automática das 10 vulnerabilidades críticas OWASP.", dot: "bg-emerald-400", line: "bg-emerald-500/30" },
  { phase: "Planned", date: "Q3 2026", title: "Secrets Detection", desc: "Detecção de chaves, tokens e senhas em código fonte.", dot: "bg-blue-400", line: "bg-blue-500/30" },
  { phase: "Planned", date: "Q3 2026", title: "Dependency Audit", desc: "Auditoria de dependências com análise de CVEs conhecidos.", dot: "bg-blue-400", line: "bg-blue-500/30" },
  { phase: "Future", date: "Q4 2026", title: "Docker Security Scan", desc: "Análise de segurança em imagens Docker e Dockerfiles.", dot: "bg-orange-400", line: "bg-orange-500/30" },
  { phase: "Beta", date: "Q2 2026", title: "JWT Analyzer", desc: "Análise de tokens JWT: expiração, assinatura e claims.", dot: "bg-emerald-400", line: "bg-emerald-500/30" },
  { phase: "Future", date: "2027", title: "LGPD Validator", desc: "Validação automática de conformidade com a LGPD.", dot: "bg-orange-400", line: "bg-orange-500/30" },
];

const complianceItems = [
  { name: "LGPD", score: 0, max: 100, status: "Planned" },
  { name: "GDPR", score: 0, max: 100, status: "Planned" },
  { name: "OWASP", score: 62, max: 100, status: "In Progress" },
  { name: "SOC2", score: 0, max: 100, status: "Future" },
  { name: "ISO 27001", score: 0, max: 100, status: "Future" },
];

const futureFeatures = [
  { name: "AI Penetration Testing", phase: "Future", eta: "2027", icon: Siren },
  { name: "Smart Secrets Rotation", phase: "Future", eta: "2027", icon: RefreshCw },
  { name: "Runtime Vulnerability Scanner", phase: "Planned", eta: "Q4 2026", icon: Radar },
  { name: "AI Attack Predictor", phase: "Research", eta: "2028", icon: ScanLine },
  { name: "Secure Architecture Advisor", phase: "Future", eta: "2027", icon: Layers },
];

const badgePhaseStyle = (phase: string) => {
  const map: Record<string, string> = {
    Beta: "bg-emerald-500/15 text-emerald-300 border-emerald-500/20",
    Planned: "bg-blue-500/15 text-blue-300 border-blue-500/20",
    Future: "bg-orange-500/15 text-orange-300 border-orange-500/20",
    Experimental: "bg-violet-500/15 text-violet-300 border-violet-500/20",
    Research: "bg-rose-500/15 text-rose-300 border-rose-500/20",
  };
  return map[phase] || "bg-gray-500/15 text-gray-400 border-gray-500/20";
};

function SectionHeader({ icon: Icon, title, subtitle }: { icon: any; title: string; subtitle?: string }) {
  return (
    <motion.div variants={fadeUp} className="flex items-center gap-2 mb-3">
      <div className="rounded-lg bg-white/[0.03] border border-white/5 p-1.5">
        <Icon size={14} className="text-gray-400" />
      </div>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-500">{title}</p>
        {subtitle && <p className="text-[9px] text-gray-600">{subtitle}</p>}
      </div>
    </motion.div>
  );
}

function ActionButton({ icon: Icon, label, onClick, primary, loading }: {
  icon: any; label: string; onClick: () => void; primary?: boolean; loading?: boolean;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      disabled={loading}
      className={cn(
        "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all border",
        primary
          ? "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20"
          : "bg-white/[0.03] text-gray-300 border-white/10 hover:bg-white/10 hover:text-white",
        loading && "opacity-50 cursor-wait"
      )}
    >
      {loading ? <Loader2 size={15} className="animate-spin" /> : <Icon size={15} />}
      {label}
    </motion.button>
  );
}

interface ModelData {
  name: string; provider: string; mode: string; status: string; model: string;
  notes?: string; description?: string; memory_usage?: string; request_limit?: string;
  requests_limit?: number; pricing?: string; last_check?: string; limitations?: string;
  docs_url?: string; show_metrics?: boolean;
}

export default function SecurityAiPremiumDrawer({
  model, isOpen, onClose,
}: {
  model: ModelData | null; isOpen: boolean; onClose: () => void;
}) {
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [actionStates, setActionStates] = useState<Record<string, "idle" | "running" | "done">>({});
  const [actionLogs, setActionLogs] = useState<Record<string, string[]>>({});
  const [showTech, setShowTech] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setTestResult(null); setShowTech(false);
      setActionStates({}); setActionLogs({});
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) { document.body.style.overflow = "hidden"; }
    else { document.body.style.overflow = ""; }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const runAction = useCallback((key: string, steps: string[], delay = 350) => {
    setActionStates(s => ({ ...s, [key]: "running" }));
    setActionLogs(s => ({ ...s, [key]: [] }));
    steps.forEach((step, i) => {
      setTimeout(() => {
        setActionLogs(s => ({ ...s, [key]: [...(s[key] || []), step] }));
      }, delay * (i + 1));
    });
    setTimeout(() => setActionStates(s => ({ ...s, [key]: "done" })), delay * steps.length + 300);
  }, []);

  const handleTestConnection = useCallback(async () => {
    if (!model) return;
    setTesting(true); setTestResult(null);
    try {
      const slug = model.name.toLowerCase().replace(/\s+/g, "-");
      const res = await apiPost(`/api/ai-models/${slug}/test`, {});
      if (res.ok && res.data) setTestResult(res.data);
      else setTestResult({ mode: "OFFLINE", connected: false, reason: res.networkError || "Indisponível", last_check: new Date().toISOString() });
    } catch { setTestResult({ mode: "OFFLINE", connected: false, reason: "Erro de rede", last_check: new Date().toISOString() }); }
    finally { setTesting(false); }
  }, [model]);

  if (!isOpen || !model) return null;

  const simRecent = {
    project: "fintech-api",
    findings: ["weak JWT secret", "open CORS policy", "outdated axios dependency"],
    riskScore: 72,
    recommendation: "Ativar rotação automática de secrets e atualizar dependências críticas.",
  };

  return (
    <AnimatePresence>
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9998]"
        onClick={onClose}
      />
      <motion.div
        key="drawer"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="fixed top-0 right-0 h-full w-full max-w-lg lg:max-w-2xl z-[9999] bg-black/85 backdrop-blur-2xl border-l border-white/[0.06] shadow-2xl shadow-black/50 flex flex-col overflow-hidden"
      >
        <div className="relative shrink-0 border-b border-white/[0.04] bg-gradient-to-r from-white/[0.02] via-transparent to-transparent">
          <div className="flex items-start justify-between p-6 pb-3">
            <div className="flex items-center gap-3">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", damping: 15 }}>
                <div className="rounded-xl bg-gradient-to-br from-cyan-500/15 to-blue-500/10 p-2.5 border border-cyan-500/20 shadow-lg shadow-cyan-500/10">
                  <Shield size={22} className="text-cyan-300" />
                </div>
              </motion.div>
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
                <p className="text-base font-bold text-gray-100 flex items-center gap-2">
                  Security AI
                  <span className="rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/20 text-[9px] px-1.5 py-0.5 font-mono">PREVIEW</span>
                </p>
                <p className="text-[11px] text-gray-500 font-medium">Internal Security Engine</p>
              </motion.div>
            </div>
            <div className="flex items-center gap-2">
              <AiModelStatusBadge status={model.mode || model.status || "offline"} />
              <motion.button
                whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="rounded-lg p-2 text-gray-500 hover:text-white hover:bg-white/10 transition-all"
              >
                <X size={18} />
              </motion.button>
            </div>
          </div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="px-6 pb-3 flex items-center gap-3 flex-wrap text-[10px] text-gray-600">
            <span className="flex items-center gap-1"><Clock size={10} />Version: 0.9-beta</span>
            <span className="w-1 h-1 rounded-full bg-gray-600" />
            <span className="flex items-center gap-1"><Database size={10} />Build: b20260510</span>
            <span className="w-1 h-1 rounded-full bg-gray-600" />
            <span className="flex items-center gap-1"><Activity size={10} />Uptime: 0h 0m</span>
            <span className="w-1 h-1 rounded-full bg-gray-600" />
            <span className="flex items-center gap-1"><RefreshCw size={10} />Last Sync: 10/05/2026 21:04</span>
          </motion.div>
        </div>

        <motion.div
          variants={stagger}
          initial="initial"
          animate="animate"
          className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar"
        >
          {/* Description */}
          <motion.div variants={fadeUp} className="rounded-xl bg-white/[0.02] border border-white/5 p-4">
            <p className="text-xs text-gray-300 leading-relaxed">{model.description}</p>
          </motion.div>

          {/* Security Runtime */}
          <motion.div variants={fadeUp}>
            <SectionHeader icon={Server} title="Security Runtime" subtitle="Preview Stage · Awaiting Deployment" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {runtimeEngines.map((e) => (
                <motion.div key={e.name} whileHover={{ scale: 1.015 }} className="rounded-xl border border-white/[0.04] bg-white/[0.01] p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={cn("rounded-lg p-1.5", e.bg)}>
                        <e.icon size={13} className={e.color} />
                      </div>
                      <span className="text-xs font-medium text-gray-200">{e.name}</span>
                    </div>
                    <span className={cn("rounded-md border px-1.5 py-0.5 text-[8px] font-mono uppercase", badgePhaseStyle(e.status))}>
                      {e.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }} animate={{ width: `${e.coverage}%` }}
                        transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
                        className={cn("h-full rounded-full", e.coverage >= 80 ? "bg-emerald-500" : e.coverage >= 60 ? "bg-amber-500" : "bg-blue-500")}
                      />
                    </div>
                    <span className="text-[9px] font-mono text-gray-500">{e.coverage}%</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Threat Intelligence */}
          <motion.div variants={fadeUp}>
            <SectionHeader icon={Siren} title="Threat Intelligence" subtitle="Última análise disponível" />
            <div className="rounded-xl border border-rose-500/15 bg-gradient-to-br from-rose-500/[0.03] to-orange-500/[0.02] p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-rose-500/10 p-1.5">
                    <AlertTriangle size={14} className="text-rose-400" />
                  </div>
                  <span className="text-xs text-rose-200 font-medium">Detecções recentes</span>
                </div>
                <motion.div
                  animate={{ opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="flex items-center gap-1.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                  <span className="text-[9px] text-rose-400 font-mono">LIVE</span>
                </motion.div>
              </div>
              <div className="space-y-1.5">
                {["JWT exposto detectado", "Config insegura encontrada", "Dependência vulnerável detectada"].map((item, i) => (
                  <motion.div
                    key={item} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 * i }}
                    className="flex items-center gap-2 text-xs text-rose-300/70"
                  >
                    <span className="w-1 h-1 rounded-full bg-rose-500/50" />
                    {item}
                  </motion.div>
                ))}
              </div>
              <div className="flex items-center gap-4 pt-1 border-t border-white/5">
                <div>
                  <p className="text-[9px] uppercase tracking-widest text-gray-500">Confidence</p>
                  <p className="text-sm font-bold text-rose-300">86%</p>
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-widest text-gray-500">Severity</p>
                  <p className="text-sm font-bold text-amber-400">Medium</p>
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-widest text-gray-500">Findings</p>
                  <p className="text-sm font-bold text-gray-200">3</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Roadmap */}
          <motion.div variants={fadeUp}>
            <SectionHeader icon={Map} title="Security Roadmap" subtitle="Próximas entregas" />
            <div className="relative pl-6 space-y-0">
              {roadmapItems.map((item, i) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * i }}
                  className="relative pb-5 last:pb-0"
                >
                  {i < roadmapItems.length - 1 && (
                    <div className={cn("absolute left-[-1.5px] top-3 w-[2px] h-full", item.line)} />
                  )}
                  <div className={cn("absolute left-[-5px] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-black", item.dot, "shadow-lg")} />
                  <div className="flex items-start gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-medium text-gray-200">{item.title}</p>
                        <span className={cn("rounded-md border px-1.5 py-0.5 text-[8px] font-mono uppercase", badgePhaseStyle(item.phase))}>
                          {item.phase}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-500 mt-0.5">{item.desc}</p>
                    </div>
                    <span className="text-[9px] text-gray-600 font-mono shrink-0">{item.date}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* AI Simulation */}
          <motion.div variants={fadeUp}>
            <SectionHeader icon={Radar} title="AI Security Simulation" subtitle="Análise simulada mais recente" />
            <div className="rounded-xl border border-cyan-500/15 bg-gradient-to-br from-cyan-500/[0.03] to-blue-500/[0.02] p-4 space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-gray-500 bg-white/[0.03] px-2 py-0.5 rounded border border-white/5">
                  Projeto: {simRecent.project}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {simRecent.findings.map((f, i) => (
                  <motion.div
                    key={f} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * i }}
                    className="rounded-lg bg-rose-500/5 border border-rose-500/10 px-2.5 py-1.5 text-[10px] text-rose-300/80 flex items-center gap-1.5"
                  >
                    <Bug size={10} className="text-rose-400 shrink-0" />
                    {f}
                  </motion.div>
                ))}
              </div>
              <div className="flex items-center gap-4 pt-1 border-t border-white/5">
                <div>
                  <p className="text-[9px] uppercase tracking-widest text-gray-500">Risk Score</p>
                  <div className="flex items-center gap-2">
                    <p className="text-lg font-bold text-amber-400">{simRecent.riskScore}%</p>
                    <div className="w-16 h-1.5 rounded-full bg-white/5 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }} animate={{ width: `${simRecent.riskScore}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="h-full rounded-full bg-gradient-to-r from-amber-500 to-rose-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="rounded-lg bg-cyan-500/5 border border-cyan-500/10 px-3 py-2">
                <p className="text-[9px] uppercase tracking-widest text-cyan-400 mb-0.5">Recomendação</p>
                <p className="text-[11px] text-cyan-300/80">{simRecent.recommendation}</p>
              </div>
            </div>
          </motion.div>

          {/* Compliance Center */}
          <motion.div variants={fadeUp}>
            <SectionHeader icon={FileCheck} title="Compliance Center" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {complianceItems.map((c) => (
                <motion.div key={c.name} whileHover={{ scale: 1.015 }} className="rounded-xl border border-white/[0.04] bg-white/[0.01] p-3 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-200">{c.name}</span>
                    <span className={cn("rounded-md border px-1.5 py-0.5 text-[8px] font-mono uppercase", badgePhaseStyle(c.status))}>
                      {c.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }} animate={{ width: `${(c.score / c.max) * 100}%` }}
                        transition={{ duration: 1, delay: 0.2 }}
                        className="h-full rounded-full bg-gradient-to-r from-gray-600 to-gray-500"
                      />
                    </div>
                    <span className="text-[9px] font-mono text-gray-500">{c.score}/{c.max}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Test Result */}
          {testing && (
            <motion.div variants={fadeIn} className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Loader2 size={12} className="animate-spin text-primary" />
                Validando ambiente de segurança...
              </div>
            </motion.div>
          )}
          {testResult && !testResult.connected && (
            <motion.div variants={fadeUp} className="rounded-xl border border-amber-500/20 bg-gradient-to-br from-amber-500/[0.05] to-orange-500/[0.02] p-4 space-y-2">
              <div className="flex items-start gap-2">
                <AlertTriangle size={16} className="text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-amber-200">Preview Stage</p>
                  <p className="text-xs text-amber-300/70">Módulo em fase de planejamento. As funcionalidades serão liberadas progressivamente.</p>
                </div>
              </div>
              <button onClick={() => setShowTech(!showTech)} className="flex items-center gap-1 text-[10px] text-gray-500 hover:text-gray-300 transition-colors">
                {showTech ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
                Ver detalhes técnicos
              </button>
              {showTech && (
                <div className="rounded-lg bg-black/40 border border-white/5 p-2.5 font-mono text-[9px] text-gray-500 leading-relaxed max-h-20 overflow-y-auto">
                  {testResult.reason || "Sem detalhes adicionais."}
                </div>
              )}
            </motion.div>
          )}

          {/* Actions */}
          <motion.div variants={fadeUp}>
            <SectionHeader icon={Zap} title="Actions" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <ActionButton icon={Map} label="Ver roadmap" onClick={() => runAction("roadmap", ["Carregando roadmap...", "Roadmap carregado."])} primary />
              <ActionButton icon={Radar} label="Simular análise" onClick={handleTestConnection} loading={testing} primary />
              <ActionButton icon={ExternalLink} label="Abrir documentação" onClick={() => runAction("docs", ["Redirecionando...", "Documentação carregada."])} />
              <ActionButton icon={FileText} label="Exportar relatório" onClick={() => runAction("report", ["Gerando relatório...", "Relatório exportado."])} />
              <ActionButton icon={ShieldIcon} label="Ver arquitetura segura" onClick={() => runAction("arch", ["Carregando blueprint...", "Arquitetura carregada."])} />
            </div>

            {/* Action Logs */}
            {Object.entries(actionLogs).map(([key, logs]) => (
              logs.length > 0 && actionStates[key] === "running" && (
                <motion.div key={key} variants={fadeIn} className="mt-2 rounded-lg bg-black/40 border border-white/5 p-2.5 font-mono text-[9px] leading-relaxed max-h-20 overflow-y-auto space-y-0.5">
                  {logs.map((l, i) => (
                    <div key={i} className="text-gray-400 flex items-center gap-1.5">
                      <Loader2 size={8} className="animate-spin text-primary shrink-0" />
                      {l}
                    </div>
                  ))}
                </motion.div>
              )
            ))}
            {Object.entries(actionStates).map(([key, state]) => (
              state === "done" && (
                <motion.div key={key} variants={fadeIn} className="mt-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-2.5 flex items-center gap-2">
                  <CheckCircle size={12} className="text-emerald-400 shrink-0" />
                  <p className="text-[10px] text-emerald-200">Operação concluída com sucesso.</p>
                </motion.div>
              )
            ))}
          </motion.div>

          {/* Future Features */}
          <motion.div variants={fadeUp}>
            <SectionHeader icon={Layers} title="Future Features" subtitle="Funcionalidades em desenvolvimento" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {futureFeatures.map((f) => (
                <motion.div key={f.name} whileHover={{ scale: 1.015 }} className="rounded-xl border border-white/[0.04] bg-white/[0.01] p-3 space-y-1.5 opacity-60 hover:opacity-80 transition-opacity">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="rounded-lg bg-gray-500/10 p-1.5">
                        <f.icon size={12} className="text-gray-500" />
                      </div>
                      <span className="text-xs text-gray-400">{f.name}</span>
                    </div>
                    <Lock size={10} className="text-gray-600" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn("rounded-md border px-1.5 py-0.5 text-[8px] font-mono uppercase", badgePhaseStyle(f.phase))}>
                      {f.phase}
                    </span>
                    <span className="text-[9px] text-gray-600 font-mono">{f.eta}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Technical Details */}
          <motion.div variants={fadeUp}>
            <SectionHeader icon={Terminal} title="Technical Details" />
            <div className="rounded-xl border border-white/5 bg-white/[0.01] overflow-hidden">
              <button
                onClick={() => setShowTech(!showTech)}
                className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Terminal size={12} className="text-gray-500" />
                  <span className="text-[10px] font-medium text-gray-500">System Info</span>
                </div>
                {showTech ? <ChevronDown size={12} className="text-gray-500" /> : <ChevronRight size={12} className="text-gray-500" />}
              </button>
              {showTech && (
                <div className="px-4 pb-4 space-y-1.5 text-[10px] text-gray-500 font-mono">
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span>Provider</span><span className="text-gray-300">{model.provider}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span>Model</span><span className="text-gray-300">{model.model}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span>Mode</span><span className="text-gray-300">{model.mode}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span>Status</span><span className="text-gray-300">{model.status}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span>Memory</span><span className="text-gray-300">{model.memory_usage || "N/A"}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>Pricing</span><span className="text-gray-300">{model.pricing || "N/A"}</span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          <div className="h-4" />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
