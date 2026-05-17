"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/common/PageHeader";
import StatusBadge from "@/components/common/StatusBadge";
import EmptyState from "@/components/common/EmptyState";
import { apiGet, apiFallbacks } from "@/lib/api";
import { usePreferences } from "@/context/PreferencesContext";

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
    <div className="mx-auto max-w-6xl">
      <PageHeader title={t("documentation.title")} subtitle={t("documentation.subtitle")} />
      <div className="mb-4 flex items-center gap-3">
        <button onClick={load} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white">{t("documentation.refresh")}</button>
        <span className="text-xs text-gray-500">{data?.summary || t("documentation.summary_unavailable")}</span>
      </div>
      {loading && <div className="h-32 animate-pulse rounded-xl bg-white/10" />}
      {error && <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-amber-200">{error}</div>}
      {!loading && docs.length === 0 && (
        <EmptyState title={t("documentation.empty_title")} description={t("documentation.empty_desc")} />
      )}
      <div className="grid gap-3 md:grid-cols-2">
        {docs.map((d: any, idx: number) => (
          <div key={`${d.technology}-${d.name}-${idx}`} className="rounded-xl border border-white/10 bg-surface p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-gray-200">{d.name}</p>
              <StatusBadge status={d.status} />
            </div>
            <p className="mt-2 text-xs text-gray-500">{t("documentation.stack")}: {d.technology}</p>
            <p className="text-xs text-gray-500">{t("documentation.summary")}: {d.summary}</p>
            <p className="text-xs text-gray-500">{t("documentation.last_update")}: {d.last_update || "-"}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
