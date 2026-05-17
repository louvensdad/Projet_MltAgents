"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/common/PageHeader";
import StatusBadge from "@/components/common/StatusBadge";
import { apiGet, apiFallbacks } from "@/lib/api";
import { usePreferences } from "@/context/PreferencesContext";

function safeArray(arr: any): any[] {
  if (Array.isArray(arr)) return arr;
  if (arr && typeof arr === "object") return Object.values(arr);
  return [];
}

export default function SecurityStatusPage() {
  const { t } = usePreferences();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setError("");
    apiGet<any>("/api/security-status", apiFallbacks["/api/security-status"] as any)
      .then((r) => setData(r.data))
      .catch(() => setError("Modo offline com fallback local."))
      .finally(() => setLoading(false));
  }, []);

  const items = safeArray(data?.layers || data?.items || []);

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader title={t("security.title")} subtitle={t("security.subtitle")} />
      {loading && <div className="h-24 animate-pulse rounded-xl bg-white/10" />}
      {error && <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-amber-200">{error}</div>}
      {!loading && (
        <div className="mb-3 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-gray-300">
          {t("security.score")}: <span className="font-semibold text-white">{data?.security_score ?? "-"}</span>
        </div>
      )}
      <div className="grid gap-3 md:grid-cols-2">
        {items.length === 0 && !loading && (
          <div className="col-span-2 rounded-xl border border-dashed border-white/15 bg-white/[0.02] py-8 text-center text-sm text-gray-500">
            {t("security.no_layers")}
          </div>
        )}
        {items.map((item: any) => (
          <div key={item.name} className="flex items-center justify-between rounded-lg border border-white/10 bg-surface px-3 py-2">
            <span className="text-sm text-gray-200">{item.name}</span>
            <StatusBadge status={item.status} />
          </div>
        ))}
      </div>
    </div>
  );
}
