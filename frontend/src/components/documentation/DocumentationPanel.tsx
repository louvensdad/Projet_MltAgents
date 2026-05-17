"use client";

import { useEffect, useState } from "react";
import { API_BASE } from "@/lib/config";
import DocSourceCard, { DocSource } from "./DocSourceCard";

export default function DocumentationPanel({ stack }: { stack: string }) {
  const [sources, setSources] = useState<DocSource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetch(`${API_BASE}/api/documentation/sources?stack=${encodeURIComponent(stack)}`)
      .then((r) => r.json())
      .then((data) => {
        if (mounted) setSources(data.sources || []);
      })
      .catch(() => {
        if (mounted) setSources([]);
      })
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [stack]);

  return (
    <div className="rounded-xl border border-white/10 bg-black/30 p-4">
      <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Documentation Sources</p>
      {loading ? (
        <div className="mt-3 space-y-2">
          <div className="h-14 animate-pulse rounded bg-white/10" />
          <div className="h-14 animate-pulse rounded bg-white/10" />
        </div>
      ) : (
        <div className="mt-3 space-y-2">
          {sources.map((source) => (
            <DocSourceCard key={`${source.name}-${source.version}`} source={source} />
          ))}
        </div>
      )}
    </div>
  );
}
