import { ArchitectureInput } from "./types";

export function buildBlueprintPreview(input: ArchitectureInput) {
  const modules: string[] = [];
  const services: string[] = [input.backendLabel];
  const containers: string[] = ["backend", "db"];
  const apis: string[] = ["/api/core"];
  const queues: string[] = [];
  const automations: string[] = [];

  if (input.frontend) {
    modules.push(`frontend/${input.frontend.toLowerCase().replace(/\s+/g, "-")}`);
    containers.push("frontend");
  }
  if (input.security.includes("OAuth2") || input.security.includes("Keycloak")) {
    services.push("auth-service");
    modules.push("security/rbac");
    apis.push("/api/auth");
  }
  if (input.messaging.includes("Kafka")) {
    queues.push("kafka");
    modules.push("messaging/kafka");
    containers.push("kafka");
  }
  if (input.messaging.includes("Redis")) {
    queues.push("redis");
    modules.push("cache/redis");
    containers.push("redis");
  }
  if (input.uxAi.includes("AI Assistant")) {
    modules.push("ai/provider", "ai/service", "ai/controller", "ai/stream");
    services.push("ai-service");
  }
  if (input.uxAi.includes("Automações") || input.uxAi.includes("Automacoes")) {
    automations.push("scheduler", "jobs", "workers", "retries");
    modules.push("automation/jobs", "automation/workers");
  }
  if (input.uxAi.includes("Multi-agent")) {
    modules.push("agents/orchestrator", "agents/registry", "agents/routing");
    services.push("agent-orchestrator");
  }
  if (input.uxAi.includes("Dashboard Analytics")) {
    modules.push("analytics/charts", "analytics/reports");
    apis.push("/api/analytics");
  }
  if (input.architecture.toLowerCase().includes("micro")) {
    services.push("gateway", "service-discovery");
    modules.push("infra/gateway");
  }

  return {
    modules: Array.from(new Set(modules)),
    services: Array.from(new Set(services)),
    containers: Array.from(new Set(containers)),
    apis: Array.from(new Set(apis)),
    gateways: services.includes("gateway") ? ["api-gateway"] : [],
    queues: Array.from(new Set(queues)),
    ai: modules.filter((m) => m.startsWith("ai/")),
    automations: Array.from(new Set(automations))
  };
}
