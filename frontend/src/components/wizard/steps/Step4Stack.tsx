"use client";

import { useWizard, BackendStack } from "@/context/WizardContext";
import { Server, Hexagon, Box, Database, Code2 } from "lucide-react";

export default function Step4Stack() {
  const { data, updateData } = useWizard();

  const stacks: { id: BackendStack; label: string; icon: any; desc: string }[] = [
    { id: "Python + FastAPI", label: "Python + FastAPI", icon: Server, desc: "Alta performance, ótimo para IA." },
    { id: "Node + NestJS", label: "Node + NestJS", icon: Hexagon, desc: "Arquitetura corporativa em TypeScript." },
    { id: "Node + Express", label: "Node + Express", icon: Box, desc: "Minimalista, flexível e rápido." },
    { id: "Java + Spring Boot", label: "Java + Spring Boot", icon: Database, desc: "Padrão da indústria, extremamente robusto." },
    { id: "PHP + Laravel", label: "PHP + Laravel", icon: Code2, desc: "Sintaxe elegante, produtivo." },
  ];

  if (data.project_type === "static") {
    return (
      <div className="space-y-6 animate-in slide-in-from-right-4">
        <h2 className="text-2xl font-bold mb-6">Stack Tecnológica</h2>
        <div className="p-6 bg-surface border border-border rounded-xl text-center">
          <Code2 size={40} className="mx-auto text-pink-400 mb-4" />
          <h3 className="text-xl font-bold text-gray-200">Site Estático</h3>
          <p className="text-gray-500 mt-2">
            Como você selecionou Site Rápido Estático, usaremos HTML5, Vanilla CSS (ou Tailwind) e JS Puro.
            Nenhuma API backend será gerada.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4">
      <h2 className="text-2xl font-bold mb-6">Stack Tecnológica (Backend)</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {stacks.map((stack) => {
          const Icon = stack.icon;
          const isSelected = data.backend_stack === stack.id;
          return (
            <div 
              key={stack.id}
              onClick={() => updateData({ backend_stack: stack.id })}
              className={`p-5 rounded-xl border flex gap-4 cursor-pointer transition-all ${
                isSelected 
                  ? "bg-primary/10 border-primary shadow-[0_0_15px_rgba(59,130,246,0.2)]" 
                  : "bg-surface border-border hover:bg-white/5"
              }`}
            >
              <div className={`mt-1 ${isSelected ? "text-primary" : "text-gray-500"}`}>
                <Icon size={24} />
              </div>
              <div>
                <h3 className={`font-semibold ${isSelected ? "text-primary" : "text-gray-200"}`}>{stack.label}</h3>
                <p className="text-sm text-gray-500 mt-1">{stack.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
