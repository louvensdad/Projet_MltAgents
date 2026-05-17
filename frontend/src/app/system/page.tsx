"use client";

import { useEffect, useState } from "react";
import { apiGet, apiFallbacks } from "@/lib/api";
import { usePreferences } from "@/context/PreferencesContext";

export default function SystemPage() {
  const { t } = usePreferences();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet<any>("/api/system/status", apiFallbacks["/api/system/status"] as any)
      .then((d) => setData(d.data))
      .catch(() => setData(apiFallbacks["/api/system/status"]))
      .finally(() => setLoading(false));
  }, []);

  const perf = data?.performance;

  return (
    <div className="mx-auto max-w-6xl animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("system.title")}</h1>
        <p className="mt-2 text-gray-400">{t("system.subtitle")}</p>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-white/10" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          <MetricCard label="Memory (MB)" value={String(perf?.memory_mb ?? "-")} />
          <MetricCard label="Generators Loaded" value={String(perf?.generators_loaded ?? "-")} />
          <MetricCard label="Docs Cache (bytes)" value={String(perf?.docs_cache_size_bytes ?? "-")} />
          <MetricCard label="Queue Size" value={String(perf?.queue_size ?? "-")} />
          <MetricCard label="Uptime (s)" value={String(perf?.uptime_seconds ?? "-")} />
          <MetricCard label="Projects Total" value={String(data?.projects_total ?? "-")} />
        </div>
      )}
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-surface p-5">
      <p className="text-xs font-medium uppercase tracking-wider text-gray-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-gray-100">{value}</p>
    </div>
  );
}
