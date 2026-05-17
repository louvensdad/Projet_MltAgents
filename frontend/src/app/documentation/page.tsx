"use client";

import { useEffect, useState } from "react";
import StatusBadge from "@/components/common/StatusBadge";
import EmptyState from "@/components/common/EmptyState";
import { apiGet, apiFallbacks } from "@/lib/api";
import { usePreferences } from "@/context/PreferencesContext";
import AnimatedBadge from "@/components/premium/AnimatedBadge";
import EngineNodeGraph from "@/components/premium/EngineNodeGraph";
import HolographicCard from "@/components/premium/HolographicCard";
import MetricOrb from "@/components/premium/MetricOrb";
import SectionHeader from "@/components/premium/SectionHeader";

function safeArray(arr: any): any[] {
  if (Array.isArray(arr)) return arr;
  if (arr && typeof arr === "object") return Object.values(arr);
  return [];
}

export default function DocumentationCenterPage() {
  const { t } = usePreferences();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    setError("");
    apiGet<any>("/api/documentation", apiFallbacks["/api/documentation"] as any)
      .then((r) => setData(r.data))
      .catch(() => setError("Modo offline com fallback local."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const docs = safeArray(data?.docs || data || []);

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 lg:py-10">
      <HolographicCard className="p-6 md:p-8">
        <div className="flex flex-wrap items-center gap-2">
          <AnimatedBadge tone="cyan">central de docs</AnimatedBadge>
          <AnimatedBadge tone="violet">grafo de conhecimento</AnimatedBadge>
        </div>
        <h1 className="mt-5 text-4xl font-semibold tracking-tight text-white md:text-5xl">{t("documentation.title")}</h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 md:text-base">{t("documentation.subtitle")}</p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <button onClick={load} className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-[0_16px_40px_rgba(34,211,238,0.18)] transition-all hover:translate-y-[-1px]">{t("documentation.refresh")}</button>
          <MetricOrb label="Docs" value={safeArray(data?.docs || data || []).length} accent="cyan" />
          <MetricOrb label="Resumo" value={data?.summary ? "Ao vivo" : "Pendente"} accent="violet" />
        </div>
      </HolographicCard>
      <HolographicCard className="p-5">
        <SectionHeader eyebrow="pipeline" title="Malha de documentação" subtitle="Documentos contratados, consciência de stack e status por tecnologia." />
        <div className="mt-5">
          <EngineNodeGraph nodes={[{ name: "Docs de origem", status: "live", hint: data?.summary || "Resumo indisponível" }, { name: "Catálogo", status: "synced", hint: `${safeArray(data?.docs || data || []).length} docs` }]} />
        </div>
      </HolographicCard>
      <div className="mb-4 flex items-center gap-3">
        <span className="text-xs text-gray-500">{data?.summary || t("documentation.summary_unavailable")}</span>
      </div>
      {loading && <div className="h-32 animate-pulse rounded-xl bg-white/10" />}
      {error && <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-amber-200">{error}</div>}
      {!loading && docs.length === 0 && (
        <EmptyState title={t("documentation.empty_title")} description={t("documentation.empty_desc")} />
      )}
      <div className="grid gap-3 md:grid-cols-2">
        {docs.map((d: any, idx: number) => (
          <HolographicCard key={`${d.technology}-${d.name}-${idx}`} className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-gray-200">{d.name}</p>
              <StatusBadge status={d.status} />
            </div>
            <p className="mt-2 text-xs text-gray-500">{t("documentation.stack")}: {d.technology}</p>
            <p className="text-xs text-gray-500">{t("documentation.summary")}: {d.summary}</p>
            <p className="text-xs text-gray-500">{t("documentation.last_update")}: {d.last_update || "-"}</p>
          </HolographicCard>
        ))}
      </div>
    </div>
  );
}
