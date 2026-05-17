import { StackKey, STACK_PROFILES } from "./stackProfiles";

export interface ValidationInput {
  stack: StackKey;
  versions: string[];
  frontend: string;
  database: string;
  security: string[];
  messaging: string[];
}

export interface ValidationResult {
  errors: string[];
  warnings: string[];
  recommendations: string[];
  valid: boolean;
}

const includesAny = (list: string[], items: string[]) => items.some((item) => list.includes(item));

export function validateStackSelection(input: ValidationInput): ValidationResult {
  const profile = STACK_PROFILES[input.stack];
  const errors: string[] = [];
  const warnings: string[] = [];
  const recommendations: string[] = [];

  const isStatic = input.stack === "static";

  if (!profile.frontends.includes(input.frontend)) {
    errors.push(`${input.frontend} não é compatível com ${profile.backendLabel}.`);
  }
  if (!profile.databases.includes(input.database)) {
    errors.push(`${input.database} não é compatível com ${profile.backendLabel}.`);
  }

  // Static site não precisa de versões de backend
  if (isStatic) {
    const allowedPrefixes = ["html", "css", "javascript", "es"];
    const irrelevant = input.versions.filter(
      (v) => !allowedPrefixes.some((p) => v.toLowerCase().startsWith(p))
    );
    if (irrelevant.length > 0) {
      warnings.push(`Static Site ignora versões de backend: ${irrelevant.join(", ")}`);
    }
  } else {
    if (!input.versions.every((v) => profile.versions.includes(v))) {
      errors.push("Versões selecionadas não são compatíveis com a stack.");
    }
  }

  if (!input.security.every((s) => profile.security.includes(s))) {
    errors.push("Há opções de segurança incompatíveis com a stack.");
  }
  if (!input.messaging.every((m) => profile.messaging.includes(m))) {
    errors.push("Há opções de mensageria incompatíveis com a stack.");
  }

  if (input.messaging.includes("Kafka") && input.database === "SQLite") {
    warnings.push("Kafka + SQLite tende a gerar gargalo para alto volume.");
    recommendations.push("Considere PostgreSQL para workloads com Kafka.");
  }

  if (includesAny(input.versions, ["Java 11"]) && includesAny(input.versions, ["Spring Cloud"])) {
    errors.push("Spring Cloud incompatível com Java 11 neste perfil.");
  }

  if (includesAny(input.versions, ["Node 14"]) && input.frontend.includes("Angular 18")) {
    errors.push("Angular 18 incompatível com Node 14.");
  }

  if (input.stack === "fastapi" && input.database === "PostgreSQL") {
    recommendations.push("FastAPI + PostgreSQL validado para APIs assíncronas robustas.");
  }
  if (input.stack === "springboot" && input.frontend === "Angular") {
    recommendations.push("Spring Boot + Angular é combinação enterprise recomendada.");
  }
  if (input.security.includes("Keycloak")) {
    warnings.push("Keycloak adiciona custo de operação e exige configuração de IAM.");
  }
  if (input.messaging.includes("Redis")) {
    recommendations.push("Redis pode reduzir latência em leitura e sessões.");
  }

  return { errors, warnings, recommendations, valid: errors.length === 0 };
}
