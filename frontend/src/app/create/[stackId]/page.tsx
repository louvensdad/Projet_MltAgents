"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, AlertTriangle, CheckCircle, Send, Sparkles, Layers3, ChevronRight } from "lucide-react";
import Link from "next/link";
import { getApiBaseUrl } from "@/lib/config";
import { STACK_PROFILES, type StackKey } from "@/lib/stackProfiles";
import PremiumShell from "@/components/premium/PremiumShell";
import FloatingBackground from "@/components/premium/create/FloatingBackground";
import AnimatedBadge from "@/components/premium/AnimatedBadge";
import HolographicCard from "@/components/premium/HolographicCard";
import SectionHeader from "@/components/premium/SectionHeader";
import HolographicBadge from "@/components/premium/create/HolographicBadge";
import AIRecommendationPanel from "@/components/premium/create/AIRecommendationPanel";
import ArchitecturePreview from "@/components/premium/create/ArchitecturePreview";
import LiveTechPreview from "@/components/premium/create/LiveTechPreview";
import StackMetrics from "@/components/premium/create/StackMetrics";
import { motion } from "framer-motion";

interface FormField {
  id: string;
  label: string;
  type: string;
  options?: string[];
  default: any;
}

interface StackSchema {
  id: string;
  name: string;
  description: string;
  form_schema: FormField[];
}

type StackKeyOrStatic = StackKey | "static";

const STACK_PREVIEW_MAP: Record<string, { title: string; subtitle: string; nodes: string[]; chips: string[]; score: number; complexity: string; scalability: string; performance: string; tone: "cyan" | "violet" | "emerald" | "amber" | "rose" }> = {
  spring_boot: {
    title: "Spring Boot enterprise",
    subtitle: "Gateway, auth, Kafka and PostgreSQL aligned for scale and traceability.",
    nodes: ["Gateway", "Auth Service", "Kafka", "PostgreSQL", "Redis", "Monitoring"],
    chips: ["Java 21", "Spring Boot 3.3", "Kafka", "PostgreSQL"],
    score: 96,
    complexity: "High",
    scalability: "Excellent",
    performance: "Strong",
    tone: "cyan",
  },
  fastapi: {
    title: "FastAPI async platform",
    subtitle: "Async API with workers, Redis and optional vector memory for AI flows.",
    nodes: ["Async API", "Workers", "Redis", "Vector DB", "PostgreSQL"],
    chips: ["Python 3.12", "FastAPI", "Redis", "PostgreSQL"],
    score: 95,
    complexity: "Medium",
    scalability: "Excellent",
    performance: "Fast",
    tone: "cyan",
  },
  nestjs: {
    title: "NestJS modular runtime",
    subtitle: "Bounded modules, gateways and queue-based scaling with strong contracts.",
    nodes: ["Gateway", "Modules", "Queue", "PostgreSQL", "Redis"],
    chips: ["Node 20", "NestJS 10", "PostgreSQL", "Redis"],
    score: 94,
    complexity: "High",
    scalability: "Excellent",
    performance: "Strong",
    tone: "violet",
  },
  static: {
    title: "Static SEO-first system",
    subtitle: "Landing hero, CTA, content blocks and analytics aligned for conversion.",
    nodes: ["Browser", "CDN", "SEO", "CMS", "Forms"],
    chips: ["HTML/CSS/JS", "SEO", "Analytics", "SSG"],
    score: 92,
    complexity: "Low",
    scalability: "Good",
    performance: "Excellent",
    tone: "emerald",
  },
  react: {
    title: "React UI surface",
    subtitle: "Premium frontend surface for productized interactions and API-driven flows.",
    nodes: ["UI Shell", "SSR", "Components", "API Client", "Cache"],
    chips: ["React 18", "TypeScript", "Design System", "API-driven"],
    score: 88,
    complexity: "Medium",
    scalability: "Good",
    performance: "Strong",
    tone: "violet",
  },
  nextjs: {
    title: "Next.js edge experience",
    subtitle: "SSR, edge rendering and premium frontend composition with SEO benefit.",
    nodes: ["Browser", "SSR", "Components", "Edge", "Cache"],
    chips: ["Next.js 14", "SSR", "Edge", "SEO"],
    score: 90,
    complexity: "Medium",
    scalability: "Excellent",
    performance: "Excellent",
    tone: "violet",
  },
  ai_agents: {
    title: "AI orchestration plane",
    subtitle: "Planner, agents, memory and observability for premium multi-agent systems.",
    nodes: ["Planner", "Agents", "Memory", "Tools", "Observability"],
    chips: ["Prompt Master", "Tracing", "Memory", "Tools"],
    score: 98,
    complexity: "High",
    scalability: "Excellent",
    performance: "Adaptive",
    tone: "rose",
  },
  automation: {
    title: "Automation runtime",
    subtitle: "Workflow engine with jobs, queues and durable orchestration.",
    nodes: ["Scheduler", "Queue", "Workers", "Events", "Audit"],
    chips: ["Workers", "Queue", "Jobs", "Notifications"],
    score: 91,
    complexity: "Medium",
    scalability: "Good",
    performance: "Strong",
    tone: "amber",
  },
};

function normalizeStackId(stackId: string): string {
  if (stackId === "static-site") return "static";
  return stackId.replace(/-/g, "_");
}

function getStackPreview(stackId: string) {
  return STACK_PREVIEW_MAP[normalizeStackId(stackId)] || STACK_PREVIEW_MAP.fastapi;
}

function getArchitectureNodes(schema: StackSchema | null, stackId: string) {
  const preview = getStackPreview(stackId);
  const nodes = preview.nodes || [];
  if (schema?.form_schema?.length) {
    return nodes.slice(0, 6);
  }
  return nodes;
}

export default function CreateWizardPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const stackId = params.stackId as string;
  const templateId = searchParams.get("template_id");

  const [schema, setSchema] = useState<StackSchema | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [mode, setMode] = useState<"guided" | "advanced">("guided");
  const [currentStep, setCurrentStep] = useState(0);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const templatePrefilled = useRef(false);

  const stackProfile = useMemo(() => {
    const normalized = normalizeStackId(stackId) as StackKeyOrStatic;
    return (STACK_PROFILES as Record<StackKeyOrStatic, any>)[normalized] || (STACK_PROFILES as Record<StackKeyOrStatic, any>).static;
  }, [stackId]);

  const stackPreview = useMemo(() => getStackPreview(stackId), [stackId]);

  useEffect(() => {
    fetch(`${getApiBaseUrl()}/api/v1/stacks/${stackId}/schema`)
      .then((res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then((data: StackSchema) => {
        setSchema(data);
        const initialData: Record<string, any> = {};
        data.form_schema.forEach((field) => {
          initialData[field.id] = field.default;
        });
        setFormData(initialData);
      })
      .catch((err) => {
        console.error("Failed to load schema", err);
      });
  }, [stackId]);

  useEffect(() => {
    if (!schema || !templateId || templatePrefilled.current) return;

    let cancelled = false;
    fetch(`${getApiBaseUrl()}/api/templates/${templateId}/prepare-generation`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((prepared) => {
        if (cancelled) return;
        const defaults = prepared?.default_answers || {};
        const selectedVersions = defaults.selected_versions || {};
        const selectedOptions = defaults.selected_stack_options || {};
        const selectedVersion = Object.values(selectedVersions).find((value) => Boolean(value));
        setFormData((prev) => ({
          ...prev,
          project_name: defaults.project_name || prev.project_name || schema.name,
          project_description: defaults.project_description || prev.project_description || schema.description,
          version: selectedVersion || prev.version,
          selections: {
            ...(prev.selections || {}),
            ...selectedOptions,
          },
        }));
        templatePrefilled.current = true;
      })
      .catch((err) => {
        console.warn("Template prefill skipped", err);
      });

    return () => {
      cancelled = true;
    };
  }, [schema, templateId]);

  useEffect(() => {
    if (!schema || Object.keys(formData).length === 0) return;

    setIsValidating(true);
    const delayDebounce = window.setTimeout(() => {
      fetch(`${getApiBaseUrl()}/api/v1/stacks/${stackId}/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
        .then((res) => res.json())
        .then((data) => setWarnings(data.warnings || []))
        .catch((err) => console.error("Validation error", err))
        .finally(() => setIsValidating(false));
    }, 500);

    return () => window.clearTimeout(delayDebounce);
  }, [formData, schema, stackId]);

  if (!schema) return <div className="p-8 text-white">Loading Stack Schema...</div>;

  const handleChange = (id: string, value: any) => {
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const currentField = schema.form_schema[currentStep];

  const handleNext = () => {
    if (currentStep < schema.form_schema.length - 1) {
      setCurrentStep((curr) => curr + 1);
    } else {
      submitProject();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) setCurrentStep((curr) => curr - 1);
  };

  const submitProject = () => {
    console.log("Submitting payload:", formData);
  };

  const renderField = (field: FormField) => {
    if (field.type === "boolean") {
      return (
        <button
          type="button"
          onClick={() => handleChange(field.id, !formData[field.id])}
          className="mt-4 flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-left transition-all hover:border-cyan-500/30 hover:bg-white/[0.05]"
        >
          <span className="text-sm text-slate-300">Enable</span>
          <span className={`h-5 w-5 rounded-full border ${formData[field.id] ? "border-cyan-400 bg-cyan-400/30" : "border-white/20 bg-white/[0.02]"}`} />
        </button>
      );
    }

    if (field.type === "select" && field.options) {
      return (
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
          {field.options.map((opt) => {
            const selected = formData[field.id] === opt;
            return (
              <button
                key={opt}
                onClick={() => handleChange(field.id, opt)}
                className={`rounded-2xl border p-4 text-left transition-all ${
                  selected
                    ? "border-cyan-500/30 bg-cyan-500/10 shadow-[0_0_28px_rgba(34,211,238,0.08)]"
                    : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05]"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-white capitalize">{opt.replaceAll("_", " ")}</div>
                    <div className="mt-1 text-xs text-slate-500">{field.label}</div>
                  </div>
                  <ChevronRight size={14} className={selected ? "text-cyan-300" : "text-slate-500"} />
                </div>
              </button>
            );
          })}
        </div>
      );
    }

    return (
      <input
        type="text"
        value={formData[field.id] || ""}
        onChange={(e) => handleChange(field.id, e.target.value)}
        className="mt-4 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition-all placeholder:text-slate-600 focus:border-cyan-500/30"
        placeholder={field.label}
      />
    );
  };

  const previewNodes = getArchitectureNodes(schema, stackId);

  const recommendation = stackId === "spring_boot"
    ? "Spring Boot + Kafka + PostgreSQL is the most coherent fit for this flow. It gives you strong enterprise semantics, auditability and scale."
    : stackId === "fastapi"
      ? "FastAPI + Redis + PostgreSQL fits async workloads and AI-heavy flows with low friction."
      : stackId === "nestjs"
        ? "NestJS is the best match when module boundaries and TypeScript discipline matter."
        : "This builder is ready to adapt to your selected stack and shape the architecture accordingly.";

  return (
    <div className="relative mx-auto max-w-7xl space-y-8 px-4 py-8">
      <FloatingBackground />

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <HolographicCard className="p-6 md:p-8">
          <div className="flex items-center justify-between gap-4">
            <Link href="/create" className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-slate-200 transition-all hover:bg-white/10">
              <ArrowLeft size={16} />
              Back to stacks
            </Link>
            <AnimatedBadge tone="cyan">{stackProfile.name}</AnimatedBadge>
          </div>

          <div className="mt-6 space-y-4">
            <h1 className="text-4xl font-semibold tracking-tight text-white md:text-5xl">Configure {schema.name}</h1>
            <p className="max-w-2xl text-sm leading-7 text-slate-300 md:text-base">{schema.description}</p>
            <div className="flex flex-wrap gap-2">
              <HolographicBadge tone="cyan">{stackProfile.backendLabel}</HolographicBadge>
              <HolographicBadge tone="violet">{stackPreview.title}</HolographicBadge>
              <HolographicBadge tone={stackPreview.tone}>{stackPreview.complexity}</HolographicBadge>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: "Version mode", value: mode === "guided" ? "Guided" : "Advanced" },
              { label: "Stack", value: stackProfile.name },
              { label: "Validation", value: isValidating ? "Live" : "Idle" },
              { label: "Template", value: templateId ? "Prefilled" : "Manual" },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500">{item.label}</p>
                <p className="mt-2 text-sm font-semibold text-white">{item.value}</p>
              </div>
            ))}
          </div>
        </HolographicCard>

        <div className="space-y-4">
          <AIRecommendationPanel
            recommendation={recommendation}
            rationale={[
              `Architecture: ${previewNodes.slice(0, 4).join(" -> ")}`,
              `Security: ${stackProfile.security.slice(0, 2).join(", ")}`,
              `Messaging: ${stackProfile.messaging.slice(0, 2).join(", ")}`,
              `Frontend: ${stackProfile.frontends.slice(0, 2).join(", ")}`,
            ]}
            mode={stackId === "spring_boot" ? "Agent Boost 100%" : "Local Build 90%"}
          />
          <HolographicCard className="p-5">
            <SectionHeader eyebrow="live preview" title="Architecture preview" subtitle="Stack topology evolves visually as you navigate the form." />
            <div className="mt-4">
              <ArchitecturePreview nodes={previewNodes} tone={stackPreview.tone} />
            </div>
          </HolographicCard>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-5">
          <HolographicCard className="p-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500">Create cockpit</p>
                <h2 className="mt-1 text-lg font-semibold text-white">Wizard composition</h2>
                <p className="mt-1 text-sm text-slate-400">Guided and advanced modes share the same contract and validation pipeline.</p>
              </div>
              <div className="flex rounded-2xl border border-white/10 bg-white/[0.03] p-1">
                <button
                  onClick={() => setMode("guided")}
                  className={`rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                    mode === "guided" ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Guided
                </button>
                <button
                  onClick={() => setMode("advanced")}
                  className={`rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                    mode === "advanced" ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Advanced
                </button>
              </div>
            </div>

            <div className="mt-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="text-[10px] uppercase tracking-[0.3em] text-slate-500">
                  Step {currentStep + 1} of {schema.form_schema.length}
                </div>
                <div className="text-[10px] uppercase tracking-[0.3em] text-slate-500">
                  {currentField.label}
                </div>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-violet-400 transition-all duration-300"
                  style={{ width: `${Math.max(4, ((currentStep + 1) / schema.form_schema.length) * 100)}%` }}
                />
              </div>
            </div>

            {mode === "guided" ? (
              <div className="mt-6 rounded-3xl border border-white/10 bg-black/20 p-5">
                <SectionHeader eyebrow="guided mode" title={currentField.label} subtitle="One field at a time with live validation and architecture context." />
                <div className="mt-4">{renderField(currentField)}</div>

                <div className="mt-8 flex items-center justify-between gap-3">
                  <button
                    onClick={handlePrev}
                    disabled={currentStep === 0}
                    className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm text-slate-200 transition-all hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleNext}
                    className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90"
                  >
                    {currentStep === schema.form_schema.length - 1 ? <><Send size={16} /> Generate project</> : <>Continue <ChevronRight size={16} /></>}
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                {schema.form_schema.map((field) => (
                  <div key={field.id} className="rounded-3xl border border-white/10 bg-black/20 p-5">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-semibold text-white">{field.label}</h3>
                        <p className="mt-1 text-sm text-slate-500">Manual control for this wizard field.</p>
                      </div>
                      <Layers3 size={18} className="text-slate-500" />
                    </div>
                    {renderField(field)}
                  </div>
                ))}
                <button
                  onClick={submitProject}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-4 text-lg font-semibold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90"
                >
                  <Send size={18} />
                  Generate architecture
                </button>
              </div>
            )}
          </HolographicCard>
        </div>

        <div className="space-y-5">
          <HolographicCard className="p-5">
            <SectionHeader eyebrow="validation" title="Live validation" subtitle="The architecture is checked continuously as the payload changes." />
            <div className="mt-4">
              {isValidating && <div className="text-sm text-slate-400 animate-pulse mb-4">Validating architecture...</div>}

              {warnings.length > 0 ? (
                <div className="space-y-3">
                  {warnings.map((warn, i) => (
                    <div key={i} className="flex gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-200">
                      <AlertTriangle size={18} className="mt-0.5 shrink-0" />
                      <p>{warn}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-200">
                  <CheckCircle size={18} className="mt-0.5 shrink-0" />
                  <p>Architecture looks solid. No anti-patterns detected.</p>
                </div>
              )}
            </div>
          </HolographicCard>

          <HolographicCard className="p-5">
            <SectionHeader eyebrow="stack intelligence" title="Stack metrics" subtitle="Engineering signals and technology context for the selected builder." />
            <div className="mt-4">
              <StackMetrics
                score={stackPreview.score}
                complexity={stackPreview.complexity}
                scalability={stackPreview.scalability}
                performance={stackPreview.performance}
              />
            </div>
          </HolographicCard>

          <HolographicCard className="p-5">
            <SectionHeader eyebrow="stack profile" title="Technology surface" subtitle="The current stack profile, architecture and supported layers." />
            <div className="mt-4 space-y-3">
              <LiveTechPreview
                title={stackProfile.name}
                subtitle={stackProfile.identity.highlight}
                chips={[
                  stackProfile.backendLabel,
                  stackProfile.versions[0] || "Versioning",
                  stackProfile.architectures[0] || "Architecture",
                  stackProfile.databases[0] || "Database",
                ]}
              />
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500">Security</p>
                  <p className="mt-2 text-sm font-semibold text-white">{stackProfile.security.slice(0, 2).join(" • ")}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500">Messaging</p>
                  <p className="mt-2 text-sm font-semibold text-white">{stackProfile.messaging.slice(0, 2).join(" • ")}</p>
                </div>
              </div>
            </div>
          </HolographicCard>

          <HolographicCard className="p-5">
            <SectionHeader eyebrow="payload" title="Payload preview" subtitle="The current form state, ready for generation or template prefill." />
            <pre className="mt-4 max-h-[360px] overflow-auto rounded-3xl border border-white/10 bg-black/30 p-4 text-xs leading-6 text-emerald-300">
              {JSON.stringify(formData, null, 2)}
            </pre>
          </HolographicCard>
        </div>
      </section>
    </div>
  );
}
