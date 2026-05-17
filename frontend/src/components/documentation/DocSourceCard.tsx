"use client";

export interface DocSource {
  name: string;
  version: string;
  updated_at: string;
  cache: "HIT" | "MISS";
  status: "online" | "offline";
}

export default function DocSourceCard({ source }: { source: DocSource }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3 text-xs text-gray-300">
      <p className="font-semibold text-white">{source.name}</p>
      <p className="mt-1">Versão: {source.version}</p>
      <p>Cache: {source.cache}</p>
      <p>Atualização: {source.updated_at}</p>
      <p className={source.status === "online" ? "text-emerald-300" : "text-rose-300"}>Status: {source.status}</p>
    </div>
  );
}
