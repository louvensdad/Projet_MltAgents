import { ArchitectureInput } from "./types";

export function runSecurity(input: ArchitectureInput, warnings: string[]) {
  const publicApi = /sim|yes|public/.test(input.guidedAnswers.publicApi.toLowerCase());
  const base = 50 + input.security.length * 10 + (publicApi ? 8 : 0) - warnings.length * 4;
  const owasp = Math.max(35, Math.min(99, base));
  return {
    score: owasp,
    jwtValidation: input.security.some((s) => s.toLowerCase().includes("jwt")) ? "active" : "pending",
    rbacValidation: input.security.some((s) => /keycloak|oauth|identity/i.test(s)) ? "active" : "partial",
    secretsScan: "active",
    dependencyAudit: "partial",
    dockerSecurity: "partial",
    lgpdGdprReadiness: /lgpd|gdpr|hospital|clinic/.test(Object.values(input.guidedAnswers).join(" ").toLowerCase()) ? "active" : "partial",
    apiProtection: publicApi ? "active" : "partial"
  };
}
