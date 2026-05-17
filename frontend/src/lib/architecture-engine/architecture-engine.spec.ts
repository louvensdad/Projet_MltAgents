import { runArchitectureEngine } from "./index";

const out = runArchitectureEngine({
  stack: "spring_boot",
  backendLabel: "Java + Spring Boot",
  frontend: "Angular",
  architecture: "Microsserviços",
  database: "PostgreSQL",
  security: ["JWT", "OAuth2"],
  messaging: ["Kafka", "Redis"],
  uxAi: ["AI Assistant", "Dashboard Analytics"],
  presets: ["Enterprise Platform"],
  guidedAnswers: {
    objective: "ERP hospital",
    users: "Admin",
    scale: "Enterprise 10k",
    monetization: "Enterprise",
    adminPanel: "yes",
    publicApi: "yes",
    automations: "yes",
    aiNeeds: "assistant",
    mobileFuture: "yes"
  }
});

if (!out.summary || out.recommendations.length === 0) {
  throw new Error("architecture-engine.spec failed");
}
