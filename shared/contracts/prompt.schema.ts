export interface PromptBuildRequest {
  stack_id: string;
  answers: Record<string, string | boolean | string[]>;
}

export interface PromptBuildResponse {
  status?: "validated" | "rejected";
  prompt_master?: Record<string, unknown>;
  warnings?: string[];
  errors?: string[];
  missing_required?: string[];
}
