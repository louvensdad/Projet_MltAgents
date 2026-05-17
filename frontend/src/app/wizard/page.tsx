"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Box, Globe, Layers3, Palette, Server, ShieldCheck, Sparkles, Workflow, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { usePreferences } from "@/context/PreferencesContext";
import AnimatedBadge from "@/components/premium/AnimatedBadge";
import EngineNodeGraph from "@/components/premium/EngineNodeGraph";
import HolographicCard from "@/components/premium/HolographicCard";
import MetricOrb from "@/components/premium/MetricOrb";
import SectionHeader from "@/components/premium/SectionHeader";
import AIRecommendationPanel from "@/components/premium/create/AIRecommendationPanel";
import LiveTechPreview from "@/components/premium/create/LiveTechPreview";

interface WizardCard {
  slug: string;
  nameKey: string;
  descKey: string;
  icon: any;
  gradient: string;
  badgeKey?: string;
  tone: "cyan" | "violet" | "amber" | "emerald" | "rose";
  ready: boolean;
  category: string;
  score: number;
  complexity: string;
  scalability: string;
  architecture: string[];
  previewTitle: string;
  previewSubtitle: string;
  chips: string[];
  recommendation: string;
  rationale: string[];
  graph: string;
}

const WIZARD_CARDS: WizardCard[] = [
  {
    slug: "static-site",
    nameKey: "wizard.selector.static_name",
    descKey: "wizard.selector.static_desc",
    icon: Globe,
    gradient: "from-sky-500 to-teal-400",
    badgeKey: "wizard.selector.badge_ready",
    tone: "cyan",
    ready: true,
    category: "Sites",
    score: 94,
    complexity: "Low",
    scalability: "High",
    architecture: ["Hero", "SEO", "CMS", "Analytics"],
    previewTitle: "SEO-first landing stack",
    previewSubtitle: "Fast static delivery with CMS and marketing analytics.",
    chips: ["SSR ready", "SEO score 98", "CMS optional", "Motion light"],
    recommendation: "Best fit for launch pages, brand sites, and content-led growth.",
    rationale: ["Minimal surface area", "Fast time-to-market", "Strong SEO posture"],
    graph: "Visitor -> Hero -> Content -> CTA -> Analytics",
  },
  {
    slug: "springboot",
    nameKey: "wizard.selector.springboot_name",
    descKey: "wizard.selector.springboot_desc",
    icon: Server,
    gradient: "from-emerald-500 to-cyan-500",
    badgeKey: "wizard.selector.badge_ready",
    tone: "emerald",
    ready: true,
    category: "Backend",
    score: 97,
    complexity: "High",
    scalability: "Enterprise",
    architecture: ["Gateway", "Auth", "Services", "Database"],
    previewTitle: "Spring Boot enterprise core",
    previewSubtitle: "Microservices, security, observability, and integration backbone.",
    chips: ["Java 21", "Kafka ready", "Redis cache", "Dockerized"],
    recommendation: "Recommended when you need strict architecture, security, and scale.",
    rationale: ["Strong domain boundaries", "Production observability", "Enterprise integration"],
    graph: "Client -> Gateway -> Auth -> Services -> PostgreSQL / Kafka",
  },
  {
    slug: "fastapi",
    nameKey: "wizard.selector.fastapi_name",
    descKey: "wizard.selector.fastapi_desc",
    icon: Zap,
    gradient: "from-cyan-500 to-blue-500",
    badgeKey: "wizard.selector.badge_ready",
    tone: "cyan",
    ready: true,
    category: "Backend",
    score: 95,
    complexity: "Medium",
    scalability: "High",
    architecture: ["API", "Workers", "Redis", "Vector DB"],
    previewTitle: "FastAPI AI backend",
    previewSubtitle: "Async APIs, workers, websockets, and AI integrations.",
    chips: ["Async IO", "Celery workers", "WebSocket", "Vector DB"],
    recommendation: "Best for AI apps, automation flows, and data-intensive APIs.",
    rationale: ["Fast iteration", "Great async story", "AI-friendly stack"],
    graph: "Client -> API -> Workers -> Redis -> Vector DB",
  },
  {
    slug: "nestjs",
    nameKey: "wizard.selector.nestjs_name",
    descKey: "wizard.selector.nestjs_desc",
    icon: Server,
    gradient: "from-red-500 to-rose-500",
    badgeKey: "wizard.selector.badge_planned",
    tone: "rose",
    ready: false,
    category: "Backend",
    score: 82,
    complexity: "Medium",
    scalability: "High",
    architecture: ["API", "Modules", "Queue", "Database"],
    previewTitle: "NestJS modular backend",
    previewSubtitle: "Structured TypeScript services with clean layering.",
    chips: ["Nest modules", "Queue friendly", "Auth ready", "Gateway optional"],
    recommendation: "Planned for teams standardized on TypeScript server-side architecture.",
    rationale: ["Strong modularity", "Good developer ergonomics", "Composable services"],
    graph: "Client -> Modules -> Queue -> Database",
  },
  {
    slug: "express",
    nameKey: "wizard.selector.express_name",
    descKey: "wizard.selector.express_desc",
    icon: Server,
    gradient: "from-slate-500 to-zinc-400",
    badgeKey: "wizard.selector.badge_planned",
    tone: "amber",
    ready: false,
    category: "Backend",
    score: 74,
    complexity: "Low",
    scalability: "Medium",
    architecture: ["API", "Middleware", "Cache", "DB"],
    previewTitle: "Express API starter",
    previewSubtitle: "Lean service layer for quick prototypes and small products.",
    chips: ["Quick boot", "Middleware stack", "Simple routing", "No ceremony"],
    recommendation: "Works for prototypes, but not the default for enterprise builds.",
    rationale: ["Fast to start", "Flexible routing", "Simple operations"],
    graph: "Client -> Middleware -> API -> DB",
  },
  {
    slug: "laravel",
    nameKey: "wizard.selector.laravel_name",
    descKey: "wizard.selector.laravel_desc",
    icon: Server,
    gradient: "from-orange-500 to-red-500",
    badgeKey: "wizard.selector.badge_planned",
    tone: "amber",
    ready: false,
    category: "Backend",
    score: 79,
    complexity: "Medium",
    scalability: "Medium",
    architecture: ["MVC", "Queue", "Cache", "DB"],
    previewTitle: "Laravel product backend",
    previewSubtitle: "Classic web stack for rapid product delivery.",
    chips: ["MVC", "Queues", "Caching", "Starter friendly"],
    recommendation: "A pragmatic option for application-heavy products and admin systems.",
    rationale: ["Fast CRUD delivery", "Rich ecosystem", "Accessible for teams"],
    graph: "Client -> MVC -> Queue -> Cache -> DB",
  },
  {
    slug: "dotnet",
    nameKey: "wizard.selector.dotnet_name",
    descKey: "wizard.selector.dotnet_desc",
    icon: Server,
    gradient: "from-violet-500 to-indigo-500",
    badgeKey: "wizard.selector.badge_planned",
    tone: "violet",
    ready: false,
    category: "Backend",
    score: 86,
    complexity: "High",
    scalability: "Enterprise",
    architecture: ["API", "Services", "Queue", "SQL"],
    previewTitle: ".NET enterprise backend",
    previewSubtitle: "Enterprise-grade service architecture for regulated domains.",
    chips: ["C#", ".NET services", "Observability", "Cloud ready"],
    recommendation: "Strong for teams already standardized on Microsoft ecosystems.",
    rationale: ["Enterprise tooling", "Robust typing", "Cloud-native fit"],
    graph: "Client -> API -> Services -> SQL / Queue",
  },
  {
    slug: "angular",
    nameKey: "wizard.selector.angular_name",
    descKey: "wizard.selector.angular_desc",
    icon: Palette,
    gradient: "from-red-500 to-pink-500",
    badgeKey: "wizard.selector.badge_planned",
    tone: "rose",
    ready: false,
    category: "Frontend",
    score: 80,
    complexity: "Medium",
    scalability: "High",
    architecture: ["Shell", "Features", "State", "API"],
    previewTitle: "Angular app shell",
    previewSubtitle: "Structured UI framework for large admin surfaces.",
    chips: ["RxJS", "Modules", "Forms", "Design system"],
    recommendation: "Good for very large frontend teams with opinionated conventions.",
    rationale: ["Strong structure", "Form-heavy apps", "Enterprise consistency"],
    graph: "Shell -> Modules -> State -> API",
  },
  {
    slug: "react",
    nameKey: "wizard.selector.react_name",
    descKey: "wizard.selector.react_desc",
    icon: Palette,
    gradient: "from-sky-500 to-cyan-500",
    badgeKey: "wizard.selector.badge_planned",
    tone: "cyan",
    ready: false,
    category: "Frontend",
    score: 88,
    complexity: "Medium",
    scalability: "High",
    architecture: ["App", "Components", "State", "API"],
    previewTitle: "React UI platform",
    previewSubtitle: "Flexible component architecture for product experiences.",
    chips: ["Reusable components", "State driven", "UI systems", "Fast iteration"],
    recommendation: "Great default for interactive products and shared UI systems.",
    rationale: ["Composable UI", "Large ecosystem", "Strong hiring market"],
    graph: "App -> Components -> State -> API",
  },
  {
    slug: "nextjs",
    nameKey: "wizard.selector.nextjs_name",
    descKey: "wizard.selector.nextjs_desc",
    icon: Palette,
    gradient: "from-gray-500 to-stone-500",
    badgeKey: "wizard.selector.badge_planned",
    tone: "violet",
    ready: false,
    category: "Frontend",
    score: 92,
    complexity: "Medium",
    scalability: "High",
    architecture: ["SSR", "Edge", "Routes", "API"],
    previewTitle: "Next.js experience layer",
    previewSubtitle: "SEO-first frontend with streaming and route-driven architecture.",
    chips: ["SSR", "SEO", "Edge", "App router"],
    recommendation: "Ideal for premium websites, SaaS frontends, and product launches.",
    rationale: ["SEO advantages", "App router maturity", "Strong DX"],
    graph: "Browser -> SSR -> Routes -> API",
  },
  {
    slug: "vue",
    nameKey: "wizard.selector.vue_name",
    descKey: "wizard.selector.vue_desc",
    icon: Palette,
    gradient: "from-emerald-400 to-green-600",
    badgeKey: "wizard.selector.badge_planned",
    tone: "emerald",
    ready: false,
    category: "Frontend",
    score: 83,
    complexity: "Low",
    scalability: "Medium",
    architecture: ["App", "Components", "Store", "API"],
    previewTitle: "Vue application shell",
    previewSubtitle: "Progressive UI stack with low-friction onboarding.",
    chips: ["Progressive UI", "Simple state", "Good DX", "Fast prototypes"],
    recommendation: "Strong if the team wants accessible frontend onboarding.",
    rationale: ["Gentle learning curve", "Responsive UI", "Clear component model"],
    graph: "App -> Components -> Store -> API",
  },
  {
    slug: "blazor",
    nameKey: "wizard.selector.blazor_name",
    descKey: "wizard.selector.blazor_desc",
    icon: Box,
    gradient: "from-violet-500 to-purple-700",
    badgeKey: "wizard.selector.badge_planned",
    tone: "violet",
    ready: false,
    category: "Frontend",
    score: 78,
    complexity: "Medium",
    scalability: "Medium",
    architecture: ["UI", "Components", "Server", "API"],
    previewTitle: "Blazor enterprise UI",
    previewSubtitle: "C#-centric frontend for Microsoft-aligned teams.",
    chips: ["C# UI", "Shared tooling", "Server integration", "Enterprise fit"],
    recommendation: "Useful when frontend and backend teams standardize on .NET.",
    rationale: ["Shared language", "Microsoft ecosystem", "Enterprise friendly"],
    graph: "UI -> Components -> Server -> API",
  },
];

const CATEGORIES = [
  { key: "sites", labelKey: "wizard.selector.cat_sites", items: ["static-site"] },
  { key: "backend", labelKey: "wizard.selector.cat_backend", items: ["springboot", "fastapi", "nestjs", "express", "laravel", "dotnet"] },
  { key: "frontend", labelKey: "wizard.selector.cat_frontend", items: ["angular", "react", "nextjs", "vue", "blazor"] },
];

const BADGE_STYLES: Record<string, string> = {
  "wizard.selector.badge_ready": "bg-emerald-500/20 text-emerald-300",
  "wizard.selector.badge_planned": "bg-amber-500/20 text-amber-300",
};

export default function WizardSelectorPage() {
  const { t } = usePreferences();
  const [activeSlug, setActiveSlug] = useState(WIZARD_CARDS.find((card) => card.ready)?.slug || WIZARD_CARDS[0].slug);

  const activeCard = useMemo(() => WIZARD_CARDS.find((card) => card.slug === activeSlug) || WIZARD_CARDS[0], [activeSlug]);
  const readyCount = WIZARD_CARDS.filter((card) => card.ready).length;
  const activeTone = activeCard.tone === "cyan" || activeCard.tone === "violet" || activeCard.tone === "emerald" ? activeCard.tone : "violet";

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 lg:py-10">
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]"
      >
        <HolographicCard className="p-6 md:p-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.16),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.12),transparent_24%)]" />
          <div className="relative z-10">
            <AnimatedBadge tone="cyan">{t("wizard.selector.tag")}</AnimatedBadge>
            <h1 className="mt-5 max-w-3xl text-4xl font-semibold tracking-tight text-white md:text-5xl">
              {t("wizard.selector.title")}
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 md:text-base">{t("wizard.selector.subtitle")}</p>

            <div className="mt-6 flex flex-wrap gap-2">
              <AnimatedBadge tone="violet">Guided mode</AnimatedBadge>
              <AnimatedBadge tone="emerald">Advanced mode</AnimatedBadge>
              <AnimatedBadge tone="cyan">Live validation</AnimatedBadge>
              <AnimatedBadge tone="violet">Architecture preview</AnimatedBadge>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <MetricOrb label="Ready stacks" value={readyCount} icon={<ShieldCheck size={16} />} accent="emerald" />
              <MetricOrb label="Total stacks" value={WIZARD_CARDS.length} icon={<Layers3 size={16} />} accent="cyan" />
              <MetricOrb label="Categories" value={CATEGORIES.length} icon={<Workflow size={16} />} accent="violet" />
              <MetricOrb label="AI Boost" value="Live" icon={<Sparkles size={16} />} accent="cyan" />
            </div>
          </div>
        </HolographicCard>

        <div className="space-y-5">
          <HolographicCard className="p-5 md:p-6">
            <SectionHeader
              eyebrow="Cockpit"
              title="Build with architecture context"
              subtitle="Preview the selected stack before entering the wizard. The side panel updates as you hover through the catalogue."
            />
            <div className="mt-5 space-y-4">
              <LiveTechPreview
                title={activeCard.previewTitle}
                subtitle={activeCard.previewSubtitle}
                chips={activeCard.chips}
              />
              <EngineNodeGraph
                nodes={[
                  { name: activeCard.category, status: "active", hint: activeCard.recommendation },
                  { name: "Architecture", status: activeCard.ready ? "ready" : "planned", hint: activeCard.graph },
                  { name: "Generator", status: activeCard.ready ? "ready" : "waiting", hint: `${activeCard.score} quality score` },
                ]}
              />
            </div>
          </HolographicCard>

          <AIRecommendationPanel
            recommendation={activeCard.recommendation}
            rationale={activeCard.rationale}
            mode={activeCard.ready ? "Guided mode" : "Planned stack"}
          />
        </div>
      </motion.section>

      <section className="grid gap-6 xl:grid-cols-[1.4fr_0.85fr]">
        <div className="space-y-8">
          {CATEGORIES.map((category) => {
            const categoryCards = category.items.map((slug) => WIZARD_CARDS.find((card) => card.slug === slug)).filter(Boolean) as WizardCard[];
            return (
              <section key={category.key} className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-500">{t(category.labelKey)}</h2>
                  <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-400">
                    {categoryCards.length} stacks
                  </span>
                </div>

                <div className="grid gap-5 lg:grid-cols-2">
                  {categoryCards.map((card) => {
                    const Icon = card.icon;
                    const isActive = activeSlug === card.slug;
                    return (
                      <motion.div
                        key={card.slug}
                        onHoverStart={() => setActiveSlug(card.slug)}
                        whileHover={{ y: -6, rotateX: 2, rotateY: -2 }}
                        transition={{ type: "spring", stiffness: 220, damping: 20 }}
                      >
                        <Link
                          href={card.ready ? `/wizard/${card.slug}` : "#"}
                          onClick={(event) => {
                            if (!card.ready) event.preventDefault();
                          }}
                          className={`group block h-full rounded-[28px] border p-5 backdrop-blur-xl transition-all ${
                            isActive
                              ? "border-cyan-500/30 shadow-[0_0_42px_rgba(34,211,238,0.12)]"
                              : "border-white/10 hover:border-white/20"
                          } ${card.ready ? "bg-slate-950/70" : "bg-slate-950/55 opacity-75"}`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className={`rounded-2xl bg-gradient-to-br ${card.gradient} p-3 shadow-[0_18px_45px_rgba(0,0,0,0.28)]`}>
                              <Icon size={24} className="text-white" />
                            </div>
                            <span className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] ${BADGE_STYLES[card.badgeKey || ""] || "bg-gray-500/20 text-gray-400"}`}>
                              {card.ready ? t(card.badgeKey || "wizard.selector.badge_ready") : t(card.badgeKey || "wizard.selector.badge_planned")}
                            </span>
                          </div>

                          <h3 className="mt-4 text-lg font-semibold text-white">{t(card.nameKey)}</h3>
                          <p className="mt-2 text-sm leading-6 text-slate-400">{t(card.descKey)}</p>

                          <div className="mt-4 grid grid-cols-2 gap-2 text-[11px] text-slate-300">
                            <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2">Score {card.score}</div>
                            <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2">{card.complexity}</div>
                            <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2">{card.scalability}</div>
                            <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2">{card.architecture[0]}</div>
                          </div>

                          <div className="mt-4 rounded-3xl border border-white/10 bg-black/25 p-4">
                            <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">Mini preview</p>
                            <p className="mt-2 text-sm font-medium text-white">{card.previewTitle}</p>
                            <p className="mt-1 text-sm leading-6 text-slate-400">{card.previewSubtitle}</p>
                            <div className="mt-3 flex flex-wrap gap-2">
                              {card.architecture.slice(0, 4).map((node) => (
                                <span key={node} className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] text-slate-300">
                                  {node}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="mt-4 flex items-center justify-between gap-3">
                            <div className="text-[10px] uppercase tracking-[0.25em] text-slate-500">
                              {card.ready ? "Ready for generation" : "In construction"}
                            </div>
                            <div className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-300 transition-transform group-hover:translate-x-0.5">
                              {card.ready ? t("wizard.selector.open_wizard") : t("wizard.selector.under_construction")}
                              <ArrowRight size={14} />
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>

        <div className="space-y-6 xl:sticky xl:top-6 xl:self-start">
          <HolographicCard className="p-6">
            <SectionHeader
              eyebrow="AI recommendation"
              title="Active stack insight"
              subtitle="This panel mirrors the card under focus so the user always sees architecture context before entering the wizard."
            />
            <div className="mt-4 space-y-4">
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <AnimatedBadge tone={activeTone}>{activeCard.category}</AnimatedBadge>
                  <AnimatedBadge tone={activeCard.ready ? "emerald" : "violet"}>{activeCard.ready ? "ready" : "planned"}</AnimatedBadge>
                </div>
                <h3 className="mt-4 text-xl font-semibold text-white">{t(activeCard.nameKey)}</h3>
                <p className="mt-2 text-sm leading-7 text-slate-300">{activeCard.recommendation}</p>
              </div>

              <LiveTechPreview
                title={activeCard.previewTitle}
                subtitle={activeCard.previewSubtitle}
                chips={activeCard.chips}
              />

              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">Architecture graph</p>
                <pre className="mt-3 whitespace-pre-wrap rounded-2xl border border-white/10 bg-black/25 p-4 text-sm leading-7 text-slate-200">
                  {activeCard.graph}
                </pre>
              </div>
            </div>
          </HolographicCard>

          <HolographicCard className="p-6">
            <p className="text-[10px] uppercase tracking-[0.35em] text-slate-500">Why this view feels premium</p>
            <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-300">
              <li>- Categories keep the page searchable and readable.</li>
              <li>- Cards expose stack, score, complexity, and preview before generation.</li>
              <li>- The selected stack updates the recommendation panel live.</li>
              <li>- Ready and planned states are explicit, not decorative.</li>
            </ul>
          </HolographicCard>
        </div>
      </section>
    </div>
  );
}
