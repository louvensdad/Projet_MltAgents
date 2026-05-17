import { runCompatibility } from "./compatibility-engine";

const c = runCompatibility({
  stack: "fastapi",
  backendLabel: "Python + FastAPI",
  frontend: "Angular",
  architecture: "Modular",
  database: "SQLite",
  security: ["JWT"],
  messaging: ["Kafka"],
  uxAi: [],
  presets: ["Startup SaaS"],
  guidedAnswers: {
    objective: "MVP",
    users: "users",
    scale: "MVP 1k",
    monetization: "SaaS",
    adminPanel: "yes",
    publicApi: "no",
    automations: "no",
    aiNeeds: "none",
    mobileFuture: "later"
  }
});

if (!c.warnings.length) {
  throw new Error("compatibility-engine.spec failed");
}
