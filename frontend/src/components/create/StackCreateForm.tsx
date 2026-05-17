"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Check, Loader2, Sparkles, AlertTriangle, Server, Database, Shield,
  Layers, GitBranch, Cpu, Zap, Globe, Lock, TestTube, MessageSquare, BookOpen,
  Wifi, Lightbulb, Rocket, Palette, Box, ChevronRight, Eye, Download, Info,
  ChevronDown, Radio, ScanLine, FileCode, Upload, Cpu as CpuIcon,
} from "lucide-react";
import StatusBadge from "@/components/common/StatusBadge";
import { getStackMaturity } from "@/lib/stack-maturity";
import LiveGenerationModal from "@/components/generation/LiveGenerationModal";
import type { GenerationEvent, DocEvent } from "@/lib/generation-types";
import { getApiBaseUrl } from "@/lib/config";

export interface FeatureItem {
  name: string;
  icon: any;
  description: string;
  impact: "core" | "high" | "enterprise" | "medium";
}

export interface ArchNode {
  label: string;
  type: "frontend" | "backend" | "gateway" | "database" | "cache" | "worker" | "realtime" | "deploy";
}

export interface CreatePageConfig {
  id: string;
  name: string;
  description: string;
  icon: any;
  gradient: string;
  maturity?: { score: number; level: string };
  versionLabel: string;
  versionOptions: { value: string; label: string; description?: string }[];
  sections: {
    title: string;
    icon: any;
    options: { value: string; label: string; description?: string }[];
    multiple?: boolean;
  }[];
  recommendedFrontend?: string[];
  databaseOptions?: string[];
  authOptions?: string[];
  forbiddenTerms?: string[];
  hasBackend?: boolean;
  architecturePreview?: ArchNode[];
  projectStructure?: string[];
  compatibleBackends?: string[];
  frontendCompatibility?: string[];
  avoid?: string[];
  aiInsights?: string[];
  willGenerate?: string[];
  features?: FeatureItem[];
}

const NAV_SECTIONS = [
  { id: "overview", label: "Overview", icon: Eye },
  { id: "features", label: "Features", icon: CpuIcon },
  { id: "architecture", label: "Architecture", icon: GitBranch },
  { id: "insights", label: "AI Insights", icon: Lightbulb },
  { id: "generation", label: "Generation", icon: FileCode },
  { id: "deploy", label: "Deploy", icon: Upload },
];

const IMPACT_CONFIG: Record<string, { label: string; color: string }> = {
  core: { label: "Core", color: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" },
  high: { label: "High", color: "border-blue-500/30 bg-blue-500/10 text-blue-300" },
  enterprise: { label: "Enterprise", color: "border-purple-500/30 bg-purple-500/10 text-purple-300" },
  medium: { label: "Med", color: "border-gray-500/30 bg-gray-500/10 text-gray-300" },
};

const ARCH_COLORS: Record<string, string> = {
  frontend: "border-sky-500/30 bg-sky-500/10 text-sky-300",
  backend: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  gateway: "border-indigo-500/30 bg-indigo-500/10 text-indigo-300",
  database: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  cache: "border-rose-500/30 bg-rose-500/10 text-rose-300",
  worker: "border-violet-500/30 bg-violet-500/10 text-violet-300",
  realtime: "border-cyan-500/30 bg-cyan-500/10 text-cyan-300",
  deploy: "border-gray-500/30 bg-gray-500/10 text-gray-300",
};

const LOADING_STEPS = [
  "Validating architecture...",
  "Checking compatibility...",
  "Generating blueprint...",
  "Building project structure...",
  "Configuring dependencies...",
  "Optimizing for production...",
];

export default function StackCreateForm({ config }: { config: CreatePageConfig }) {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState("overview");
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [showGenerationModal, setShowGenerationModal] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [formData, setFormData] = useState<Record<string, any>>({
    project_name: "",
    project_description: "",
    version: config.versionOptions[0]?.value || "",
    selections: {} as Record<string, string[]>,
  });

  const maturity = useMemo(() => {
    if (config.maturity) return config.maturity;
    const m = getStackMaturity(config.id);
    return m ? { score: m.score, level: m.level } : null;
  }, [config]);

  const Icon = config.icon;

  const toggleSelection = (sectionTitle: string, value: string) => {
    const current = formData.selections[sectionTitle] || [];
    const updated = current.includes(value)
      ? current.filter((v: string) => v !== value)
      : [...current, value];
    setFormData({ ...formData, selections: { ...formData.selections, [sectionTitle]: updated } });
    setValidationErrors([]);
  };

  const setSingleSelection = (sectionTitle: string, value: string) => {
    setFormData({ ...formData, selections: { ...formData.selections, [sectionTitle]: [value] } });
    setValidationErrors([]);
  };

  const validateForm = (): boolean => {
    const errors: string[] = [];
    if (!formData.project_name.trim()) errors.push("Nome do projeto é obrigatório");
    if (!formData.version) errors.push("Selecione uma versão");
    for (const section of config.sections) {
      if (!section.multiple) {
        const sel = formData.selections[section.title];
        if (!sel || sel.length === 0) errors.push(`Selecione ${section.title.toLowerCase()}`);
      }
    }
    const projectNameLower = formData.project_name.toLowerCase();
    if (config.forbiddenTerms) {
      for (const term of config.forbiddenTerms) {
        if (projectNameLower.includes(term.toLowerCase())) {
          errors.push(`Termo '${term}' não é compatível com ${config.name}`);
        }
      }
    }
    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) { setActiveSection("overview"); return; }
    setLoading(true);
    setError(null);

    const payload = {
      project_type: config.hasBackend !== false ? "backend" : "frontend",
      stack_profile_id: config.id,
      project_name: formData.project_name,
      project_description: formData.project_description,
      backend_stack: config.hasBackend !== false ? config.name : null,
      frontend_stack: config.hasBackend === false ? config.name : (formData.selections["Frontend"]?.[0] || null),
      selected_versions: { [config.versionLabel]: formData.version },
      selected_stack_options: formData.selections,
      confirmed_entities: [],
      confirmed_features: [],
      confirmed_business_rules: [],
    };

    try {
      const res = await fetch(`${getApiBaseUrl()}/api/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || data?.success === false) {
        setError(data?.message || "Erro ao criar projeto");
        setLoading(false);
        return;
      }
      const pid = data?.project_id || formData.project_name;
      setJobId(`gen_${pid}_${Date.now()}`);
      setLoading(false);
      setShowGenerationModal(true);
    } catch (e) {
      setError("Erro de conexão com o backend. Verifique se o servidor está rodando.");
      setLoading(false);
    }
  };

  const selectedCount = useMemo(() => {
    return Object.values(formData.selections).reduce((acc: number, v: any) => acc + (Array.isArray(v) ? v.length : 0), 0);
  }, [formData.selections]);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16">
        <div className="rounded-2xl border border-white/10 bg-surface p-12 text-center space-y-8">
          <div className="flex justify-center">
            <div className="relative">
              <div className="h-20 w-20 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
              <ScanLine size={28} className="absolute inset-0 m-auto text-primary animate-pulse" />
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-lg font-bold text-gray-100 animate-pulse">{LOADING_STEPS[loadingStep]}</p>
            <div className="mx-auto flex justify-center gap-1.5">
              {LOADING_STEPS.map((_, i) => (
                <div key={i} className={`h-1.5 w-12 rounded-full transition-all duration-500 ${i <= loadingStep ? "bg-primary" : "bg-white/10"}`} />
              ))}
            </div>
          </div>
          <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
            <span>Preparando sua fábrica de software...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Back */}
      <button onClick={() => router.push("/create")} className="mb-6 flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
        <ArrowLeft size={16} /> Voltar para categorias
      </button>

      <div className="flex gap-8">
        {/* Floating Sidebar */}
        <aside className="hidden xl:block w-56 shrink-0">
          <div className="sticky top-8 space-y-1 rounded-xl border border-white/10 bg-surface p-3">
            {NAV_SECTIONS.map((s) => {
              const SIcon = s.icon;
              return (
                <button
                  key={s.id}
                  onClick={() => setActiveSection(s.id)}
                  className={`flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm transition-all ${
                    activeSection === s.id
                      ? "bg-primary/10 text-primary border border-primary/20"
                      : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
                  }`}
                >
                  <SIcon size={16} />
                  <span className="font-medium">{s.label}</span>
                </button>
              );
            })}
            <div className="border-t border-white/10 pt-3 mt-3">
              <button
                onClick={handleSubmit}
                disabled={!formData.project_name.trim()}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary/90 transition-all disabled:opacity-40"
              >
                <Rocket size={16} />
                Gerar
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 min-w-0 space-y-8">
          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-200">
              <AlertTriangle size={16} /> {error}
            </div>
          )}

          {validationErrors.length > 0 && (
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
              {validationErrors.map((err, i) => (
                <p key={i} className="flex items-center gap-2 text-sm text-amber-200"><AlertTriangle size={14} /> {err}</p>
              ))}
            </div>
          )}

          {/* ===== OVERVIEW ===== */}
          {activeSection === "overview" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              {/* Hero */}
              <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#0c0c1a] via-[#0a0a18] to-[#060612] p-8">
                <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-blue-500/10 blur-[80px]" />
                <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-5">
                    <div className={`rounded-2xl bg-gradient-to-br ${config.gradient} p-4 shadow-lg`}>
                      <Icon size={36} className="text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 flex-wrap">
                        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white via-blue-100 to-indigo-200 bg-clip-text text-transparent">
                          {config.name}
                        </h1>
                        {maturity && (
                          <StatusBadge status={maturity.level} maturityScore={maturity.score} />
                        )}
                      </div>
                      <p className="mt-2 text-gray-400 max-w-xl">{config.description}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveSection("features")}
                    className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all shrink-0"
                  >
                    Configurar <ChevronRight size={16} />
                  </button>
                </div>
              </div>

              {/* Project info + version */}
              <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-xl border border-white/10 bg-surface p-6">
                  <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-gray-400">Informações do Projeto</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-300">Nome do Projeto *</label>
                      <input
                        type="text"
                        value={formData.project_name}
                        onChange={(e) => setFormData({ ...formData, project_name: e.target.value })}
                        placeholder={`Meu ${config.name}`}
                        className="w-full rounded-lg border border-white/10 bg-black/20 px-4 py-2.5 text-sm text-white outline-none focus:border-primary/50 transition-all placeholder:text-gray-600"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-300">Descrição</label>
                      <textarea
                        value={formData.project_description}
                        onChange={(e) => setFormData({ ...formData, project_description: e.target.value })}
                        placeholder="Descreva brevemente o propósito do projeto"
                        rows={3}
                        className="w-full rounded-lg border border-white/10 bg-black/20 px-4 py-2.5 text-sm text-white outline-none focus:border-primary/50 transition-all placeholder:text-gray-600"
                      />
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-surface p-6">
                  <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-gray-400">{config.versionLabel}</h2>
                  <div className="flex flex-wrap gap-2">
                    {config.versionOptions.map((v) => (
                      <button
                        key={v.value}
                        onClick={() => setFormData({ ...formData, version: v.value })}
                        className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm transition-all ${
                          formData.version === v.value
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-white/10 text-gray-400 hover:border-white/30 hover:text-gray-200"
                        }`}
                      >
                        {formData.version === v.value && <Check size={14} />}
                        {v.label}
                        {v.description && <span className="text-[10px] text-gray-500">({v.description})</span>}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Info cards */}
              <div className="grid gap-4 md:grid-cols-3">
                {config.recommendedFrontend && config.recommendedFrontend.length > 0 && (
                  <div className="rounded-xl border border-primary/20 bg-primary/5 p-5">
                    <p className="text-xs font-bold uppercase tracking-widest text-primary">Frontend Recomendado</p>
                    <p className="mt-2 text-sm text-gray-300">{config.recommendedFrontend.join(", ")}</p>
                  </div>
                )}
                {config.compatibleBackends && (
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5">
                    <p className="text-xs font-bold uppercase tracking-widest text-emerald-400">Backends</p>
                    <p className="mt-2 text-sm text-gray-300">{config.compatibleBackends.join(", ")}</p>
                  </div>
                )}
                <div className="rounded-xl border border-white/10 bg-surface p-5">
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Complexidade</p>
                  <p className="mt-2 text-sm text-gray-300">
                    {config.sections.length > 6 ? "Alta" : config.sections.length > 4 ? "Média" : "Baixa"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ===== FEATURES ===== */}
          {activeSection === "features" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              {/* Config sections */}
              <div className="rounded-xl border border-white/10 bg-surface p-6">
                <h2 className="mb-1 text-lg font-bold text-gray-100">Configuração Progressiva</h2>
                <p className="text-sm text-gray-500">Configure os recursos da sua stack</p>
              </div>

              {config.sections.map((section) => {
                const SectionIcon = section.icon;
                const selected = formData.selections[section.title] || [];
                const isSelected = (value: string) => selected.includes(value);

                return (
                  <div key={section.title} className="rounded-xl border border-white/10 bg-surface p-6 transition-all hover:border-white/20">
                    <div className="mb-4 flex items-center gap-2">
                      <SectionIcon size={16} className="text-primary" />
                      <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400">{section.title}</h2>
                      {selected.length > 0 && (
                        <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold text-primary">{selected.length}</span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {section.options.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => section.multiple
                            ? toggleSelection(section.title, opt.value)
                            : setSingleSelection(section.title, opt.value)
                          }
                          className={`group relative flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm transition-all ${
                            isSelected(opt.value)
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-white/10 text-gray-400 hover:border-white/30 hover:text-gray-200"
                          }`}
                        >
                          {isSelected(opt.value) && <Check size={14} />}
                          {opt.label}
                          {opt.description && (
                            <span className="ml-1 text-[10px] text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
                              — {opt.description}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}

              {/* Feature cards */}
              {config.features && config.features.length > 0 && (
                <div className="rounded-xl border border-white/10 bg-surface p-6">
                  <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-gray-400">Feature Overview</h2>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {config.features.map((f) => {
                      const FIcon = f.icon;
                      const imp = IMPACT_CONFIG[f.impact] || IMPACT_CONFIG.medium;
                      return (
                        <div key={f.name} className="group relative rounded-lg border border-white/10 bg-white/[0.03] p-4 transition-all hover:border-primary/30 hover:bg-primary/[0.02]">
                          <div className="flex items-start justify-between">
                            <FIcon size={18} className="text-primary mt-0.5" />
                            <span className={`rounded border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${imp.color}`}>
                              {imp.label}
                            </span>
                          </div>
                          <p className="mt-3 text-sm font-semibold text-gray-200">{f.name}</p>
                          <p className="mt-1 text-xs text-gray-500">{f.description}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ===== ARCHITECTURE ===== */}
          {activeSection === "architecture" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              {/* Visual Architecture */}
              {(() => {
                const preview = config.architecturePreview;
                if (!preview || preview.length === 0) return null;
                return (
                  <div className="rounded-xl border border-white/10 bg-surface p-6">
                    <h2 className="mb-1 text-lg font-bold text-gray-100">Arquitetura Visual</h2>
                    <p className="mb-6 text-sm text-gray-500">Fluxo estimado da arquitetura do projeto</p>
                    <div className="flex flex-col items-center gap-0">
                      {preview.map((node, i) => (
                        <div key={i} className="flex flex-col items-center">
                          <div className={`rounded-xl border px-6 py-3 text-sm font-medium ${ARCH_COLORS[node.type] || ARCH_COLORS.backend}`}>
                            {node.label}
                          </div>
                          {i < preview.length - 1 && (
                            <div className="flex flex-col items-center py-1">
                              <ChevronDown size={16} className="text-gray-600" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Compatibility Matrix */}
              <div className="grid gap-6 md:grid-cols-2">
                {config.compatibleBackends && (
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.03] p-6">
                    <h2 className="text-sm font-bold uppercase tracking-widest text-emerald-400">Compatible Backends</h2>
                    <div className="mt-4 space-y-2">
                      {config.compatibleBackends.map((b) => (
                        <div key={b} className="flex items-center gap-3 text-sm">
                          <span className="text-emerald-400 text-xs">✔</span>
                          <span className="text-gray-200">{b}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {config.frontendCompatibility && config.frontendCompatibility.length > 0 && (
                  <div className="rounded-xl border border-blue-500/20 bg-blue-500/[0.03] p-6">
                    <h2 className="text-sm font-bold uppercase tracking-widest text-blue-400">Frontend Compatibility</h2>
                    <div className="mt-4 space-y-2">
                      {config.frontendCompatibility.map((f) => (
                        <div key={f} className="flex items-center gap-3 text-sm">
                          <span className="text-emerald-400 text-xs">✔</span>
                          <span className="text-gray-200">{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Avoid */}
              {config.avoid && config.avoid.length > 0 && (
                <div className="rounded-xl border border-rose-500/20 bg-rose-500/[0.03] p-6">
                  <h2 className="text-sm font-bold uppercase tracking-widest text-rose-400">Avoid</h2>
                  <div className="mt-4 space-y-2">
                    {config.avoid.map((a) => (
                      <div key={a} className="flex items-center gap-3 text-sm">
                        <span className="text-rose-400 text-xs">✖</span>
                        <span className="text-gray-400">{a}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Project Structure */}
              {config.projectStructure && (
                <div className="rounded-xl border border-white/10 bg-surface p-6">
                  <h2 className="mb-1 text-lg font-bold text-gray-100">Estimated Project Structure</h2>
                  <p className="mb-4 text-sm text-gray-500">Estrutura de diretórios que será gerada</p>
                  <div className="rounded-lg bg-black/30 p-4 font-mono text-xs leading-relaxed">
                    {config.projectStructure.map((p, i) => (
                      <div key={i} className="text-gray-400 hover:text-gray-200 transition-colors">
                        {p}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ===== AI INSIGHTS ===== */}
          {activeSection === "insights" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="rounded-xl border border-purple-500/20 bg-gradient-to-br from-purple-900/10 to-indigo-900/10 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="rounded-xl bg-purple-500/20 p-3">
                    <Lightbulb size={24} className="text-purple-300" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-100">AI Recommendations</h2>
                    <p className="text-sm text-gray-500">Insights inteligentes para sua stack</p>
                  </div>
                </div>
                {config.aiInsights && config.aiInsights.length > 0 ? (
                  <div className="space-y-3">
                    {config.aiInsights.map((insight, i) => (
                      <div key={i} className="flex items-start gap-3 rounded-lg border border-purple-500/10 bg-purple-500/[0.03] px-4 py-3">
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-purple-500/20 text-[10px] font-bold text-purple-300">{i + 1}</span>
                        <p className="text-sm text-gray-300">{insight}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Nenhum insight disponível para esta stack.</p>
                )}
              </div>

              {/* Will Generate */}
              {config.willGenerate && (
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.03] p-6">
                  <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-emerald-400">Will Generate</h2>
                  <div className="grid gap-3 md:grid-cols-2">
                    {config.willGenerate.map((item) => (
                      <div key={item} className="flex items-center gap-3 rounded-lg border border-emerald-500/10 bg-emerald-500/[0.02] px-4 py-3">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-xs text-emerald-300">✔</span>
                        <span className="text-sm text-gray-200">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ===== GENERATION ===== */}
          {activeSection === "generation" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="rounded-xl border border-white/10 bg-surface p-6">
                <h2 className="mb-1 text-lg font-bold text-gray-100">Generation Preview</h2>
                <p className="text-sm text-gray-500">Pré-visualização do que será gerado com as configurações atuais</p>
              </div>

              {/* Config summary */}
              <div className="rounded-xl border border-white/10 bg-surface p-6">
                <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-gray-400">Configuração Selecionada</h2>
                <div className="space-y-3">
                  {config.sections.map((section) => {
                    const selected = formData.selections[section.title] || [];
                    if (selected.length === 0) return null;
                    return (
                      <div key={section.title} className="flex items-start gap-3">
                        <span className="mt-0.5 text-xs text-gray-500 w-28 shrink-0">{section.title}</span>
                        <div className="flex flex-wrap gap-1.5">
                          {selected.map((v: string) => {
                            const opt = section.options.find((o) => o.value === v);
                            return (
                              <span key={v} className="rounded-md bg-primary/10 px-2 py-1 text-xs text-primary">
                                {opt?.label || v}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 text-xs text-gray-500 w-28 shrink-0">{config.versionLabel}</span>
                    <span className="rounded-md bg-primary/10 px-2 py-1 text-xs text-primary">
                      {config.versionOptions.find((v) => v.value === formData.version)?.label || formData.version}
                    </span>
                  </div>
                </div>
              </div>

              {/* Will Generate */}
              {config.willGenerate && (
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.03] p-6">
                  <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-emerald-400">Será gerado</h2>
                  <div className="grid gap-2 md:grid-cols-2">
                    {config.willGenerate.map((item) => (
                      <div key={item} className="flex items-center gap-3 rounded-lg border border-emerald-500/10 px-4 py-2.5">
                        <span className="text-emerald-400 text-xs">✔</span>
                        <span className="text-sm text-gray-200">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Total selections */}
              <div className="rounded-xl border border-white/10 bg-surface p-4 flex items-center justify-between">
                <span className="text-sm text-gray-400">
                  <span className="text-gray-200 font-semibold">{selectedCount}</span> opções selecionadas
                </span>
                <span className="text-sm text-gray-400">
                  Versão: <span className="text-gray-200 font-semibold">{config.versionOptions.find((v) => v.value === formData.version)?.label || formData.version}</span>
                </span>
              </div>

              {/* Generate button */}
              <button
                onClick={handleSubmit}
                disabled={!formData.project_name.trim()}
                className="flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-4 font-bold text-white shadow-lg shadow-emerald-500/20 hover:from-emerald-400 hover:to-emerald-500 transition-all disabled:opacity-40"
              >
                <Rocket size={20} />
                {formData.project_name.trim() ? `Gerar ${config.name}: ${formData.project_name}` : "Defina um nome para o projeto"}
              </button>
            </div>
          )}

          {/* ===== DEPLOY ===== */}
          {activeSection === "deploy" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="rounded-xl border border-white/10 bg-surface p-6">
                <h2 className="mb-1 text-lg font-bold text-gray-100">Deploy & Delivery</h2>
                <p className="text-sm text-gray-500">Configuração de entrega e infraestrutura</p>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-xl border border-white/10 bg-surface p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="rounded-lg bg-cyan-500/10 p-2 text-cyan-300">
                      <Download size={18} />
                    </div>
                    <h3 className="text-sm font-bold text-gray-200">Download</h3>
                  </div>
                  <p className="text-sm text-gray-500">Faça o download do projeto gerado como um arquivo ZIP validado e assinado.</p>
                </div>

                <div className="rounded-xl border border-white/10 bg-surface p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-300">
                      <Server size={18} />
                    </div>
                    <h3 className="text-sm font-bold text-gray-200">Docker</h3>
                  </div>
                  <p className="text-sm text-gray-500">Dockerfile e docker-compose gerados automaticamente para deploy imediato.</p>
                </div>
              </div>

              {/* Final CTA */}
              <div className="rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 to-indigo-500/5 p-8 text-center">
                <Rocket size={40} className="mx-auto text-primary mb-4" />
                <h2 className="text-xl font-bold text-gray-100">Pronto para gerar seu projeto?</h2>
                <p className="mt-2 text-gray-500 mb-6">Sua fábrica de software inteligente está configurada e pronta.</p>
                <button
                  onClick={handleSubmit}
                  disabled={!formData.project_name.trim()}
                  className="inline-flex items-center gap-3 rounded-xl bg-primary px-8 py-4 font-bold text-white shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all disabled:opacity-40"
                >
                  <Rocket size={20} />
                  {formData.project_name.trim() ? `Gerar ${config.name}: ${formData.project_name}` : "Defina um nome"}
                </button>
              </div>
            </div>
          )}

          {/* Mobile nav buttons */}
          <div className="flex items-center justify-between xl:hidden pt-4 border-t border-white/10">
            <button
              onClick={() => {
                const idx = NAV_SECTIONS.findIndex((s) => s.id === activeSection);
                if (idx > 0) setActiveSection(NAV_SECTIONS[idx - 1].id);
              }}
              disabled={activeSection === NAV_SECTIONS[0].id}
              className="flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2 text-sm text-gray-400 hover:text-white disabled:opacity-30 transition-all"
            >
              <ArrowLeft size={16} /> Anterior
            </button>
            <span className="text-xs text-gray-500">
              {NAV_SECTIONS.findIndex((s) => s.id === activeSection) + 1} / {NAV_SECTIONS.length}
            </span>
            <button
              onClick={() => {
                const idx = NAV_SECTIONS.findIndex((s) => s.id === activeSection);
                if (idx < NAV_SECTIONS.length - 1) setActiveSection(NAV_SECTIONS[idx + 1].id);
              }}
              disabled={activeSection === NAV_SECTIONS[NAV_SECTIONS.length - 1].id}
              className="flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2 text-sm text-gray-400 hover:text-white disabled:opacity-30 transition-all"
            >
              Próximo <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {showGenerationModal && jobId && (
        <LiveGenerationModal
          jobId={jobId}
          onClose={() => {
            setShowGenerationModal(false);
            setJobId(null);
          }}
          onComplete={() => {
            setShowGenerationModal(false);
            const pid = formData.project_name;
            router.push(`/projects/${pid}/checkout`);
          }}
        />
      )}
    </div>
  );
}
