"use client";

export default function InfraEstimate({ complexity }: { complexity: number }) {
  const infra = complexity < 35 ? "Small" : complexity < 70 ? "Medium" : "Large";
  const time = complexity < 35 ? "2-4 semanas" : complexity < 70 ? "6-10 semanas" : "12+ semanas";
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Infra / Prazo</p>
      <p className="mt-2 text-sm text-gray-200">{infra} - {time}</p>
    </div>
  );
}
