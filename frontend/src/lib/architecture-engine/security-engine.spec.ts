import { runSecurity } from "./security-engine";

const s = runSecurity(
  {
    stack: "spring_boot",
    backendLabel: "Java + Spring Boot",
    frontend: "Angular",
    architecture: "Monólito Modular",
    database: "PostgreSQL",
    security: ["JWT", "OAuth2"],
    messaging: [],
    uxAi: [],
    presets: [],
    guidedAnswers: {
      objective: "API pública",
      users: "partners",
      scale: "10k",
      monetization: "B2B",
      adminPanel: "yes",
      publicApi: "yes",
      automations: "no",
      aiNeeds: "none",
      mobileFuture: "yes"
    }
  },
  []
);

if (s.score < 40) {
  throw new Error("security-engine.spec failed");
}
