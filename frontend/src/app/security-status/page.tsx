"use client";

import { useEffect, useState } from "react";
import StatusBadge from "@/components/common/StatusBadge";
import { apiGet, apiFallbacks } from "@/lib/api";
import { usePreferences } from "@/context/PreferencesContext";
import AnimatedBadge from "@/components/premium/AnimatedBadge";
import EngineNodeGraph from "@/components/premium/EngineNodeGraph";
import HolographicCard from "@/components/premium/HolographicCard";
import MetricOrb from "@/components/premium/MetricOrb";
import SectionHeader from "@/components/premium/SectionHeader";
import { AlertTriangle, CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";

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
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 lg:py-10">
      <HolographicCard className="p-6 md:p-8">
        <div className="flex flex-wrap items-center gap-2">
          <AnimatedBadge tone="emerald">security center</AnimatedBadge>
          <AnimatedBadge tone="violet">live validation</AnimatedBadge>
        </div>
        <h1 className="mt-5 text-4xl font-semibold tracking-tight text-white md:text-5xl">{t("security.title")}</h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 md:text-base">{t("security.subtitle")}</p>
        {!loading && (
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <MetricOrb label="Score" value={data?.security_score ?? "-"} icon={<Sparkles size={16} />} accent="emerald" />
            <MetricOrb label="Layers" value={items.length} icon={<ShieldCheck size={16} />} accent="cyan" />
            <MetricOrb label="Mode" value={error ? "Offline" : "Live"} icon={<ShieldCheck size={16} />} accent="violet" />
          </div>
        )}
      </HolographicCard>

      {loading && <div className="h-24 animate-pulse rounded-xl bg-white/10" />}
      {error && <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-amber-200">{error}</div>}
      {!loading && (
        <div className="mb-3 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-gray-300">
          {t("security.score")}: <span className="font-semibold text-white">{data?.security_score ?? "-"}</span>
        </div>
      )}
      <HolographicCard className="p-5">
        <SectionHeader eyebrow="layers" title="Security layers" subtitle="Rules, warnings and compliance nodes rendered as a live map." />
        <div className="mt-5">
          <EngineNodeGraph
            nodes={items.map((item: any) => ({ name: item.name, status: item.status, hint: item.detail }))}
          />
        </div>
      </HolographicCard>
      <div className="grid gap-3 md:grid-cols-2">
        {items.length === 0 && !loading && (
          <div className="col-span-2 rounded-xl border border-dashed border-white/15 bg-white/[0.02] py-8 text-center text-sm text-gray-500">
            {t("security.no_layers")}
          </div>
        )}
        {items.map((item: any) => (
          <HolographicCard key={item.name} className="p-3">
            <div className="flex items-center justify-between">
            <span className="text-sm text-gray-200">{item.name}</span>
            <StatusBadge status={item.status} />
            </div>
          </HolographicCard>
        ))}
      </div>
    </div>
  );
}
