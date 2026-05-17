"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { StackKey } from "@/lib/stackProfiles";

export type ProjectType = "saas" | "api" | "static";
export type BackendStack = "Python + FastAPI" | "Node + NestJS" | "Java + Spring Boot" | "Node + Express" | "PHP + Laravel";
export type ProjectMode = "Guiado" | "Avançado";

export interface BriefingData {
  targetAudience: string;
  objective: string;
  features: string;
  userRoles: string;
  entities: string;
  businessRules: string;
  securityLevel: string;
  database: string;
  authentication: string;
  adminPanel: string;
  testing: string;
  documentation: string;
  deploy: string;
}

export interface AdvancedArchitecture {
  architecture_type: string;
  communication_protocols: string[];
  api_gateway: string;
  auth_provider: string;
  monitoring: string;
  cache: string;
  testing_strategy: string[];
  endpoint_testing_tools: string[];
  logic_testing_tools: string[];
}

export interface WizardState {
  smart_mode: boolean;
  selected_stack_key: StackKey;
  selected_versions: string[];
  selected_architecture: string;
  selected_frontend: string;
  selected_database: string;
  selected_security: string[];
  selected_messaging: string[];
  selected_ux_ai: string[];
  ux_ai_preferences: string[];
  selected_presets: string[];
  smart_recommendations: string[];
  architecture_scores: {
    confidence: number;
    complexity: number;
    scalability: string;
    maintenance: string;
    deployDifficulty: string;
    estimatedCost: string;
  };
  generated_architecture_summary: string;
  step9_answers: {
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
  guided_answers: {
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

  // Step 1
  project_type: ProjectType;
  use_automation: boolean;
  use_agents: boolean;
  
  // Step 2
  project_name: string;
  user_idea: string;
  
  // Step 3
  project_language: string;
  
  // Step 4
  backend_stack: BackendStack;
  
  // Step 5
  mode: ProjectMode;
  use_ai: boolean; // Real LLM vs Mock
  
  // AI Generation Mode
  ai_generation_mode: "local_build_90" | "agent_boost_100";
  allow_mock_fallback: boolean;
  payment_status: string;
  agent_boost_status: string;
  
  // Step 6
  briefing: BriefingData;
  
  // Step 7
  advanced_architecture: AdvancedArchitecture;
  
  // Step 8
  automation_level: string;
  automation_types: string[];
  selected_agents: string[];
  external_integrations: string[];
  
  // Step 9
  design_style: string;
  design_emotion: string;
  design_references: string;
}

const defaultBriefing: BriefingData = {
  targetAudience: "",
  objective: "",
  features: "",
  userRoles: "",
  entities: "",
  businessRules: "",
  securityLevel: "Padrão da Indústria",
  database: "Relacional Padrão",
  authentication: "JWT Nativo",
  adminPanel: "Básico",
  testing: "Unitários Essenciais",
  documentation: "OpenAPI/Swagger",
  deploy: "Docker Básico"
};

const defaultArchitecture: AdvancedArchitecture = {
  architecture_type: "monolith_modular",
  communication_protocols: ["http_rest"],
  api_gateway: "none",
  auth_provider: "jwt_simple",
  monitoring: "basic_logs",
  cache: "none",
  testing_strategy: ["unit_tests"],
  endpoint_testing_tools: ["swagger_openapi"],
  logic_testing_tools: ["tests/unit"]
};

const initialState: WizardState = {
  smart_mode: false,
  selected_stack_key: "fastapi",
  selected_versions: ["Python 3.11", "FastAPI Latest", "Node 20 (frontend toolchain)"],
  selected_architecture: "Modular Monolith",
  selected_frontend: "React",
  selected_database: "PostgreSQL",
  selected_security: ["JWT"],
  selected_messaging: ["Redis"],
  selected_ux_ai: ["Dashboard Analytics"],
  ux_ai_preferences: ["Dashboard Analytics"],
  selected_presets: [],
  smart_recommendations: [],
  architecture_scores: {
    confidence: 50,
    complexity: 20,
    scalability: "Growth",
    maintenance: "Low",
    deployDifficulty: "Low",
    estimatedCost: "Low"
  },
  generated_architecture_summary: "",
  step9_answers: {
    objective: "",
    users: "",
    scale: "",
    monetization: "",
    adminPanel: "",
    publicApi: "",
    automations: "",
    aiNeeds: "",
    mobileFuture: ""
  },
  guided_answers: {
    objective: "",
    users: "",
    scale: "",
    monetization: "",
    adminPanel: "",
    publicApi: "",
    automations: "",
    aiNeeds: "",
    mobileFuture: ""
  },
  project_type: "saas",
  use_automation: false,
  use_agents: false,
  project_name: "",
  user_idea: "",
  project_language: "Português",
  backend_stack: "Python + FastAPI",
  mode: "Guiado",
  use_ai: false,
  ai_generation_mode: "local_build_90",
  allow_mock_fallback: true,
  payment_status: "pending_payment",
  agent_boost_status: "inactive",
  briefing: { ...defaultBriefing },
  advanced_architecture: { ...defaultArchitecture },
  automation_level: "none",
  automation_types: [],
  selected_agents: [],
  external_integrations: [],
  design_style: "Futurista",
  design_emotion: "Profissional",
  design_references: ""
};

interface WizardContextProps {
  step: number;
  setStep: (step: number) => void;
  data: WizardState;
  updateData: (updates: Partial<WizardState>) => void;
  updateBriefing: (updates: Partial<BriefingData>) => void;
  updateArchitecture: (updates: Partial<AdvancedArchitecture>) => void;
  nextStep: () => void;
  prevStep: () => void;
}

const WizardContext = createContext<WizardContextProps | undefined>(undefined);

export function WizardProvider({ children }: { children: ReactNode }) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<WizardState>(initialState);

  const updateData = (updates: Partial<WizardState>) => {
    setData((prev) => ({ ...prev, ...updates }));
  };

  const updateBriefing = (updates: Partial<BriefingData>) => {
    setData((prev) => ({ ...prev, briefing: { ...prev.briefing, ...updates } }));
  };

  const updateArchitecture = (updates: Partial<AdvancedArchitecture>) => {
    setData((prev) => ({ ...prev, advanced_architecture: { ...prev.advanced_architecture, ...updates } }));
  };

  const nextStep = () => setStep((p) => Math.min(p + 1, 10));
  const prevStep = () => setStep((p) => Math.max(p - 1, 1));

  return (
    <WizardContext.Provider value={{ step, setStep, data, updateData, updateBriefing, updateArchitecture, nextStep, prevStep }}>
      {children}
    </WizardContext.Provider>
  );
}

export function useWizard() {
  const context = useContext(WizardContext);
  if (!context) throw new Error("useWizard must be used within WizardProvider");
  return context;
}
