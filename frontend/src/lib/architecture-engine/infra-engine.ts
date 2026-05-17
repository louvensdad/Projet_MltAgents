import { ArchitectureInput } from "./types";
import { normalizeLevel } from "./calculators";

export function estimateInfra(input: ArchitectureInput, complexity: number, services: string[], containers: string[]) {
  const total = services.length + containers.length;
  const ramGb = Math.max(2, Math.round((total * 0.7 + complexity / 30) * 10) / 10);
  const cpu = Math.max(2, Math.ceil(total / 2));
  return {
    ramGb,
    cpu,
    containers: total,
    cloudCost: normalizeLevel(complexity) as "Low" | "Medium" | "High",
    requiredServices: [
      "Database",
      services.includes("gateway") ? "API Gateway" : "",
      input.messaging.length ? "Queue/Cache" : "",
      input.security.length ? "Security Layer" : ""
    ].filter(Boolean)
  };
}
