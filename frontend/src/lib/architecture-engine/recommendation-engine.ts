import { ArchitectureInput } from "./types";

export function buildRecommendations(input: ArchitectureInput) {
  const text = Object.values(input.guidedAnswers).join(" ").toLowerCase();
  const enterprise = /enterprise|alto|large|10k|global|saas/i.test(text);
  const mvp = /mvp|startup|1k|baixo|pilot/i.test(text);
  const recs: string[] = [];
  const warnings: string[] = [];
  const chosen: string[] = [];
  const rejected: string[] = [];
  const rules: string[] = [];

  if (enterprise || input.presets.includes("Enterprise Platform")) {
    rules.push("enterprise_escalation");
    recs.push("Enable API Gateway, observability, structured logs and RBAC.");
    recs.push("Use Redis + async messaging for scale.");
    chosen.push("API Gateway", "RBAC", "Observability", "Structured Logs", "Redis");
  }

  if (mvp || input.presets.includes("Startup SaaS")) {
    rules.push("mvp_downgrade");
    recs.push("Prefer modular monolith and simple JWT baseline.");
    rejected.push("Kubernetes", "Unnecessary microservices");
    if (input.messaging.includes("Kafka")) warnings.push("Kafka may add unnecessary complexity for MVP scale.");
  }

  if (/hospital|clinic|erp/.test(text)) {
    rules.push("domain_hospital_erp");
    recs.push("Add RBAC, audit logs, LGPD/GDPR readiness, reports and notification workflows.");
    chosen.push("RBAC", "Audit Logs", "Compliance");
  }

  if (/delivery|entrega/.test(text)) {
    rules.push("domain_delivery");
    recs.push("Add real-time tracking, notification service and payment integration.");
    chosen.push("Real-time Tracking", "Notification Service");
  }

  if (/public|api pública|api publica|partner/.test(input.guidedAnswers.publicApi.toLowerCase())) {
    rules.push("public_api_security");
    recs.push("Add OAuth2/API Keys/Rate Limiting/JWT rotation.");
    if (!input.security.includes("OAuth2")) warnings.push("Public API selected without OAuth2.");
  }

  return { recs, warnings, chosen, rejected, rules };
}
