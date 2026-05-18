"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ComponentType } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, BadgeInfo, Sparkles, Layers3, PlayCircle, GitBranch } from "lucide-react";
import { apiGet, apiPost, apiFallbacks } from "@/lib/api";
import { usePreferences } from "@/context/PreferencesContext";
import TemplateInspectorModal from "@/components/templates/TemplateInspectorModal";
import StaticSiteMiniPreview from "@/components/templates/previews/StaticSiteMiniPreview";
import BackendArchitectureMiniPreview from "@/components/templates/previews/BackendArchitectureMiniPreview";
import DashboardMiniPreview from "@/components/templates/previews/DashboardMiniPreview";
import MarketplaceMiniPreview from "@/components/templates/previews/MarketplaceMiniPreview";
import AiSaasMiniPreview from "@/components/templates/previews/AiSaasMiniPreview";

const PREVIEW_COMPONENTS: Record<string, ComponentType<{ template: any }>> = {
  static_site: StaticSiteMiniPreview,
  backend_architecture: BackendArchitectureMiniPreview,
  dashboard: DashboardMiniPreview,
  marketplace: MarketplaceMiniPreview,
  ai_saas: AiSaasMiniPreview,
};

type TemplateMode = "preview" | "architecture" | "blueprint";

function safeArray(arr: any): any[] {
  if (Array.isArray(arr)) return arr;
  if (arr && typeof arr === "object") return Object.values(arr);
  return [];
}

function isTemplateReady(template: any) {
  return template?.generation_supported !== false && template?.status === "ready";
}

function templateAsset(template: any, index = 0) {
  const images = safeArray(template?.demo_images);
  return template?.image || images[index] || "";
}

function storeTemplateContext(template: any, prepared: any) {
  if (typeof window === "undefined") return;
  const context = {
    template_id: template.id,
    stack_id: prepared?.stack_id || template.stack_profile_id,
    project_type: prepared?.project_type || template.project_type,
    default_answers: prepared?.default_answers || template.default_answers,
    blueprint: prepared?.blueprint || template.blueprint,
    prompt_master_seed: prepared?.prompt_master?.seed || template.prompt_master_seed,
    redirect_url: prepared?.redirect_url || `/create/${template.stack_profile_id}?template_id=${template.id}`,
  };
  window.sessionStorage.setItem("template_context", JSON.stringify(context));
  window.localStorage.setItem("template_context", JSON.stringify(context));
  window.localStorage.setItem("ldcn_selected_template", template.id);
  window.localStorage.setItem("ldcn_wizard_stack", template.stack_profile_id || "");
  window.dispatchEvent(new Event("ldcn:context-update"));
}

export default function TemplatesPage() {
  const router = useRouter();
  const { t } = usePreferences();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTemplate, setActiveTemplate] = useState<any>(null);
  const [activeMode, setActiveMode] = useState<TemplateMode>("preview");
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    apiGet<any>("/api/templates", apiFallbacks["/api/templates"] as any)
      .then((r) => setData(r.data))
      .catch(() => setError("N?o foi poss?vel carregar o marketplace de templates."))
      .finally(() => setLoading(false));
  }, []);

  const catalog = safeArray(data?.catalog || []);
  const featured = safeArray(data?.featured || []);
  const categories = safeArray(data?.categories || []);
  const stats = data?.stats || {};

  const templatesById = useMemo(() => {
    const map = new Map<string, any>();
    catalog.forEach((template: any) => map.set(template.id, template));
    featured.forEach((template: any) => map.set(template.id, template));
    categories.forEach((category: any) => safeArray(category.templates).forEach((template: any) => map.set(template.id || template.slug, template)));
    return map;
  }, [catalog, featured, categories]);

  const totalTemplates = useMemo(() => stats.total || catalog.length || featured.length || 0, [catalog.length, featured.length, stats.total]);

  const openInspector = useCallback((template: any, mode: TemplateMode) => {
    setActiveTemplate(template);
    setActiveMode(mode);
  }, []);

  const closeInspector = useCallback(() => setActiveTemplate(null), []);

  const handleUseTemplate = useCallback(async (template: any) => {
    setBusyId(template.id);
    setError("");
    try {
      const prep = await apiPost<any>(`/api/templates/${template.id}/prepare-generation`, {
        project_name: template.name,
        project_description: template.description,
        answers: template.default_answers,
      });
      if (!prep.ok || !prep.data) {
        throw new Error(prep.backendError?.message || prep.networkError || "Falha ao preparar o template");
      }
      const prepared = prep.data;
      storeTemplateContext(template, prepared);
      router.push(prepared.redirect_url || `/create/${template.stack_profile_id}?template_id=${template.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusyId(null);
    }
  }, [router]);

  const handleGenerateNow = useCallback(async (template: any) => {
    if (!isTemplateReady(template)) {
      setError("Este template ainda est? em constru??o. Abra o wizard para revisar os dados faltantes.");
      return;
    }

    setBusyId(template.id);
    setError("");
    try {
      const payload = {
        stack_id: template.stack_profile_id,
        project_type: template.project_type,
        project_name: template.name,
        answers: template.default_answers,
        template_id: template.id,
        blueprint: template.blueprint,
        generation_quality_mode: "local_build_90",
        locale: "pt",
      };

      const result = await apiPost<any>("/api/generate", payload);
      const body = result.data as any;
      if (!result.ok || !body?.success || !body?.project_id) {
        throw new Error(result.backendError?.message || result.networkError || body?.message || "Falha ao gerar projeto");
      }

      if (body.payment_required) {
        const checkoutUrl = body.checkout_url || `/projects/${body.project_id}/checkout`;
        router.push(checkoutUrl);
        return;
      }

      const downloadUrl = body.download_url || `/downloads/${body.project_id}`;
      router.push(downloadUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusyId(null);
    }
  }, [router]);

  const groupedTemplates = categories.length > 0
    ? categories
    : [{ category: "catalog", description: "Cat?logo principal", templates: catalog }];

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <section className="overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-8 shadow-2xl shadow-black/30 md:p-10">
        <div className="grid gap-8 xl:grid-cols-[1.2fr_0.8fr] xl:items-end">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-200">
              <Sparkles size={12} />
              Marketplace real de templates
            </div>
            <h1 className="text-4xl font-semibold tracking-tight text-white md:text-5xl">{t("templates.title")}</h1>
            <p className="max-w-2xl text-sm leading-7 text-slate-300 md:text-base">{t("templates.subtitle")}</p>
            <p className="max-w-2xl text-sm text-slate-300/80">
              Cada template carrega capa visual, blueprint, seed do Prompt Master e caminho oficial de gera??o.
              Pr?via, arquitetura e gera??o passam a operar sobre o contrato real do produto.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/wizard" className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90">
                <Sparkles size={16} />
                Abrir assistente
              </Link>
              <Link href="/billing" className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-medium text-slate-200 transition-all hover:bg-white/10">
                <BadgeInfo size={16} />
                Monetiza??o
              </Link>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <StatCard label="Templates" value={totalTemplates} accent="cyan" />
            <StatCard label="Prontos" value={stats.ready || 0} accent="emerald" />
            <StatCard label="Parciais" value={stats.partial || 0} accent="amber" />
            <StatCard label="Planejados" value={stats.planned || 0} accent="violet" />
          </div>
        </div>
      </section>

      {loading && <div className="h-40 animate-pulse rounded-2xl bg-white/5" />}
      {error && <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-200">{error}</div>}

      {!loading && (featured.length > 0 || catalog.length > 0) && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-[0.25em] text-slate-400">Templates em destaque</h2>
            <span className="text-xs text-slate-500">blueprint + pr?via + gera??o</span>
          </div>
          <div className="grid gap-4 xl:grid-cols-2">
            {(featured.length > 0 ? featured : catalog.slice(0, 2)).map((template: any) => {
              const full = templatesById.get(template.id) || template;
              return (
                <TemplateCard
                  key={full.id}
                  template={full}
                  onPreview={() => openInspector(full, "preview")}
                  onArchitecture={() => openInspector(full, "architecture")}
                  onUseTemplate={() => handleUseTemplate(full)}
                  onGenerateNow={() => handleGenerateNow(full)}
                  onDetails={() => router.push(`/templates/${full.id}`)}
                  buildingId={busyId}
                />
              );
            })}
          </div>
        </section>
      )}

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-[0.25em] text-slate-400">Cat?logo por categoria</h2>
          <span className="text-xs text-slate-500">templates reais, n?o enfeites</span>
        </div>

        <div className="space-y-6">
          {groupedTemplates.map((category: any) => (
            <div key={category.category} className="rounded-3xl border border-white/10 bg-surface/80 p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-semibold text-white">{category.category}</h3>
                  <p className="mt-1 text-sm text-slate-400">{category.description}</p>
                </div>
                <Layers3 size={18} className="text-slate-500" />
              </div>

              <div className="mt-4 grid gap-4 xl:grid-cols-2">
                {(safeArray(category.templates).length > 0 ? safeArray(category.templates) : catalog.filter((template: any) => template.category === category.category)).map((template: any) => {
                  const full = templatesById.get(template.id) || template;
                  return (
                    <TemplateCard
                      key={full.id}
                      template={full}
                      onPreview={() => openInspector(full, "preview")}
                      onArchitecture={() => openInspector(full, "architecture")}
                      onUseTemplate={() => handleUseTemplate(full)}
                      onGenerateNow={() => handleGenerateNow(full)}
                      onDetails={() => router.push(`/templates/${full.id}`)}
                      buildingId={busyId}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      <TemplateInspectorModal
        isOpen={Boolean(activeTemplate)}
        mode={activeMode}
        template={activeTemplate}
        onClose={closeInspector}
        onUseTemplate={() => activeTemplate && handleUseTemplate(activeTemplate)}
        onGenerateNow={() => activeTemplate && handleGenerateNow(activeTemplate)}
      />
    </div>
  );
}

function TemplateCard({
  template,
  onPreview,
  onArchitecture,
  onUseTemplate,
  onGenerateNow,
  onDetails,
  buildingId,
}: {
  template: any;
  onPreview: () => void;
  onArchitecture: () => void;
  onUseTemplate: () => void;
  onGenerateNow: () => void;
  onDetails: () => void;
  buildingId: string | null;
}) {
  const Preview = PREVIEW_COMPONENTS[template.preview_type] || BackendArchitectureMiniPreview;
  const canGenerate = isTemplateReady(template);
  const isBusy = buildingId === template.id;
  const cover = templateAsset(template);

  return (
    <article className="group overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 transition-all hover:border-cyan-500/30 hover:shadow-[0_0_40px_rgba(6,182,212,0.08)]">
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/80">
        <div className="relative aspect-[16/9] w-full overflow-hidden">
          {cover ? (
            <Image src={cover} alt={template.name} fill sizes="(min-width: 1280px) 50vw, 100vw" className="object-cover transition-transform duration-500 group-hover:scale-[1.02]" />
          ) : (
            <div className="h-full w-full p-3">
              <Preview template={template} />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
          <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2">
            <span className={`rounded-full border px-2.5 py-0.5 text-[10px] uppercase tracking-[0.2em] ${template.status === "ready" ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" : template.status === "partial" ? "bg-amber-500/15 text-amber-300 border-amber-500/30" : "bg-slate-500/15 text-slate-300 border-slate-500/30"}`}>
              {template.status}
            </span>
            <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-0.5 text-[10px] uppercase tracking-[0.2em] text-slate-300">
              Nota {template.quality_score}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-lg font-semibold text-white">{template.name}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-400">{template.description}</p>
        </div>
        <div className="shrink-0 text-slate-500 transition-colors group-hover:text-cyan-300">
          <ArrowRight size={16} />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 text-[11px] text-slate-300 sm:grid-cols-3">
        {(template.modules || []).slice(0, 3).map((module: string) => (
          <div key={module} className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
            {module}
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {(template.stack || []).slice(0, 5).map((item: string) => (
          <span key={item} className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[11px] text-slate-300">
            {item}
          </span>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button onClick={onPreview} className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-slate-200 hover:bg-white/10">
          <PlayCircle size={14} />
          Pr?via
        </button>
        <button onClick={onArchitecture} className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-slate-200 hover:bg-white/10">
          <GitBranch size={14} />
          Arquitetura
        </button>
        <button
          onClick={onUseTemplate}
          className="inline-flex items-center gap-2 rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-3 py-2 text-xs text-cyan-200 hover:bg-cyan-500/20"
        >
          <Sparkles size={14} />
          Usar template
        </button>
        <button
          onClick={onGenerateNow}
          disabled={!canGenerate || isBusy}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-white hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Sparkles size={14} />
          {canGenerate ? (isBusy ? "Gerando..." : "Gerar agora") : "Em constru??o"}
        </button>
        <button onClick={onDetails} className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-slate-200 hover:bg-white/10">
          Ver detalhes
        </button>
      </div>
    </article>
  );
}

function StatCard({ label, value, accent }: { label: string; value: string | number; accent: "cyan" | "emerald" | "amber" | "violet" }) {
  const colorMap = {
    cyan: "from-cyan-500/20 to-cyan-500/5 text-cyan-200 border-cyan-500/20",
    emerald: "from-emerald-500/20 to-emerald-500/5 text-emerald-200 border-emerald-500/20",
    amber: "from-amber-500/20 to-amber-500/5 text-amber-200 border-amber-500/20",
    violet: "from-violet-500/20 to-violet-500/5 text-violet-200 border-violet-500/20",
  }[accent];

  return (
    <div className={`rounded-2xl border bg-gradient-to-br p-4 ${colorMap}`}>
      <p className="text-[11px] uppercase tracking-[0.25em] text-slate-400">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-white">{value}</p>
    </div>
  );
}
