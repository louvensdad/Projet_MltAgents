"use client";

interface ValidationPanelProps {
  checks: { label: string; ok: boolean }[];
  featureSupport: { feature: string; level: "full" | "partial" | "planned" }[];
}

const STATUS_CLASS: Record<"full" | "partial" | "planned", string> = {
  full: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  partial: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  planned: "bg-rose-500/20 text-rose-300 border-rose-500/30"
};

export default function ValidationPanel({ checks, featureSupport }: ValidationPanelProps) {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Quality Validation</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {checks.map((item) => (
            <div key={item.label} className={`rounded-lg border px-3 py-2 text-sm ${item.ok ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" : "border-rose-500/30 bg-rose-500/10 text-rose-300"}`}>
              {item.ok ? "OK" : "Pendente"} - {item.label}
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Implementation Confidence</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {featureSupport.map((item) => (
            <span key={item.feature} className={`rounded-md border px-2 py-1 text-xs ${STATUS_CLASS[item.level]}`}>
              {item.feature}: {item.level === "full" ? "Totalmente suportado" : item.level === "partial" ? "Parcialmente suportado" : "Ainda não implementado"}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
