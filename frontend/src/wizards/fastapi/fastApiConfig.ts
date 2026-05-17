import type { WizardConfig, WizardStep } from "../types";

const STEPS: WizardStep[] = [
  { number: 1, key: "project_data", labelKey: "wizard.fastapi.step1", descKey: "wizard.fastapi.step1_desc" },
  { number: 2, key: "python_versions", labelKey: "wizard.fastapi.step2", descKey: "wizard.fastapi.step2_desc" },
  { number: 3, key: "architecture", labelKey: "wizard.fastapi.step3", descKey: "wizard.fastapi.step3_desc" },
  { number: 4, key: "database_orm", labelKey: "wizard.fastapi.step4", descKey: "wizard.fastapi.step4_desc" },
  { number: 5, key: "auth", labelKey: "wizard.fastapi.step5", descKey: "wizard.fastapi.step5_desc" },
  { number: 6, key: "async_workers", labelKey: "wizard.fastapi.step6", descKey: "wizard.fastapi.step6_desc" },
  { number: 7, key: "docs_openapi", labelKey: "wizard.fastapi.step7", descKey: "wizard.fastapi.step7_desc" },
  { number: 8, key: "tests", labelKey: "wizard.fastapi.step8", descKey: "wizard.fastapi.step8_desc" },
  { number: 9, key: "preview", labelKey: "wizard.fastapi.step9", descKey: "wizard.fastapi.step9_desc" },
  { number: 10, key: "generate", labelKey: "wizard.fastapi.step10", descKey: "wizard.fastapi.step10_desc" },
];

export const FASTAPI_CONFIG: WizardConfig = {
  slug: "fastapi",
  stackKey: "fastapi",
  titleKey: "wizard.fastapi.title",
  subtitleKey: "wizard.fastapi.subtitle",
  steps: STEPS,
  totalSteps: STEPS.length,
};

export const PYTHON_VERSIONS = ["Python 3.11", "Python 3.12"];
export const FASTAPI_VERSIONS = ["FastAPI Latest"];
export const ARCHITECTURES = ["wizard.fastapi.arch_modular", "wizard.fastapi.arch_async", "wizard.fastapi.arch_event", "wizard.fastapi.arch_clean"];
export const DATABASES = ["PostgreSQL", "MySQL", "SQLite"];
export const ORM_OPTIONS = ["SQLAlchemy", "SQLModel", "Alembic", "Tortoise ORM"];
export const AUTH_OPTIONS = ["JWT", "OAuth2", "API Key", "Session Auth"];
export const WORKER_OPTIONS = ["Celery", "RQ", "Redis", "Background Tasks", "FastAPI Events"];
export const DOCS_OPTIONS = ["Swagger UI", "ReDoc", "OpenAPI JSON", "AsyncAPI"];
export const TEST_OPTIONS = ["Pytest", "httpx", "pytest-asyncio", "coverage.py", "Factory Boy"];
