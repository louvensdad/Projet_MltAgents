import { ArchitectureInput } from "./types";
import { COMPATIBILITY_MATRIX } from "./rules";

export function runCompatibility(input: ArchitectureInput) {
  const conflicts: string[] = [];
  const warnings: string[] = [];
  const compatFrontends = COMPATIBILITY_MATRIX[input.stack] || [];
  if (input.frontend && !compatFrontends.includes(input.frontend)) {
    conflicts.push(`Frontend ${input.frontend} is incompatible with ${input.backendLabel}.`);
  }
  const scale = input.guidedAnswers.scale.toLowerCase();
  if (input.database.toLowerCase().includes("sqlite") && /enterprise|10k|global/.test(scale)) {
    conflicts.push("SQLite is incompatible with enterprise scale target.");
  }
  if (input.messaging.includes("Kafka") && /mvp|1k|100/.test(scale)) {
    warnings.push("Kafka in small MVP likely over-complex.");
  }
  if (input.stack === "fastapi" && input.frontend === "Angular") {
    warnings.push("Angular + FastAPI is valid but may increase integration complexity.");
  }
  return { conflicts, warnings, compatFrontends };
}
