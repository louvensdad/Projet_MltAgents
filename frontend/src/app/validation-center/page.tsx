"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, ShieldCheck } from "lucide-react";
import { API_BASE } from "@/lib/config";
import { usePreferences } from "@/context/PreferencesContext";
import AnimatedBadge from "@/components/premium/AnimatedBadge";
import EngineNodeGraph from "@/components/premium/EngineNodeGraph";
import HolographicCard from "@/components/premium/HolographicCard";
import MetricOrb from "@/components/premium/MetricOrb";
import SectionHeader from "@/components/premium/SectionHeader";

type Item = { rule: string; status: "validado" | "warning" | "erro"; detail: string };

export default function ValidationCenterPage() {
  const { t } = usePreferences();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/api/validation/summary`)
      .then((r) => r.json())
      .then((d) => setItems(d.items || []))
      .finally(() => setLoading(false));
  }, []);

  const tone = (s: Item["status"]) =>
    s === "validado"
      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
      : s === "warning"
      ? "border-amber-500/30 bg-amber-500/10 text-amber-200"
      : "border-rose-500/30 bg-rose-500/10 text-rose-200";

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 lg:py-10">
      <HolographicCard className="p-6 md:p-8">
        <div className="flex flex-wrap items-center gap-2">
          <AnimatedBadge tone="cyan">validation center</AnimatedBadge>
          <AnimatedBadge tone="emerald">quality gates</AnimatedBadge>
        </div>
        <h1 className="mt-5 text-4xl font-semibold tracking-tight text-white md:text-5xl">{t("validation.title")}</h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 md:text-base">{t("validation.subtitle")}</p>
        {!loading && (
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <MetricOrb label="Rules" value={items.length} icon={<ShieldCheck size={16} />} accent="cyan" />
            <MetricOrb label="Warnings" value={items.filter((item) => item.status === "warning").length} icon={<AlertTriangle size={16} />} accent="violet" />
            <MetricOrb label="Passed" value={items.filter((item) => item.status === "validado").length} icon={<CheckCircle2 size={16} />} accent="emerald" />
          </div>
        )}
      </HolographicCard>

      <HolographicCard className="p-5">
        <SectionHeader eyebrow="pipeline" title="Validation flow" subtitle="A quality gate view for rules, warnings and errors." />
        <div className="mt-5">
          <EngineNodeGraph
            nodes={items.map((item) => ({ name: item.rule, status: item.status, hint: item.detail }))}
          />
        </div>
      </HolographicCard>

      <div className="mt-6 rounded-xl border border-white/10 bg-surface p-5">
        {loading ? (
          <div className="space-y-2">
            <div className="h-14 animate-pulse rounded bg-white/10" />
            <div className="h-14 animate-pulse rounded bg-white/10" />
            <div className="h-14 animate-pulse rounded bg-white/10" />
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((item) => (
              <div key={item.rule} className={`rounded-lg border p-3 ${tone(item.status)}`}>
                <p className="font-semibold">{item.rule}</p>
                <p className="text-sm opacity-90">{item.detail}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
