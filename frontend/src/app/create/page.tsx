"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Bot, Cpu, Globe, Palette, Server, Sparkles, Zap } from "lucide-react";
import { usePreferences } from "@/context/PreferencesContext";
import { API_BASE } from "@/lib/config";
import AnimatedBadge from "@/components/premium/AnimatedBadge";
import HolographicCard from "@/components/premium/HolographicCard";
import SectionHeader from "@/components/premium/SectionHeader";
import FloatingBackground from "@/components/premium/create/FloatingBackground";
import HolographicBadge from "@/components/premium/create/HolographicBadge";
import StackCard3D, { type CreateStackCard } from "@/components/premium/create/StackCard3D";
import AnimatedGrid from "@/components/premium/create/AnimatedGrid";
import EnterpriseHero from "@/components/premium/create/EnterpriseHero";
import AIRecommendationPanel from "@/components/premium/create/AIRecommendationPanel";
import ArchitecturePreview from "@/components/premium/create/ArchitecturePreview";
import StackMetrics from "@/components/premium/create/StackMetrics";
import LiveTechPreview from "@/components/premium/create/LiveTechPreview";

type CategoryKey = "Backend" | "Frontend" | "AI" | "Automation" | "Sites";

const CATEGORY_META: Record<CategoryKey, { label: string; tone: CreateStackCard["tone"]; description: string; icon: typeof Server }> = {
  Backend: { label: "Backend", tone: "cyan", description: "APIs enterprise, microsserviços, mensageria e dados.", icon: Server },
  Frontend: { label: "Frontend", tone: "violet", description: "Interfaces modernas com SSR, DX e performance.", icon: Palette },
  AI: { label: "AI", tone: "rose", description: "Orquestração de agentes, IA premium e automação.", icon: Bot },
  Automation: { label: "Automation", tone: "amber", description: "Workflows, filas e jobs para operações inteligentes.", icon: Zap },
  Sites: { label: "Sites", tone: "emerald", description: "SEO-first, marketing e landing pages premium.", icon: Globe },
};

const STACKS: CreateStackCard[] = [
  {
    id: "springboot",
    name: "Java + Spring Boot",
    description: "Enterprise Java com microsserviços, observabilidade e disciplina arquitetural.",
    category: "Backend",
    icon: <Server size={18} />,
    badge: "Stable",
    tone: "cyan",
    score: 96,
    complexity: "High",
    scalability: "Excellent",
    performance: "Strong",
    architecture: ["Gateway", "Auth Service", "Kafka", "PostgreSQL", "Redis", "Monitoring"],
    chips: ["Java 21", "Spring Boot 3.3", "Kafka", "PostgreSQL"],
    previewTitle: "Spring Boot microservices",
    previewSubtitle: "Gateway, auth server, messaging and persistent stores wired for scale.",
    href: "/create/springboot",
    ready: true,
    techBadge: "enterprise",
  },
  {
    id: "fastapi",
    name: "Python + FastAPI",
    description: "APIs assíncronas com workers, cache e integração de IA de baixo atrito.",
    category: "Backend",
    icon: <Server size={18} />,
    badge: "Stable",
    tone: "cyan",
    score: 95,
    complexity: "Medium",
    scalability: "Excellent",
    performance: "Fast",
    architecture: ["Client", "Async API", "Workers", "Redis", "PostgreSQL", "Observability"],
    chips: ["Python 3.12", "FastAPI", "Redis", "PostgreSQL"],
    previewTitle: "Async API control plane",
    previewSubtitle: "Async endpoints, background jobs and cache-first execution.",
    href: "/create/fastapi",
    ready: true,
    techBadge: "async",
  },
  {
    id: "nestjs",
    name: "Node.js + NestJS",
    description: "Arquitetura modular com DI forte, contratos claros e stack escalável.",
    category: "Backend",
    icon: <Server size={18} />,
    badge: "Stable",
    tone: "violet",
    score: 94,
    complexity: "High",
    scalability: "Excellent",
    performance: "Strong",
    architecture: ["Gateway", "Modules", "Kafka", "PostgreSQL", "Redis", "Monitoring"],
    chips: ["Node 20", "NestJS 10", "PostgreSQL", "Redis"],
    previewTitle: "Modular Node platform",
    previewSubtitle: "Domain modules with clear boundaries and infra-friendly runtime.",
    href: "/create/nestjs",
    ready: true,
    techBadge: "modular",
  },
  {
    id: "static-site",
    name: "Static Site",
    description: "SEO-first, ultra rápido, conversão alta e base visual premium.",
    category: "Sites",
    icon: <Globe size={18} />,
    badge: "Stable",
    tone: "emerald",
    score: 92,
    complexity: "Low",
    scalability: "Good",
    performance: "Excellent",
    architecture: ["Browser", "Static Assets", "CMS", "Analytics", "Forms"],
    chips: ["HTML/CSS/JS", "Next.js SSG", "SEO", "Analytics"],
    previewTitle: "SEO-first landing system",
    previewSubtitle: "Hero, CTA, proof blocks and content sections with conversion flow.",
    href: "/create/static-site",
    ready: true,
    techBadge: "seo-first",
  },
  {
    id: "react",
    name: "React",
    description: "Frontend moderno com interface reativa e integração com APIs enterprise.",
    category: "Frontend",
    icon: <Palette size={18} />,
    badge: "Partial",
    tone: "violet",
    score: 88,
    complexity: "Medium",
    scalability: "Good",
    performance: "Strong",
    architecture: ["UI Shell", "SSR", "API Client", "State", "Design System"],
    chips: ["React 18", "TS", "Design System", "API-driven"],
    previewTitle: "Reactive UI layer",
    previewSubtitle: "Componentized frontend with server rendering and design primitives.",
    href: "/create/react",
    ready: true,
    techBadge: "frontend",
  },
  {
    id: "nextjs",
    name: "Next.js",
    description: "Fullstack React com SSR, edge rendering e DX premium.",
    category: "Frontend",
    icon: <Palette size={18} />,
    badge: "Partial",
    tone: "violet",
    score: 90,
    complexity: "Medium",
    scalability: "Excellent",
    performance: "Excellent",
    architecture: ["Edge", "SSR", "Components", "Routes", "Caching"],
    chips: ["Next.js 14", "SSR", "Edge", "SEO"],
    previewTitle: "Fullstack edge UX",
    previewSubtitle: "High-performance frontend with routing, SSR and live previews.",
    href: "/create/nextjs",
    ready: true,
    techBadge: "edge",
  },
  {
    id: "agentes-ia",
    name: "Agentes IA",
    description: "Multi-agents com coordenação, memória e workflows premium.",
    category: "AI",
    icon: <Bot size={18} />,
    badge: "Planned",
    tone: "rose",
    score: 98,
    complexity: "High",
    scalability: "Excellent",
    performance: "Adaptive",
    architecture: ["Planner", "Agents", "Memory", "Tools", "Observability", "Billing"],
    chips: ["Prompt Master", "Orchestrator", "Tracing", "Memory"],
    previewTitle: "Agent orchestration plane",
    previewSubtitle: "Graph of agents working over prompts, tools and traceable memory.",
    href: "/create/agentes-ia",
    ready: false,
    techBadge: "planned",
  },
  {
    id: "automacao",
    name: "Automação",
    description: "Workflows, filas e jobs para operações repetitivas com controle.",
    category: "Automation",
    icon: <Zap size={18} />,
    badge: "Planned",
    tone: "amber",
    score: 91,
    complexity: "Medium",
    scalability: "Good",
    performance: "Strong",
    architecture: ["Scheduler", "Queue", "Workers", "Events", "Audit"],
    chips: ["Workers", "Queue", "Jobs", "Notifications"],
    previewTitle: "Automation runtime",
    previewSubtitle: "Event-driven workflows with workers and durable orchestration.",
    href: "/create/automacao",
    ready: false,
    techBadge: "planned",
  },
];

const CATEGORY_ORDER: CategoryKey[] = ["Backend", "Frontend", "AI", "Automation", "Sites"];

const CATEGORY_TABS = CATEGORY_ORDER.map((key) => {
  const items = STACKS.filter((stack) => stack.category === key);
  return {
    key,
    label: CATEGORY_META[key].label,
    count: items.length,
    tone: CATEGORY_META[key].tone,
  };
});

function describeStack(stack: CreateStackCard) {
  if (stack.id === "springboot") {
    return "Spring Boot + Kafka + PostgreSQL is the best fit for enterprise systems with hard boundaries, auditability and scale.";
  }
  if (stack.id === "fastapi") {
    return "FastAPI + Redis + PostgreSQL gives you async throughput and clean integration for agentic workflows.";
  }
  if (stack.id === "nestjs") {
    return "NestJS is ideal when you want modular boundaries, shared contracts and a strong Node enterprise layer.";
  }
  if (stack.id === "static-site") {
    return "Static-first stacks maximize speed, SEO and conversion for brand and landing experiences.";
  }
  if (stack.id === "react" || stack.id === "nextjs") {
    return "Use this when the product needs a premium frontend surface, SSR and a fluid component architecture.";
  }
  if (stack.id === "agentes-ia") {
    return "AI agents need orchestration, memory and tracing. This stack points toward a control plane, not a simple UI.";
  }
  return "This stack balances delivery speed with clear engineering structure and room for growth.";
}

function getPreviewNodes(stack: CreateStackCard) {
  if (stack.id === "springboot") return ["Client", "Gateway", "Auth Service", "Kafka", "PostgreSQL", "Redis"];
  if (stack.id === "fastapi") return ["Client", "Async API", "Workers", "Redis", "Vector DB", "PostgreSQL"];
  if (stack.id === "nestjs") return ["Client", "Gateway", "Modules", "Queue", "PostgreSQL", "Redis"];
  if (stack.id === "static-site") return ["Browser", "CDN", "SEO", "CMS", "Forms"];
  if (stack.id === "react" || stack.id === "nextjs") return ["Browser", "SSR", "Components", "API Client", "Cache"];
  return ["Planner", "Agents", "Memory", "Tools", "Observability"];
}

function getModeBadge(mode: string) {
  return mode === "Agent Boost 100%" ? "emerald" : "violet";
}

export default function CreatePage() {
  const { t } = usePreferences();
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<CategoryKey>("Backend");
  const [activeStackId, setActiveStackId] = useState<string>("springboot");
  const [aiMode, setAiMode] = useState("Local Build 90%");

  useEffect(() => {
    fetch(`${API_BASE}/api/ai/status`)
      .then((res) => res.json())
      .then((data) => setAiMode(data?.generation_quality_mode === "agent_boost_100" ? "Agent Boost 100%" : "Local Build 90%"))
      .catch(() => {});
  }, []);

  const activeStack = useMemo(
    () => STACKS.find((stack) => stack.id === activeStackId) || STACKS[0],
    [activeStackId]
  );

  const visibleStacks = useMemo(
    () => STACKS.filter((stack) => stack.category === activeCategory),
    [activeCategory]
  );

  const heroStats = useMemo(() => [
    { label: "Stacks", value: String(STACKS.length) },
    { label: "Agents", value: "11" },
    { label: "Architectures", value: "6" },
    { label: "Mode", value: aiMode },
  ], [aiMode]);

  const recommendation = describeStack(activeStack);
  const rationale = [
    `Category: ${activeStack.category}`,
    `Architecture: ${activeStack.architecture.slice(0, 3).join(" -> ")}`,
    `Core chips: ${activeStack.chips.join(", ")}`,
    activeStack.ready ? "Ready to enter the builder" : "Marked as planned, preview only",
  ];

  return (
    <div className="relative mx-auto max-w-7xl space-y-8 px-4 py-8">
      <FloatingBackground />
      <EnterpriseHero
        title="Build enterprise-grade systems with AI orchestration"
        subtitle="Marketplace Enterprise de Engenharia de Software por IA. Escolha a stack, inspecione a arquitetura, valide o preview e entre no builder com contexto."
        stats={heroStats}
      />

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-5">
          <AnimatedBadge tone="cyan">stack marketplace</AnimatedBadge>
          <SectionHeader
            eyebrow="category map"
            title="Categorias inteligentes"
            subtitle="Cada categoria carrega identidade visual própria, glow distinto e stacks com linguagem de produto."
          />
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            {CATEGORY_TABS.map((category) => {
              const active = activeCategory === category.key;
              const Icon = CATEGORY_META[category.key].icon;
              return (
                <button
                  key={category.key}
                  onClick={() => setActiveCategory(category.key)}
                  className={`group rounded-3xl border p-4 text-left transition-all ${
                    active
                      ? "border-cyan-500/30 bg-cyan-500/10 shadow-[0_0_36px_rgba(34,211,238,0.12)]"
                      : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className={`rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-slate-100 ${active ? "shadow-[0_0_24px_rgba(34,211,238,0.1)]" : ""}`}>
                      <Icon size={18} />
                    </div>
                    <HolographicBadge tone={CATEGORY_META[category.key].tone}>{category.count} stacks</HolographicBadge>
                  </div>
                  <h3 className="mt-4 text-sm font-semibold text-white">{category.label}</h3>
                  <p className="mt-1 text-xs leading-6 text-slate-400">{CATEGORY_META[category.key].description}</p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-5">
          <AnimatedBadge tone="violet">live intelligence</AnimatedBadge>
          <SectionHeader
            eyebrow="ai panel"
            title="AI recommendation"
            subtitle="O sistema sugere a stack mais coerente com o tipo de produto e a arquitetura desejada."
          />
          <AIRecommendationPanel
            recommendation={recommendation}
            rationale={rationale}
            mode={aiMode}
          />
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">
        <div className="space-y-5">
          <SectionHeader
            eyebrow="enterprise grid"
            title={`${CATEGORY_META[activeCategory].label} stacks`}
            subtitle="Cards com mini preview, score, complexidade e superfície técnica. Hover altera a arquitetura ao vivo."
          />
          <AnimatedGrid>
            {visibleStacks.map((stack) => (
              <StackCard3D
                key={stack.id}
                stack={stack}
                active={activeStackId === stack.id}
                onHover={() => setActiveStackId(stack.id)}
              />
            ))}
          </AnimatedGrid>
        </div>

        <div className="space-y-5">
          <SectionHeader
            eyebrow="live preview"
            title="Preview vivo da arquitetura"
            subtitle="Amostra da estrutura, serviços e camadas de engenharia para a stack selecionada."
          />
          <HolographicCard className="p-5">
            <div className="flex flex-wrap gap-2">
              <HolographicBadge tone={getModeBadge(aiMode)}>{aiMode}</HolographicBadge>
              <HolographicBadge tone={activeStack.tone}>{activeStack.badge}</HolographicBadge>
            </div>
            <div className="mt-4">
              <ArchitecturePreview nodes={getPreviewNodes(activeStack)} tone={activeStack.tone} />
            </div>
          </HolographicCard>

          <HolographicCard className="p-5">
            <SectionHeader
              eyebrow="stack metrics"
              title="Stack metrics"
              subtitle="Sinais de engenharia que ajudam a comparar arquitetura, escala e performance."
            />
            <div className="mt-4">
              <StackMetrics
                score={activeStack.score}
                complexity={activeStack.complexity}
                scalability={activeStack.scalability}
                performance={activeStack.performance}
              />
            </div>
          </HolographicCard>

          <HolographicCard className="p-5">
            <SectionHeader
              eyebrow="live tech"
              title="Live technology preview"
              subtitle="Visual mínimo para a natureza técnica da stack sem ocupar a navegação."
            />
            <div className="mt-4">
              <LiveTechPreview
                title={activeStack.previewTitle}
                subtitle={activeStack.previewSubtitle}
                chips={activeStack.chips}
              />
            </div>
          </HolographicCard>
        </div>
      </section>

      <section className="space-y-5">
        <AnimatedBadge tone="emerald">interactive grid</AnimatedBadge>
        <SectionHeader
          eyebrow="all stacks"
          title="Stacks premium interativas"
          subtitle="Selecione uma stack e siga para o builder com contexto técnico real. Stacks planejadas aparecem bloqueadas para evitar rotas enganosas."
        />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {STACKS.map((stack) => (
              <button
                key={stack.id}
                onMouseEnter={() => setActiveStackId(stack.id)}
                onClick={() => {
                  if (stack.ready) router.push(stack.href);
                }}
                className={`text-left transition-transform ${stack.ready ? "cursor-pointer" : "cursor-not-allowed"}`}
              >
              <div className={`rounded-[28px] border bg-slate-950/70 p-4 backdrop-blur-xl ${activeStackId === stack.id ? "border-cyan-500/30" : "border-white/10"}`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap gap-2">
                      <HolographicBadge tone={stack.tone}>{stack.badge}</HolographicBadge>
                      <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] text-slate-300">{stack.techBadge}</span>
                    </div>
                    <h3 className="mt-3 text-lg font-semibold text-white">{stack.name}</h3>
                    <p className="mt-1 text-sm leading-6 text-slate-400">{stack.description}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-2 text-slate-300">
                    {stack.icon}
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 text-[11px] text-slate-300">
                  {stack.chips.slice(0, 4).map((chip) => (
                    <div key={chip} className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">{chip}</div>
                  ))}
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-[0.25em] text-slate-500">
                    {stack.ready ? "Ready to build" : "Planned"}
                  </span>
                  <span className="inline-flex items-center gap-1 text-sm font-medium text-cyan-300">
                    Open builder <ArrowRight size={14} />
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
