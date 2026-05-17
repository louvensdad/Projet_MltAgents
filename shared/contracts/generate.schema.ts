export type GenerationQualityMode = "local_build_90" | "agent_boost_100";

export interface GenerateRequest {
  wizard_type: string;
  project_type: string;
  stack_profile_id: string;
  project_name: string;
  project_language?: string;
  locale?: string;
  ai_generation_mode?: GenerationQualityMode;
  prompt_master?: Record<string, unknown>;
  generation_trace?: Record<string, unknown>;
}

export interface GenerateSuccessResponse {
  success: true;
  id: string;
  project_id: string;
  project_name: string;
  stack: string;
  status: "generated";
  redirect_url: string;
  download_url: string;
  checkout_url: string;
  prompt_validated: true;
  generation_quality_mode: GenerationQualityMode;
}

export interface GenerateErrorResponse {
  success: false;
  status: string;
  error_code?: string;
  message: string;
  details?: string[];
  warnings?: string[];
  missing_required?: string[];
}
