"use client";

export default function AiSaasMiniPreview({ template }: { template: any }) {
  const agents = template?.demo_data?.agents || ["Prompt", "Security", "Docs", "Billing"];
  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 text-white">
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-[0.25em] text-cyan-300">{template?.name || "AI SaaS"}</span>
        <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2 py-0.5 text-[10px] text-cyan-200">Agents</span>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {agents.slice(0, 4).map((agent: string) => (
          <div key={agent} className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-4 text-[11px] text-slate-200">
            {agent}
          </div>
        ))}
      </div>
      <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-3 text-[10px] text-slate-400">
        {"Prompt Master -> Validator -> Docs -> Gatekeeper -> Runner"}
      </div>
    </div>
  );
}
