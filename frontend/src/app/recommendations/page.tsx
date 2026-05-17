"use client";

import { useEffect, useState } from "react";
import { Lightbulb, AlertTriangle, RefreshCw, Sparkles } from "lucide-react";
import { API_BASE } from "@/lib/config";
import { usePreferences } from "@/context/PreferencesContext";
import AnimatedBadge from "@/components/premium/AnimatedBadge";
import HolographicCard from "@/components/premium/HolographicCard";
import MetricOrb from "@/components/premium/MetricOrb";
import SectionHeader from "@/components/premium/SectionHeader";

export default function RecommendationsPage() {
  const { t } = usePreferences();
  const [data, setData] = useState<{ suggestions: string[]; risks: string[] }>({ suggestions: [], risks: [] });
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    setLoading(true);
    fetch(`${API_BASE}/api/recommendations?selected=`)
      .then((r) => r.json())
      .then((d) => setData({ suggestions: d.suggestions || [], risks: d.risks || [] }))
      .catch(() => setData({ suggestions: [], risks: [] }))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 lg:py-10">
      <HolographicCard className="p-6 md:p-8">
        <div className="flex flex-wrap items-center gap-2">
          <AnimatedBadge tone="cyan">recommendation engine</AnimatedBadge>
          <AnimatedBadge tone="violet">risk matrix</AnimatedBadge>
        </div>
        <h1 className="mt-5 text-4xl font-semibold tracking-tight text-white md:text-5xl">{t("recommendations.title")}</h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 md:text-base">{t("recommendations.subtitle")}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <button
            onClick={fetchData}
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-[0_16px_40px_rgba(34,211,238,0.18)] transition-all hover:translate-y-[-1px]"
          >
            <RefreshCw size={14} /> {t("common.refresh")}
          </button>
          <MetricOrb label="Suggestions" value={data.suggestions.length} icon={<Lightbulb size={16} />} accent="emerald" />
          <MetricOrb label="Risks" value={data.risks.length} icon={<AlertTriangle size={16} />} accent="violet" />
        </div>
      </HolographicCard>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-white/10" />
          ))}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          <HolographicCard className="p-5">
            <div className="mb-4 flex items-center gap-2 text-emerald-400">
              <Lightbulb size={18} />
              <h2 className="text-sm font-bold uppercase tracking-widest">{t("recommendations.title")}</h2>
            </div>
            {data.suggestions.length === 0 ? (
              <p className="text-sm text-gray-500">{t("recommendations.no_recommendations")}</p>
            ) : (
              <div className="space-y-2">
                {data.suggestions.map((item, i) => (
                  <div key={i} className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-200">
                    {item}
                  </div>
                ))}
              </div>
            )}
          </HolographicCard>
          <HolographicCard className="p-5">
            <div className="mb-4 flex items-center gap-2 text-amber-400">
              <AlertTriangle size={18} />
              <h2 className="text-sm font-bold uppercase tracking-widest">{t("common.warning")}</h2>
            </div>
            {data.risks.length === 0 ? (
              <p className="text-sm text-gray-500">{t("recommendations.no_recommendations")}</p>
            ) : (
              <div className="space-y-2">
                {data.risks.map((item, i) => (
                  <div key={i} className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-sm text-amber-200">
                    {item}
                  </div>
                ))}
              </div>
            )}
          </HolographicCard>
        </div>
      )}
    </div>
  );
}
