import { StackKey } from "@/lib/stackProfiles";

export interface AssistantInput {
  stack: StackKey;
  frontend: string;
  database: string;
  messaging: string[];
  security: string[];
  uxAi: string[];
}

export function buildSuggestions(input: AssistantInput) {
  const suggestions: string[] = [];
  const warnings: string[] = [];

  if (input.stack === "spring_boot") suggestions.push("Angular é recomendado para dashboards enterprise.");
  if (input.stack === "fastapi") suggestions.push("Arquitetura async com Redis melhora throughput.");
  if (input.messaging.includes("Kafka")) warnings.push("Kafka adiciona complexidade operacional.");
  if (input.database === "SQLite") warnings.push("SQLite não é recomendado para alto volume.");
  if (!input.messaging.includes("Redis") && input.uxAi.includes("AI Assistant")) suggestions.push("Redis pode melhorar performance das respostas.");
  if (input.security.includes("JWT") && !input.security.includes("OAuth2")) suggestions.push("Considere OAuth2 para integração com provedores externos.");

  return { suggestions, warnings };
}
