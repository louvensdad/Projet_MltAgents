"use client";

import { useWizard } from "@/context/WizardContext";
import { Compass, Settings2, Sparkles, Shield, ShieldCheck, Gauge, DollarSign, Clock, AlertTriangle } from "lucide-react";

const AI_MODES = [
  {
    id: "local_build_90" as const,
    label: "Local Build 90%",
    description: "Gratuito, sem API externa, usa templates e gatekeepers",
    icon: Shield,
    color: "text-emerald-400",
    borderColor: "border-emerald-500",
    bgColor: "bg-emerald-500/10",
    shadow: "shadow-[0_0_15px_rgba(16,185,129,0.2)]",
    details: { quality: "90%", cost: "Grátis", time: "Rápido", risk: "Nenhum" },
  },
  {
    id: "agent_boost_100" as const,
    label: "Agent Boost 100%",
    description: "Pago, usa infraestrutura de IA da plataforma",
    icon: Sparkles,
    color: "text-violet-400",
    borderColor: "border-violet-500",
    bgColor: "bg-violet-500/10",
    shadow: "shadow-[0_0_15px_rgba(168,85,247,0.2)]",
    details: { quality: "100%", cost: "Pago", time: "Médio", risk: "Baixo" },
  },
];

export default function Step5Mode() {
  const { data, updateData } = useWizard();

  const selectedMode = data.ai_generation_mode;
  const isLocalBuild = selectedMode === "local_build_90";
  const isAgentBoost = selectedMode === "agent_boost_100";

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4">
      <h2 className="text-2xl font-bold mb-6">Configuração do Projeto</h2>

      {/* Project Mode: Guiado vs Avançado */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          onClick={() => updateData({ mode: "Guiado" })}
          className={`p-6 rounded-xl border cursor-pointer transition-all ${
            data.mode === "Guiado"
              ? "bg-primary/10 border-primary shadow-[0_0_15px_rgba(59,130,246,0.2)]"
              : "bg-surface border-border hover:bg-white/5"
          }`}
        >
          <Compass size={32} className={data.mode === "Guiado" ? "text-primary mb-4" : "text-gray-500 mb-4"} />
          <h3 className={`text-xl font-bold mb-2 ${data.mode === "Guiado" ? "text-primary" : "text-gray-200"}`}>Modo Guiado</h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            Nós tomamos as decisões por você com base nas melhores práticas da indústria. Ideal para MVP rápido.
          </p>
        </div>

        <div
          onClick={() => updateData({ mode: "Avançado" })}
          className={`p-6 rounded-xl border cursor-pointer transition-all ${
            data.mode === "Avançado"
              ? "bg-purple-500/10 border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.2)]"
              : "bg-surface border-border hover:bg-white/5"
          }`}
        >
          <Settings2 size={32} className={data.mode === "Avançado" ? "text-purple-500 mb-4" : "text-gray-500 mb-4"} />
          <h3 className={`text-xl font-bold mb-2 ${data.mode === "Avançado" ? "text-purple-500" : "text-gray-200"}`}>Modo Avançado</h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            Controle granular. Você define cada detalhe: banco, autenticação, cache, testes e documentação.
          </p>
        </div>
      </div>

      {/* AI Generation Mode */}
      <div className="mt-8">
        <h3 className="text-lg font-bold mb-4">Modo de IA para Geração</h3>
        <p className="text-gray-400 text-sm mb-4">Escolha como o motor de IA será usado para gerar seu projeto.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {AI_MODES.map((mode) => {
            const Icon = mode.icon;
            const isSelected = selectedMode === mode.id;
            return (
              <div
                key={mode.id}
                onClick={() => {
                  updateData({ ai_generation_mode: mode.id, use_ai: mode.id !== "local_build_90" });
                }}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? `${mode.bgColor} ${mode.borderColor} ${mode.shadow}`
                    : "bg-surface border-border hover:bg-white/5"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Icon size={20} className={isSelected ? mode.color : "text-gray-500"} />
                  <h4 className={`font-bold text-sm ${isSelected ? mode.color : "text-gray-200"}`}>{mode.label}</h4>
                </div>
                <p className="text-gray-400 text-xs mb-2">{mode.description}</p>
                <div className="grid grid-cols-2 gap-1 text-[10px] text-gray-500">
                  <span>Qualidade: {mode.details.quality}</span>
                  <span>Custo: {mode.details.cost}</span>
                  <span>Tempo: {mode.details.time}</span>
                  <span>Risco: {mode.details.risk}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Fallback toggle */}
      <div className="p-4 bg-surface border border-border rounded-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldCheck size={20} className={data.allow_mock_fallback ? "text-emerald-400" : "text-gray-500"} />
            <div>
              <h3 className="font-bold text-gray-200 text-sm">Permitir fallback para Local Build</h3>
              <p className="text-xs text-gray-400 mt-0.5">Se Agent Boost falhar, usar Local Build 90% automaticamente</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={data.allow_mock_fallback}
              onChange={(e) => updateData({ allow_mock_fallback: e.target.checked })}
            />
            <div className="w-14 h-7 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-500"></div>
          </label>
        </div>
      </div>

      {isLocalBuild && (
        <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
          <div className="flex items-start gap-3">
            <Shield size={20} className="text-emerald-400 mt-0.5" />
            <div>
              <h4 className="text-emerald-400 font-bold text-sm">Local Build 90% Ativo</h4>
              <p className="text-gray-400 text-xs mt-1">
                Geração 100% local com templates e gatekeepers. Nenhuma API externa necessária. Ideal para testes e protótipos sem custo.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
