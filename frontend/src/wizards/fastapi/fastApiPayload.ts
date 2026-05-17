export interface FastApiPayload {
  project_name: string;
  python_version: string;
  fastapi_version: string;
  architecture: string;
  database: string;
  orm_options: string[];
  auth_options: string[];
  worker_options: string[];
  docs_options: string[];
  test_options: string[];
}

export const defaultFastApiPayload: FastApiPayload = {
  project_name: "",
  python_version: "Python 3.12",
  fastapi_version: "FastAPI Latest",
  architecture: "wizard.fastapi.arch_modular",
  database: "PostgreSQL",
  orm_options: ["SQLAlchemy"],
  auth_options: ["JWT"],
  worker_options: ["Background Tasks"],
  docs_options: ["Swagger UI"],
  test_options: ["Pytest"],
};

export function buildFastApiPayload(data: FastApiPayload): FastApiPayload {
  return { ...data };
}

export function buildFastApiGeneratePayload(formData: FastApiPayload, aiMode: string = "local_build_90", allowFallback: boolean = true) {
  return {
    project_type: "api",
    project_name: formData.project_name,
    backend_stack: "Python + FastAPI",
    ai_generation_mode: aiMode,
    allow_mock_fallback: allowFallback,
    use_ai: aiMode !== "local_build_90",
    project_brief: {
      backend_stack: "Python + FastAPI",
      database: formData.database,
      architecture: formData.architecture,
      auth: formData.auth_options,
      workers: formData.worker_options,
    },
  };
}
