"use client";

import { useEffect, useState } from "react";
import { API_BASE } from "@/lib/config";
import RecommendationCard from "./RecommendationCard";

export default function RecommendationPanel({ selected }: { selected: string[] }) {
  const [data, setData] = useState<{ suggestions: string[]; risks: string[] }>({ suggestions: [], risks: [] });

  useEffect(() => {
    fetch(`${API_BASE}/api/recommendations?selected=${encodeURIComponent(selected.join(","))}`)
      .then((r) => r.json())
      .then((d) => setData({ suggestions: d.suggestions || [], risks: d.risks || [] }))
      .catch(() => setData({ suggestions: [], risks: [] }));
  }, [selected]);

  return (
    <div className="rounded-xl border border-white/10 bg-surface p-4">
      <p className="text-xs font-bold uppercase tracking-widest text-gray-400">AI Recommendation Center</p>
      <div className="mt-3 space-y-2">
        {data.suggestions.map((item) => (
          <RecommendationCard key={item} label={item} type="recommendation" />
        ))}
        {data.risks.map((item) => (
          <RecommendationCard key={item} label={item} type="risk" />
        ))}
      </div>
    </div>
  );
}
