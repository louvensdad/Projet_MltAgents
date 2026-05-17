export type StackKey = "springboot" | "fastapi" | "nestjs" | "express" | "laravel" | "dotnet" | "static";

export type SupportLevel = "full" | "partial" | "planned";

export interface StackProfile {
  key: StackKey;
  name: string;
  backendLabel: string;
  versions: string[];
  architectures: string[];
  frontends: string[];
  databases: string[];
  security: string[];
  messaging: string[];
  docs: string[];
  templates: string[];
  aiModels: string[];
  features: Record<string, SupportLevel>;
  identity: {
    accent: string;
    tone: string;
    highlight: string;
  };
}

export const PROJECT_TYPES = [
  "SaaS",
  "API Backend",
  "Site Estático",
  "Automação",
  "Agentes IA",
  "SaaS + IA",
  "Site + IA",
  "Plataforma Enterprise"
];

export const STACK_PROFILES: Record<StackKey, StackProfile> = {
  springboot: {
    key: "springboot",
    name: "Spring Boot Wizard",
    backendLabel: "Java + Spring Boot",
    versions: ["Java 17", "Java 21", "Spring Boot 3.2", "Spring Boot 3.3", "Node 20 (frontend toolchain)"],
    architectures: ["Monólito Modular", "Microsserviços", "Event Driven", "Clean Architecture"],
    frontends: ["Angular", "React", "Vue", "Thymeleaf"],
    databases: ["PostgreSQL", "MySQL", "H2"],
    security: ["Spring Security", "JWT", "OAuth2", "Keycloak"],
    messaging: ["Kafka", "RabbitMQ", "Redis", "WebSocket", "SSE"],
    docs: ["OpenAPI", "Arquitetura", "Playbooks Enterprise"],
    templates: ["Spring Modular SaaS", "Spring + Angular Enterprise"],
    aiModels: ["gpt-4.1", "gpt-4o-mini"],
    features: { Keycloak: "partial", Kafka: "full", gRPC: "planned", "Spring Security": "full" },
    identity: { accent: "from-emerald-500 to-cyan-500", tone: "Enterprise Java", highlight: "Angular em destaque para front corporativo" }
  },
  fastapi: {
    key: "fastapi",
    name: "FastAPI Wizard",
    backendLabel: "Python + FastAPI",
    versions: ["Python 3.11", "Python 3.12", "FastAPI Latest", "Node 20 (frontend toolchain)"],
    architectures: ["Modular Monolith", "Async API", "Event Driven", "Clean Architecture"],
    frontends: ["React", "Next.js", "Vue"],
    databases: ["PostgreSQL", "MySQL", "SQLite"],
    security: ["JWT", "OAuth2"],
    messaging: ["Kafka", "RabbitMQ", "Redis", "WebSocket", "SSE"],
    docs: ["OpenAPI", "Async Patterns", "Performance Notes"],
    templates: ["FastAPI Async Core", "FastAPI + Next.js"],
    aiModels: ["gpt-4.1-mini", "gpt-4o-mini"],
    features: { Keycloak: "planned", Kafka: "full", gRPC: "partial", OAuth2: "full" },
    identity: { accent: "from-cyan-500 to-blue-500", tone: "Python Async", highlight: "Foco em performance e IO assíncrono" }
  },
  nestjs: {
    key: "nestjs",
    name: "NestJS Wizard",
    backendLabel: "Node.js + NestJS",
    versions: ["Node 20", "NestJS 10"],
    architectures: ["Modular Monolith", "Microsserviços", "Clean Architecture"],
    frontends: ["Angular", "React", "Next.js"],
    databases: ["PostgreSQL", "MySQL", "MongoDB"],
    security: ["JWT", "Passport", "OAuth2"],
    messaging: ["Kafka", "RabbitMQ", "Redis", "WebSocket"],
    docs: ["Swagger", "Module Contracts"],
    templates: ["Nest Enterprise API", "Nest + Angular"],
    aiModels: ["gpt-4.1-mini", "gpt-4o-mini"],
    features: { Keycloak: "partial", Kafka: "full", gRPC: "full", Passport: "full" },
    identity: { accent: "from-red-500 to-rose-500", tone: "Node Enterprise", highlight: "Estrutura modular com DI forte" }
  },
  express: {
    key: "express",
    name: "Express Wizard",
    backendLabel: "Node.js + Express",
    versions: ["Node 20", "Express 4/5"],
    architectures: ["Monólito Modular", "API Gateway + Services"],
    frontends: ["React", "Vue", "Next.js"],
    databases: ["PostgreSQL", "MySQL", "MongoDB"],
    security: ["JWT", "Passport"],
    messaging: ["Redis", "WebSocket", "SSE"],
    docs: ["OpenAPI", "Route Contracts"],
    templates: ["Express API Core"],
    aiModels: ["gpt-4o-mini"],
    features: { Keycloak: "planned", Kafka: "partial", gRPC: "planned", Passport: "full" },
    identity: { accent: "from-slate-500 to-zinc-400", tone: "Node Lean", highlight: "Fluxo direto para APIs pragmáticas" }
  },
  laravel: {
    key: "laravel",
    name: "Laravel Wizard",
    backendLabel: "PHP + Laravel",
    versions: ["PHP 8.2", "Laravel 11", "Node 20 (frontend toolchain)"],
    architectures: ["Monólito Modular", "Clean Architecture"],
    frontends: ["Blade", "Vue", "React", "Inertia"],
    databases: ["MySQL", "PostgreSQL", "SQLite"],
    security: ["Sanctum", "Passport"],
    messaging: ["Redis", "RabbitMQ", "WebSocket"],
    docs: ["API Resources", "Domain Docs"],
    templates: ["Laravel Fullstack SaaS"],
    aiModels: ["gpt-4o-mini"],
    features: { Keycloak: "planned", Kafka: "partial", gRPC: "planned", Sanctum: "full" },
    identity: { accent: "from-orange-500 to-red-500", tone: "Fullstack Laravel", highlight: "Visual clean e fluxo rápido fullstack" }
  },
  dotnet: {
    key: "dotnet",
    name: "ASP.NET Wizard",
    backendLabel: "C# + ASP.NET Core",
    versions: [".NET 8", "C# 12", "Node 20 (frontend toolchain)"],
    architectures: ["Monólito Modular", "Microsserviços", "Clean Architecture"],
    frontends: ["Blazor", "Angular", "React"],
    databases: ["SQL Server", "PostgreSQL", "SQLite"],
    security: ["Identity", "JWT", "OAuth2"],
    messaging: ["RabbitMQ", "Redis", "WebSocket", "SSE"],
    docs: ["Swagger", "Enterprise Docs"],
    templates: ["ASP.NET Enterprise Core", "ASP.NET + Blazor"],
    aiModels: ["gpt-4.1", "gpt-4o-mini"],
    features: { Keycloak: "partial", Kafka: "partial", gRPC: "full", Identity: "full" },
    identity: { accent: "from-violet-500 to-indigo-500", tone: "Enterprise Microsoft", highlight: "Integração natural com ecossistema .NET" }
  },
  static: {
    key: "static",
    name: "Static Site Wizard",
    backendLabel: "Static Site",
    versions: ["HTML5", "CSS3", "Node 20 (build optional)"],
    architectures: ["Static Rendering", "SEO-first"],
    frontends: ["HTML/CSS/JS", "Next.js (SSG)"],
    databases: ["Nenhum"],
    security: ["Nenhum"],
    messaging: ["SSE"],
    docs: ["SEO Checklist"],
    templates: ["Static Marketing Site"],
    aiModels: ["gpt-4o-mini"],
    features: { Keycloak: "planned", Kafka: "planned", gRPC: "planned", SEO: "full" },
    identity: { accent: "from-sky-500 to-teal-400", tone: "Static UX", highlight: "Foco em conteúdo, performance e SEO" }
  }
};

export const STACK_OPTIONS: { key: StackKey; label: string }[] = [
  { key: "springboot", label: "Spring Boot" },
  { key: "fastapi", label: "FastAPI" },
  { key: "nestjs", label: "NestJS" },
  { key: "express", label: "Express" },
  { key: "laravel", label: "Laravel" },
  { key: "dotnet", label: "ASP.NET" },
  { key: "static", label: "Static Site" }
];
