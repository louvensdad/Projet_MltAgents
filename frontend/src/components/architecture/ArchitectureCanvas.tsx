"use client";

import StackConnection from "./StackConnection";
import StackFlowNode, { FlowNode } from "./StackFlowNode";

interface Props {
  frontend: string;
  stackName: string;
  architecture: string;
  security: string[];
  messaging: string[];
  database: string;
}

export default function ArchitectureCanvas({ frontend, stackName, architecture, security, messaging, database }: Props) {
  const isStatic = stackName.toLowerCase().includes("static");
  if (isStatic) {
    const staticNodes: FlowNode[] = [
      { id: "html", label: "HTML Semântico", layer: "frontend", hint: "Estrutura semanticamente correta e acessível." },
      { id: "css", label: "CSS Responsivo", layer: "gateway", hint: "Design mobile-first, grid moderno e animações." },
      { id: "js", label: "JS Interativo", layer: "backend", hint: "Navbar, FAQ accordion, validação de formulário." },
      { id: "seo", label: "SEO + OG", layer: "security", hint: "Meta tags, canonical, robots e sitemap." },
      { id: "analytics", label: "Analytics Hooks", layer: "messaging", hint: "Eventos de conversão e jornada de usuário." },
      { id: "a11y", label: "Accessibility + Performance", layer: "database", hint: "Boas práticas WCAG e otimizações de carga." }
    ];
    return (
      <div className="rounded-xl border border-white/10 bg-black/30 p-4">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Static Site Preview</p>
        <div className="mt-3 space-y-0.5">
          {staticNodes.map((node, idx) => (
            <div key={node.id}>
              <StackFlowNode node={node} />
              {idx < staticNodes.length - 1 && <StackConnection />}
            </div>
          ))}
        </div>
      </div>
    );
  }

  const nodes: FlowNode[] = [
    { id: "frontend", label: frontend || "Frontend", layer: "frontend", hint: "Camada de experiência do usuário." },
    { id: "gateway", label: architecture.includes("Micro") ? "API Gateway" : "API Layer", layer: "gateway", hint: "Roteamento e governança de tráfego." },
    { id: "backend", label: stackName, layer: "backend", hint: "Núcleo de regras de negócio e serviços." },
    { id: "security", label: security[0] || "Security", layer: "security", hint: "Autenticação, autorização e identidade." },
    { id: "messaging", label: messaging[0] || "Messaging", layer: "messaging", hint: "Comunicação assíncrona e eventos." },
    { id: "database", label: database || "Database", layer: "database", hint: "Persistência e consistência de dados." }
  ];

  return (
    <div className="rounded-xl border border-white/10 bg-black/30 p-4">
      <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Real-time Architecture Preview</p>
      <div className="mt-3 space-y-0.5">
        {nodes.map((node, idx) => (
          <div key={node.id}>
            <StackFlowNode node={node} />
            {idx < nodes.length - 1 && <StackConnection />}
          </div>
        ))}
      </div>
    </div>
  );
}
