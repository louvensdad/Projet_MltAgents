"use client";

import { useWizard } from "@/context/WizardContext";
import { PROJECT_TYPE_PROFILES } from "@/lib/projectTypeProfiles";
import { STACK_PROFILES } from "@/lib/stackProfiles";
import { Server, Globe, Bot, Blocks, Zap, Cpu, Layers } from "lucide-react";

const ICON_MAP: Record<string, React.ElementType> = {
  Layers, Server, Globe, Zap, Bot, Blocks, Cpu
};

export default function Step1ProjectType() {
  const { data, updateData } = useWizard();

  const options = [
    { id: "saas", type: "saas" as const, auto: false, agents: false },
    { id: "api", type: "api" as const, auto: false, agents: false },
    { id: "static", type: "static" as const, auto: false, agents: false },
    { id: "automacao", type: "api" as const, auto: true, agents: false },
    { id: "agentes", type: "api" as const, auto: true, agents: true },
    { id: "saas_full", type: "saas" as const, auto: true, agents: true },
    { id: "site_full", type: "static" as const, auto: true, agents: true },
  ];

  const currentId = options.find(o =>
    o.type === data.project_type &&
    o.auto === data.use_automation &&
    o.agents === data.use_agents
  )?.id || "saas";

  return (
    <div className="space-y-1.5">
      {options.map((opt) => {
        const profile = PROJECT_TYPE_PROFILES[opt.id];
        if (!profile) return null;
        const Icon = ICON_MAP[profile.icon] || Layers;
        const isSelected = currentId === opt.id;
        const stackProfile = STACK_PROFILES[profile.stackKey as keyof typeof STACK_PROFILES];

        const complexityDots =
          profile.complexity === "Baixa" ? 1 : profile.complexity === "Média" ? 2 : 3;

        return (
          <button
            key={opt.id}
            onClick={() => {
              updateData({
                project_type: opt.type,
                use_automation: opt.auto,
                use_agents: opt.agents,
                selected_stack_key: profile.stackKey as any,
                backend_stack: stackProfile.backendLabel as any,
                selected_frontend: stackProfile.frontends[0] || "",
                selected_database: stackProfile.databases[0] || "",
                selected_security: stackProfile.security.slice(0, 1),
                selected_messaging: stackProfile.messaging.slice(0, 1),
                selected_architecture: stackProfile.architectures[0] || "",
              });
            }}
            className={`w-full text-left rounded-xl border-2 p-3 transition-all duration-200 ${
              isSelected
                ? `border-transparent bg-gradient-to-br ${profile.gradient}/10 shadow-[0_0_15px_-3px_rgba(59,130,246,0.15)] ring-1 ring-white/15`
                : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.06] hover:border-white/10"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg transition-all duration-300 ${
                isSelected
                  ? `bg-gradient-to-br ${profile.gradient} text-white shadow-lg shadow-black/20`
                  : "bg-white/[0.04] text-gray-500 group-hover:text-gray-300"
              }`}>
                <Icon size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-bold truncate ${isSelected ? "text-white" : "text-gray-300"}`}>
                  {profile.title}
                </p>
                <p className="text-[11px] text-gray-500 truncate mt-0.5">{profile.audience}</p>
              </div>
              <div className="flex gap-[3px] items-center">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                      i <= complexityDots
                        ? `bg-gradient-to-r ${profile.gradient}`
                        : "bg-white/10"
                    } ${isSelected && i <= complexityDots ? "scale-110" : ""}`}
                  />
                ))}
              </div>
            </div>
            {isSelected && (
              <div className="mt-2.5 flex flex-wrap gap-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
                {profile.tags.map((tag) => (
                  <span
                    key={tag}
                    className={`text-[10px] font-medium px-2 py-0.5 rounded-md border ${profile.gradient}/20 bg-white/[0.03] text-gray-400`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
