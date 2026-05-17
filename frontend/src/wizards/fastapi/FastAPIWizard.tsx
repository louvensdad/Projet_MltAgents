"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { WizardShell } from "../core";
import { usePreferences } from "@/context/PreferencesContext";
import { useLiveBuilder } from "@/context/LiveBuilderContext";
import { computeApiSnapshot } from "@/lib/live-builder";
import { FASTAPI_CONFIG } from "./fastApiConfig";
import { defaultFastApiPayload } from "./fastApiPayload";
import type { FastApiPayload } from "./fastApiPayload";
import { apiPost } from "@/lib/api";

import ProjectDataStep from "./steps/ProjectDataStep";
import PythonVersionsStep from "./steps/PythonVersionsStep";
import ArchitectureStep from "./steps/ArchitectureStep";
import DatabaseOrmStep from "./steps/DatabaseOrmStep";
import AuthStep from "./steps/AuthStep";
import AsyncWorkersStep from "./steps/AsyncWorkersStep";
import DocsOpenapiStep from "./steps/DocsOpenapiStep";
import TestsStep from "./steps/TestsStep";
import PreviewStep from "./steps/PreviewStep";
import GenerateStep from "./steps/GenerateStep";

export default function FastAPIWizard() {
  const router = useRouter();
  const { t, lang } = usePreferences();
  const liveBuilder = useLiveBuilder();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<FastApiPayload>(defaultFastApiPayload);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);

  useEffect(() => {
    liveBuilder.initProject("api");
    liveBuilder.setAiMode("local_build_90");
  }, [liveBuilder]);

  useEffect(() => {
    const messaging = data.worker_options.filter(w => ["Kafka", "RabbitMQ", "Redis"].includes(w));
    const snapshot = computeApiSnapshot(
      data.auth_options,
      messaging,
      data.worker_options.filter(w => w === "Redis"),
      data.docs_options,
      data.test_options
    );
    liveBuilder.updateSnapshot(snapshot);
    if (data.project_name) liveBuilder.setProjectName(data.project_name);
  }, [data.auth_options, data.worker_options, data.docs_options, data.test_options, data.project_name, liveBuilder]);

  const updateData = useCallback((updates: Partial<FastApiPayload>) => {
    setData((prev) => ({ ...prev, ...updates }));
    setErrors([]);
  }, []);

  const canProceed = (() => {
    if (step === 1) return data.project_name.trim().length > 0;
    return true;
  })();

  const handleValidate = (): boolean => {
    const e: string[] = [];
    if (step === 1 && !data.project_name.trim()) e.push("project_name");
    setErrors(e);
    return e.length === 0;
  };

  const handleNext = () => {
    if (!handleValidate()) return;
    setStep((p) => Math.min(p + 1, FASTAPI_CONFIG.totalSteps));
  };

  const handlePrev = () => {
    setStep((p) => Math.max(p - 1, 1));
  };

  const handleGenerate = async () => {
    setLoading(true);
    setWarnings([]);
    try {
      const promptAnswers = {
        project_name: data.project_name,
        project_description: `API FastAPI para ${data.project_name}`,
        project_language: lang,
        python_version: data.python_version.replace("Python", "").trim(),
        architecture: data.architecture,
        database: data.database,
        orm: data.orm_options[0] || "SQLAlchemy",
        auth_strategy: data.auth_options.length > 0 ? "jwt" : "none",
        confirmed_entities: ["User", "Job"],
        confirmed_features: [
          ...data.orm_options,
          ...data.auth_options,
          ...data.worker_options,
          ...data.docs_options,
          ...data.test_options,
        ],
        testing_strategy: data.test_options.length > 0 ? "unit_integration" : "unit_only",
      };

      const promptRes = await apiPost<{ status?: string; prompt_master?: Record<string, unknown>; details?: string[] }>(
        "/api/prompt/build",
        { stack_id: "fastapi", answers: promptAnswers }
      );
      if (!promptRes.ok || !promptRes.data?.prompt_master) {
        const message = promptRes.backendError?.message || promptRes.networkError || "Prompt inválido";
        setWarnings([message]);
        return;
      }

      const payload: Record<string, any> = {
        wizard_type: "fastapi",
        project_type: "api",
        stack_profile_id: "fastapi",
        backend_stack: "Python + FastAPI",
        project_name: data.project_name,
        project_language: lang,
        locale: lang,
        python_version: data.python_version,
        architecture: data.architecture,
        database: data.database,
        orm_options: data.orm_options,
        auth_options: data.auth_options,
        worker_options: data.worker_options,
        docs_options: data.docs_options,
        test_options: data.test_options,
        ai_generation_mode: liveBuilder.state.aiMode,
        prompt_master: promptRes.data.prompt_master,
      };
      const trace = liveBuilder.getTrace();
      if (trace) payload.generation_trace = trace;
      const res = await apiPost<{ redirect_url?: string; id?: string; details?: string[]; message?: string }>("/api/generate", payload);
      if (res.ok && res.data) {
        router.push(res.data.redirect_url || `/projects/${res.data.id}/checkout`);
        return;
      }
      setWarnings([
        res.backendError?.message || res.networkError || "Generation failed",
        ...(res.backendError?.details || []),
      ].filter(Boolean));
    } catch {
      setWarnings(["Generation failed"]);
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1: return <ProjectDataStep data={data} onChange={updateData} errors={errors} />;
      case 2: return <PythonVersionsStep data={data} onChange={updateData} />;
      case 3: return <ArchitectureStep data={data} onChange={updateData} />;
      case 4: return <DatabaseOrmStep data={data} onChange={updateData} />;
      case 5: return <AuthStep data={data} onChange={updateData} />;
      case 6: return <AsyncWorkersStep data={data} onChange={updateData} />;
      case 7: return <DocsOpenapiStep data={data} onChange={updateData} />;
      case 8: return <TestsStep data={data} onChange={updateData} />;
      case 9: return <PreviewStep data={data} />;
      case 10: return <GenerateStep loading={loading} />;
      default: return null;
    }
  };

  return (
    <WizardShell
      title={t(FASTAPI_CONFIG.titleKey)}
      subtitle={t(FASTAPI_CONFIG.subtitleKey)}
      step={step}
      totalSteps={FASTAPI_CONFIG.totalSteps}
      steps={FASTAPI_CONFIG.steps}
      loading={loading}
      canProceed={canProceed}
      errors={errors.map((e) => t(`wizard.fastapi.${e}_error`))}
      warnings={warnings}
      onStepClick={(s) => { if (s < step || canProceed) setStep(s); }}
      onPrev={handlePrev}
      onNext={handleNext}
      onGenerate={handleGenerate}
      t={t}
      accent="from-sky-500 to-teal-500"
    >
      {renderStep()}
    </WizardShell>
  );
}
