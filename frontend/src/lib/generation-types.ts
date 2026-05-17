export type GenerationEventType =
  | "generation_started"
  | "docs_lookup_started"
  | "docs_source_found"
  | "docs_cache_hit"
  | "docs_cache_miss"
  | "docs_summary_ready"
  | "blueprint_generated"
  | "generator_started"
  | "quality_gate_started"
  | "security_gate_started"
  | "packaging_started"
  | "generation_completed"
  | "generation_failed";

export interface DocEvent {
  technology: string;
  version?: string;
  source: string;
  cache: "HIT" | "MISS" | "FALLBACK";
  status: "consulting" | "used" | "failed";
  used_for: string[];
  summary?: string;
}

export interface GenerationEvent {
  type: GenerationEventType;
  timestamp: string;
  message: string;
  progress: number;
  doc?: DocEvent;
  error?: string;
}
