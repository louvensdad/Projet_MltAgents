"use client";

import { useWizard } from "@/context/WizardContext";
import { ShieldAlert } from "lucide-react";

export default function Step8Automation() {
  const { data, updateData } = useWizard();

  const handleCheckboxArray = (field: "automation_types" | "selected_agents" | "external_integrations", value: string, checked: boolean) => {
    const current = data[field];
    if (checked) {
      updateData({ [field]: [...current, value] });
    } else {
      updateData({ [field]: current.filter(item => item !== value) });
    }
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 pb-10">
      <div>
        <h2 className="text-2xl font-bold mb-2">Automações, Agentes e Integrações</h2>
        <p className="text-gray-400">Configure os super-poderes do seu software.</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">Nível de Automação</label>
        <select 
          className="w-full bg-[#0a0a0f] border border-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
          value={data.automation_level}
          onChange={e => updateData({ automation_level: e.target.value })}
        >
          <option value="none">1. Não usar automação</option>
          <option value="basic">2. Automação básica</option>
          <option value="advanced">3. Automação avançada com agentes</option>
        </select>
      </div>

      {data.automation_level !== "none" && (
        <div className="space-y-4 pt-4">
          <h3 className="font-semibold text-primary">Tipos de Automação</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              "Envio de e-mail", "Notificações WhatsApp/Telegram", 
              "Formulário com resposta automática", "Captura de leads", 
              "Newsletter", "Integração com API externa", 
              "Agendamento automático", "Relatórios automáticos"
            ].map(tipo => (
              <label key={tipo} className="flex items-center gap-3 p-3 rounded-lg border border-border/50 hover:bg-white/5 cursor-pointer">
                <input 
                  type="checkbox" 
                  className="accent-primary w-4 h-4"
                  checked={data.automation_types.includes(tipo)}
                  onChange={e => handleCheckboxArray("automation_types", tipo, e.target.checked)}
                />
                <span className="text-gray-200 text-sm">{tipo}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {data.automation_level === "advanced" && (
        <div className="space-y-4 pt-4">
          <h3 className="font-semibold text-purple-400">Agentes Inteligentes</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              "Agente de atendimento", "Agente de suporte", 
              "Agente de vendas", "Agente de análise de dados", 
              "Agente de automação de tarefas"
            ].map(agente => (
              <label key={agente} className="flex items-center gap-3 p-3 rounded-lg border border-purple-500/20 hover:bg-purple-500/10 cursor-pointer">
                <input 
                  type="checkbox" 
                  className="accent-purple-500 w-4 h-4"
                  checked={data.selected_agents.includes(agente)}
                  onChange={e => handleCheckboxArray("selected_agents", agente, e.target.checked)}
                />
                <span className="text-purple-100 text-sm">{agente}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4 pt-6 border-t border-border">
        <h3 className="font-semibold text-gray-200">Integrações Externas</h3>
        <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg flex gap-3 text-yellow-500 mb-4">
          <ShieldAlert size={24} className="shrink-0" />
          <p className="text-sm">
            <strong>Aviso de Segurança:</strong> Nunca pedimos suas chaves reais aqui. 
            Nós vamos apenas gerar os arquivos <code>.env.example</code> para você preencher com segurança no seu ambiente local depois que o projeto for gerado.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            "Stripe (Pagamentos)", "OpenAI (IA)", "SendGrid (E-mail)", 
            "AWS S3 (Storage)", "Twilio (SMS/WhatsApp)"
          ].map(integ => (
            <label key={integ} className="flex items-center gap-3 p-3 rounded-lg border border-border/50 hover:bg-white/5 cursor-pointer">
              <input 
                type="checkbox" 
                className="accent-primary w-4 h-4"
                checked={data.external_integrations.includes(integ)}
                onChange={e => handleCheckboxArray("external_integrations", integ, e.target.checked)}
              />
              <span className="text-gray-200 text-sm">{integ}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
