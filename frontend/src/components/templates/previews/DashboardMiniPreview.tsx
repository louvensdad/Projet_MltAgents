"use client";

export default function DashboardMiniPreview({ template }: { template: any }) {
  const metrics = template?.demo_data?.kpis || ["Revenue", "Users", "Alerts"];
  const bars = template?.demo_data?.bars || [80, 60, 90, 55];
  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 text-white">
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-[0.25em] text-violet-300">{template?.name || "Dashboard"}</span>
        <span className="rounded-full border border-violet-500/20 bg-violet-500/10 px-2 py-0.5 text-[10px] text-violet-200">Realtime</span>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {metrics.slice(0, 3).map((metric: string) => (
          <div key={metric} className="rounded-xl border border-white/10 bg-white/[0.03] p-2 text-[10px] text-slate-300">
            <div className="h-2 w-10 rounded-full bg-white/30" />
            <div className="mt-2 text-[10px]">{metric}</div>
          </div>
        ))}
      </div>
      <div className="mt-3 grid grid-cols-4 gap-1">
        {bars.slice(0, 4).map((bar: number, index: number) => (
          <div key={index} className="flex h-20 items-end rounded-xl border border-white/5 bg-white/[0.02] p-1">
            <div className="w-full rounded-lg bg-gradient-to-t from-violet-500 to-cyan-400" style={{ height: `${Math.max(12, Math.min(100, bar))}%` }} />
          </div>
        ))}
      </div>
    </div>
  );
}

