"use client";

import { useWizard } from "@/context/WizardContext";

export default function Step7Architecture() {
  const { data, updateArchitecture } = useWizard();

  const SelectField = ({ label, field, options, multiple = false }: { label: string, field: keyof typeof data.advanced_architecture, options: {value: string, label: string}[], multiple?: boolean }) => {
    const value = data.advanced_architecture[field];
    
    return (
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">{label}</label>
        {multiple ? (
          <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
            {options.map(opt => (
              <label key={opt.value} className="flex items-center gap-3 p-2 rounded border border-border/50 hover:bg-white/5 cursor-pointer">
                <input 
                  type="checkbox" 
                  className="accent-primary w-4 h-4"
                  checked={Array.isArray(value) && value.includes(opt.value)}
                  onChange={e => {
                    const currentArr = Array.isArray(value) ? value : [];
                    const newArr = e.target.checked 
                      ? [...currentArr, opt.value]
                      : currentArr.filter(v => v !== opt.value);
                    updateArchitecture({ [field]: newArr });
                  }}
                />
                <span className="text-gray-200 text-sm">{opt.label}</span>
              </label>
            ))}
          </div>
        ) : (
          <select 
            className="w-full bg-[#0a0a0f] border border-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
            value={value as string}
            onChange={e => updateArchitecture({ [field]: e.target.value })}
          >
            {options.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 pb-10">
      <div>
        <h2 className="text-2xl font-bold mb-2">Arquitetura Avançada</h2>
        <p className="text-gray-400">Defina os componentes de infraestrutura e padrões de desenvolvimento.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SelectField 
          label="Tipo de Arquitetura" 
          field="architecture_type"
          options={[
            { value: "monolith_modular", label: "Monolito Modular" },
            { value: "microservices", label: "Microsserviços" },
            { value: "serverless", label: "Serverless (Functions)" }
          ]}
        />
        
        <SelectField 
          label="Comunicação entre serviços" 
          field="communication_protocols"
          multiple={true}
          options={[
            { value: "http_rest", label: "HTTP REST" },
            { value: "graphql", label: "GraphQL" },
            { value: "grpc", label: "gRPC" },
            { value: "kafka", label: "Apache Kafka" },
            { value: "rabbitmq", label: "RabbitMQ" }
          ]}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SelectField 
          label="API Gateway" 
          field="api_gateway"
          options={[
            { value: "none", label: "Nenhum" },
            { value: "kong", label: "Kong Gateway" },
            { value: "aws_api_gateway", label: "AWS API Gateway" },
            { value: "nginx", label: "NGINX Ingress" }
          ]}
        />
        
        <SelectField 
          label="Autenticação e Segurança" 
          field="auth_provider"
          options={[
            { value: "jwt_simple", label: "JWT Customizado" },
            { value: "keycloak", label: "Keycloak" },
            { value: "auth0", label: "Auth0" },
            { value: "cognito", label: "AWS Cognito" }
          ]}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SelectField 
          label="Monitoramento e Logs" 
          field="monitoring"
          options={[
            { value: "basic_logs", label: "Logs Nativos" },
            { value: "elk_stack", label: "ELK Stack (Elasticsearch)" },
            { value: "prometheus_grafana", label: "Prometheus + Grafana" },
            { value: "datadog", label: "Datadog" }
          ]}
        />
        
        <SelectField 
          label="Camada de Cache" 
          field="cache"
          options={[
            { value: "none", label: "Sem Cache" },
            { value: "redis", label: "Redis" },
            { value: "memcached", label: "Memcached" }
          ]}
        />
      </div>

      <h3 className="text-xl font-bold pt-4 border-t border-border text-gray-200">Estratégia de Testes</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SelectField 
          label="Ferramentas para Endpoints" 
          field="endpoint_testing_tools"
          multiple={true}
          options={[
            { value: "swagger_openapi", label: "Swagger/OpenAPI" },
            { value: "postman", label: "Postman Collection" },
            { value: "insomnia", label: "Insomnia Collection" }
          ]}
        />
        
        <SelectField 
          label="Testes de Lógica" 
          field="logic_testing_tools"
          multiple={true}
          options={[
            { value: "tests/unit", label: "Testes Unitários" },
            { value: "tests/integration", label: "Testes de Integração" },
            { value: "tests/e2e", label: "Testes E2E (End-to-End)" }
          ]}
        />
      </div>
    </div>
  );
}
