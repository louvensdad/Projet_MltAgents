"use client";

import { useEffect, useMemo, useState } from "react";
import { API_BASE } from "@/lib/config";

type ActivityItem = {
  timestamp?: string;
  event_type?: string;
  project_id?: string;
};

const FILTERS = ["all", "project_created", "project_deleted", "payment_confirmed", "project_generated"] as const;

export default function LiveActivityStreamPanel() {
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("all");

  useEffect(() => {
    const qp = filter === "all" ? "" : `?event_type=${encodeURIComponent(filter)}`;
    fetch(`${API_BASE}/api/activity${qp}`)
      .then((r) => r.json())
      .then((d) => setItems(d.items || []))
      .catch(() => setItems([]));
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
          return next.slice(0, 25);
        });
      } catch {
        // ignore malformed payload
      }
    };
    es.onerror = () => {
      es.close();
    };
    return () => es.close();
  }, [filter]);

  const title = useMemo(() => (filter === "all" ? "Live Activity" : `Live Activity: ${filter}`), [filter]);

  return (
    <div className="rounded-xl border border-white/10 bg-surface p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400">{title}</p>
        <span className="flex items-center gap-1 text-[10px] text-emerald-300">
          <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
          stream
        </span>
      </div>
      <div className="mb-3 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-md border px-2 py-1 text-[11px] ${filter === f ? "border-primary/40 bg-primary/15 text-primary" : "border-white/10 bg-white/[0.03] text-gray-400"}`}
          >
            {f}
          </button>
        ))}
      </div>
      <div className="space-y-2">
        {items.length === 0 && <p className="text-xs text-gray-500">Sem atividade recente.</p>}
        {items.map((item, idx) => (
          <div key={`${item.timestamp}-${idx}`} className="rounded-md border border-white/10 bg-white/[0.03] p-2 text-xs">
            <p className="text-gray-200">{item.event_type || "event"}</p>
            <p className="text-gray-500">{item.project_id || "-"} • {item.timestamp || "-"}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
