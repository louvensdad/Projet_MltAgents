"use client";

export default function TemplateArchitectureDiagram({ template }: { template: any }) {
  const nodes = template?.blueprint?.architecture_flow || template?.demo_data?.nodes || ["Client", "Gateway", "Services", "Database"];
  return (
    <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-[0.25em] text-slate-400">Architecture Diagram</span>
        <span className="text-[10px] text-slate-500">{template?.architecture_label || template?.architecture}</span>
      </div>
      <div className="space-y-2">
        {nodes.map((node: string, index: number) => (
          <div key={node} className="flex flex-col items-center">
            <div className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-center text-sm text-white">
              {node}
            </div>
            {index < nodes.length - 1 && <div className="h-4 w-px bg-cyan-500/40" />}
          </div>
        ))}
      </div>
    </div>
  );
}

