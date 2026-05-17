export interface ProjectTypeProfile {
  id: string;
  title: string;
  description: string;
  audience: string;
  outputs: string[];
  recommended: string[];
  complexity: string;
  estimatedTime: string;
  tags: string[];
  gradient: string;
  icon: string;
  stackKey: string;
}

export const PROJECT_TYPE_PROFILES: Record<string, ProjectTypeProfile> = {
  saas: {
    id: "saas",
    title: "SaaS Completo",
    description: "Backend + Frontend + Banco + Autenticação. Ideal para produtos digitais com painel administrativo e APIs.",
    audience: "Startups, produtos digitais, ISVs",
    outputs: [
      "API RESTful",
      "Frontend React/Next.js",
      "Banco de Dados",
      "Autenticação JWT/OAuth",
      "Painel Admin",
      "Docker",
      "README",
      "Documentação"
    ],
    recommended: ["Python + FastAPI", "React", "PostgreSQL", "JWT", "Redis"],
    complexity: "Média",
    estimatedTime: "Moderado",
    tags: ["Fullstack", "Auth", "Dashboard", "API"],
    gradient: "from-blue-500 to-cyan-500",
    icon: "Layers",
    stackKey: "fastapi"
  },
  api: {
    id: "api",
    title: "API Backend",
    description: "Backend robusto com documentação automática. Perfeito para microsserviços e integrações.",
    audience: "Backend developers, microsserviços, integrações",
    outputs: [
      "API RESTful",
      "OpenAPI/Swagger",
      "Banco de Dados",
      "Autenticação",
      "Testes",
      "Docker",
      "README"
    ],
    recommended: ["Node + Express", "PostgreSQL", "JWT", "Redis"],
    complexity: "Baixa",
    estimatedTime: "Rápido",
    tags: ["Backend", "API", "REST", "Microservices"],
    gradient: "from-purple-500 to-indigo-500",
    icon: "Server",
    stackKey: "fastapi"
  },
  static: {
    id: "static",
    title: "Site Estático Moderno",
    description: "Landing pages, portfólios e sites institucionais com performance máxima e SEO otimizado.",
    audience: "Landing pages, portfólios, sites institucionais",
    outputs: [
      "index.html",
      "CSS Responsivo",
      "JavaScript",
      "SEO Otimizado",
      "Formulário de Contato",
      "README",
      "Documentação"
    ],
    recommended: ["HTML5", "CSS3", "JavaScript"],
    complexity: "Baixa",
    estimatedTime: "Rápido",
    tags: ["Frontend", "Static", "SEO", "Landing"],
    gradient: "from-sky-500 to-teal-400",
    icon: "Globe",
    stackKey: "static"
  },
  automacao: {
    id: "automacao",
    title: "Automação Inteligente",
    description: "Sistema de automação com workflows, notificações e integrações. Ideal para eliminar processos repetitivos.",
    audience: "Operações, processos repetitivos, integrações",
    outputs: [
      "API RESTful",
      "Workflow Engine",
      "Notificações",
      "Integrações",
      "Dashboard",
      "Docker",
      "README"
    ],
    recommended: ["Python + FastAPI", "Redis", "PostgreSQL"],
    complexity: "Média",
    estimatedTime: "Moderado",
    tags: ["Automação", "Workflow", "Integrações", "Notificações"],
    gradient: "from-amber-500 to-orange-500",
    icon: "Zap",
    stackKey: "fastapi"
  },
  agentes: {
    id: "agentes",
    title: "Agentes Inteligentes",
    description: "Multi-agents com IA, processamento de linguagem natural e tomada de decisão autônoma.",
    audience: "Suporte IA, análise de dados, automação cognitiva",
    outputs: [
      "API RESTful",
      "AI Agent Engine",
      "Processamento NLP",
      "Memória Contextual",
      "Dashboard",
      "Docker",
      "README"
    ],
    recommended: ["Python + FastAPI", "OpenAI/GPT", "Redis", "PostgreSQL"],
    complexity: "Alta",
    estimatedTime: "Avançado",
    tags: ["IA", "Agents", "NLP", "Automação"],
    gradient: "from-fuchsia-500 to-pink-500",
    icon: "Bot",
    stackKey: "fastapi"
  },
  saas_full: {
    id: "saas_full",
    title: "SaaS + Automação + Agentes",
    description: "Plataforma completa com SaaS, automação de processos e agentes inteligentes integrados.",
    audience: "Produtos avançados, plataformas enterprise",
    outputs: [
      "API RESTful",
      "Frontend React/Next.js",
      "AI Agents",
      "Workflow Engine",
      "Dashboard Analytics",
      "Autenticação",
      "Docker",
      "README"
    ],
    recommended: ["Python + FastAPI", "React", "PostgreSQL", "Redis", "OpenAI/GPT", "Kafka"],
    complexity: "Alta",
    estimatedTime: "Avançado",
    tags: ["Fullstack", "IA", "Automação", "Enterprise", "Agents"],
    gradient: "from-violet-500 to-fuchsia-500",
    icon: "Blocks",
    stackKey: "fastapi"
  },
  site_full: {
    id: "site_full",
    title: "Site + Automação + Agentes",
    description: "Site moderno com automação de marketing e agentes de atendimento inteligentes.",
    audience: "Sites com automação, atendimento IA, marketing digital",
    outputs: [
      "Site Estático",
      "CSS Responsivo",
      "JavaScript",
      "AI Chat",
      "Formulário Automatizado",
      "SEO",
      "README"
    ],
    recommended: ["HTML5", "CSS3", "JavaScript", "OpenAI/GPT"],
    complexity: "Média",
    estimatedTime: "Moderado",
    tags: ["Frontend", "IA", "Automação", "Chat", "Marketing"],
    gradient: "from-teal-500 to-emerald-500",
    icon: "Cpu",
    stackKey: "static"
  }
};
