"use client";

export default function StaticSiteMiniPreview({ template }: { template: any }) {
  const sections = template?.demo_data?.sections || ["Hero", "Features", "FAQ"];
  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 text-white">
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-[0.25em] text-cyan-300">{template?.business_domain || "brand"}</span>
        <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2 py-0.5 text-[10px] text-cyan-200">SEO</span>
      </div>
      <div className="mt-4 space-y-3">
        <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
          <div className="h-2 w-2/3 rounded-full bg-white/70" />
          <div className="mt-2 h-2 w-1/2 rounded-full bg-white/20" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          {sections.slice(0, 4).map((section: string) => (
            <div key={section} className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-[11px] text-slate-300">
              {section}
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <div className="h-8 flex-1 rounded-lg bg-cyan-500/20" />
          <div className="h-8 flex-1 rounded-lg border border-white/10 bg-white/[0.03]" />
        </div>
      </div>
    </div>
  );
}

