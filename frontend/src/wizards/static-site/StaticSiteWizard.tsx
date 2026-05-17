"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePreferences } from "@/context/PreferencesContext";
import { useLiveBuilder } from "@/context/LiveBuilderContext";
import { computeStaticSiteSnapshot } from "@/lib/live-builder";
import { WizardShell } from "../core";
import { apiPost, API_URL } from "@/lib/api";
import type { StaticSiteData } from "./staticSitePayload";
import { DEFAULT_STATIC_SITE_DATA, buildStaticSitePayload, buildStaticSitePromptAnswers } from "./staticSitePayload";
import { STATIC_SITE_CONFIG, SITE_TYPES, VISUAL_STYLES, BRAND_COLORS, SECTIONS, CONTACT_METHODS, ANIMATION_LEVELS, ACCESSIBILITY_LEVELS, PERFORMANCE_OPTIONS } from "./staticSiteConfig";
import SiteTypeStep from "./steps/SiteTypeStep";
import VisualIdentityStep from "./steps/VisualIdentityStep";
import SectionsStep from "./steps/SectionsStep";
import ContentStep from "./steps/ContentStep";
import SeoStep from "./steps/SeoStep";
import FormStep from "./steps/FormStep";
import SecurityStep from "./steps/SecurityStep";
import PreviewStep from "./steps/PreviewStep";
import GenerateStep from "./steps/GenerateStep";
import UxStep from "./steps/UxStep";

const REQUIRED_FIELDS: Array<{ key: keyof StaticSiteData; label: string }> = [
  { key: "project_name", label: "Project name" },
  { key: "site_type", label: "Site type" },
  { key: "target_audience", label: "Target audience" },
  { key: "business_goal", label: "Business goal" },
  { key: "sections", label: "Sections" },
  { key: "visual_style", label: "Visual style" },
  { key: "seo_keywords", label: "SEO keywords" },
  { key: "contact_method", label: "Contact method" },
  { key: "language", label: "Language" },
];

export default function StaticSiteWizard() {
  const { t, lang: locale } = usePreferences();
  const liveBuilder = useLiveBuilder();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<StaticSiteData>(DEFAULT_STATIC_SITE_DATA);
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [generateSuccess, setGenerateSuccess] = useState(false);
  const [generatedProjectId, setGeneratedProjectId] = useState<string | null>(null);
  const [generatedDownloadUrl, setGeneratedDownloadUrl] = useState<string | null>(null);
  const [generatedCheckoutUrl, setGeneratedCheckoutUrl] = useState<string | null>(null);
  const [generatedRedirectUrl, setGeneratedRedirectUrl] = useState<string | null>(null);
  const [generatedPaymentRequired, setGeneratedPaymentRequired] = useState(false);

  const aiMode = liveBuilder.state.aiMode;

  useEffect(() => {
    liveBuilder.initProject("static_site");
    liveBuilder.setAiMode("local_build_90");
  }, [liveBuilder]);

  useEffect(() => {
    const liveOptions: string[] = [];
    if (data.contact_method !== "none") liveOptions.push("contact");
    if (data.analytics) liveOptions.push("analytics");
    const snapshot = computeStaticSiteSnapshot(
      data.sections,
      liveOptions,
      [data.animations, data.accessibility_level]
    );
    liveBuilder.updateSnapshot(snapshot);
    if (data.project_name) {
      liveBuilder.setProjectName(data.project_name);
    }
  }, [data.sections, data.contact_method, data.analytics, data.animations, data.accessibility_level, data.project_name, liveBuilder]);

  const updateField = useCallback(<K extends keyof StaticSiteData>(field: K, value: StaticSiteData[K]) => {
    setData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const toggleArrayItem = useCallback((field: "sections" | "brand_colors", key: string) => {
    setData((prev) => {
      const arr = prev[field];
      const next = arr.includes(key) ? arr.filter((item) => item !== key) : [...arr, key];
      return { ...prev, [field]: next };
    });
  }, []);

  const canProceed = useMemo(() => {
    switch (currentStep) {
      case 1:
        return !!data.site_type;
      case 2:
        return !!data.project_name && !!data.target_audience && !!data.business_goal;
      case 3:
        return data.sections.length > 0;
      case 4:
        return !!data.visual_style;
      case 5:
        return !!data.seo_keywords.trim();
      case 6:
        return !!data.contact_method;
      case 7:
        return true;
      case 8:
        return !!data.animations;
      default:
        return true;
    }
  }, [currentStep, data]);

  const missingFields = useMemo(() => {
    return REQUIRED_FIELDS.filter((item) => {
      const value = data[item.key];
      if (Array.isArray(value)) return value.length === 0;
      return typeof value === "string" ? !value.trim() : !value;
    }).map((item) => item.label);
  }, [data]);

  const buildPromptAnswers = useCallback(() => ({
    ...buildStaticSitePromptAnswers(data, locale),
    ai_generation_mode: aiMode,
  }), [aiMode, data, locale]);

  const handleGenerate = useCallback(async () => {
    setGenerating(true);
    setGenerateError(null);
    setGenerateSuccess(false);
    setGeneratedProjectId(null);
    setGeneratedDownloadUrl(null);
    setGeneratedCheckoutUrl(null);
    setGeneratedRedirectUrl(null);
    setGeneratedPaymentRequired(false);

    const generateUrl = `${API_URL}/api/generate`;
    const healthUrl = `${API_URL}/api/health`;

    try {
      const healthRes = await fetch(healthUrl).catch(() => null);
      if (!healthRes?.ok) {
        setGenerateError(
          "API service unavailable in this environment.\n\n" +
          "Start the API locally and try again:\nuvicorn backend.app.main:app --reload --port 8001"
        );
        return;
      }

      const promptRes = await apiPost<{ success?: boolean; status?: string; prompt_master?: Record<string, unknown>; errors?: string[]; missing_fields?: string[]; validation?: { passed?: boolean } }>(
        "/api/prompt/build",
        { stack_id: "static_site", project_type: "static_site", answers: buildPromptAnswers(), locale }
      );

      const promptOk = promptRes.ok && (promptRes.data?.success ?? true) && promptRes.data?.validation?.passed !== false;
      if (!promptOk || !promptRes.data?.prompt_master) {
        const detail = (promptRes.data?.errors || promptRes.data?.missing_fields || [promptRes.backendError?.message || promptRes.networkError || "Prompt Master invalid"]).join("\n");
        throw new Error(`Prompt Master blocked.\nEndpoint: POST ${API_URL}/api/prompt/build\n${detail}`);
      }

      const payload = buildStaticSitePayload(data, locale, aiMode) as Record<string, unknown>;
      payload.prompt_master = promptRes.data.prompt_master;
      payload.generation_trace = liveBuilder.getTrace();

      const res = await apiPost<{
        id?: string;
        project_id?: string;
        redirect_url?: string;
        download_url?: string | null;
        checkout_url?: string | null;
        payment_required?: boolean;
        success?: boolean;
      }>("/api/generate", payload);

      const responseData = res.data || null;
      const generatedId = responseData?.project_id || responseData?.id || null;
      const successLike = Boolean(generatedId) && (res.ok || res.status === 200 || responseData?.success !== false);

      if (successLike && generatedId) {
        const paymentRequired = Boolean(responseData?.payment_required);
        const downloadUrl = responseData?.download_url || (!paymentRequired ? `/downloads/${generatedId}` : null);
        const checkoutUrl = responseData?.checkout_url || (paymentRequired ? `/projects/${generatedId}/checkout` : null);
        const redirectUrl = responseData?.redirect_url || checkoutUrl || downloadUrl || `/downloads/${generatedId}`;

        setGeneratedProjectId(generatedId);
        setGeneratedPaymentRequired(paymentRequired);
        setGeneratedDownloadUrl(downloadUrl);
        setGeneratedCheckoutUrl(checkoutUrl);
        setGeneratedRedirectUrl(redirectUrl);
        setGenerateSuccess(true);
        setTimeout(() => {
          router.push(redirectUrl);
        }, 2000);
        return;
      }

      const minimalPayload = {
        stack_id: payload.stack_id,
        project_type: payload.project_type,
        project_name: payload.project_name,
        generation_quality_mode: payload.generation_quality_mode,
        locale: payload.locale,
      };
      const errorMsg = [
        "Failed to generate project.",
        `Endpoint: POST ${generateUrl}`,
        `Status: ${res.status || "no response"}`,
        `Backend: ${res.backendError?.message || res.networkError || "no details"}`,
        `Payload: ${JSON.stringify(minimalPayload)}`,
      ].join("\n");
      console.error("[StaticSiteWizard] generate failed", { generateUrl, status: res.status, errorMsg });
      setGenerateError(errorMsg);
    } catch (err: any) {
      const message = err?.message || "Unexpected error";
      console.error("[StaticSiteWizard] unexpected generate error", message);
      setGenerateError(message);
    } finally {
      setGenerating(false);
    }
  }, [aiMode, buildPromptAnswers, data, liveBuilder, locale, router]);

  const handleOpenDownload = useCallback(() => {
    const target = generatedDownloadUrl || (generatedProjectId ? `/downloads/${generatedProjectId}` : null);
    if (target) {
      router.push(target);
    }
  }, [generatedDownloadUrl, generatedProjectId, router]);

  const handleOpenCheckout = useCallback(() => {
    const target = generatedCheckoutUrl || (generatedProjectId ? `/projects/${generatedProjectId}/checkout` : null);
    if (target) {
      router.push(target);
    }
  }, [generatedCheckoutUrl, generatedProjectId, router]);

  const errors = useMemo(() => {
    const items: string[] = [];
    if (currentStep === 2 && !data.project_name.trim()) items.push("Project name is required");
    if (currentStep === 5 && !data.seo_keywords.trim()) items.push("SEO keywords are required");
    return items;
  }, [currentStep, data.project_name, data.seo_keywords]);

  const config = STATIC_SITE_CONFIG;

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <SiteTypeStep value={data.site_type} onSelect={(v) => updateField("site_type", v)} options={SITE_TYPES} />;
      case 2:
        return (
          <ContentStep
            projectName={data.project_name}
            targetAudience={data.target_audience}
            businessGoal={data.business_goal}
            onChange={(field, value) => updateField(field, value)}
          />
        );
      case 3:
        return <SectionsStep sections={data.sections} onToggle={(k) => toggleArrayItem("sections", k)} options={SECTIONS} />;
      case 4:
        return (
          <VisualIdentityStep
            visualStyle={data.visual_style}
            brandColors={data.brand_colors}
            onVisualStyle={(v) => updateField("visual_style", v)}
            onToggleColor={(v) => toggleArrayItem("brand_colors", v)}
            visualStyles={VISUAL_STYLES}
            brandColorsOptions={BRAND_COLORS}
          />
        );
      case 5:
        return (
          <SeoStep
            seoTitle={data.seo_title}
            seoDescription={data.seo_description}
            seoKeywords={data.seo_keywords}
            openGraphTitle={data.open_graph_title}
            openGraphDescription={data.open_graph_description}
            analytics={data.analytics}
            onChange={(field, value) => updateField(field as keyof StaticSiteData, value as any)}
          />
        );
      case 6:
        return <FormStep contactMethod={data.contact_method} onSelect={(v) => updateField("contact_method", v)} options={CONTACT_METHODS} />;
      case 7:
        return (
          <SecurityStep
            lazyLoading={data.lazy_loading}
            semanticHtml={data.semantic_html}
            altText={data.alt_text}
            responsive={data.responsive}
            reducedMotion={data.reduced_motion}
            accessibilityLevel={data.accessibility_level}
            onToggle={(field, value) => updateField(field as keyof StaticSiteData, value as any)}
            onAccessibilityChange={(value) => updateField("accessibility_level", value)}
            options={PERFORMANCE_OPTIONS}
            accessibilityOptions={ACCESSIBILITY_LEVELS}
          />
        );
      case 8:
        return <UxStep animation={data.animations} onSelect={(v) => updateField("animations", v)} options={ANIMATION_LEVELS} />;
      case 9:
        return <PreviewStep data={data} />;
      case 10:
        return (
          <GenerateStep
            generating={generating}
            generateError={generateError}
            generateSuccess={generateSuccess}
            generatedProjectId={generatedProjectId}
            paymentRequired={generatedPaymentRequired}
            downloadUrl={generatedDownloadUrl}
            checkoutUrl={generatedCheckoutUrl}
            redirectUrl={generatedRedirectUrl}
            onGenerate={handleGenerate}
            onPrev={() => setCurrentStep((step) => Math.max(1, step - 1))}
            onOpenDownload={handleOpenDownload}
            onOpenCheckout={handleOpenCheckout}
            onCreateAnother={() => router.push("/create")}
            onBackHome={() => router.push("/wizard")}
            isValid={missingFields.length === 0}
            missingFields={missingFields}
            aiMode={aiMode}
            onAiModeChange={(mode) => liveBuilder.setAiMode(mode)}
            promptReady={missingFields.length === 0}
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
      onStepClick={(step) => setCurrentStep(step)}
      onPrev={() => (currentStep === 1 ? router.push("/wizard") : setCurrentStep((step) => Math.max(1, step - 1)))}
      onNext={() => setCurrentStep((step) => Math.min(step + 1, config.totalSteps))}
      onGenerate={handleGenerate}
      t={t}
    >
      {renderStep()}
    </WizardShell>
  );
}
