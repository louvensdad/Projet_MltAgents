"use client";

import { useEffect, useMemo, useState } from "react";
import type { ComponentType, ReactNode } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, BadgeInfo, Boxes, GitBranch, Layers3, Rocket, Shield, Sparkles, FileCode2 } from "lucide-react";
import { apiFallbacks, apiGet, apiPost } from "@/lib/api";
import StatusBadge from "@/components/common/StatusBadge";
import TemplateArchitectureDiagram from "@/components/templates/previews/TemplateArchitectureDiagram";
import TemplateFileTreePreview from "@/components/templates/previews/TemplateFileTreePreview";
import StaticSiteMiniPreview from "@/components/templates/previews/StaticSiteMiniPreview";
import BackendArchitectureMiniPreview from "@/components/templates/previews/BackendArchitectureMiniPreview";
import DashboardMiniPreview from "@/components/templates/previews/DashboardMiniPreview";
import MarketplaceMiniPreview from "@/components/templates/previews/MarketplaceMiniPreview";
import AiSaasMiniPreview from "@/components/templates/previews/AiSaasMiniPreview";

const PREVIEW_MAP: Record<string, ComponentType<{ template: any }>> = {
  static_site: StaticSiteMiniPreview,
  backend_architecture: BackendArchitectureMiniPreview,
  dashboard: DashboardMiniPreview,
  marketplace: MarketplaceMiniPreview,
  ai_saas: AiSaasMiniPreview,
};

function findFallbackTemplate(slug: string) {
  const base = apiFallbacks["/api/templates"] as any;
  const catalog = Array.isArray(base?.catalog) ? base.catalog : [];
  return catalog.find((template: any) => template.slug === slug || template.id === slug) || null;
}

export default function TemplateDetailPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const slug = Array.isArray(params?.slug) ? params.slug[0] : params?.slug;
  const [template, setTemplate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!slug) return;
    let mounted = true;

    apiGet<any>(`/api/templates/${slug}`, findFallbackTemplate(slug))
      .then((res) => {
        if (!mounted) return;
        setTemplate(res.data?.template || res.data);
      })
      .catch(() => mounted && setError("Nao foi possivel carregar este template."))
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, [slug]);

  const Preview = useMemo(() => PREVIEW_MAP[template?.preview_type] || BackendArchitectureMiniPreview, [template?.preview_type]);
  const ready = template?.generation_supported !== false && template?.status === "ready";

  const handleBuild = async () => {
    if (!template || !template.generation_supported) return;
    setBusy(true);
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
        throw new Error(buildResult.backendError?.message || buildResult.networkError || buildResult.data?.message || "Falha ao gerar projeto");
      }

      router.push(`/projects/${buildResult.data.project_id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return <div className="mx-auto flex max-w-6xl items-center justify-center py-24 text-slate-400">Carregando template...</div>;
  }

  if (error || !template) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 py-20 text-center">
        <p className="text-sm uppercase tracking-[0.25em] text-slate-500">Template</p>
        <h1 className="text-3xl font-semibold text-white">Nao foi possivel abrir o template</h1>
        <p className="text-slate-400">{error || "Registro ausente no catalogo."}</p>
        <Link href="/templates" className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm text-slate-200 transition-all hover:bg-white/10">
          <ArrowLeft size={16} />
          Voltar ao catalogo
        </Link>
      </div>
    );
  }

  const StackPreview = Preview;

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div className="flex items-center justify-between gap-4">
        <Link href="/templates" className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-slate-300 transition-all hover:bg-white/10">
          <ArrowLeft size={16} />
          Catalogo
        </Link>
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-slate-500">
          <BadgeInfo size={14} />
          Template registry real
        </div>
      </div>

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-8 shadow-2xl shadow-black/30">
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-200">
                {template.category}
              </span>
              <StatusBadge status={template.status} />
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] text-slate-300">
                {template.architecture_label || template.architecture}
              </span>
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] text-slate-300">
                Score {template.quality_score}
              </span>
            </div>
            <div>
              <h1 className="text-3xl font-semibold text-white md:text-4xl">{template.name}</h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">{template.description}</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <MiniMetric icon={<Layers3 size={16} />} label="Stack" value={(template.stack || []).join(" + ")} />
              <MiniMetric icon={<Boxes size={16} />} label="Modules" value={(template.modules || []).length} />
              <MiniMetric icon={<Rocket size={16} />} label="Gatekeeper" value={template.gatekeeper} />
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleBuild}
                disabled={!ready || busy}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Sparkles size={16} />
                {ready ? (busy ? "Preparando..." : "Gerar projeto com este template") : "Em construção"}
              </button>
              <Link href={`/create/${template.stack_profile_id}?template_id=${template.id}`} className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-medium text-slate-200 transition-all hover:bg-white/10">
                <GitBranch size={16} />
                Abrir wizard
              </Link>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-surface p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Preview real</p>
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-black p-2">
            <StackPreview template={template} />
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <InfoPanel title="Arquitetura" icon={<GitBranch size={16} />} items={template.architecture_flow || []} />
        <InfoPanel title="Requisitos de seguranca" icon={<Shield size={16} />} items={template.security_requirements || []} />
        <InfoPanel title="Arquivos previstos" icon={<FileCode2 size={16} />} items={template.required_files || []} />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-surface p-6">
          <h2 className="text-sm font-bold uppercase tracking-[0.25em] text-slate-400">Blueprint preview</h2>
          <pre className="mt-4 max-h-[320px] overflow-auto rounded-2xl border border-white/10 bg-black/40 p-4 text-xs text-slate-200">
            {JSON.stringify(template.blueprint, null, 2)}
          </pre>
        </div>
        <div className="rounded-2xl border border-white/10 bg-surface p-6">
          <h2 className="text-sm font-bold uppercase tracking-[0.25em] text-slate-400">Prompt Master seed</h2>
          <p className="mt-4 whitespace-pre-wrap rounded-2xl border border-white/10 bg-black/40 p-4 text-sm leading-6 text-slate-200">
            {template.prompt_master_seed}
          </p>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-surface p-6">
          <h2 className="text-sm font-bold uppercase tracking-[0.25em] text-slate-400">Modules</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {(template.modules || []).map((module: string) => (
              <span key={module} className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-sm text-slate-200">
                {module}
              </span>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-surface p-6">
          <h2 className="text-sm font-bold uppercase tracking-[0.25em] text-slate-400">Features e qualidade</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <MiniMetric icon={<Rocket size={16} />} label="Quality score" value={template.quality_score} />
            <MiniMetric icon={<BadgeInfo size={16} />} label="Generation" value={template.generation_supported ? "supported" : "planned"} />
          </div>
          <ul className="mt-4 space-y-3">
            {(template.features || []).map((feature: string) => (
              <li key={feature} className="flex items-start gap-3 text-sm text-slate-300">
                <span className="mt-1 h-2 w-2 rounded-full bg-cyan-400" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <TemplateArchitectureDiagram template={template} />
        <TemplateFileTreePreview template={template} />
      </section>
    </div>
  );
}

function MiniMetric({ icon, label, value }: { icon: ReactNode; label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div className="flex items-center gap-2 text-slate-500">
        {icon}
        <span className="text-xs uppercase tracking-[0.2em]">{label}</span>
      </div>
      <p className="mt-3 text-sm font-semibold text-white">{value}</p>
    </div>
  );
}

function InfoPanel({ title, icon, items }: { title: string; icon: ReactNode; items: string[] }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-surface p-6">
      <div className="flex items-center gap-2 text-slate-400">
        {icon}
        <h2 className="text-sm font-bold uppercase tracking-[0.25em]">{title}</h2>
      </div>
      <div className="mt-4 space-y-2">
        {items.length > 0 ? items.map((item) => (
          <div key={item} className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-300">
            {item}
          </div>
        )) : <div className="rounded-xl border border-dashed border-white/10 px-4 py-3 text-sm text-slate-500">Sem dados.</div>}
      </div>
    </div>
  );
}
