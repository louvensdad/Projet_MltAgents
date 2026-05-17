import type { WizardConfig, WizardStep } from "../types";

const STEPS: WizardStep[] = [
  { number: 1, key: "project_data", labelKey: "wizard.springboot.step1", descKey: "wizard.springboot.step1_desc" },
  { number: 2, key: "java_versions", labelKey: "wizard.springboot.step2", descKey: "wizard.springboot.step2_desc" },
  { number: 3, key: "build_tool", labelKey: "wizard.springboot.step3", descKey: "wizard.springboot.step3_desc" },
  { number: 4, key: "architecture", labelKey: "wizard.springboot.step4", descKey: "wizard.springboot.step4_desc" },
  { number: 5, key: "database_jpa", labelKey: "wizard.springboot.step5", descKey: "wizard.springboot.step5_desc" },
  { number: 6, key: "security", labelKey: "wizard.springboot.step6", descKey: "wizard.springboot.step6_desc" },
  { number: 7, key: "events", labelKey: "wizard.springboot.step7", descKey: "wizard.springboot.step7_desc" },
  { number: 8, key: "observability", labelKey: "wizard.springboot.step8", descKey: "wizard.springboot.step8_desc" },
  { number: 9, key: "tests", labelKey: "wizard.springboot.step9", descKey: "wizard.springboot.step9_desc" },
  { number: 10, key: "generate", labelKey: "wizard.springboot.step10", descKey: "wizard.springboot.step10_desc" },
];

export const SPRING_BOOT_CONFIG: WizardConfig = {
  slug: "springboot",
  stackKey: "springboot",
  titleKey: "wizard.springboot.title",
  subtitleKey: "wizard.springboot.subtitle",
  steps: STEPS,
  totalSteps: STEPS.length,
};

export const JAVA_VERSIONS = ["Java 17", "Java 21"];
export const SPRING_BOOT_VERSIONS = ["Spring Boot 3.2", "Spring Boot 3.3"];
export const BUILD_TOOLS = ["Maven", "Gradle"];
export const ARCHITECTURES = ["wizard.springboot.arch_monolith", "wizard.springboot.arch_microservices", "wizard.springboot.arch_event_driven", "wizard.springboot.arch_clean"];
export const DATABASES = ["PostgreSQL", "MySQL", "H2"];
export const JPA_OPTIONS = ["Spring Data JPA", "Hibernate", "Flyway", "Liquibase"];
export const SECURITY_OPTIONS = ["Spring Security", "JWT", "OAuth2", "Keycloak"];
export const EVENT_OPTIONS = ["Kafka", "RabbitMQ", "Redis", "WebSocket", "SSE"];
export const OBSERVABILITY_OPTIONS = ["Spring Actuator", "Micrometer", "Prometheus", "Grafana", "OpenAPI", "Logback"];
export const TEST_OPTIONS = ["JUnit 5", "Mockito", "Testcontainers", "Spring Boot Test", "RestAssured", "ArchUnit"];
