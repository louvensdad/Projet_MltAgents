import { PIPELINE_STEPS } from "./rules";

export function buildGenerationPipeline(flags: {
  hasProjectBasics: boolean;
  hasDocs: boolean;
  architectureValid: boolean;
  hasBackend: boolean;
  hasFrontend: boolean;
  hasSecurity: boolean;
}) {
  return PIPELINE_STEPS.map((name) => {
    let state: "done" | "pending" = "pending";
    if (name === "Parsing") state = flags.hasProjectBasics ? "done" : "pending";
    if (name === "Docs Sync") state = flags.hasDocs ? "done" : "pending";
    if (name === "Architecture Validation") state = flags.architectureValid ? "done" : "pending";
    if (name === "Backend Generation") state = flags.hasBackend ? "done" : "pending";
    if (name === "Frontend Generation") state = flags.hasFrontend ? "done" : "pending";
    if (name === "Docker Generation") state = flags.hasBackend ? "done" : "pending";
    if (name === "Security Validation") state = flags.hasSecurity ? "done" : "pending";
    if (name === "Packaging") state = flags.hasProjectBasics && flags.architectureValid ? "done" : "pending";
    return { name, state };
  });
}
