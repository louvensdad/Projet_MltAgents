"use client";

export interface ActivityItem {
  timestamp?: string;
  event_type?: string;
  project_id?: string;
}

export default function LiveActivityPanel({ items }: { items: ActivityItem[] }) {
  return (
    <div className="rounded-xl border border-white/10 bg-surface p-4">
      <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Live Activity</p>
      <div className="mt-3 space-y-2">
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
