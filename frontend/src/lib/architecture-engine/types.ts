export type StackKey = "springboot" | "fastapi" | "nestjs" | "express" | "laravel" | "dotnet" | "static";

export interface ArchitectureInput {
  stack: StackKey;
  backendLabel: string;
  frontend: string;
  architecture: string;
  database: string;
  security: string[];
  messaging: string[];
  uxAi: string[];
  presets: string[];
  guidedAnswers: {
    objective: string;
    users: string;
    scale: string;
    monetization: string;
    adminPanel: string;
    publicApi: string;
    automations: string;
    aiNeeds: string;
    mobileFuture: string;
  };
  projectName?: string;
  projectType?: string;
}

export interface ReasoningNode {
  source: string;
  trigger: string;
  impact: string;
  risk: string;
  cost: string;
  explanation: string;
}

export interface ArchitectureEngineOutput {
  recommendations: string[];
  warnings: string[];
  conflicts: string[];
  resolvedConflicts: string[];
  selectedTechnologies: string[];
  rejectedTechnologies: string[];
  scores: {
    confidence: number;
    complexity: number;
    complexityTier: "MVP" | "Startup" | "Scale" | "Enterprise" | "Distributed Enterprise";
    scalability: "Lean" | "Growth" | "Enterprise";
    securityScore: number;
    maintenance: "Low" | "Medium" | "High";
    deployDifficulty: "Low" | "Medium" | "High";
    estimatedCost: "Low" | "Medium" | "High";
  };
  infra: {
    ramGb: number;
    cpu: number;
    containers: number;
    cloudCost: "Low" | "Medium" | "High";
    requiredServices: string[];
  };
  preview: {
    modules: string[];
    services: string[];
    containers: string[];
    apis: string[];
    gateways: string[];
    queues: string[];
    ai: string[];
    automations: string[];
  };
  pipeline: Array<{ name: string; state: "done" | "pending" }>;
  reasoning: ReasoningNode[];
  summary: string;
  executionTrace: {
    rulesExecuted: string[];
    decisionsTaken: string[];
    technologiesChosen: string[];
    technologiesRejected: string[];
    conflictsResolved: string[];
    warnings: string[];
  };
  docs: {
    architectureDecisions: string;
    stackCompatibility: string;
    infrastructurePlan: string;
  };
}
