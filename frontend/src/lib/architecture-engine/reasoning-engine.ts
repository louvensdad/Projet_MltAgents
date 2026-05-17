import { ArchitectureInput, ReasoningNode } from "./types";

export function buildReasoning(input: ArchitectureInput, recommendations: string[], warnings: string[]): ReasoningNode[] {
  const nodes: ReasoningNode[] = [];
  for (const rec of recommendations.slice(0, 8)) {
    nodes.push({
      source: "rule-engine",
      trigger: input.guidedAnswers.objective || "guided-input",
      impact: "architecture upgrade",
      risk: warnings[0] || "controlled",
      cost: "contextual",
      explanation: rec
    });
  }
  return nodes;
}
