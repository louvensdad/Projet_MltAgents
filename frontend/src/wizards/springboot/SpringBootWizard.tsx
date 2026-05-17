"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePreferences } from "@/context/PreferencesContext";
import { useLiveBuilder } from "@/context/LiveBuilderContext";
import { computeApiSnapshot } from "@/lib/live-builder";
import WizardShell from "../core/WizardShell";
import { apiPost } from "@/lib/api";
import { SPRING_BOOT_CONFIG } from "./springBootConfig";
import { DEFAULT_SPRING_BOOT_DATA, buildSpringBootPayload } from "./springBootPayload";
import type { SpringBootFormData } from "./springBootPayload";
import ProjectDataStep from "./steps/ProjectDataStep";
import JavaVersionsStep from "./steps/JavaVersionsStep";
import BuildToolStep from "./steps/BuildToolStep";
import ArchitectureStep from "./steps/ArchitectureStep";
import DatabaseJpaStep from "./steps/DatabaseJpaStep";
import SecurityStep from "./steps/SecurityStep";
import EventsStep from "./steps/EventsStep";
import ObservabilityStep from "./steps/ObservabilityStep";
import TestsStep from "./steps/TestsStep";
import GenerateStep from "./steps/GenerateStep";

export default function SpringBootWizard() {
  const router = useRouter();
  const { t, lang } = usePreferences();
  const liveBuilder = useLiveBuilder();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [warnings] = useState<string[]>([]);
  const [formData, setFormData] = useState<SpringBootFormData>(DEFAULT_SPRING_BOOT_DATA);

  useEffect(() => {
    liveBuilder.initProject("api");
    liveBuilder.setAiMode("local_build_90");
  }, [liveBuilder]);

  useEffect(() => {
    const snapshot = computeApiSnapshot(
      formData.security_options,
      formData.event_options.filter(e => ["Kafka", "RabbitMQ", "Redis"].includes(e)),
      formData.event_options.filter(e => e === "Redis"),
      formData.observability_options,
      formData.test_options
    );
    liveBuilder.updateSnapshot(snapshot);
    if (formData.project_name) liveBuilder.setProjectName(formData.project_name);
  }, [formData.security_options, formData.event_options, formData.observability_options, formData.test_options, formData.project_name, liveBuilder]);

  const update = useCallback((updates: Partial<SpringBootFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
    setErrors([]);
  }, []);

  const toggleArrayField = useCallback(
    (field: "jpa_options" | "security_options" | "event_options" | "observability_options" | "test_options", value: string) => {
      setFormData((prev) => ({
        ...prev,
        [field]: prev[field].includes(value)
          ? prev[field].filter((v) => v !== value)
          : [...prev[field], value],
      }));
      setErrors([]);
    },
    []
  );

  const validate = (): boolean => {
    const errs: string[] = [];
    if (step === 1 && !formData.project_name.trim()) {
      errs.push(t("wizard.springboot.project_name_required"));
    }
    setErrors(errs);
    return errs.length === 0;
  };

  const onStepClick = (s: number) => {
    if (s < step || validate()) {
      setStep(s);
    }
  };

  const onPrev = () => setStep((p) => Math.max(p - 1, 1));
  const onNext = () => {
    if (validate()) setStep((p) => Math.min(p + 1, SPRING_BOOT_CONFIG.totalSteps));
  };

  const onGenerateClick = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const payload = buildSpringBootPayload(formData, lang) as Record<string, any>;
      const promptAnswers = {
        project_name: formData.project_name,
        project_description: `Sistema Spring Boot para ${formData.project_name}`,
        project_language: lang,
        java_version: formData.java_version.replace("Java", "").trim(),
        spring_boot_version: formData.spring_boot_version.replace("Spring Boot", "").trim() + ".x",
        build_tool: formData.build_tool.toLowerCase(),
        architecture: formData.architecture,
        database: formData.database.toLowerCase(),
        orm: "jpa_hibernate",
        auth_strategy: formData.security_options.some((item) => item.toLowerCase().includes("oauth")) ? "oauth2" : "jwt",
        confirmed_entities: ["User", "AuditLog"],
        confirmed_features: [
          ...formData.jpa_options,
          ...formData.security_options,
          ...formData.event_options,
          ...formData.observability_options,
          ...formData.test_options,
        ],
        testing_strategy: formData.test_options.length > 0 ? "unit_integration" : "unit_only",
      };
      const promptRes = await apiPost<{ prompt_master?: Record<string, unknown> }>("/api/prompt/build", {
        stack_id: "spring_boot",
        answers: promptAnswers,
      });
      if (!promptRes.ok || !promptRes.data?.prompt_master) {
        setErrors([promptRes.backendError?.message || promptRes.networkError || "Prompt inválido"]);
        return;
      }
      payload.project_language = lang;
      payload.ai_generation_mode = liveBuilder.state.aiMode;
      payload.prompt_master = promptRes.data.prompt_master;
      const trace = liveBuilder.getTrace();
      if (trace) payload.generation_trace = trace;
      const res = await apiPost<{ redirect_url?: string; id?: string }>("/api/generate", payload);
      if (res.ok && res.data) {
        router.push(res.data.redirect_url || `/projects/${res.data.id}/checkout`);
        return;
      }
      setErrors([
        res.backendError?.message || res.networkError || "Erro ao gerar projeto",
        ...(res.backendError?.details || []),
      ].filter(Boolean));
    } finally {
      setLoading(false);
    }
  };

  const canProceed = (): boolean => {
    if (step === 1) return formData.project_name.trim().length > 0;
    return true;
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return <ProjectDataStep value={formData.project_name} onChange={(v) => update({ project_name: v })} t={t} />;
      case 2:
        return (
          <JavaVersionsStep
            javaVersion={formData.java_version}
            springBootVersion={formData.spring_boot_version}
            onJavaChange={(v) => update({ java_version: v })}
            onSpringBootChange={(v) => update({ spring_boot_version: v })}
            t={t}
          />
        );
      case 3:
        return <BuildToolStep value={formData.build_tool} onChange={(v) => update({ build_tool: v })} t={t} />;
      case 4:
        return <ArchitectureStep value={formData.architecture} onChange={(v) => update({ architecture: v })} t={t} />;
      case 5:
        return (
          <DatabaseJpaStep
            database={formData.database}
            jpaOptions={formData.jpa_options}
            onDatabaseChange={(v) => update({ database: v })}
            onJpaToggle={(v) => toggleArrayField("jpa_options", v)}
            t={t}
          />
        );
      case 6:
        return <SecurityStep selected={formData.security_options} onToggle={(v) => toggleArrayField("security_options", v)} t={t} />;
      case 7:
        return <EventsStep selected={formData.event_options} onToggle={(v) => toggleArrayField("event_options", v)} t={t} />;
      case 8:
        return <ObservabilityStep selected={formData.observability_options} onToggle={(v) => toggleArrayField("observability_options", v)} t={t} />;
      case 9:
        return <TestsStep selected={formData.test_options} onToggle={(v) => toggleArrayField("test_options", v)} t={t} />;
      case 10:
        return <GenerateStep data={formData} t={t} />;
      default:
        return null;
    }
  };

  return (
    <WizardShell
      title={t(SPRING_BOOT_CONFIG.titleKey)}
      subtitle={t(SPRING_BOOT_CONFIG.subtitleKey)}
      step={step}
      totalSteps={SPRING_BOOT_CONFIG.totalSteps}
      steps={SPRING_BOOT_CONFIG.steps}
      loading={loading}
      canProceed={canProceed()}
      errors={errors}
      warnings={warnings}
      onStepClick={onStepClick}
      onPrev={onPrev}
      onNext={onNext}
      onGenerate={onGenerateClick}
      t={t}
    >
      {renderStep()}
    </WizardShell>
  );
}
