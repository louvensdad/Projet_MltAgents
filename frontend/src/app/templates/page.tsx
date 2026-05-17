"use client";

import { useEffect, useMemo, useState } from "react";
import type { ComponentType } from "react";
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

function safeArray(arr: any): any[] {
  if (Array.isArray(arr)) return arr;
  if (arr && typeof arr === "object") return Object.values(arr);
  return [];
}

export default function TemplatesPage() {
  const router = useRouter();
  const { t } = usePreferences();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTemplate, setActiveTemplate] = useState<any>(null);
  const [activeMode, setActiveMode] = useState<"preview" | "architecture" | "blueprint">("preview");
  const [buildingId, setBuildingId] = useState<string | null>(null);

  useEffect(() => {
    apiGet<any>("/api/templates", apiFallbacks["/api/templates"] as any)
      .then((r) => setData(r.data))
      .catch(() => setError("Nao foi possivel carregar o marketplace de templates."))
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

  const openInspector = (template: any, mode: "preview" | "architecture" | "blueprint") => {
    setActiveTemplate(template);
    setActiveMode(mode);
  };

  const closeInspector = () => {
    setActiveTemplate(null);
  };

  const handleBuild = async (template: any) => {
    if (!template?.generation_supported) return;
    setBuildingId(template.id);
    try {
      const prep = await apiPost<any>(`/api/templates/${template.id}/prepare-generation`, {});
      if (!prep.ok || !prep.data) {
        throw new Error(prep.backendError?.message || prep.networkError || "Falha ao preparar template");
      }

      const prepared = prep.data;
      const missing = prepared.required_questions_missing || [];
      if (missing.length > 0) {
        const route = prepared.next_route?.route || prepared.template?.wizard_route || `/create/${template.stack_profile_id}`;
        router.push(`${route}?template_id=${template.id}`);
        return;
      }

      const buildResult = await apiPost<any>("/api/create", prepared.create_payload);
      if (!buildResult.ok || !buildResult.data?.success) {
        const message = buildResult.backendError?.message || buildResult.networkError || buildResult.data?.message || "Falha ao gerar projeto";
        throw new Error(message);
      }

      const projectId = buildResult.data.project_id;
      router.push(`/projects/${projectId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBuildingId(null);
    }
  };

  const groupedTemplates = categories.length > 0
    ? categories
    : [
        {
          category: "catalog",
          description: "Catalogo principal",
          templates: catalog,
        },
      ];

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <section className="overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-8 shadow-2xl shadow-black/30 md:p-10">
        <div className="grid gap-8 xl:grid-cols-[1.2fr_0.8fr] xl:items-end">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-200">
              <Sparkles size={12} />
              Real Template Marketplace
            </div>
            <h1 className="text-4xl font-semibold tracking-tight text-white md:text-5xl">{t("templates.title")}</h1>
            <p className="max-w-2xl text-sm leading-7 text-slate-300 md:text-base">{t("templates.subtitle")}</p>
            <p className="max-w-2xl text-sm text-slate-300/80">
              Cada template agora carrega blueprint, Prompt Master seed, gatekeeper e caminho oficial de geração.
              Preview, arquitetura e build deixam de ser decoracao e passam a operar sobre o contrato real.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/wizard" className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90">
                <Sparkles size={16} />
                Abrir wizard
              </Link>
              <Link href="/billing" className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-medium text-slate-200 transition-all hover:bg-white/10">
                <BadgeInfo size={16} />
                Monetizacao
              </Link>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <StatCard label="Templates" value={totalTemplates} accent="cyan" />
            <StatCard label="Ready" value={stats.ready || 0} accent="emerald" />
            <StatCard label="Partial" value={stats.partial || 0} accent="amber" />
            <StatCard label="Planned" value={stats.planned || 0} accent="violet" />
          </div>
        </div>
      </section>

      {loading && <div className="h-40 animate-pulse rounded-2xl bg-white/5" />}
      {error && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-200">
          {error}
        </div>
      )}

      {!loading && (featured.length > 0 || catalog.length > 0) && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-[0.25em] text-slate-400">Featured templates</h2>
            <span className="text-xs text-slate-500">blueprint + preview + build</span>
          </div>
          <div className="grid gap-4 xl:grid-cols-2">
            {(featured.length > 0 ? featured : catalog.slice(0, 2)).map((template: any) => (
              <TemplateCard
                key={template.id}
                template={templatesById.get(template.id) || template}
                onPreview={() => openInspector(templatesById.get(template.id) || template, "preview")}
                onArchitecture={() => openInspector(templatesById.get(template.id) || template, "architecture")}
                onBuild={() => handleBuild(templatesById.get(template.id) || template)}
                onDetails={() => router.push(`/templates/${template.id}`)}
                buildingId={buildingId}
              />
            ))}
          </div>
        </section>
      )}

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-[0.25em] text-slate-400">Catalog by category</h2>
          <span className="text-xs text-slate-500">templates reais, nao enfeites</span>
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
                      onBuild={() => handleBuild(full)}
                      onDetails={() => router.push(`/templates/${full.id}`)}
                      buildingId={buildingId}
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
        onBuild={() => activeTemplate && handleBuild(activeTemplate)}
      />
    </div>
  );
}

function TemplateCard({
  template,
  onPreview,
  onArchitecture,
  onBuild,
  onDetails,
  buildingId,
}: {
  template: any;
  onPreview: () => void;
  onArchitecture: () => void;
  onBuild: () => void;
  onDetails: () => void;
  buildingId: string | null;
}) {
  const Preview = PREVIEW_COMPONENTS[template.preview_type] || BackendArchitectureMiniPreview;
  const isBuilding = buildingId === template.id;
  const ready = template.status === "ready" && template.generation_supported !== false;
  const badgeClass = template.status === "ready"
    ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
    : template.status === "partial"
      ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
      : "bg-slate-500/15 text-slate-300 border-slate-500/30";

  return (
    <article className="group overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 transition-all hover:border-cyan-500/30 hover:shadow-[0_0_40px_rgba(6,182,212,0.08)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap gap-2">
            <span className={`rounded-full border px-2.5 py-0.5 text-[10px] uppercase tracking-[0.2em] ${badgeClass}`}>{template.status}</span>
            <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-0.5 text-[10px] uppercase tracking-[0.2em] text-slate-400">
              Score {template.quality_score}
            </span>
            <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-0.5 text-[10px] uppercase tracking-[0.2em] text-slate-400">
              {template.architecture_label || template.architecture}
            </span>
          </div>
          <h3 className="mt-3 text-lg font-semibold text-white">{template.name}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-400">{template.description}</p>
        </div>
        <div className="shrink-0 text-slate-500 transition-colors group-hover:text-cyan-300">
          <ArrowRight size={16} />
        </div>
      </div>

      <div className="mt-4">
        <Preview template={template} />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {(template.stack || []).slice(0, 5).map((item: string) => (
          <span key={item} className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[11px] text-slate-300">
            {item}
          </span>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 text-[11px] text-slate-300 sm:grid-cols-3">
        {(template.modules || []).slice(0, 3).map((module: string) => (
          <div key={module} className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
            {module}
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button onClick={onPreview} className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-slate-200 hover:bg-white/10">
          <PlayCircle size={14} />
          Preview
        </button>
        <button onClick={onArchitecture} className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-slate-200 hover:bg-white/10">
          <GitBranch size={14} />
          Arquitetura
        </button>
        <button
          onClick={onBuild}
          disabled={!ready || isBuilding}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-white hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Sparkles size={14} />
          {ready ? (isBuilding ? "Preparando..." : "Build") : "Em construção"}
        </button>
        <button onClick={onDetails} className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-slate-200 hover:bg-white/10">
          Ver detalhes
        </button>
              <button
                onClick={onBuild}
                disabled={!ready || isBuilding}
                className="inline-flex items-center gap-2 rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-3 py-2 text-xs text-cyan-200 hover:bg-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-50"
              >
          <Sparkles size={14} />
          Usar template
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
