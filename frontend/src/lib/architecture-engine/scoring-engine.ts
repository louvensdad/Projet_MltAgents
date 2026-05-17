import { ArchitectureInput } from "./types";
import { complexityTier, normalizeLevel } from "./calculators";

export function computeScores(input: ArchitectureInput) {
  let complexity = 15;
  if (input.architecture.toLowerCase().includes("micro")) complexity += 22;
  if (input.architecture.toLowerCase().includes("event")) complexity += 16;
  complexity += input.security.length * 5;
  complexity += input.messaging.length * 7;
  complexity += input.uxAi.filter((x) => ["AI Assistant", "Multi-agent", "Automacoes", "Automações"].includes(x)).length * 8;
  if (input.frontend.includes("Angular") || input.frontend.includes("Next")) complexity += 8;
  complexity = Math.min(complexity, 100);

  const text = Object.values(input.guidedAnswers).join(" ").toLowerCase();
  const enterprise = /enterprise|alto|large|10k|global/.test(text);
  const mvp = /mvp|startup|1k|baixo/.test(text);
  const scalability = enterprise ? "Enterprise" : mvp ? "Lean" : "Growth";

  return {
    complexity,
    complexityTier: complexityTier(complexity),
    confidence: Math.max(35, Math.min(98, 60 + (input.uxAi.length * 2) + (input.security.length * 2))),
    scalability: scalability as "Lean" | "Growth" | "Enterprise",
    maintenance: normalizeLevel(complexity) as "Low" | "Medium" | "High",
    deployDifficulty: normalizeLevel(complexity) as "Low" | "Medium" | "High",
    estimatedCost: normalizeLevel(complexity) as "Low" | "Medium" | "High"
  };
}
