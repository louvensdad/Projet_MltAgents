"use client";

import { useWizard } from "@/context/WizardContext";
import { Shield, Sparkles, Gauge, DollarSign, Clock, AlertTriangle, Lock } from "lucide-react";

const AI_MODES = [
  {
    id: "local_build_90" as const,
    label: "Local Build 90%",
    description: "Gratuito, sem API externa, usa templates locais e gatekeepers",
    icon: Shield,
    color: "text-emerald-400",
    borderColor: "border-emerald-500",
    bgColor: "bg-emerald-500/10",
    shadow: "shadow-[0_0_15px_rgba(16,185,129,0.2)]",
    details: {
      quality: "90%",
      cost: "Grátis",
      time: "Rápido",
      risk: "Nenhum",
    },
    detailDesc: "Ideal para testes e protótipos. 90% de qualidade com zero custo.",
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
    details: {
      quality: "100%",
      cost: "Pago",
      time: "Médio",
      risk: "Baixo",
    },
    detailDesc: "Máxima qualidade. Agentes premium, revisão avançada, documentação completa. Você não precisa informar API key.",
  },
];

export default function Step5AIMode() {
  const { data, updateData } = useWizard();

  const selected = data.ai_generation_mode;
  const isPaid =
    data.payment_status === "paid" ||
    data.agent_boost_status === "active" ||
    (typeof window !== "undefined" && localStorage.getItem("agent_boost_status") === "active");

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
      <h2 className="text-2xl font-bold mb-6">Modo de IA para Geração</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {AI_MODES.map((mode) => {
          const Icon = mode.icon;
          const isSelected = selected === mode.id;
          const isBoostLocked = mode.id === "agent_boost_100" && !isPaid;

          return (
            <div
              key={mode.id}
              onClick={() => {
                if (!isBoostLocked) {
                  updateData({ ai_generation_mode: mode.id });
                }
              }}
              className={`p-5 rounded-xl border cursor-pointer transition-all ${
                isBoostLocked
                  ? "bg-surface border-border opacity-60 cursor-not-allowed"
                  : isSelected
                  ? `${mode.bgColor} ${mode.borderColor} ${mode.shadow}`
                  : "bg-surface border-border hover:bg-white/5"
              }`}
            >
              <div className="flex items-start gap-3 mb-3">
                <Icon size={28} className={isSelected && !isBoostLocked ? mode.color : "text-gray-500"} />
                <div>
                  <h3 className={`text-lg font-bold ${isSelected && !isBoostLocked ? mode.color : "text-gray-200"}`}>
                    {mode.label}
                  </h3>
                  <p className="text-gray-400 text-xs mt-1">{mode.description}</p>
                </div>
              </div>

              <p className="text-gray-500 text-xs mb-3">{mode.detailDesc}</p>

              <div className="space-y-1.5 mt-3 pt-3 border-t border-white/5">
                <div className="flex items-center gap-2 text-xs">
                  <Gauge size={12} className="text-gray-500" />
                  <span className="text-gray-400">Qualidade:</span>
                  <span className="text-gray-200 font-medium">{mode.details.quality}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <DollarSign size={12} className="text-gray-500" />
                  <span className="text-gray-400">Custo:</span>
                  <span className="text-gray-200 font-medium">{mode.details.cost}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <Clock size={12} className="text-gray-500" />
                  <span className="text-gray-400">Tempo:</span>
                  <span className="text-gray-200 font-medium">{mode.details.time}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <AlertTriangle size={12} className="text-gray-500" />
                  <span className="text-gray-400">Risco fallback:</span>
                  <span className="text-gray-200 font-medium">{mode.details.risk}</span>
                </div>
              </div>

              {isBoostLocked && (
                <div className="mt-3 pt-3 border-t border-white/5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open("/billing", "_blank");
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-violet-500/15 text-violet-300 border border-violet-500/30 hover:bg-violet-500/25 transition-all"
                  >
                    <Lock size={14} />
                    Desbloquear Agent Boost
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-6 p-5 bg-surface border border-border rounded-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield size={20} className={data.allow_mock_fallback ? "text-emerald-400" : "text-gray-500"} />
            <div>
              <h3 className="font-bold text-gray-200 text-sm">Permitir fallback para Local Build</h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Se Agent Boost falhar, usar Local Build 90% automaticamente
              </p>
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

      {selected === "local_build_90" && (
        <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
          <div className="flex items-start gap-3">
            <Shield size={20} className="text-emerald-400 mt-0.5" />
            <div>
              <h4 className="text-emerald-400 font-bold text-sm">Local Build 90% Ativo</h4>
              <p className="text-gray-400 text-xs mt-1">
                Geração 100% local com templates e gatekeepers. Nenhuma API externa necessária.
                Ideal para testes rápidos e protótipos sem custo.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="p-4 bg-violet-500/5 border border-violet-500/20 rounded-xl">
        <p className="text-gray-400 text-xs text-center">
          Agent Boost usa a infraestrutura de IA da plataforma. Você não precisa informar API key.
        </p>
      </div>
    </div>
  );
}
