"use client";

import { useWizard } from "@/context/WizardContext";
import { useEffect } from "react";
import { ListChecks } from "lucide-react";

export default function Step6Briefing() {
  const { data, updateBriefing } = useWizard();

  useEffect(() => {
    if (data.mode === "Guiado") {
      if (!data.briefing.targetAudience) updateBriefing({ targetAudience: "Público geral ou B2B padrão" });
      if (!data.briefing.objective) updateBriefing({ objective: "Fornecer uma solução escalável para o nicho escolhido" });
      if (!data.briefing.features) updateBriefing({ features: "Login, Cadastro, Dashboard, Pagamentos, Relatórios Básicos" });
      if (!data.briefing.userRoles) updateBriefing({ userRoles: "Admin, User" });
      if (!data.briefing.entities) updateBriefing({ entities: "User, Profile, Subscription" });
      if (!data.briefing.businessRules) updateBriefing({ businessRules: "Usuários precisam estar ativos para acessar o painel." });
      
      if (!data.briefing.securityLevel) updateBriefing({ securityLevel: "OAuth2 / JWT" });
      if (!data.briefing.database) updateBriefing({ database: "PostgreSQL" });
      if (!data.briefing.authentication) updateBriefing({ authentication: "E-mail e Senha + JWT" });
      if (!data.briefing.adminPanel) updateBriefing({ adminPanel: "CRUD Básico de Usuários" });
      if (!data.briefing.testing) updateBriefing({ testing: "Testes Unitários no Service" });
      if (!data.briefing.documentation) updateBriefing({ documentation: "OpenAPI/Swagger Automático" });
      if (!data.briefing.deploy) updateBriefing({ deploy: "Docker Container Padrão" });
    }
  }, [data.mode]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 pb-10">
      <div>
        <h2 className="text-2xl font-bold mb-2">Briefing Completo do Software</h2>
        <p className="text-gray-400">
          {data.mode === "Guiado" 
            ? "Modo Guiado: Preenchemos algumas sugestões baseadas nas melhores práticas de mercado. Você pode editar o que desejar."
            : "Modo Avançado: Preencha todos os detalhes técnicos e de negócio do seu software."}
        </p>
      </div>
      
      {data.mode === "Guiado" && (
        <div className="p-4 bg-primary/10 border border-primary/20 text-primary rounded-lg flex items-start gap-3">
          <ListChecks size={20} className="mt-0.5" />
          <p className="text-sm">Campos pré-preenchidos. Edite apenas se quiser algo específico.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Público-Alvo</label>
          <textarea rows={3} placeholder="Ex: Empresas de pequeno porte..." className="w-full bg-[#0a0a0f] border border-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors" value={data.briefing.targetAudience} onChange={e => updateBriefing({ targetAudience: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Objetivo do Sistema</label>
          <textarea rows={3} placeholder="Ex: Reduzir tempo de faturamento..." className="w-full bg-[#0a0a0f] border border-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors" value={data.briefing.objective} onChange={e => updateBriefing({ objective: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Funcionalidades Principais</label>
          <textarea rows={3} placeholder="Ex: Emissão de nota, relatórios..." className="w-full bg-[#0a0a0f] border border-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors" value={data.briefing.features} onChange={e => updateBriefing({ features: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Regras de Negócio</label>
          <textarea rows={3} placeholder="Ex: Notas não podem ser deletadas após 24h..." className="w-full bg-[#0a0a0f] border border-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors" value={data.briefing.businessRules} onChange={e => updateBriefing({ businessRules: e.target.value })} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Perfis de Usuário</label>
          <input type="text" placeholder="Ex: Admin, Vendedor, Cliente" className="w-full bg-[#0a0a0f] border border-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors" value={data.briefing.userRoles} onChange={e => updateBriefing({ userRoles: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Entidades de Domínio</label>
          <input type="text" placeholder="Ex: Produto, Pedido, Cliente" className="w-full bg-[#0a0a0f] border border-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors" value={data.briefing.entities} onChange={e => updateBriefing({ entities: e.target.value })} />
        </div>
      </div>

      <h3 className="text-xl font-bold pt-4 border-t border-border text-gray-200">Requisitos Técnicos</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Banco de Dados</label>
          <select className="w-full bg-[#0a0a0f] border border-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors" value={data.briefing.database} onChange={e => updateBriefing({ database: e.target.value })}>
            <option value="PostgreSQL">PostgreSQL (Relacional)</option>
            <option value="MySQL">MySQL / MariaDB</option>
            <option value="MongoDB">MongoDB (NoSQL)</option>
            <option value="SQLite">SQLite (Leve/Local)</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Autenticação</label>
          <select className="w-full bg-[#0a0a0f] border border-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors" value={data.briefing.authentication} onChange={e => updateBriefing({ authentication: e.target.value })}>
            <option value="E-mail e Senha + JWT">E-mail e Senha + JWT (Padrão)</option>
            <option value="OAuth2 (Google/Github)">OAuth2 (Google/Github)</option>
            <option value="Magic Links">Magic Links (Sem Senha)</option>
            <option value="Nenhuma">Sem Autenticação</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Nível de Segurança</label>
          <select className="w-full bg-[#0a0a0f] border border-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors" value={data.briefing.securityLevel} onChange={e => updateBriefing({ securityLevel: e.target.value })}>
            <option value="Padrão">Padrão (Maioria das aplicações)</option>
            <option value="Alto (Financeiro/Médico)">Alto (Financeiro/Médico - Criptografia em repouso)</option>
            <option value="Básico (Ferramenta Interna)">Básico (Ferramenta Interna)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Painel Admin</label>
          <select className="w-full bg-[#0a0a0f] border border-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors" value={data.briefing.adminPanel} onChange={e => updateBriefing({ adminPanel: e.target.value })}>
            <option value="CRUD Básico de Usuários">CRUD Básico (Gerenciar Usuários)</option>
            <option value="Painel Completo + Métricas">Painel Completo + Métricas</option>
            <option value="Nenhum">Nenhum Painel Admin</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Estratégia de Testes</label>
          <select className="w-full bg-[#0a0a0f] border border-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors" value={data.briefing.testing} onChange={e => updateBriefing({ testing: e.target.value })}>
            <option value="Testes Unitários Essenciais">Testes Unitários Essenciais</option>
            <option value="Cobertura > 80% (Unitário e Integração)">Cobertura &gt; 80% (Unitário e Integração)</option>
            <option value="TDD Rígido">TDD Rígido</option>
            <option value="Nenhum Teste (MVP Rápido)">Nenhum Teste (MVP Rápido)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Documentação</label>
          <select className="w-full bg-[#0a0a0f] border border-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors" value={data.briefing.documentation} onChange={e => updateBriefing({ documentation: e.target.value })}>
            <option value="OpenAPI/Swagger Automático">OpenAPI/Swagger Automático</option>
            <option value="Postman Collection">Collection Postman/Insomnia</option>
            <option value="Documentação em Markdown">Documentação Simples em Markdown</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Estratégia de Deploy</label>
          <select className="w-full bg-[#0a0a0f] border border-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors" value={data.briefing.deploy} onChange={e => updateBriefing({ deploy: e.target.value })}>
            <option value="Docker Container Padrão">Docker (Container Padrão)</option>
            <option value="PaaS (Vercel/Render/Heroku)">PaaS (Vercel / Render / Heroku)</option>
            <option value="Serverless AWS">AWS Serverless (Lambda)</option>
            <option value="Kubernetes">Kubernetes (K8s)</option>
          </select>
        </div>
      </div>
    </div>
  );
}
