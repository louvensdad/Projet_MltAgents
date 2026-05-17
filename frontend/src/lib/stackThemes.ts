import { StackKey } from "./stackProfiles";

export interface StackTheme {
  name: string;
  accent: string;
  panel: string;
  chip: string;
  emphasis: string;
}

export const STACK_THEMES: Record<StackKey, StackTheme> = {
  spring_boot: {
    name: "Spring Enterprise",
    accent: "from-emerald-500 to-cyan-500",
    panel: "bg-emerald-500/10 border-emerald-500/30",
    chip: "bg-emerald-500/20 text-emerald-200 border-emerald-500/30",
    emphasis: "Angular + Keycloak + Kafka recommended for enterprise"
  },
  fastapi: {
    name: "FastAPI Async",
    accent: "from-cyan-500 to-blue-500",
    panel: "bg-cyan-500/10 border-cyan-500/30",
    chip: "bg-cyan-500/20 text-cyan-200 border-cyan-500/30",
    emphasis: "Next.js + Redis for fast UX and low latency"
  },
  nestjs: {
    name: "NestJS Modular",
    accent: "from-rose-500 to-red-500",
    panel: "bg-rose-500/10 border-rose-500/30",
    chip: "bg-rose-500/20 text-rose-200 border-rose-500/30",
    emphasis: "Modular architecture with scalable services"
  },
  express: {
    name: "Express Lean",
    accent: "from-slate-500 to-zinc-400",
    panel: "bg-slate-500/10 border-slate-500/30",
    chip: "bg-slate-500/20 text-slate-200 border-slate-500/30",
    emphasis: "Pragmatic API with low operational friction"
  },
  laravel: {
    name: "Laravel Fullstack",
    accent: "from-orange-500 to-red-500",
    panel: "bg-orange-500/10 border-orange-500/30",
    chip: "bg-orange-500/20 text-orange-200 border-orange-500/30",
    emphasis: "Clean and productive fullstack flow"
  },
  dotnet: {
    name: "ASP.NET Enterprise",
    accent: "from-violet-500 to-indigo-500",
    panel: "bg-violet-500/10 border-violet-500/30",
    chip: "bg-violet-500/20 text-violet-200 border-violet-500/30",
    emphasis: "Microsoft ecosystem with strong governance"
  },
  automation: {
    name: "Automation Workflow",
    accent: "from-amber-500 to-orange-500",
    panel: "bg-amber-500/10 border-amber-500/30",
    chip: "bg-amber-500/20 text-amber-200 border-amber-500/30",
    emphasis: "Durable workflows with queues and traceability"
  },
  ai_agents: {
    name: "AI Agents Control Plane",
    accent: "from-fuchsia-500 to-pink-500",
    panel: "bg-fuchsia-500/10 border-fuchsia-500/30",
    chip: "bg-fuchsia-500/20 text-fuchsia-200 border-fuchsia-500/30",
    emphasis: "Agent orchestration, memory and guardrails"
  },
  static: {
    name: "Static Performance",
    accent: "from-sky-500 to-teal-400",
    panel: "bg-sky-500/10 border-sky-500/30",
    chip: "bg-sky-500/20 text-sky-200 border-sky-500/30",
    emphasis: "SEO and performance first"
  }
};
