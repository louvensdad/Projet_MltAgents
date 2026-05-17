export type MaturityLevel = "experimental" | "beta" | "stable" | "enterprise";

export interface StackMaturityScores {
  generator_score: number;
  template_score: number;
  validation_score: number;
  docker_score: number;
  deployment_score: number;
  security_score: number;
  test_score: number;
}

export interface StackMaturityInfo {
  key: string;
  name: string;
  type: "frontend" | "backend" | "fullstack";
  level: MaturityLevel;
  score: number;
  scores: StackMaturityScores;
  features: { name: string; supported: boolean }[];
}

interface StackMaturityInput {
  key: string;
  name: string;
  type: "frontend" | "backend" | "fullstack";
  scores: StackMaturityScores;
  features: { name: string; supported: boolean }[];
}

function calcLevel(score: number): MaturityLevel {
  if (score >= 86) return "enterprise";
  if (score >= 61) return "stable";
  if (score >= 31) return "beta";
  return "experimental";
}

function avg(s: StackMaturityScores): number {
  const vals = Object.values(s);
  return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
}

const STACKS_INPUT: StackMaturityInput[] = [
  {
    key: "react",
    name: "React",
    type: "frontend",
    scores: {
      generator_score: 95,
      template_score: 90,
      validation_score: 85,
      docker_score: 80,
      deployment_score: 85,
      security_score: 75,
      test_score: 80,
    },
    features: [
      { name: "Scaffold", supported: true },
      { name: "Build", supported: true },
      { name: "Docker", supported: true },
      { name: "Validation", supported: true },
      { name: "Templates", supported: true },
      { name: "Frontend Generator", supported: true },
      { name: "Native Mobile", supported: false },
    ],
  },
  {
    key: "angular",
    name: "Angular",
    type: "frontend",
    scores: {
      generator_score: 98,
      template_score: 95,
      validation_score: 92,
      docker_score: 85,
      deployment_score: 88,
      security_score: 90,
      test_score: 85,
    },
    features: [
      { name: "Scaffold", supported: true },
      { name: "Build", supported: true },
      { name: "Docker", supported: true },
      { name: "Validation", supported: true },
      { name: "Templates", supported: true },
      { name: "Enterprise Patterns", supported: true },
      { name: "PWA", supported: true },
    ],
  },
  {
    key: "nextjs",
    name: "Next.js",
    type: "frontend",
    scores: {
      generator_score: 90,
      template_score: 88,
      validation_score: 82,
      docker_score: 78,
      deployment_score: 92,
      security_score: 75,
      test_score: 75,
    },
    features: [
      { name: "Scaffold", supported: true },
      { name: "SSR", supported: true },
      { name: "App Router", supported: true },
      { name: "Templates", supported: true },
      { name: "Deploy", supported: true },
      { name: "Docker", supported: true },
      { name: "Static Export", supported: true },
    ],
  },
  {
    key: "vue",
    name: "Vue",
    type: "frontend",
    scores: {
      generator_score: 88,
      template_score: 85,
      validation_score: 80,
      docker_score: 75,
      deployment_score: 80,
      security_score: 72,
      test_score: 78,
    },
    features: [
      { name: "Scaffold", supported: true },
      { name: "Build", supported: true },
      { name: "Docker", supported: true },
      { name: "Validation", supported: true },
      { name: "Templates", supported: true },
      { name: "Composition API", supported: true },
      { name: "SSR (Nuxt)", supported: false },
    ],
  },
  {
    key: "springboot",
    name: "Spring Boot",
    type: "backend",
    scores: {
      generator_score: 96,
      template_score: 92,
      validation_score: 90,
      docker_score: 88,
      deployment_score: 90,
      security_score: 95,
      test_score: 88,
    },
    features: [
      { name: "Scaffold", supported: true },
      { name: "Build", supported: true },
      { name: "Docker", supported: true },
      { name: "Validation", supported: true },
      { name: "Templates", supported: true },
      { name: "Security", supported: true },
      { name: "Enterprise", supported: true },
    ],
  },
  {
    key: "fastapi",
    name: "FastAPI",
    type: "backend",
    scores: {
      generator_score: 92,
      template_score: 88,
      validation_score: 85,
      docker_score: 85,
      deployment_score: 85,
      security_score: 78,
      test_score: 82,
    },
    features: [
      { name: "Scaffold", supported: true },
      { name: "Build", supported: true },
      { name: "Docker", supported: true },
      { name: "Validation", supported: true },
      { name: "Templates", supported: true },
      { name: "Async Support", supported: true },
      { name: "Auto Docs", supported: true },
    ],
  },
  {
    key: "nestjs",
    name: "NestJS",
    type: "backend",
    scores: {
      generator_score: 88,
      template_score: 85,
      validation_score: 82,
      docker_score: 80,
      deployment_score: 82,
      security_score: 80,
      test_score: 85,
    },
    features: [
      { name: "Scaffold", supported: true },
      { name: "Build", supported: true },
      { name: "Docker", supported: true },
      { name: "Validation", supported: true },
      { name: "Templates", supported: true },
      { name: "Modular Architecture", supported: true },
      { name: "Microservices", supported: true },
    ],
  },
  {
    key: "express",
    name: "Express",
    type: "backend",
    scores: {
      generator_score: 82,
      template_score: 75,
      validation_score: 72,
      docker_score: 78,
      deployment_score: 80,
      security_score: 65,
      test_score: 70,
    },
    features: [
      { name: "Scaffold", supported: true },
      { name: "Build", supported: true },
      { name: "Docker", supported: true },
      { name: "Validation", supported: true },
      { name: "Templates", supported: true },
      { name: "Pipeline", supported: false },
      { name: "Security Audit", supported: false },
    ],
  },
  {
    key: "laravel",
    name: "Laravel",
    type: "backend",
    scores: {
      generator_score: 85,
      template_score: 80,
      validation_score: 75,
      docker_score: 72,
      deployment_score: 75,
      security_score: 75,
      test_score: 72,
    },
    features: [
      { name: "Scaffold", supported: true },
      { name: "Build", supported: true },
      { name: "Docker", supported: true },
      { name: "Validation", supported: true },
      { name: "Templates", supported: true },
      { name: "Pipeline", supported: false },
      { name: "CI/CD", supported: false },
    ],
  },
  {
    key: "dotnet",
    name: "ASP.NET",
    type: "backend",
    scores: {
      generator_score: 90,
      template_score: 85,
      validation_score: 88,
      docker_score: 82,
      deployment_score: 85,
      security_score: 90,
      test_score: 82,
    },
    features: [
      { name: "Scaffold", supported: true },
      { name: "Build", supported: true },
      { name: "Docker", supported: true },
      { name: "Validation", supported: true },
      { name: "Templates", supported: true },
      { name: "Enterprise", supported: true },
      { name: "Identity", supported: true },
    ],
  },
  {
    key: "blazor",
    name: "Blazor",
    type: "fullstack",
    scores: {
      generator_score: 78,
      template_score: 72,
      validation_score: 70,
      docker_score: 75,
      deployment_score: 75,
      security_score: 78,
      test_score: 68,
    },
    features: [
      { name: "Scaffold", supported: true },
      { name: "Build", supported: true },
      { name: "Docker", supported: true },
      { name: "Validation", supported: true },
      { name: "Templates", supported: false },
      { name: "Pipeline", supported: false },
      { name: "CI/CD", supported: false },
    ],
  },
  {
    key: "static",
    name: "Static Site",
    type: "frontend",
    scores: {
      generator_score: 92,
      template_score: 90,
      validation_score: 80,
      docker_score: 85,
      deployment_score: 95,
      security_score: 95,
      test_score: 70,
    },
    features: [
      { name: "Scaffold", supported: true },
      { name: "Build", supported: true },
      { name: "Docker", supported: true },
      { name: "Validation", supported: true },
      { name: "Templates", supported: true },
      { name: "SEO", supported: true },
      { name: "Performance", supported: true },
    ],
  },
];

const STACKS: StackMaturityInfo[] = STACKS_INPUT.map((s) => ({
  ...s,
  level: calcLevel(avg(s.scores)),
  score: avg(s.scores),
}));

const maturityMap = new Map<string, StackMaturityInfo>();

STACKS.forEach((s) => {
  maturityMap.set(s.key, s);
});

export function getStackMaturity(key: string): StackMaturityInfo | undefined {
  return maturityMap.get(key);
}

export function getAllStackMaturities(): StackMaturityInfo[] {
  return STACKS;
}

export function getGeneratorsForDashboard() {
  return STACKS.map((s) => ({
    stack: s.key,
    generator: `${s.name} Generator`,
    support_level: s.level,
    last_validation: "2026-05-10 12:00 UTC",
    maturity_score: s.score,
  }));
}
