import { StackKey } from "./stackProfiles";

export interface StackTheme {
  name: string;
  accent: string;
  panel: string;
  chip: string;
  emphasis: string;
}

export const STACK_THEMES: Record<StackKey, StackTheme> = {
  springboot: {
    name: "Spring Enterprise",
    accent: "from-emerald-500 to-cyan-500",
    panel: "bg-emerald-500/10 border-emerald-500/30",
    chip: "bg-emerald-500/20 text-emerald-200 border-emerald-500/30",
    emphasis: "Angular + Keycloak + Kafka recomendados para enterprise"
  },
  fastapi: {
    name: "FastAPI Async",
    accent: "from-cyan-500 to-blue-500",
    panel: "bg-cyan-500/10 border-cyan-500/30",
    chip: "bg-cyan-500/20 text-cyan-200 border-cyan-500/30",
    emphasis: "Next.js + Redis para UX rápida e baixa latência"
  },
  nestjs: {
    name: "NestJS Modular",
    accent: "from-rose-500 to-red-500",
    panel: "bg-rose-500/10 border-rose-500/30",
    chip: "bg-rose-500/20 text-rose-200 border-rose-500/30",
    emphasis: "Arquitetura modular com serviços escaláveis"
  },
  express: {
    name: "Express Lean",
    accent: "from-slate-500 to-zinc-400",
    panel: "bg-slate-500/10 border-slate-500/30",
    chip: "bg-slate-500/20 text-slate-200 border-slate-500/30",
    emphasis: "API pragmática com baixa fricção operacional"
  },
  laravel: {
    name: "Laravel Fullstack",
    accent: "from-orange-500 to-red-500",
    panel: "bg-orange-500/10 border-orange-500/30",
    chip: "bg-orange-500/20 text-orange-200 border-orange-500/30",
    emphasis: "Fluxo fullstack clean e produtivo"
  },
  dotnet: {
    name: "ASP.NET Enterprise",
    accent: "from-violet-500 to-indigo-500",
    panel: "bg-violet-500/10 border-violet-500/30",
    chip: "bg-violet-500/20 text-violet-200 border-violet-500/30",
    emphasis: "Ecossistema Microsoft com alta governança"
  },
  static: {
    name: "Static Performance",
    accent: "from-sky-500 to-teal-400",
    panel: "bg-sky-500/10 border-sky-500/30",
    chip: "bg-sky-500/20 text-sky-200 border-sky-500/30",
    emphasis: "SEO e performance como prioridade"
  }
};
