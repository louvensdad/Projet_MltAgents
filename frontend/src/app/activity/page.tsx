"use client";

import { useEffect, useMemo, useState } from "react";
import { API_BASE } from "@/lib/config";
import { usePreferences } from "@/context/PreferencesContext";

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
    <div className="mx-auto max-w-6xl animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("activity.title")}</h1>
        <p className="mt-2 text-gray-400">{t("activity.subtitle")}</p>
      </div>

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

      <div className="rounded-xl border border-white/10 bg-surface p-5">
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
              <div key={`${item.timestamp}-${idx}`} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-sm">
                <div>
                  <p className="font-medium text-gray-200">{item.event_type || "event"}</p>
                  <p className="text-xs text-gray-500">{item.project_id || "-"}</p>
                </div>
                <span className="text-xs text-gray-500">{item.timestamp || "-"}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
