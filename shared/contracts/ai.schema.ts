export interface AiModelTestResponse {
  mode: string;
  connected: boolean;
  reason: string;
  last_check: string;
  provider: string;
  model?: string;
}

export interface AiBoostPermissionResponse {
  project_id: string;
  agent_boost_allowed: boolean;
  mode: "local_build_90" | "agent_boost_100";
  reason: string;
  api_key_source: "platform_backend";
  api_key_exposed: false;
}
