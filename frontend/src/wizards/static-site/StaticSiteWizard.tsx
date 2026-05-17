"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePreferences } from "@/context/PreferencesContext";
import { useLiveBuilder } from "@/context/LiveBuilderContext";
import { computeStaticSiteSnapshot } from "@/lib/live-builder";
import { WizardShell } from "../core";
import { apiPost, API_URL } from "@/lib/api";
import type { StaticSiteData } from "./staticSitePayload";
import { DEFAULT_STATIC_SITE_DATA, buildStaticSitePayload } from "./staticSitePayload";
import { STATIC_SITE_CONFIG, SITE_TYPES, VISUAL_STYLES, COLOR_PALETTES, BRAND_TONES, SECTIONS, UX_OPTIONS, FORM_OPTIONS } from "./staticSiteConfig";
import SiteTypeStep from "./steps/SiteTypeStep";
import VisualIdentityStep from "./steps/VisualIdentityStep";
import SectionsStep from "./steps/SectionsStep";
import ContentStep from "./steps/ContentStep";
import UxStep from "./steps/UxStep";
import SeoStep from "./steps/SeoStep";
import FormStep from "./steps/FormStep";
import SecurityStep from "./steps/SecurityStep";
import PreviewStep from "./steps/PreviewStep";
import GenerateStep from "./steps/GenerateStep";

export default function StaticSiteWizard() {
  const { t, lang: locale } = usePreferences();
  const liveBuilder = useLiveBuilder();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<StaticSiteData>(DEFAULT_STATIC_SITE_DATA);
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [generateSuccess, setGenerateSuccess] = useState(false);

  const aiMode = liveBuilder.state.aiMode;
  const promptReady = data.site_name.trim().length > 0 && !!data.site_type && !!data.visual_style && !!data.color_palette && !!data.brand_tone;

  useEffect(() => {
    liveBuilder.initProject("static");
    liveBuilder.setAiMode("local_build_90");
  }, [liveBuilder]);

  useEffect(() => {
    const snapshot = computeStaticSiteSnapshot(data.sections, data.form_options, data.ux_options);
    liveBuilder.updateSnapshot(snapshot);
    if (data.site_name) {
      liveBuilder.setProjectName(data.site_name);
    }
  }, [data.sections, data.form_options, data.ux_options, data.site_name, liveBuilder]);

  const updateField = useCallback(<K extends keyof StaticSiteData>(field: K, value: StaticSiteData[K]) => {
    setData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const toggleArrayItem = useCallback((field: "sections" | "ux_options" | "form_options", key: string) => {
    setData((prev) => {
      const arr = prev[field];
      const next = arr.includes(key) ? arr.filter((x) => x !== key) : [...arr, key];
      return { ...prev, [field]: next };
    });
  }, []);

  const canProceed = useMemo(() => {
    switch (currentStep) {
      case 1:
        return !!data.site_type;
      case 2:
        return !!(data.visual_style && data.color_palette && data.brand_tone);
      case 4:
        return !!data.site_name;
      default:
        return true;
    }
  }, [currentStep, data]);

  const missingFields = useMemo(() => {
    const fields: { key: keyof StaticSiteData; label: string }[] = [
      { key: "site_type", label: t("wizard.static.site_type") },
      { key: "visual_style", label: t("wizard.static.visual_style") },
      { key: "color_palette", label: t("wizard.static.color_palette") },
      { key: "brand_tone", label: t("wizard.static.brand_tone") },
      { key: "site_name", label: t("wizard.static.site_name") },
    ];
    return fields.filter((f) => !data[f.key]).map((f) => f.label);
  }, [data, t]);

  const buildPromptAnswers = useCallback(() => ({
    project_name: data.site_name || "Meu Site",
    site_name: data.site_name,
    site_type: data.site_type,
    visual_style: data.visual_style,
    color_palette: data.color_palette,
    brand_tone: data.brand_tone,
    sections: data.sections,
    ux_options: data.ux_options,
    form_options: data.form_options,
    meta_title: data.meta_title,
    meta_description: data.meta_description,
    keywords: data.keywords,
    company_description: data.company_description,
    target_audience: data.target_audience,
    ai_generation_mode: aiMode,
  }), [aiMode, data]);

  const handleGenerate = useCallback(async () => {
    setGenerating(true);
    setGenerateError(null);

    const generateUrl = `${API_URL}/api/generate`;
    const healthUrl = `${API_URL}/api/health`;

    try {
      const healthRes = await fetch(healthUrl).catch(() => null);
      if (!healthRes?.ok) {
        setGenerateError(
          "O serviço de API não está disponível neste ambiente.\n\n" +
          "Inicie a API local e tente novamente:\nuvicorn backend.app.main:app --reload --port 8001"
        );
        return;
      }

      const promptRes = await apiPost<{ status?: string; prompt_master?: Record<string, unknown>; errors?: string[] }>(
        "/api/prompt/build",
        { stack_id: "static_site", answers: buildPromptAnswers() }
      );
      if (!promptRes.ok || !promptRes.data?.prompt_master || promptRes.data.status === "rejected") {
        const detail = (promptRes.data?.errors || [promptRes.backendError?.message || promptRes.networkError || "Prompt Master inválido"]).join("\n");
        throw new Error(`Prompt Master bloqueado.\nEndpoint: POST ${API_URL}/api/prompt/build\n${detail}`);
      }

      const payload = buildStaticSitePayload(data, locale) as Record<string, unknown>;
      payload.ai_generation_mode = aiMode;
      payload.generation_quality_mode = aiMode === "agent_boost_100" ? "agent_boost_100" : "local_90";
      payload.prompt_master = promptRes.data.prompt_master;
      const trace = liveBuilder.getTrace();
      if (trace) {
        payload.generation_trace = trace;
      }

      const res = await apiPost<{ id: string; redirect_url?: string }>("/api/generate", payload);
      if (res.ok && res.data) {
        setGenerateSuccess(true);
        setTimeout(() => {
          router.push(res.data?.redirect_url || `/projects/${res.data?.id}/checkout`);
        }, 1200);
        return;
      }

      const minimalPayload = {
        project_type: payload.project_type,
        stack: payload.stack,
        project_name: payload.project_name,
        generation_quality_mode: payload.generation_quality_mode,
        locale: payload.locale,
      };
      const errorMsg = [
        "Falha ao gerar projeto.",
        `Endpoint: POST ${generateUrl}`,
        `Status: ${res.status || "sem resposta"}`,
        `Backend: ${res.backendError?.message || res.networkError || "sem detalhe"}`,
        `Payload: ${JSON.stringify(minimalPayload)}`,
      ].join("\n");
      console.error("[StaticSiteWizard] generate failed", { generateUrl, status: res.status, errorMsg });
      setGenerateError(errorMsg);
    } catch (err: any) {
      const message = err?.message || "Erro inesperado";
      console.error("[StaticSiteWizard] unexpected generate error", message);
      setGenerateError(message);
    } finally {
      setGenerating(false);
    }
  }, [aiMode, buildPromptAnswers, data, liveBuilder, locale, router]);

  const errors = useMemo(() => {
    const items: string[] = [];
    if (currentStep === 4 && !data.site_name) {
      items.push(t("wizard.static.error_site_name"));
    }
    return items;
  }, [currentStep, data.site_name, t]);

  const config = STATIC_SITE_CONFIG;

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <SiteTypeStep value={data.site_type} onSelect={(v) => updateField("site_type", v)} t={t} options={SITE_TYPES} />;
      case 2:
        return (
          <VisualIdentityStep
            visualStyle={data.visual_style}
            colorPalette={data.color_palette}
            brandTone={data.brand_tone}
            hasLogo={data.has_logo}
            darkMode={data.dark_mode}
            onVisualStyle={(v) => updateField("visual_style", v)}
            onColorPalette={(v) => updateField("color_palette", v)}
            onBrandTone={(v) => updateField("brand_tone", v)}
            onHasLogo={(v) => updateField("has_logo", v)}
            onDarkMode={(v) => updateField("dark_mode", v)}
            t={t}
            visualStyles={VISUAL_STYLES}
            colorPalettes={COLOR_PALETTES}
            brandTones={BRAND_TONES}
          />
        );
      case 3:
        return <SectionsStep sections={data.sections} onToggle={(k) => toggleArrayItem("sections", k)} t={t} options={SECTIONS} />;
      case 4:
        return (
          <ContentStep
            siteName={data.site_name}
            slogan={data.slogan}
            companyDescription={data.company_description}
            mainTexts={data.main_texts}
            ctas={data.ctas}
            targetAudience={data.target_audience}
            onChange={(f, v) => updateField(f as keyof StaticSiteData, v)}
            t={t}
          />
        );
      case 5:
        return <UxStep uxOptions={data.ux_options} onToggle={(k) => toggleArrayItem("ux_options", k)} t={t} options={UX_OPTIONS} />;
      case 6:
        return (
          <SeoStep
            metaTitle={data.meta_title}
            metaDescription={data.meta_description}
            keywords={data.keywords}
            openGraph={data.open_graph}
            sitemap={data.sitemap}
            robotsTxt={data.robots_txt}
            lazyLoading={data.lazy_loading}
            onChange={(f, v) => updateField(f as keyof StaticSiteData, v as any)}
            t={t}
          />
        );
      case 7:
        return <FormStep formOptions={data.form_options} onToggle={(k) => toggleArrayItem("form_options", k)} t={t} options={FORM_OPTIONS} />;
      case 8:
        return (
          <SecurityStep
            cspEnabled={data.csp_enabled}
            jsSanitization={data.js_sanitization}
            unsafeLinkProtection={data.unsafe_link_protection}
            noCredentialsFrontend={data.no_credentials_frontend}
            formValidation={data.form_validation}
            onChange={(f, v) => updateField(f as keyof StaticSiteData, v as any)}
            t={t}
          />
        );
      case 9:
        return <PreviewStep data={data} t={t} />;
      case 10:
        return (
          <GenerateStep
            generating={generating}
            generateError={generateError}
            generateSuccess={generateSuccess}
            onGenerate={handleGenerate}
            onPrev={() => setCurrentStep((s) => Math.max(1, s - 1))}
            isValid={missingFields.length === 0}
            missingFields={missingFields}
            aiMode={aiMode}
            onAiModeChange={(mode) => liveBuilder.setAiMode(mode)}
            promptReady={promptReady}
            t={t}
          />
        );
      default:
        return null;
    }
  };

  return (
    <WizardShell
      title={t(config.titleKey)}
      subtitle={t(config.subtitleKey)}
      step={currentStep}
      totalSteps={config.totalSteps}
      steps={config.steps}
      loading={generating}
      canProceed={canProceed}
      errors={errors}
      warnings={[]}
      onStepClick={(s) => setCurrentStep(s)}
      onPrev={() => (currentStep === 1 ? router.push("/wizard") : setCurrentStep((s) => Math.max(1, s - 1)))}
      onNext={() => setCurrentStep((s) => Math.min(s + 1, config.totalSteps))}
      onGenerate={handleGenerate}
      t={t}
    >
      {renderStep()}
    </WizardShell>
  );
}
