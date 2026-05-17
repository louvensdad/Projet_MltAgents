"use client";

export default function BackendArchitectureMiniPreview({ template }: { template: any }) {
  const nodes = template?.demo_data?.nodes || ["Client", "Gateway", "Services", "Database", "Queue"];
  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 text-white">
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-[0.25em] text-sky-300">{template?.architecture_label || "Architecture"}</span>
        <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] text-slate-300">Gatekeeper</span>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        {nodes.slice(0, 6).map((node: string) => (
          <div key={node} className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-4 text-center text-[11px] text-slate-200">
            {node}
          </div>
        ))}
      </div>
    </div>
  );
}

