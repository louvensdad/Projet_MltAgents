export type BuilderProjectType = "static_site" | "static" | "api" | "frontend" | "saas" | "automation" | "agents";

export interface FileTreeEntry {
  path: string;
  type: "file" | "folder";
  added?: boolean;
  children?: FileTreeEntry[];
}

export interface VisualComponent {
  id: string;
  type: string;
  label: string;
  icon: string;
  color: string;
  status: "active" | "added" | "removed";
  children?: VisualComponent[];
  layer?: number;
}

export interface BuilderSnapshot {
  files: string[];
  modules: string[];
  dependencies: string[];
  docs: string[];
  tests: string[];
  structure: FileTreeEntry[];
  visualComponents: VisualComponent[];
}

const emptySnapshot: BuilderSnapshot = {
  files: [],
  modules: [],
  dependencies: [],
  docs: [],
  tests: [],
  structure: [],
  visualComponents: [],
};

export function getEmptySnapshot(): BuilderSnapshot {
  return JSON.parse(JSON.stringify(emptySnapshot));
}

// ─── STATIC SITE ──────────────────────────────────────────────────────────────

const STATIC_BASE_FILES: string[] = [
  "index.html",
  "assets/css/style.css",
  "assets/js/main.js",
  "sections/hero.html",
  "sections/about.html",
  "sections/contact.html",
  "docs/SEO.md",
  "docs/SECURITY.md",
  "README.md",
];

const STATIC_BASE_TREE: FileTreeEntry[] = [
  { path: "index.html", type: "file" },
  { path: "assets", type: "folder", children: [
    { path: "css/style.css", type: "file" },
    { path: "js/main.js", type: "file" },
  ]},
  { path: "sections", type: "folder", children: [
    { path: "hero.html", type: "file" },
    { path: "about.html", type: "file" },
    { path: "contact.html", type: "file" },
  ]},
  { path: "docs", type: "folder", children: [
    { path: "SEO.md", type: "file" },
    { path: "SECURITY.md", type: "file" },
  ]},
  { path: "README.md", type: "file" },
];

const STATIC_BASE_VISUALS: VisualComponent[] = [
  { id: "navbar", type: "nav", label: "Navbar", icon: "≡", color: "from-sky-500 to-cyan-400", status: "active", layer: 1 },
  { id: "hero", type: "hero", label: "Hero", icon: "★", color: "from-blue-500 to-indigo-400", status: "active", layer: 2 },
  { id: "about", type: "section", label: "Sobre", icon: "◈", color: "from-teal-500 to-emerald-400", status: "active", layer: 3 },
  { id: "contact", type: "section", label: "Contato", icon: "✉", color: "from-emerald-500 to-green-400", status: "active", layer: 6 },
  { id: "footer", type: "footer", label: "Footer", icon: "—", color: "from-slate-500 to-gray-400", status: "active", layer: 7 },
];

const STATIC_VISUAL_MAP: Record<string, VisualComponent> = {
  faq: { id: "faq", type: "accordion", label: "FAQ", icon: "?", color: "from-amber-500 to-orange-400", status: "added", layer: 4 },
  newsletter: { id: "newsletter", type: "form", label: "Newsletter", icon: "✉", color: "from-rose-500 to-pink-400", status: "added", layer: 5 },
  blog: { id: "blog", type: "cards", label: "Blog", icon: "📄", color: "from-violet-500 to-purple-400", status: "added", layer: 3 },
  services: { id: "services", type: "cards", label: "Serviços", icon: "◆", color: "from-cyan-500 to-blue-400", status: "added", layer: 3 },
};

const STATIC_MODULE_MAP: Record<string, { files: string[]; tree: FileTreeEntry[]; deps: string[]; docs: string[]; tests: string[] }> = {
  faq: {
    files: ["sections/faq.html"],
    tree: [{ path: "sections", type: "folder", children: [{ path: "faq.html", type: "file", added: true }]}],
    deps: [], docs: [], tests: [],
  },
  newsletter: {
    files: ["sections/newsletter.html"],
    tree: [{ path: "sections", type: "folder", children: [{ path: "newsletter.html", type: "file", added: true }]}],
    deps: [], docs: [], tests: [],
  },
  blog: {
    files: ["content/articles.json"],
    tree: [{ path: "content", type: "folder", children: [{ path: "articles.json", type: "file", added: true }]}],
    deps: [], docs: [], tests: [],
  },
  analytics: {
    files: ["assets/js/analytics.js"],
    tree: [{ path: "assets/js/analytics.js", type: "file", added: true }],
    deps: [], docs: [], tests: [],
  },
  contact_form: {
    files: ["assets/js/form-validation.js"],
    tree: [{ path: "assets/js/form-validation.js", type: "file", added: true }],
    deps: [], docs: [], tests: [],
  },
};

// ─── API BACKEND ──────────────────────────────────────────────────────────────

const API_BASE_TREE: FileTreeEntry[] = [
  { path: "src", type: "folder", children: [
    { path: "controllers/", type: "folder" },
    { path: "services/", type: "folder" },
    { path: "repositories/", type: "folder" },
    { path: "models/", type: "folder" },
    { path: "dtos/", type: "folder" },
    { path: "security/", type: "folder" },
  ]},
  { path: "tests/", type: "folder" },
  { path: "docs/", type: "folder" },
  { path: "README.md", type: "file" },
  { path: ".env.example", type: "file" },
];

const API_BASE_FILES: string[] = [
  "src/controllers/", "src/services/", "src/repositories/",
  "src/models/", "src/dtos/", "src/security/",
  "tests/", "docs/", "README.md", ".env.example",
];

const API_BASE_VISUALS: VisualComponent[] = [
  { id: "client", type: "client", label: "Client", icon: "◉", color: "from-purple-500 to-fuchsia-400", status: "active", layer: 1 },
  { id: "controller", type: "layer", label: "Controller", icon: "⇶", color: "from-indigo-500 to-blue-400", status: "active", layer: 2 },
  { id: "service", type: "layer", label: "Service", icon: "⚙", color: "from-blue-500 to-cyan-400", status: "active", layer: 3 },
  { id: "repository", type: "layer", label: "Repository", icon: "🗄", color: "from-cyan-500 to-teal-400", status: "active", layer: 4 },
  { id: "database", type: "db", label: "Database", icon: "💾", color: "from-emerald-500 to-green-400", status: "active", layer: 5 },
];

const API_VISUAL_MAP: Record<string, VisualComponent> = {
  jwt: { id: "jwt", type: "guard", label: "JWT Guard", icon: "🔒", color: "from-amber-500 to-yellow-400", status: "added", layer: 2 },
  redis: { id: "redis", type: "cache", label: "Redis Cache", icon: "⚡", color: "from-red-500 to-rose-400", status: "added", layer: 3 },
  kafka: { id: "kafka", type: "event", label: "Kafka Bus", icon: "◈", color: "from-orange-500 to-amber-400", status: "added", layer: 2 },
  swagger: { id: "swagger", type: "docs", label: "API Docs", icon: "📖", color: "from-sky-500 to-blue-400", status: "added", layer: 1 },
  tests: { id: "tests", type: "test", label: "Test Layer", icon: "🧪", color: "from-lime-500 to-green-400", status: "added", layer: 6 },
};

const API_MODULE_MAP: Record<string, { files: string[]; tree: FileTreeEntry[]; deps: string[]; docs: string[]; tests: string[] }> = {
  jwt: {
    files: ["src/security/jwt/", "src/security/jwt/JwtProvider.ts", "src/security/jwt/JwtGuard.ts"],
    tree: [{ path: "src/security/jwt", type: "folder", children: [
      { path: "JwtProvider.ts", type: "file", added: true },
      { path: "JwtGuard.ts", type: "file", added: true },
    ]}],
    deps: ["jsonwebtoken", "bcrypt"], docs: ["security/JWT_AUTH.md"], tests: ["tests/unit/security/jwt.test.ts"],
  },
  kafka: {
    files: ["src/messaging/kafka/", "src/messaging/kafka/producer.ts", "src/messaging/kafka/consumer.ts"],
    tree: [{ path: "src/messaging/kafka", type: "folder", children: [
      { path: "producer.ts", type: "file", added: true },
      { path: "consumer.ts", type: "file", added: true },
    ]}],
    deps: ["kafkajs"], docs: ["messaging/KAFKA_SETUP.md"], tests: ["tests/unit/messaging/kafka.test.ts"],
  },
  redis: {
    files: ["src/cache/redis/", "src/cache/redis/cache.service.ts"],
    tree: [{ path: "src/cache/redis", type: "folder", children: [
      { path: "cache.service.ts", type: "file", added: true },
    ]}],
    deps: ["ioredis"], docs: ["cache/REDIS_CACHE.md"], tests: ["tests/unit/cache/redis.test.ts"],
  },
  swagger: {
    files: ["docs/openapi/", "docs/openapi/openapi.yaml"],
    tree: [{ path: "docs/openapi", type: "folder", children: [
      { path: "openapi.yaml", type: "file", added: true },
    ]}],
    deps: ["swagger-ui-express"], docs: ["docs/openapi/openapi.yaml"], tests: [],
  },
  tests: {
    files: ["tests/unit/", "tests/integration/"],
    tree: [
      { path: "tests/unit/", type: "folder", added: true },
      { path: "tests/integration/", type: "folder", added: true },
    ],
    deps: ["jest", "supertest"], docs: [], tests: ["tests/unit/", "tests/integration/"],
  },
};

// ─── FRONTEND ─────────────────────────────────────────────────────────────────

const FRONTEND_BASE_TREE: FileTreeEntry[] = [
  { path: "components/", type: "folder" },
  { path: "pages/", type: "folder" },
  { path: "services/api/", type: "folder" },
  { path: "auth/", type: "folder" },
  { path: "forms/", type: "folder" },
  { path: "layouts/", type: "folder" },
  { path: "hooks/", type: "folder" },
  { path: "store/", type: "folder" },
  { path: "styles/", type: "folder" },
  { path: "tests/", type: "folder" },
];

const FRONTEND_BASE_FILES: string[] = [
  "components/", "pages/", "services/api/", "auth/", "forms/",
  "layouts/", "hooks/", "store/", "styles/", "tests/",
];

const FRONTEND_BASE_VISUALS: VisualComponent[] = [
  { id: "sidebar", type: "layout", label: "Sidebar", icon: "☰", color: "from-violet-500 to-purple-400", status: "active", layer: 1 },
  { id: "topbar", type: "layout", label: "Topbar", icon: "—", color: "from-indigo-500 to-blue-400", status: "active", layer: 1 },
  { id: "dashboard", type: "cards", label: "Dashboard Cards", icon: "◈", color: "from-fuchsia-500 to-pink-400", status: "active", layer: 2 },
  { id: "table", type: "data", label: "Tabela", icon: "⊞", color: "from-cyan-500 to-teal-400", status: "active", layer: 3 },
  { id: "form", type: "input", label: "Formulário", icon: "📝", color: "from-emerald-500 to-green-400", status: "active", layer: 4 },
];

const FRONTEND_VISUAL_MAP: Record<string, VisualComponent> = {
  auth_frontend: { id: "auth_guard", type: "guard", label: "Auth Guard", icon: "🔒", color: "from-amber-500 to-orange-400", status: "added", layer: 1 },
  charts: { id: "charts", type: "chart", label: "Gráficos", icon: "📊", color: "from-rose-500 to-red-400", status: "added", layer: 2 },
  forms_frontend: { id: "form_validation", type: "validation", label: "Validação", icon: "✓", color: "from-lime-500 to-green-400", status: "added", layer: 4 },
  api_client: { id: "api_client", type: "api", label: "API Client", icon: "⇄", color: "from-sky-500 to-blue-400", status: "added", layer: 3 },
};

const FRONTEND_MODULE_MAP: Record<string, { files: string[]; tree: FileTreeEntry[]; deps: string[]; docs: string[]; tests: string[] }> = {
  auth_frontend: {
    files: ["auth/guards/", "auth/interceptors/", "auth/AuthProvider.tsx"],
    tree: [
      { path: "auth", type: "folder", children: [
        { path: "guards/", type: "folder", added: true },
        { path: "interceptors/", type: "folder", added: true },
        { path: "AuthProvider.tsx", type: "file", added: true },
      ]},
    ],
    deps: [], docs: [], tests: [],
  },
  dashboard: {
    files: ["components/dashboard/", "components/dashboard/Charts.tsx", "components/dashboard/Metrics.tsx"],
    tree: [{ path: "components/dashboard", type: "folder", children: [
      { path: "Charts.tsx", type: "file", added: true },
      { path: "Metrics.tsx", type: "file", added: true },
    ]}],
    deps: ["recharts"], docs: [], tests: [],
  },
  forms_frontend: {
    files: ["forms/validation/", "forms/validation/validators.ts"],
    tree: [{ path: "forms/validation", type: "folder", children: [
      { path: "validators.ts", type: "file", added: true },
    ]}],
    deps: ["zod"], docs: [], tests: [],
  },
  api_client: {
    files: ["services/api/client.ts", "services/api/endpoints.ts"],
    tree: [{ path: "services/api", type: "folder", children: [
      { path: "client.ts", type: "file", added: true },
      { path: "endpoints.ts", type: "file", added: true },
    ]}],
    deps: ["axios"], docs: [], tests: [],
  },
};

// ─── SAAS FULLSTACK ───────────────────────────────────────────────────────────

const SAAS_BASE_VISUALS: VisualComponent[] = [
  { id: "frontend", type: "layer", label: "Frontend Dashboard", icon: "◈", color: "from-violet-500 to-purple-400", status: "active", layer: 1 },
  { id: "gateway", type: "layer", label: "API Gateway", icon: "⇶", color: "from-indigo-500 to-blue-400", status: "active", layer: 2 },
  { id: "services", type: "layer", label: "Services", icon: "⚙", color: "from-blue-500 to-cyan-400", status: "active", layer: 3 },
  { id: "database", type: "db", label: "Database", icon: "🗄", color: "from-emerald-500 to-green-400", status: "active", layer: 4 },
  { id: "workers", type: "layer", label: "Workers/Queue", icon: "⏳", color: "from-amber-500 to-orange-400", status: "active", layer: 5 },
];

const SAAS_VISUAL_MAP: Record<string, VisualComponent> = {
  users: { id: "users", type: "module", label: "User Module", icon: "👤", color: "from-sky-500 to-blue-400", status: "added", layer: 3 },
  payments: { id: "payments", type: "module", label: "Billing Module", icon: "💰", color: "from-emerald-500 to-green-400", status: "added", layer: 3 },
  analytics: { id: "analytics", type: "module", label: "Analytics Charts", icon: "📊", color: "from-rose-500 to-pink-400", status: "added", layer: 1 },
  admin: { id: "admin", type: "module", label: "Admin Panel", icon: "⚙", color: "from-amber-500 to-yellow-400", status: "added", layer: 1 },
  ai_assistant: { id: "ai_assistant", type: "module", label: "AI Assistant", icon: "🤖", color: "from-fuchsia-500 to-purple-400", status: "added", layer: 2 },
};

// ─── AUTOMATION ───────────────────────────────────────────────────────────────

const AUTOMATION_BASE_VISUALS: VisualComponent[] = [
  { id: "trigger", type: "start", label: "Trigger", icon: "▶", color: "from-emerald-500 to-green-400", status: "active", layer: 1 },
  { id: "condition", type: "diamond", label: "Condition", icon: "◆", color: "from-amber-500 to-yellow-400", status: "active", layer: 2 },
  { id: "job", type: "action", label: "Job", icon: "⚙", color: "from-blue-500 to-cyan-400", status: "active", layer: 3 },
  { id: "queue", type: "queue", label: "Queue", icon: "⏳", color: "from-violet-500 to-purple-400", status: "active", layer: 4 },
  { id: "notification", type: "output", label: "Notification", icon: "🔔", color: "from-rose-500 to-pink-400", status: "active", layer: 5 },
  { id: "log", type: "output", label: "Log", icon: "📝", color: "from-slate-500 to-gray-400", status: "active", layer: 6 },
];

const AUTOMATION_VISUAL_MAP: Record<string, VisualComponent> = {
  email: { id: "email", type: "node", label: "Email", icon: "✉", color: "from-sky-500 to-blue-400", status: "added", layer: 5 },
  telegram: { id: "telegram", type: "node", label: "Telegram", icon: "✈", color: "from-cyan-500 to-teal-400", status: "added", layer: 5 },
  retry: { id: "retry", type: "node", label: "Retry", icon: "↻", color: "from-orange-500 to-amber-400", status: "added", layer: 3 },
  scheduler: { id: "scheduler", type: "node", label: "Scheduler", icon: "🕐", color: "from-indigo-500 to-violet-400", status: "added", layer: 1 },
};

// ─── AGENTS IA ────────────────────────────────────────────────────────────────

const AGENTS_BASE_VISUALS: VisualComponent[] = [
  { id: "user_task", type: "start", label: "User Task", icon: "👤", color: "from-sky-500 to-blue-400", status: "active", layer: 1 },
  { id: "orchestrator", type: "layer", label: "Orchestrator", icon: "◉", color: "from-violet-500 to-purple-400", status: "active", layer: 2 },
  { id: "agent_registry", type: "layer", label: "Agent Registry", icon: "▣", color: "from-indigo-500 to-blue-400", status: "active", layer: 3 },
  { id: "tools", type: "layer", label: "Tools", icon: "🔧", color: "from-amber-500 to-yellow-400", status: "active", layer: 4 },
  { id: "memory", type: "layer", label: "Memory", icon: "🧠", color: "from-emerald-500 to-green-400", status: "active", layer: 5 },
  { id: "response", type: "end", label: "Final Response", icon: "✓", color: "from-emerald-500 to-green-400", status: "active", layer: 6 },
];

const AGENTS_VISUAL_MAP: Record<string, VisualComponent> = {
  multi_agent: { id: "multi_agent", type: "node", label: "Multi-Agent", icon: "◈", color: "from-fuchsia-500 to-pink-400", status: "added", layer: 3 },
  memory_layer: { id: "memory_layer", type: "node", label: "Memory Layer", icon: "💾", color: "from-cyan-500 to-teal-400", status: "added", layer: 5 },
  tool_nodes: { id: "tool_nodes", type: "node", label: "Tool Nodes", icon: "🔨", color: "from-orange-500 to-amber-400", status: "added", layer: 4 },
  rag: { id: "rag", type: "node", label: "RAG Pipeline", icon: "📚", color: "from-rose-500 to-red-400", status: "added", layer: 3 },
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function mergeTree(existing: FileTreeEntry[], additions: FileTreeEntry[]): FileTreeEntry[] {
  const result = [...existing];
  for (const add of additions) {
    if (add.type === "file") {
      const exists = result.some(r => r.path === add.path && r.type === "file");
      if (!exists) result.push(add);
    } else {
      const existingFolder = result.find(r => r.path === add.path && r.type === "folder");
      if (existingFolder && add.children) {
        existingFolder.children = mergeTree(existingFolder.children || [], add.children);
      } else if (!existingFolder) {
        result.push(add);
      }
    }
  }
  return result;
}

function mergeVisuals(existing: VisualComponent[], additions: VisualComponent[]): VisualComponent[] {
  const result = [...existing];
  for (const add of additions) {
    const idx = result.findIndex(r => r.id === add.id);
    if (idx >= 0) {
      result[idx] = { ...result[idx], ...add, status: "added" };
    } else {
      result.push(add);
    }
  }
  return result;
}

// ─── COMPUTE SNAPSHOTS ────────────────────────────────────────────────────────

export function computeStaticSiteSnapshot(sections: string[], formOptions: string[] = [], uxOptions: string[] = []): BuilderSnapshot {
  let files = [...STATIC_BASE_FILES];
  let tree = [...STATIC_BASE_TREE.map(t => JSON.parse(JSON.stringify(t)))];
  let visuals = [...STATIC_BASE_VISUALS.map(v => JSON.parse(JSON.stringify(v)))];
  const modules: string[] = [];
  let deps: string[] = [];
  let docs: string[] = [];
  let tests: string[] = [];

  const sectionMapping: Record<string, string> = {
    faq: "faq", newsletter: "newsletter", blog: "blog", services: "services",
  };

  for (const section of sections) {
    const mapped = sectionMapping[section];
    if (mapped && STATIC_MODULE_MAP[mapped]) {
      const mod = STATIC_MODULE_MAP[mapped];
      files = [...files, ...mod.files];
      tree = mergeTree(tree, mod.tree);
      modules.push(section);
      deps = [...deps, ...mod.deps];
      docs = [...docs, ...mod.docs];
      tests = [...tests, ...mod.tests];
    }
    if (mapped && STATIC_VISUAL_MAP[mapped]) {
      visuals = mergeVisuals(visuals, [STATIC_VISUAL_MAP[mapped]]);
    }
  }

  if (formOptions.includes("analytics")) {
    const mod = STATIC_MODULE_MAP["analytics"];
    files = [...files, ...mod.files];
    tree = mergeTree(tree, mod.tree);
    modules.push("analytics");
  }

  const hasForm = formOptions.length > 0 || formOptions.includes("contact");
  if (hasForm) {
    const mod = STATIC_MODULE_MAP["contact_form"];
    files = [...files, ...mod.files];
    tree = mergeTree(tree, mod.tree);
    modules.push("contact_form");
  }

  return {
    files: Array.from(new Set(files)),
    modules: Array.from(new Set(modules)),
    dependencies: Array.from(new Set(deps)),
    docs: Array.from(new Set(docs)),
    tests: Array.from(new Set(tests)),
    structure: tree,
    visualComponents: visuals,
  };
}

export function computeApiSnapshot(auth: string[], messaging: string[], cache: string[], docs_opts: string[], test_opts: string[]): BuilderSnapshot {
  let files = [...API_BASE_FILES];
  let tree = [...API_BASE_TREE.map(t => JSON.parse(JSON.stringify(t)))];
  let visuals = [...API_BASE_VISUALS.map(v => JSON.parse(JSON.stringify(v)))];
  const modules: string[] = [];
  let deps: string[] = [];
  let docs: string[] = [];
  let tests: string[] = [];

  if (auth.some(a => a.toLowerCase().includes("jwt"))) {
    const mod = API_MODULE_MAP["jwt"];
    files = [...files, ...mod.files];
    tree = mergeTree(tree, mod.tree);
    modules.push("JWT");
    deps = [...deps, ...mod.deps];
    docs = [...docs, ...mod.docs];
    tests = [...tests, ...mod.tests];
    visuals = mergeVisuals(visuals, [API_VISUAL_MAP.jwt]);
  }

  if (messaging.some(m => m.toLowerCase().includes("kafka"))) {
    const mod = API_MODULE_MAP["kafka"];
    files = [...files, ...mod.files];
    tree = mergeTree(tree, mod.tree);
    modules.push("Kafka");
    deps = [...deps, ...mod.deps];
    docs = [...docs, ...mod.docs];
    tests = [...tests, ...mod.tests];
    visuals = mergeVisuals(visuals, [API_VISUAL_MAP.kafka]);
  }

  if (cache.some(c => c.toLowerCase().includes("redis")) || messaging.some(m => m.toLowerCase().includes("redis"))) {
    const mod = API_MODULE_MAP["redis"];
    files = [...files, ...mod.files];
    tree = mergeTree(tree, mod.tree);
    modules.push("Redis");
    deps = [...deps, ...mod.deps];
    docs = [...docs, ...mod.docs];
    tests = [...tests, ...mod.tests];
    visuals = mergeVisuals(visuals, [API_VISUAL_MAP.redis]);
  }

  if (docs_opts.some(d => d.toLowerCase().includes("swagger") || d.toLowerCase().includes("openapi"))) {
    const mod = API_MODULE_MAP["swagger"];
    files = [...files, ...mod.files];
    tree = mergeTree(tree, mod.tree);
    modules.push("Swagger");
    deps = [...deps, ...mod.deps];
    docs = [...docs, ...mod.docs];
    tests = [...tests, ...mod.tests];
    visuals = mergeVisuals(visuals, [API_VISUAL_MAP.swagger]);
  }

  if (test_opts.length > 0) {
    const mod = API_MODULE_MAP["tests"];
    files = [...files, ...mod.files];
    tree = mergeTree(tree, mod.tree);
    modules.push("Tests");
    deps = [...deps, ...mod.deps];
    docs = [...docs, ...mod.docs];
    tests = [...tests, ...mod.tests];
    visuals = mergeVisuals(visuals, [API_VISUAL_MAP.tests]);
  }

  return {
    files: Array.from(new Set(files)),
    modules: Array.from(new Set(modules)),
    dependencies: Array.from(new Set(deps)),
    docs: Array.from(new Set(docs)),
    tests: Array.from(new Set(tests)),
    structure: tree,
    visualComponents: visuals,
  };
}

export function computeFrontendSnapshot(modules: string[], _features: string[] = []): BuilderSnapshot {
  let files = [...FRONTEND_BASE_FILES];
  let tree = [...FRONTEND_BASE_TREE.map(t => JSON.parse(JSON.stringify(t)))];
  let visuals = [...FRONTEND_BASE_VISUALS.map(v => JSON.parse(JSON.stringify(v)))];
  const activeModules: string[] = [];
  let deps: string[] = [];
  let docs: string[] = [];
  let tests: string[] = [];

  for (const mod of modules) {
    if (FRONTEND_MODULE_MAP[mod]) {
      const m = FRONTEND_MODULE_MAP[mod];
      files = [...files, ...m.files];
      tree = mergeTree(tree, m.tree);
      activeModules.push(mod);
      deps = [...deps, ...m.deps];
      docs = [...docs, ...m.docs];
      tests = [...tests, ...m.tests];
    }
    if (FRONTEND_VISUAL_MAP[mod]) {
      visuals = mergeVisuals(visuals, [FRONTEND_VISUAL_MAP[mod]]);
    }
  }

  return {
    files: Array.from(new Set(files)),
    modules: Array.from(new Set(activeModules)),
    dependencies: Array.from(new Set(deps)),
    docs: Array.from(new Set(docs)),
    tests: Array.from(new Set(tests)),
    structure: tree,
    visualComponents: visuals,
  };
}

export function computeSaasSnapshot(modules: string[]): BuilderSnapshot {
  let visuals = [...SAAS_BASE_VISUALS.map(v => JSON.parse(JSON.stringify(v)))];
  const activeModules: string[] = [];
  let deps: string[] = [];
  let docs: string[] = [];
  let tests: string[] = [];

  for (const mod of modules) {
    activeModules.push(mod);
    if (SAAS_VISUAL_MAP[mod]) {
      visuals = mergeVisuals(visuals, [SAAS_VISUAL_MAP[mod]]);
    }
  }

  return {
    files: [],
    modules: activeModules,
    dependencies: deps,
    docs,
    tests,
    structure: [],
    visualComponents: visuals,
  };
}

export function computeAutomationSnapshot(modules: string[]): BuilderSnapshot {
  let visuals = [...AUTOMATION_BASE_VISUALS.map(v => JSON.parse(JSON.stringify(v)))];
  const activeModules: string[] = [];

  for (const mod of modules) {
    activeModules.push(mod);
    if (AUTOMATION_VISUAL_MAP[mod]) {
      visuals = mergeVisuals(visuals, [AUTOMATION_VISUAL_MAP[mod]]);
    }
  }

  return {
    files: [],
    modules: activeModules,
    dependencies: [],
    docs: [],
    tests: [],
    structure: [],
    visualComponents: visuals,
  };
}

export function computeAgentsSnapshot(modules: string[]): BuilderSnapshot {
  let visuals = [...AGENTS_BASE_VISUALS.map(v => JSON.parse(JSON.stringify(v)))];
  const activeModules: string[] = [];

  for (const mod of modules) {
    activeModules.push(mod);
    if (AGENTS_VISUAL_MAP[mod]) {
      visuals = mergeVisuals(visuals, [AGENTS_VISUAL_MAP[mod]]);
    }
  }

  return {
    files: [],
    modules: activeModules,
    dependencies: [],
    docs: [],
    tests: [],
    structure: [],
    visualComponents: visuals,
  };
}

export function buildGenerationTrace(snapshot: BuilderSnapshot, projectType: string, aiMode: string, projectName: string) {
  return {
    generated_at: new Date().toISOString(),
    project_name: projectName,
    project_type: projectType,
    ai_mode: aiMode,
    live_builder_snapshot: {
      files: snapshot.files,
      modules: snapshot.modules,
      dependencies: snapshot.dependencies,
      docs: snapshot.docs,
      tests: snapshot.tests,
    },
  };
}

export function validateGeneration(snapshot: BuilderSnapshot, actualFiles: string[]): { valid: boolean; missing: string[] } {
  const missing = snapshot.files.filter(f => !actualFiles.includes(f) && !f.endsWith("/"));
  return { valid: missing.length === 0, missing };
}
