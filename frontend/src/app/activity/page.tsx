"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Activity, RefreshCw, Sparkles } from "lucide-react";
import { API_BASE } from "@/lib/config";
import { usePreferences } from "@/context/PreferencesContext";
import AnimatedBadge from "@/components/premium/AnimatedBadge";
import EngineNodeGraph from "@/components/premium/EngineNodeGraph";
import HolographicCard from "@/components/premium/HolographicCard";
import MetricOrb from "@/components/premium/MetricOrb";
import SectionHeader from "@/components/premium/SectionHeader";

type ActivityItem = { timestamp?: string; event_type?: string; project_id?: string };

const FILTERS = ["all", "project_created", "project_deleted", "payment_confirmed", "project_generated"] as const;

export default function ActivityPage() {
  const { t } = usePreferences();
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const qp = filter === "all" ? "" : `?event_type=${encodeURIComponent(filter)}`;
    fetch(`${API_BASE}/api/activity${qp}`)
      .then((r) => r.json())
      .then((d) => setItems(d.items || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [filter]);

  useEffect(() => {
    const qp = filter === "all" ? "" : `?event_type=${encodeURIComponent(filter)}`;
    const es = new EventSource(`${API_BASE}/api/activity/stream${qp}`);
    es.onmessage = (event) => {
      try {
        const payload: ActivityItem = JSON.parse(event.data);
        if (!payload?.event_type) return;
        setItems((prev) => {
          const next = [payload, ...prev];
          return next.slice(0, 50);
        });
      } catch {}
    };
    es.onerror = () => es.close();
    return () => es.close();
  }, [filter]);

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 lg:py-10">
      <motion.section initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <HolographicCard className="p-6 md:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <AnimatedBadge tone="cyan">live stream</AnimatedBadge>
            <AnimatedBadge tone="violet">event timeline</AnimatedBadge>
          </div>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight text-white md:text-5xl">{t("activity.title")}</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 md:text-base">{t("activity.subtitle")}</p>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <MetricOrb label="Events" value={items.length} icon={<Activity size={16} />} accent="cyan" />
            <MetricOrb label="Filter" value={filter} icon={<Sparkles size={16} />} accent="violet" />
            <MetricOrb label="Stream" value="Live" icon={<Activity size={16} />} accent="emerald" />
          </div>
        </HolographicCard>

        <HolographicCard className="p-6">
          <SectionHeader eyebrow="monitoring" title="Activity mesh" subtitle="A live operational stream for project events and system changes." />
          <div className="mt-5">
            <EngineNodeGraph
              nodes={[
                { name: "Ingestion", status: "live", hint: "HTTP + SSE" },
                { name: "Filter", status: filter, hint: "Event type selection" },
                { name: "Timeline", status: `${items.length} events`, hint: "Recent system activity" },
              ]}
            />
          </div>
        </HolographicCard>
      </motion.section>

      <HolographicCard className="p-5">
        <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-lg border px-4 py-2 text-xs font-medium transition-all ${
              filter === f
                ? "border-primary/40 bg-primary/15 text-primary"
                : "border-white/10 bg-white/[0.03] text-gray-400 hover:bg-white/10"
            }`}
            >
              {f}
            </button>
          ))}
        </div>
      </HolographicCard>

      <HolographicCard className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400">
            {filter === "all" ? t("activity.title") : filter}
          </h2>
          <span className="flex items-center gap-2 text-[10px] text-emerald-300">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
            {items.length} events
          </span>
        </div>
        {loading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 animate-pulse rounded-lg bg-white/10" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm text-gray-500">{t("activity.no_activity")}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((item, idx) => (
              <div key={`${item.timestamp}-${idx}`} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm">
                <div>
                  <p className="font-medium text-gray-200">{item.event_type || "event"}</p>
                  <p className="text-xs text-gray-500">{item.project_id || "-"}</p>
                </div>
                <span className="text-xs text-gray-500">{item.timestamp || "-"}</span>
              </div>
            ))}
          </div>
        )}
      </HolographicCard>
    </div>
  );
}
