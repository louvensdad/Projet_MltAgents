"use client";

import { useWizard } from "@/context/WizardContext";
import { PROJECT_TYPE_PROFILES } from "@/lib/projectTypeProfiles";
import { STACK_PROFILES } from "@/lib/stackProfiles";
import { ArrowRight, CheckCircle, Clock, Cpu, Layers } from "lucide-react";

export default function ProjectTypeOverview() {
  const { data, updateData, nextStep } = useWizard();

  const options = [
    { id: "saas", type: "saas" as const, auto: false, agents: false },
    { id: "api", type: "api" as const, auto: false, agents: false },
    { id: "static", type: "static" as const, auto: false, agents: false },
    { id: "automation", type: "api" as const, auto: true, agents: false },
    { id: "ai_agents", type: "api" as const, auto: true, agents: true },
    { id: "saas_full", type: "saas" as const, auto: true, agents: true },
    { id: "site_full", type: "static" as const, auto: true, agents: true },
  ];

  const currentId = options.find(o =>
    o.type === data.project_type &&
    o.auto === data.use_automation &&
    o.agents === data.use_agents
  )?.id || "saas";

  const profile = PROJECT_TYPE_PROFILES[currentId];
  if (!profile) return null;

  const stackProfile = STACK_PROFILES[profile.stackKey as keyof typeof STACK_PROFILES];

  const handleContinue = () => {
    const p = STACK_PROFILES[profile.stackKey as keyof typeof STACK_PROFILES];
    updateData({
      selected_stack_key: profile.stackKey as any,
      backend_stack: p.backendLabel as any,
      selected_versions: p.versions.slice(0, 2),
      selected_architecture: p.architectures[0] || "",
      selected_frontend: p.frontends[0] || "",
      selected_database: p.databases[0] || "",
      selected_security: p.security.slice(0, 1),
      selected_messaging: p.messaging.slice(0, 1)
    });
    nextStep();
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className={`rounded-2xl border border-white/10 bg-gradient-to-br ${profile.gradient}/5 p-6`}>
        <div className="flex items-start justify-between gap-4 mb-5">
          <div className="flex-1 min-w-0">
            <h3 className="text-2xl font-bold text-white">{profile.title}</h3>
            <p className="mt-1.5 text-sm text-gray-400 leading-relaxed">{profile.description}</p>
          </div>
          <span className={`inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r ${profile.gradient} px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-white whitespace-nowrap shadow-lg`}>
            <Cpu size={12} />
            {profile.complexity}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-5">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Para quem serve</p>
            <p className="text-sm text-gray-300 leading-relaxed">{profile.audience}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Tempo estimado</p>
            <div className="flex items-center gap-2 text-sm text-gray-200 font-medium">
              <Clock size={14} className="text-gray-400" />
              {profile.estimatedTime}
            </div>
          </div>
        </div>

        <div className="mb-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-3">O que será gerado</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {profile.outputs.map((output) => (
              <div key={output} className="flex items-center gap-2.5 text-sm text-gray-300 py-1">
                <CheckCircle size={14} className="text-emerald-400 shrink-0" />
                <span>{output}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Tecnologias recomendadas</p>
          <div className="flex flex-wrap gap-2">
            {profile.recommended.map((tech) => (
              <span
                key={tech}
                className={`rounded-lg border ${profile.gradient}/20 bg-white/[0.04] px-3 py-1.5 text-xs text-gray-200 font-medium`}
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-2 border-t border-white/5">
          <button
            onClick={handleContinue}
            className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 active:scale-[0.97]"
          >
            Continuar com {profile.title}
            <ArrowRight size={16} />
          </button>
          <button className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-gray-400 transition-all hover:bg-white/10 hover:text-gray-200 active:scale-[0.97]">
            Ver Detalhes
          </button>
        </div>
      </div>
    </div>
  );
}
