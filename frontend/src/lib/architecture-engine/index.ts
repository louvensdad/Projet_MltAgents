import { ArchitectureEngineOutput, ArchitectureInput } from "./types";
import { buildRecommendations } from "./recommendation-engine";
import { runCompatibility } from "./compatibility-engine";
import { computeScores } from "./scoring-engine";
import { buildBlueprintPreview } from "./blueprint-engine";
import { estimateInfra } from "./infra-engine";
import { runSecurity } from "./security-engine";
import { buildReasoning } from "./reasoning-engine";
import { buildGenerationPipeline } from "./generation-engine";

const CACHE = new Map<string, ArchitectureEngineOutput>();

function stableKey(input: ArchitectureInput): string {
  return JSON.stringify(input);
}

export function runArchitectureEngine(input: ArchitectureInput): ArchitectureEngineOutput {
  const key = stableKey(input);
  const cached = CACHE.get(key);
  if (cached) return cached;

  const rec = buildRecommendations(input);
  const comp = runCompatibility(input);
  const scores0 = computeScores(input);
  const security = runSecurity(input, [...rec.warnings, ...comp.warnings]);
  const scores = { ...scores0, securityScore: security.score };
  const preview = buildBlueprintPreview(input);
  const infra = estimateInfra(input, scores.complexity, preview.services, preview.containers);
  const reasoning = buildReasoning(input, rec.recs, [...rec.warnings, ...comp.warnings]);
  const pipeline = buildGenerationPipeline({
    hasProjectBasics: Boolean((input.projectName || "").trim()),
    hasDocs: true,
    architectureValid: comp.conflicts.length === 0,
    hasBackend: Boolean(input.stack),
    hasFrontend: Boolean(input.frontend),
    hasSecurity: input.security.length > 0
  });

  const summary = `Architecture evolves to ${scores.scalability} ${input.backendLabel} using ${input.frontend || "frontend pending"}, ${input.database}, security [${input.security.join(", ")}], messaging [${input.messaging.join(", ")}], with ${input.uxAi.join(", ") || "standard UX"}.`;
  const recommendations = Array.from(new Set(rec.recs));
  const warnings = Array.from(new Set([...rec.warnings, ...comp.warnings]));
  const conflicts = Array.from(new Set(comp.conflicts));
  const resolvedConflicts: string[] = [];

  const out: ArchitectureEngineOutput = {
    recommendations,
    warnings,
    conflicts,
    resolvedConflicts,
    selectedTechnologies: Array.from(new Set([input.backendLabel, input.frontend, input.database, ...input.security, ...input.messaging, ...input.uxAi].filter(Boolean))),
    rejectedTechnologies: rec.rejected,
    scores,
    infra,
    preview,
    pipeline,
    reasoning,
    summary,
    executionTrace: {
      rulesExecuted: [...rec.rules, "compatibility_matrix", "scoring_engine", "infra_engine", "security_engine", "reasoning_engine", "generation_pipeline"],
      decisionsTaken: [
        `scalability=${scores.scalability}`,
        `complexityTier=${scores.complexityTier}`,
        ...recommendations.slice(0, 4)
      ],
      technologiesChosen: Array.from(new Set([input.backendLabel, input.frontend, ...preview.services, ...preview.modules])),
      technologiesRejected: rec.rejected,
      conflictsResolved: resolvedConflicts,
      warnings
    },
    docs: {
      architectureDecisions: `# ARCHITECTURE_DECISIONS\n\n- Summary: ${summary}\n- Recommendations: ${recommendations.join("; ") || "none"}\n- Warnings: ${warnings.join("; ") || "none"}\n`,
      stackCompatibility: `# STACK_COMPATIBILITY\n\n- Stack: ${input.backendLabel}\n- Frontend: ${input.frontend}\n- Conflicts: ${conflicts.join("; ") || "none"}\n`,
      infrastructurePlan: `# INFRASTRUCTURE_PLAN\n\n- RAM: ${infra.ramGb} GB\n- CPU: ${infra.cpu} vCPU\n- Containers: ${infra.containers}\n- Cost: ${infra.cloudCost}\n- Required Services: ${infra.requiredServices.join(", ")}\n`
    }
  };

  CACHE.set(key, out);
  return out;
}

export * from "./types";
