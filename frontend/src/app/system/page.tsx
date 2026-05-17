"use client";

import { useEffect, useState } from "react";
import { apiGet, apiFallbacks } from "@/lib/api";
import { usePreferences } from "@/context/PreferencesContext";
import AnimatedBadge from "@/components/premium/AnimatedBadge";
import EngineNodeGraph from "@/components/premium/EngineNodeGraph";
import HolographicCard from "@/components/premium/HolographicCard";
import MetricOrb from "@/components/premium/MetricOrb";
import SectionHeader from "@/components/premium/SectionHeader";

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
  const runtimeNodes = [
    { name: "Memory", status: "live", hint: `${perf?.memory_mb ?? "-"} MB` },
    { name: "Generators", status: "live", hint: `${perf?.generators_loaded ?? "-"} loaded` },
    { name: "Queue", status: "ready", hint: `${perf?.queue_size ?? "-"} pending` },
    { name: "Uptime", status: "online", hint: `${perf?.uptime_seconds ?? "-"} s` },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 lg:py-10">
      <HolographicCard className="p-6 md:p-8">
        <div className="flex flex-wrap items-center gap-2">
          <AnimatedBadge tone="cyan">system console</AnimatedBadge>
          <AnimatedBadge tone="violet">runtime metrics</AnimatedBadge>
        </div>
        <h1 className="mt-5 text-4xl font-semibold tracking-tight text-white md:text-5xl">{t("system.title")}</h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 md:text-base">{t("system.subtitle")}</p>
        {!loading && (
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <MetricOrb label="Memory" value={perf?.memory_mb ?? "-"} accent="cyan" />
            <MetricOrb label="Generators" value={perf?.generators_loaded ?? "-"} accent="violet" />
            <MetricOrb label="Uptime" value={perf?.uptime_seconds ?? "-"} accent="emerald" />
          </div>
        )}
      </HolographicCard>

      <HolographicCard className="p-5">
        <SectionHeader eyebrow="runtime" title="System mesh" subtitle="Operational map for memory, queue, generators and uptime." />
        <div className="mt-5">
          <EngineNodeGraph nodes={runtimeNodes} />
        </div>
      </HolographicCard>

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
    <HolographicCard className="p-5">
      <p className="text-xs font-medium uppercase tracking-wider text-gray-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-gray-100">{value}</p>
    </HolographicCard>
  );
}
