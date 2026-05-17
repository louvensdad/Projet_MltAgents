export interface SpringBootPayload {
  wizard_type: string;
  project_type: string;
  stack_profile_id: string;
  backend_stack: string;
  project_name: string;
  java_version: string;
  spring_boot_version: string;
  build_tool: string;
  architecture: string;
  database: string;
  jpa: string[];
  security: string[];
  events: string[];
  observability: string[];
  tests: string[];
  locale: string;
}

export interface SpringBootFormData {
  project_name: string;
  java_version: string;
  spring_boot_version: string;
  build_tool: string;
  architecture: string;
  database: string;
  jpa_options: string[];
  security_options: string[];
  event_options: string[];
  observability_options: string[];
  test_options: string[];
}

export const DEFAULT_SPRING_BOOT_DATA: SpringBootFormData = {
  project_name: "",
  java_version: "Java 21",
  spring_boot_version: "Spring Boot 3.3",
  build_tool: "Maven",
  architecture: "wizard.springboot.arch_monolith",
  database: "PostgreSQL",
  jpa_options: ["Spring Data JPA"],
  security_options: [],
  event_options: [],
  observability_options: [],
  test_options: ["JUnit 5", "Spring Boot Test"],
};

export function buildSpringBootPayload(
  form: SpringBootFormData,
  locale: string
): SpringBootPayload {
  return {
    wizard_type: "springboot",
    project_type: "api",
    stack_profile_id: "java_springboot",
    backend_stack: "java_springboot",
    project_name: form.project_name,
    java_version: form.java_version,
    spring_boot_version: form.spring_boot_version,
    build_tool: form.build_tool,
    architecture: form.architecture,
    database: form.database,
    jpa: form.jpa_options,
    security: form.security_options,
    events: form.event_options,
    observability: form.observability_options,
    tests: form.test_options,
    locale,
  };
}
