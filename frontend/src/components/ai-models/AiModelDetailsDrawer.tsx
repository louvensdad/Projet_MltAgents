"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Cpu,
  Sparkles,
  Brain,
  Shield,
  Zap,
  Clock,
  Globe,
  BookOpen,
  Play,
  Settings,
  Power,
  BarChart3,
  ExternalLink,
  AlertTriangle,
  CheckCircle,
  Loader2,
  FileText,
  Route,
  Layers,
  Eye,
  Map,
  Flag,
  ChevronDown,
  ChevronRight,
  Activity,
  RefreshCw,
  Gauge,
  Palette,
  Layout,
  Monitor,
  Smartphone,
  Layers as LayersIcon,
  Star,
  Wifi,
  WifiOff,
  Database,
  Timer,
  Hash,
  TrendingUp,
  Search,
  Lock,
  Shield as ShieldIcon,
  Bug,
  FileCheck,
  Users,
  Terminal,
  Server,
} from "lucide-react";
import { apiPost } from "@/lib/api";
import AiModelStatusBadge, { StatusType } from "./AiModelStatusBadge";
import AiModelHealthScore from "./AiModelHealthScore";
import SecurityAiPremiumDrawer from "./SecurityAiPremiumDrawer";

function cn(...classes: (string | false | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

interface ModelData {
  name: string;
  provider: string;
  mode: string;
  status: string;
  model: string;
  notes?: string;
  description?: string;
  memory_usage?: string;
  request_limit?: string;
  requests_limit?: number;
  pricing?: string;
  last_check?: string;
  limitations?: string;
  docs_url?: string;
  show_metrics?: boolean;
}

interface TestResult {
  mode: string;
  model: string;
  mock: boolean;
  reason: string;
  last_check: string;
  provider: string;
  connected: boolean;
}

const ICON_MAP: Record<string, React.ElementType> = {
  "Agent Boost": Sparkles,
  "Local Engine": Cpu,
  "Recommendation Engine": Brain,
  "Security AI": Shield,
  "UX AI": Zap,
};

function SmartNotes({ notes }: { notes: string }) {
  const [showRaw, setShowRaw] = useState(false);
  const isError = /(error|exception|traceback|RESOURCE_EXHAUSTED|status'?:\s*['\"]?\d{3})/i.test(notes);
  const isJson = /^\s*[\{\[]/.test(notes.trim()) && /[\}\]]\s*$/.test(notes.trim());
  const isLong = notes.length > 200;

  if (!isError && !isJson && !isLong) {
    return (
      <div>
        <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-1.5">Observações</p>
        <p className="text-sm text-gray-400 leading-relaxed">{notes}</p>
      </div>
    );
  }

  const safe = notes || "";
  const friendly = (() => {
    if (safe.includes("429") || safe.includes("RESOURCE_EXHAUSTED")) {
      return "Limite de requisições gratuito atingido. O serviço será retomado automaticamente quando a cota for restaurada.";
    }
    if (safe.includes("PLATFORM_CONNECTION") || safe.includes("platform_connection")) {
      return "Agent Boost powered by platform AI infrastructure.";
    }
    if (safe.includes("DEADLINE_EXCEEDED")) {
      return "Tempo limite excedido na requisição ao provedor.";
    }
    if (safe.includes("PERMISSION_DENIED") || safe.includes("FORBIDDEN")) {
      return "Acesso negado. Verifique as permissões da chave de API configurada.";
    }
    if (safe.includes("NOT_FOUND")) {
      return "Modelo não encontrado. Verifique a configuração da plataforma.";
    }
    return "O serviço apresentou um erro inesperado. O fallback local está ativo.";
  })();

  return (
    <div className="rounded-xl border border-amber-500/15 bg-gradient-to-br from-amber-500/[0.03] to-orange-500/[0.02] p-4 space-y-2">
      <div className="flex items-start gap-2">
        <AlertTriangle size={14} className="text-amber-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-semibold text-amber-200">Status do serviço</p>
          <p className="text-[11px] text-amber-300/70 leading-relaxed mt-0.5">{friendly}</p>
        </div>
      </div>
      <button
        onClick={() => setShowRaw(!showRaw)}
        className="flex items-center gap-1 text-[10px] text-gray-500 hover:text-gray-300 transition-colors"
      >
        {showRaw ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
        {showRaw ? "Ocultar detalhes" : "Ver detalhes técnicos"}
      </button>
      {showRaw && (
        <div className="rounded-lg bg-black/40 border border-white/5 p-2.5 font-mono text-[9px] text-gray-500 leading-relaxed max-h-28 overflow-y-auto whitespace-pre-wrap break-all">
          {safe}
        </div>
      )}
    </div>
  );
}

function FriendlyError({ reason }: { reason?: string }) {
  const [showTech, setShowTech] = useState(false);
  const safe = reason || "";
  const isQuota = safe.includes("429") || safe.toLowerCase().includes("resource_exhausted");
  const isPlatformIssue = safe.includes("PLATFORM_CONNECTION") || safe.includes("api_key");
  const isNetwork = safe.includes("timeout") || safe.includes("ECONNREFUSED");

  let title = "Conexão indisponível";
  let subtitle = "O serviço não está acessível no momento.";
  let fallbackText = "Fallback Local Engine ativo.";

  if (isQuota) {
    title = "Limite temporário atingido";
    subtitle = "O número de requisições gratuitas foi excedido. O sistema aguardará o reset para retomar.";
  } else if (isPlatformIssue) {
    title = "Plataforma indisponível";
    subtitle = "Agent Boost powered by platform AI infrastructure.";
    fallbackText = "Fallback Local Build disponível.";
  } else if (isNetwork) {
    title = "Serviço temporariamente inacessível";
    subtitle = "Não foi possível estabelecer conexão com o provedor. O sistema tentará novamente automaticamente.";
  }

  return (
    <div className="rounded-xl border border-amber-500/20 bg-gradient-to-br from-amber-500/[0.05] to-orange-500/[0.03] p-4 space-y-3">
      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-amber-500/10 p-2 shrink-0">
          <AlertTriangle size={18} className="text-amber-400" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-bold text-amber-200">{title}</p>
          <p className="text-xs text-amber-300/70 leading-relaxed">{subtitle}</p>
        </div>
      </div>

      <div className="flex items-center gap-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-3 py-2">
        <RefreshCw size={14} className="text-emerald-400 shrink-0" />
        <div>
          <p className="text-xs text-emerald-200 font-medium">Fallback ativo</p>
          <p className="text-[10px] text-emerald-300/60">{fallbackText}</p>
        </div>
      </div>

      <button
        onClick={() => setShowTech(!showTech)}
        className="flex items-center gap-1.5 text-[11px] text-gray-500 hover:text-gray-300 transition-colors"
      >
        {showTech ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        Ver detalhes técnicos
      </button>

      {showTech && (
        <div className="rounded-lg bg-black/40 border border-white/5 p-3 font-mono text-[10px] text-gray-500 leading-relaxed max-h-24 overflow-y-auto">
          {safe || "N/A"}
        </div>
      )}
    </div>
  );
}

function StepLoader({ steps, onDone }: { steps: string[]; onDone: () => void }) {
  const [current, setCurrent] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (current >= steps.length) {
      setDone(true);
      onDone();
      return;
    }
    const t = setTimeout(() => setCurrent((c) => c + 1), 400 + Math.random() * 600);
    return () => clearTimeout(t);
  }, [current, steps, onDone]);

  if (done) return null;

  return (
    <div className="space-y-1.5 rounded-lg bg-white/[0.02] border border-white/5 p-3">
      {steps.map((s, i) => (
        <div key={i} className="flex items-center gap-2 text-xs">
          {i < current ? (
            <CheckCircle size={12} className="text-emerald-500 shrink-0" />
          ) : i === current ? (
            <Loader2 size={12} className="text-primary animate-spin shrink-0" />
          ) : (
            <div className="w-3 h-3 rounded-full border border-white/10 shrink-0" />
          )}
          <span
            className={cn(
              i < current ? "text-emerald-400" : i === current ? "text-gray-200" : "text-gray-600"
            )}
          >
            {s}
          </span>
        </div>
      ))}
    </div>
  );
}

function CollapsibleSection({ title, icon: Icon, defaultOpen = false, children }: {
  title: string;
  icon: React.ElementType;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.01] overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-2">
          <Icon size={14} className="text-gray-500" />
          <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-500">{title}</span>
        </div>
        {open ? <ChevronDown size={14} className="text-gray-500" /> : <ChevronRight size={14} className="text-gray-500" />}
      </button>
      {open && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}

function LogStream({ lines }: { lines: string[] }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [lines]);
  return (
    <div ref={ref} className="rounded-lg bg-black/60 border border-white/5 p-3 font-mono text-[10px] leading-relaxed max-h-32 overflow-y-auto space-y-0.5">
      {lines.length === 0 && <span className="text-gray-600">Nenhuma entrada de log.</span>}
      {lines.map((l, i) => (
        <div key={i} className="text-gray-400">
          <span className="text-gray-600">[{String(i + 1).padStart(3, "0")}]</span> {l}
        </div>
      ))}
    </div>
  );
}

function UxSuggestions() {
  const [step, setStep] = useState<"idle" | "running" | "done">("idle");
  const [logs, setLogs] = useState<string[]>([]);
  const [styles] = useState([
    { name: "Enterprise", match: 94, desc: "Clean, professional, high-density data presentation", colors: ["#1e293b", "#3b82f6", "#f8fafc"] },
    { name: "Startup", match: 91, desc: "Bold, modern, conversion-focused with vibrant accents", colors: ["#0f172a", "#8b5cf6", "#f97316"] },
    { name: "Fintech", match: 87, desc: "Trust-oriented, secure feel with green/blue palette", colors: ["#020617", "#10b981", "#06b6d4"] },
    { name: "AI", match: 86, desc: "Futuristic glassmorphism with gradient accents", colors: ["#050508", "#a855f7", "#06b6d4"] },
    { name: "Dashboard", match: 82, desc: "Data-dense, multi-panel layout with filters", colors: ["#0c0c14", "#6366f1", "#22d3ee"] },
    { name: "Glassmorphism", match: 78, desc: "Modern frosted glass with depth and blur layers", colors: ["#1a1a2e", "#e2e8f0", "#94a3b8"] },
  ]);

  const run = () => {
    setStep("running");
    setLogs([]);
    const steps = [
      "Analisando stack do projeto...",
      "Identificando padrões de UI...",
      "Comparando com referências de mercado...",
      "Calculando compatibilidade visual...",
      "Sugestões geradas.",
    ];
    steps.forEach((s, i) => {
      setTimeout(() => setLogs((prev) => [...prev, s]), 300 * (i + 1));
    });
    setTimeout(() => setStep("done"), 300 * steps.length + 200);
  };

  return (
    <div className="space-y-3">
      {step === "idle" && (
        <button onClick={run} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-all">
          <Play size={14} /> Gerar sugestões UX
        </button>
      )}
      {step === "running" && <LogStream lines={logs} />}
      {step === "done" && (
        <div className="space-y-3">
          <p className="text-[11px] text-emerald-400 font-medium flex items-center gap-1.5">
            <CheckCircle size={13} /> Sugestões geradas com base no perfil do projeto
          </p>
          <div className="grid gap-2">
            {styles.map((s) => (
              <div key={s.name} className="rounded-lg border border-white/5 bg-white/[0.02] p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-200">{s.name}</span>
                    <span className="rounded-md bg-emerald-500/15 text-emerald-300 text-[10px] px-1.5 py-0.5 font-mono">{s.match}%</span>
                  </div>
                  <div className="flex gap-1">
                    {s.colors.map((c, i) => (
                      <div key={i} className="w-4 h-4 rounded-full border border-white/10" style={{ backgroundColor: c }} />
                    ))}
                  </div>
                </div>
                <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-primary to-violet-500 transition-all" style={{ width: `${s.match}%` }} />
                </div>
                <p className="text-[10px] text-gray-500">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function CompatibilityView() {
  const [step, setStep] = useState<"idle" | "running" | "done">("idle");
  const [logs, setLogs] = useState<string[]>([]);
  const [compat] = useState([
    { stack: "FastAPI + React", score: 98, badge: "Native", desc: "Combinação ideal para projetos SaaS modernos com API assíncrona." },
    { stack: "Spring Boot + Angular", score: 96, badge: "Enterprise", desc: "Stack enterprise madura e amplamente adotada no mercado." },
    { stack: "Laravel + Vue", score: 94, badge: "Full-Stack", desc: "Produtividade elevada com ecossistema PHP integrado." },
    { stack: "NestJS + Next.js", score: 93, badge: "Full-Stack TS", desc: "TypeScript end-to-end com performance e escalabilidade." },
    { stack: "Express + React", score: 89, badge: "Flexível", desc: "Stack leve e flexível para aplicações web tradicionais." },
    { stack: "ASP.NET + Blazor", score: 87, badge: "Microsoft", desc: "Plataforma Microsoft unificada para aplicações enterprise." },
  ]);

  const run = () => {
    setStep("running");
    setLogs([]);
    const steps = [
      "Carregando matriz de compatibilidade...",
      "Analisando stacks disponíveis...",
      "Verificando versões e dependências...",
      "Compatibilidade calculada.",
    ];
    steps.forEach((s, i) => {
      setTimeout(() => setLogs((prev) => [...prev, s]), 350 * (i + 1));
    });
    setTimeout(() => setStep("done"), 350 * steps.length + 200);
  };

  return (
    <div className="space-y-3">
      {step === "idle" && (
        <button onClick={run} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-all">
          <Play size={14} /> Analisar compatibilidade
        </button>
      )}
      {step === "running" && <LogStream lines={logs} />}
      {step === "done" && (
        <div className="space-y-3">
          <p className="text-[11px] text-emerald-400 font-medium flex items-center gap-1.5">
            <CheckCircle size={13} /> Matriz de compatibilidade atualizada
          </p>
          <div className="grid gap-2">
            {compat.map((c) => (
              <div key={c.stack} className="rounded-lg border border-white/5 bg-white/[0.02] p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-200">{c.stack}</span>
                  <span className="rounded-md bg-emerald-500/15 text-emerald-300 text-[10px] px-1.5 py-0.5 font-mono">{c.score}%</span>
                </div>
                <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      c.score >= 95 ? "bg-gradient-to-r from-emerald-500 to-emerald-400" : "bg-gradient-to-r from-primary to-violet-500"
                    )}
                    style={{ width: `${c.score}%` }}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-[10px] text-gray-500">{c.desc}</p>
                  <span className="text-[9px] font-mono text-gray-600 bg-white/[0.03] px-1.5 py-0.5 rounded">{c.badge}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SecurityRoadmap() {
  const [features] = useState([
    { name: "OWASP Top 10 Scanner", status: "beta", eta: "Q2 2026", desc: "Varredura automática das 10 vulnerabilidades críticas OWASP." },
    { name: "Secrets Detection", status: "planned", eta: "Q3 2026", desc: "Detecção de chaves, tokens e senhas em código fonte." },
    { name: "Dependency Audit", status: "planned", eta: "Q3 2026", desc: "Auditoria de dependências com análise de CVEs conhecidos." },
    { name: "Docker Scan", status: "future", eta: "Q4 2026", desc: "Análise de segurança em imagens Docker e Dockerfiles." },
    { name: "LGPD Validation", status: "future", eta: "2027", desc: "Validação automática de conformidade com a LGPD." },
    { name: "JWT Analyzer", status: "beta", eta: "Q2 2026", desc: "Análise de tokens JWT: expiração, assinatura e claims." },
  ]);

  const badgeStyles: Record<string, string> = {
    beta: "bg-emerald-500/15 text-emerald-300 border-emerald-500/20",
    planned: "bg-blue-500/15 text-blue-300 border-blue-500/20",
    future: "bg-gray-500/15 text-gray-400 border-gray-500/20",
  };

  return (
    <div className="space-y-2">
      <p className="text-[11px] text-gray-400">Roadmap de funcionalidades de segurança</p>
      <div className="space-y-2">
        {features.map((f) => (
          <div key={f.name} className="rounded-lg border border-white/5 bg-white/[0.02] p-3 flex items-start gap-3">
            <div className={cn("rounded-md border px-1.5 py-0.5 text-[9px] font-mono uppercase shrink-0 mt-0.5", badgeStyles[f.status] || "")}>
              {f.status}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-xs font-medium text-gray-200">{f.name}</p>
                <span className="text-[9px] text-gray-600 font-mono">{f.eta}</span>
              </div>
              <p className="text-[10px] text-gray-500 mt-0.5">{f.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LocalEngineDetails() {
  const [stats] = useState({
    cacheHits: 847,
    cacheMiss: 23,
    avgLatency: "4.2ms",
    lastFallback: "22s atrás",
    fallbackReason: "Agent Boost quota exceeded",
    mode: "offline-motor",
  });

  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 flex items-start gap-2">
        <Shield size={14} className="text-emerald-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-xs text-emerald-200 font-medium">Proteção de disponibilidade ativa</p>
          <p className="text-[10px] text-emerald-300/60">Gerando respostas localmente durante indisponibilidade externa.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-lg bg-white/[0.02] border border-white/5 px-3 py-2">
          <p className="text-[9px] uppercase tracking-widest text-gray-500">Cache Hits</p>
          <p className="text-sm font-bold text-emerald-300">{stats.cacheHits.toLocaleString()}</p>
        </div>
        <div className="rounded-lg bg-white/[0.02] border border-white/5 px-3 py-2">
          <p className="text-[9px] uppercase tracking-widest text-gray-500">Cache Miss</p>
          <p className="text-sm font-bold text-amber-300">{stats.cacheMiss}</p>
        </div>
        <div className="rounded-lg bg-white/[0.02] border border-white/5 px-3 py-2">
          <p className="text-[9px] uppercase tracking-widest text-gray-500">Latência Média</p>
          <p className="text-sm font-bold text-gray-200">{stats.avgLatency}</p>
        </div>
        <div className="rounded-lg bg-white/[0.02] border border-white/5 px-3 py-2">
          <p className="text-[9px] uppercase tracking-widest text-gray-500">Último Fallback</p>
          <p className="text-sm font-bold text-gray-200">{stats.lastFallback}</p>
        </div>
      </div>

      <div className="rounded-lg bg-amber-500/5 border border-amber-500/15 px-3 py-2">
        <p className="text-[9px] uppercase tracking-widest text-amber-400 mb-0.5">Motivo do Fallback</p>
        <p className="text-xs text-amber-300/80">{stats.fallbackReason}</p>
      </div>
    </div>
  );
}

export default function AiModelDetailsDrawer({
  model,
  isOpen,
  onClose,
}: {
  model: ModelData | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [showTechError, setShowTechError] = useState(false);
  const [actionState, setActionState] = useState<Record<string, "idle" | "running" | "done">>({});
  const [actionLogs, setActionLogs] = useState<Record<string, string[]>>({});

  useEffect(() => {
    if (!isOpen) {
      setTestResult(null);
      setShowTechError(false);
      setActionState({});
      setActionLogs({});
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const handleTestConnection = useCallback(async () => {
    if (!model) return;
    setTesting(true);
    setTestResult(null);
    setShowTechError(false);
    try {
      const slug = model.name.toLowerCase().replace(/\s+/g, "-");
      const res = await apiPost<TestResult>(`/api/ai-models/${slug}/test`, {});
      if (res.ok && res.data) {
        setTestResult(res.data);
      } else {
        const msg = res.networkError || res.backendError?.message || "Serviço temporariamente indisponível";
        setTestResult({
          mode: "OFFLINE",
          model: model.model || "unknown",
          mock: true,
          reason: msg,
          last_check: new Date().toISOString(),
          provider: model.provider,
          connected: false,
        });
      }
    } catch (err) {
      setTestResult({
        mode: "OFFLINE",
        model: model.model || "unknown",
        mock: true,
        reason: err instanceof Error ? err.message : "Erro inesperado",
        last_check: new Date().toISOString(),
        provider: model.provider,
        connected: false,
      });
    } finally {
      setTesting(false);
    }
  }, [model]);

  const runAction = useCallback((actionKey: string, steps: string[]) => {
    setActionState((s) => ({ ...s, [actionKey]: "running" }));
    setActionLogs((s) => ({ ...s, [actionKey]: [] }));
    steps.forEach((step, i) => {
      setTimeout(() => {
        setActionLogs((s) => ({
          ...s,
          [actionKey]: [...(s[actionKey] || []), step],
        }));
      }, 350 * (i + 1));
    });
    setTimeout(() => {
      setActionState((s) => ({ ...s, [actionKey]: "done" }));
    }, 350 * steps.length + 300);
  }, []);

  if (model?.name === "Security AI") {
    return <SecurityAiPremiumDrawer model={model} isOpen={isOpen} onClose={onClose} />;
  }

  const Icon = model ? (ICON_MAP[model.name] || Cpu) : Cpu;
  const isPlanned = model ? (model.status === "planned" || model.show_metrics === false) : true;

  const friendlyStatus: StatusType = !model ? "planned"
    : (model.status === "planned" || isPlanned)
    ? "planned"
    : model.mode === "GEMINI_ERROR" ? "PLATFORM_ERROR"
    : model.mode === "MOCK_MODE" ? "MOCK_MODE"
    : model.mode === "ACTIVE" ? "ACTIVE"
    : model.status as StatusType;

  const geminiTestSteps = ["Validando conexão...", "Conectando à plataforma...", "Verificando disponibilidade...", "Teste concluído."];
  const localTestSteps = ["Inicializando motor local...", "Verificando cache...", "Teste de resposta concluído."];
  const recoTestSteps = ["Carregando regras de recomendação...", "Analisando stacks disponíveis...", "Compatibilidade calculada."];
  const uxTestSteps = ["Analisando perfil do projeto...", "Gerando sugestões visuais...", "Sugestões prontas."];

  return (
    <AnimatePresence>
      {isOpen && model && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />

          <motion.div
            className={cn(
              "fixed top-0 right-0 h-full w-full z-[9999]",
              "max-w-lg lg:max-w-2xl",
              "bg-black/80 backdrop-blur-2xl border-l border-white/10",
              "shadow-2xl shadow-black/50",
              "flex flex-col"
            )}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
        <div className="relative shrink-0 border-b border-white/5 bg-gradient-to-r from-white/[0.02] to-transparent">
          <div className="flex items-start justify-between p-6 pb-4">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "rounded-xl p-2.5",
                  model.status === "active" ? "bg-emerald-500/10 text-emerald-400 shadow-lg shadow-emerald-500/10" :
                  model.status === "mock" ? "bg-emerald-500/10 text-emerald-400 shadow-lg shadow-emerald-500/10" :
                  "bg-gray-500/10 text-gray-500"
                )}
              >
                <Icon size={22} />
              </div>
              <div>
                <p className="text-base font-bold text-gray-100">{model.name}</p>
                <p className="text-[11px] text-gray-500 font-medium">{model.provider}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <AiModelStatusBadge status={friendlyStatus} />
              <button
                onClick={onClose}
                className="rounded-lg p-2 text-gray-500 hover:text-white hover:bg-white/10 transition-all"
                aria-label="Fechar detalhes"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {!isPlanned && (
            <div className="px-6 pb-4 flex items-center gap-2 flex-wrap">
              {model.mode && (
                <span className={cn(
                  "rounded-md border px-2 py-0.5 text-[10px] font-mono",
                  model.mode === "GEMINI_CONNECTED" ? "bg-violet-500/10 text-violet-300 border-violet-500/20" :
                  model.mode === "MOCK_MODE" ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20" :
                  model.mode === "GEMINI_ERROR" ? "bg-rose-500/10 text-rose-300 border-rose-500/20" :
                  model.mode === "ACTIVE" ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20" :
                  model.mode === "OFFLINE" ? "bg-gray-500/10 text-gray-400 border-gray-500/20" :
                  "bg-white/5 text-gray-400 border-white/10"
                )}>
                  {model.mode}
                </span>
              )}
              {model.model && (
                <span className="text-[10px] font-mono text-gray-500 bg-white/[0.03] px-2 py-0.5 rounded-md border border-white/5">
                  {model.model}
                </span>
              )}
              {model.last_check && (
                <span className="flex items-center gap-1 text-[10px] text-gray-600 ml-auto">
                  <Clock size={10} />
                  {new Date(model.last_check).toLocaleString("pt-BR")}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5 no-scrollbar">
          {isPlanned && (
            <div className="flex items-center gap-2">
              <span className="rounded-md border border-blue-500/20 bg-blue-500/10 px-2 py-0.5 text-[10px] font-mono text-blue-300">roadmap</span>
            </div>
          )}

          {/* Description */}
          {model.description && (
            <div className="rounded-xl bg-white/[0.02] border border-white/5 p-4">
              <p className="text-xs text-gray-300 leading-relaxed">{model.description}</p>
            </div>
          )}

          {model.notes && !testResult && (
            <SmartNotes notes={model.notes} />
          )}

          {/* Health Score */}
          <AiModelHealthScore model={model} />

          {/* Limitations */}
          {model.limitations && (
            <div className="rounded-xl border border-amber-500/10 bg-amber-500/[0.02] p-3">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle size={12} className="text-amber-400" />
                <p className="text-[10px] uppercase tracking-widest text-amber-400">Limitações</p>
              </div>
              <p className="text-xs text-amber-300/70">{model.limitations}</p>
            </div>
          )}

          {/* Metrics */}
          {!isPlanned && (
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-xl bg-white/[0.02] border border-white/5 px-3 py-2.5">
                <p className="text-[9px] uppercase tracking-widest text-gray-500">Memória</p>
                <p className="text-sm font-bold text-gray-100">{model.memory_usage || "N/A"}</p>
              </div>
              <div className="rounded-xl bg-white/[0.02] border border-white/5 px-3 py-2.5">
                <p className="text-[9px] uppercase tracking-widest text-gray-500">Requests</p>
                <p className="text-sm font-bold text-gray-100">{model.request_limit || "N/A"}</p>
              </div>
              <div className="rounded-xl bg-white/[0.02] border border-white/5 px-3 py-2.5">
                <p className="text-[9px] uppercase tracking-widest text-gray-500">Preço</p>
                <p className="text-sm font-bold text-gray-100">{model.pricing || "N/A"}</p>
              </div>
            </div>
          )}

          {/* Test Result - Friendly */}
          {testing && (
            <StepLoader steps={geminiTestSteps} onDone={() => {}} />
          )}

          {testResult && !testResult.connected && (
            <FriendlyError reason={testResult.reason} />
          )}

          {testResult && testResult.connected && (
            <div className="rounded-xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/[0.05] to-cyan-500/[0.02] p-4 flex items-start gap-3">
              <div className="rounded-lg bg-emerald-500/10 p-2 shrink-0">
                <CheckCircle size={18} className="text-emerald-400" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-emerald-200">Conexão validada</p>
                <p className="text-xs text-emerald-300/70">O serviço está operacional e respondendo normalmente.</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className={cn(
                    "rounded-md border px-1.5 py-0.5 text-[9px] font-mono",
                    "bg-cyan-500/10 text-cyan-300 border-cyan-500/20"
                  )}>
                    {testResult.mode}
                  </span>
                  <span className="text-[10px] text-gray-500">{testResult.model}</span>
                </div>
              </div>
            </div>
          )}

          {/* Model-specific panels */}
          {model.name === "UX AI" && !isPlanned && (
            <CollapsibleSection title="Sugestões de UX" icon={Palette}>
              <UxSuggestions />
            </CollapsibleSection>
          )}

          {model.name === "Recommendation Engine" && !isPlanned && (
            <CollapsibleSection title="Compatibilidade de Stacks" icon={LayersIcon}>
              <CompatibilityView />
            </CollapsibleSection>
          )}

          {model.name === "Security AI" && (
            <CollapsibleSection title="Roadmap de Segurança" icon={ShieldIcon} defaultOpen>
              <SecurityRoadmap />
            </CollapsibleSection>
          )}

          {model.name === "Local Engine" && !isPlanned && (
            <CollapsibleSection title="Detalhes do Motor Local" icon={Server} defaultOpen>
              <LocalEngineDetails />
            </CollapsibleSection>
          )}

          {/* Actions */}
          {!isPlanned && (
            <div className="space-y-2">
              <p className="text-[10px] uppercase tracking-widest text-gray-500 flex items-center gap-1.5">
                <Zap size={12} /> Ações
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {/* Test Connection - only for Agent Boost */}
                {model.name === "Agent Boost" && (
                  <button
                    onClick={handleTestConnection}
                    disabled={testing}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-all disabled:opacity-50 disabled:cursor-wait"
                    aria-label="Testar conexão"
                  >
                    {testing ? <Loader2 size={15} className="animate-spin" /> : <Play size={15} />}
                    Testar conexão
                  </button>
                )}

                {/* Test Mock - Local Engine */}
                {model.name === "Local Engine" && (
                  <button
                    onClick={() => runAction("mock_test", localTestSteps)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-all"
                    aria-label="Testar resposta"
                  >
                    <Play size={15} /> Testar resposta
                  </button>
                )}

                {/* Generate UX Suggestions */}
                {model.name === "UX AI" && (
                  <button
                    onClick={() => runAction("ux_test", uxTestSteps)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-all"
                    aria-label="Testar sugestão UX"
                  >
                    <Play size={15} /> Gerar sugestão
                  </button>
                )}

                {/* Test Recommendation */}
                {model.name === "Recommendation Engine" && (
                  <button
                    onClick={() => runAction("reco_test", recoTestSteps)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-all"
                    aria-label="Testar recomendação"
                  >
                    <Play size={15} /> Recomendar stacks
                  </button>
                )}

                {/* Ver configuração - Agent Boost */}
                {model.name === "Agent Boost" && (
                  <button
                    onClick={() => runAction("config", ["Carregando configuração...", "Configuração carregada."])}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-white/[0.03] text-gray-300 border border-white/10 hover:bg-white/10 hover:text-white transition-all"
                    aria-label="Ver configuração"
                  >
                    <Settings size={15} /> Configuração
                  </button>
                )}

                {/* Ver Uso - Agent Boost */}
                {model.name === "Agent Boost" && (
                  <button
                    onClick={() => runAction("usage", ["Consultando uso...", "Uso carregado."])}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-white/[0.03] text-gray-300 border border-white/10 hover:bg-white/10 hover:text-white transition-all"
                    aria-label="Ver uso"
                  >
                    <BarChart3 size={15} /> Uso
                  </button>
                )}

                {/* Ver Docs */}
                {model.name === "Agent Boost" && model.docs_url && (
                  <button
                    onClick={() => window.open(model.docs_url, "_blank")}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-white/[0.03] text-gray-300 border border-white/10 hover:bg-white/10 hover:text-white transition-all"
                    aria-label="Abrir documentação"
                  >
                    <ExternalLink size={15} /> Documentação
                  </button>
                )}

                {/* Ver Logs - Local Engine */}
                {model.name === "Local Engine" && (
                  <button
                    onClick={() => runAction("logs", ["Acessando logs do motor...", "Logs carregados."])}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-white/[0.03] text-gray-300 border border-white/10 hover:bg-white/10 hover:text-white transition-all"
                    aria-label="Ver logs"
                  >
                    <FileText size={15} /> Logs
                  </button>
                )}

                {/* Ver Regras - Recommendation */}
                {model.name === "Recommendation Engine" && (
                  <button
                    onClick={() => runAction("rules", ["Carregando regras...", "Regras carregadas."])}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-white/[0.03] text-gray-300 border border-white/10 hover:bg-white/10 hover:text-white transition-all"
                    aria-label="Ver regras"
                  >
                    <BookOpen size={15} /> Regras
                  </button>
                )}
              </div>

              {/* Action Logs */}
              {Object.entries(actionLogs).map(([key, logs]) => (
                logs.length > 0 && actionState[key] === "running" && (
                  <div key={key}>
                    <LogStream lines={logs} />
                  </div>
                )
              ))}

              {/* Action Done feedback */}
              {Object.entries(actionState).map(([key, state]) => (
                state === "done" && (
                  <div key={key} className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 flex items-center gap-2">
                    <CheckCircle size={14} className="text-emerald-400 shrink-0" />
                    <p className="text-xs text-emerald-200">Operação concluída com sucesso.</p>
                  </div>
                )
              ))}
            </div>
          )}

          {/* Technical Details (collapsible) */}
          <CollapsibleSection title="Detalhes Técnicos" icon={Terminal}>
            <div className="space-y-2 text-xs text-gray-400">
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-gray-500">Provider</span>
                <span className="text-gray-200 font-mono">{model.provider}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-gray-500">Modelo</span>
                <span className="text-gray-200 font-mono">{model.model}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-gray-500">Modo</span>
                <span className="text-gray-200 font-mono">{model.mode}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-gray-500">Status</span>
                <span className="text-gray-200 font-mono">{model.status}</span>
              </div>
              {model.memory_usage && (
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-gray-500">Memória</span>
                  <span className="text-gray-200 font-mono">{model.memory_usage}</span>
                </div>
              )}
              {model.requests_limit !== undefined && (
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-gray-500">Limite (núm.)</span>
                  <span className="text-gray-200 font-mono">{model.requests_limit}/dia</span>
                </div>
              )}
              {model.pricing && (
                <div className="flex justify-between py-1">
                  <span className="text-gray-500">Preço</span>
                  <span className="text-gray-200 font-mono">{model.pricing}</span>
                </div>
              )}
            </div>
          </CollapsibleSection>

          {/* AI Activity */}
          <CollapsibleSection title="Atividade Recente" icon={Activity}>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs py-1.5 border-b border-white/5">
                <span className="text-gray-400 flex items-center gap-1.5"><FileText size={11} /> Docs analisadas</span>
                <span className="text-gray-500 font-mono">12 docs</span>
              </div>
              <div className="flex items-center justify-between text-xs py-1.5 border-b border-white/5">
                <span className="text-gray-400 flex items-center gap-1.5"><Timer size={11} /> Tempo médio de resposta</span>
                <span className="text-gray-500 font-mono">{model.name === "Agent Boost" ? "1.2s" : "4ms"}</span>
              </div>
              <div className="flex items-center justify-between text-xs py-1.5 border-b border-white/5">
                <span className="text-gray-400 flex items-center gap-1.5"><Hash size={11} /> Stacks processadas</span>
                <span className="text-gray-500 font-mono">{model.name === "Recommendation Engine" ? "12 stacks" : model.name === "Agent Boost" ? "7 projetos" : "N/A"}</span>
              </div>
              <div className="flex items-center justify-between text-xs py-1.5">
                <span className="text-gray-400 flex items-center gap-1.5"><Activity size={11} /> Última atividade</span>
                <span className="text-gray-500 font-mono">{model.last_check ? new Date(model.last_check).toLocaleString("pt-BR") : "N/A"}</span>
              </div>
            </div>
          </CollapsibleSection>

          <div className="h-4" />
        </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
