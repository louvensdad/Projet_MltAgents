"use client";

import { useWizard } from "@/context/WizardContext";
import { useState } from "react";
import { Code, CheckCircle, AlertTriangle } from "lucide-react";

export default function Step10Review() {
  const { data } = useWizard();
  const [showJson, setShowJson] = useState(false);

  // Validação
  const missingFields: string[] = [];
  if (!data.project_name) missingFields.push("Nome do projeto");
  if (!data.user_idea) missingFields.push("Ideia/Descrição");
  if (!data.briefing.targetAudience) missingFields.push("Público-alvo");
  if (!data.briefing.objective) missingFields.push("Objetivo do Sistema");

  const isReady = missingFields.length === 0;

  // Montagem do Payload para espelhar o project_runner.py
  const payload = {
    project_type: data.project_type,
    project_name: data.project_name,
    project_language: data.project_language,
    backend_stack: data.backend_stack,
    use_ai: data.use_ai,
    ai_generation_mode: data.ai_generation_mode,
    allow_mock_fallback: data.allow_mock_fallback,
    project_brief: {
      Tipo: data.project_type === "saas" ? "SaaS Completo" : data.project_type === "api" ? "API Backend" : "Site Estático",
      Nome: data.project_name,
      Ideia: data.user_idea,
      Modo: data.mode,
      "Público-alvo": data.briefing.targetAudience,
      "Objetivo": data.briefing.objective,
      "Funcionalidades": data.briefing.features.split(",").map(s => s.trim()),
      "Perfis": data.briefing.userRoles,
      "Entidades": data.briefing.entities,
      "Regras": data.briefing.businessRules,
      "Banco": data.briefing.database,
      "Autenticação": data.briefing.authentication,
      "Segurança": data.briefing.securityLevel,
      "Painel": data.briefing.adminPanel,
      "Testes": data.briefing.testing,
      "Documentação": data.briefing.documentation,
      "Deploy": data.briefing.deploy
    },
    advanced_architecture: data.advanced_architecture,
    automation: {
      automation_level: data.automation_level,
      types: data.automation_types,
      agents: data.selected_agents
    },
    integrations: {
      external_integrations: data.external_integrations
    },
    design_brief: {
      style: data.design_style,
      emotion: data.design_emotion,
      references: data.design_references
    },
    ux_rules: [
      `Focar na emoção: ${data.design_emotion}`,
      `Estilo visual: ${data.design_style}`
    ]
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 pb-10">
      <div>
        <h2 className="text-2xl font-bold mb-2">Revisão Final</h2>
        <p className="text-gray-400">Verifique os dados antes de iniciar a fábrica de software.</p>
      </div>

      {!isReady ? (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3">
          <AlertTriangle size={20} className="text-red-400 mt-0.5" />
          <div>
            <h3 className="text-red-400 font-bold">Campos Obrigatórios Pendentes</h3>
            <ul className="list-disc list-inside text-red-300 text-sm mt-2">
              {missingFields.map(f => <li key={f}>{f}</li>)}
            </ul>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-3">
          <CheckCircle size={20} className="text-green-400" />
          <span className="text-green-400 font-bold">Tudo pronto para geração!</span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="p-4 bg-surface rounded-lg border border-border">
          <p className="text-gray-500">Nome do Projeto</p>
          <p className="text-white font-medium">{data.project_name || "N/A"}</p>
        </div>
        <div className="p-4 bg-surface rounded-lg border border-border">
          <p className="text-gray-500">Tipo / Stack</p>
          <p className="text-white font-medium">{data.project_type.toUpperCase()} - {data.backend_stack}</p>
        </div>
      </div>

      <button
        onClick={() => setShowJson(!showJson)}
        className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-lg transition-colors text-sm font-medium"
      >
        <Code size={16} />
        {showJson ? "Ocultar JSON do Projeto" : "Ver JSON do Projeto"}
      </button>

      {showJson && (
        <div className="relative">
          <pre className="bg-[#050505] border border-gray-800 p-4 rounded-xl overflow-x-auto text-xs text-green-400 font-mono">
            {JSON.stringify(payload, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
