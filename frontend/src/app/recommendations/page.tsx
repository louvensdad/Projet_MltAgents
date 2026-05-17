"use client";

import { useEffect, useState } from "react";
import { Lightbulb, AlertTriangle, RefreshCw } from "lucide-react";
import { API_BASE } from "@/lib/config";
import { usePreferences } from "@/context/PreferencesContext";

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
    <div className="mx-auto max-w-6xl animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("recommendations.title")}</h1>
          <p className="mt-2 text-gray-400">{t("recommendations.subtitle")}</p>
        </div>
        <button
          onClick={fetchData}
          className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.05] px-4 py-2 text-sm text-gray-300 hover:bg-white/10 transition-all"
        >
          <RefreshCw size={14} /> {t("common.refresh")}
        </button>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-white/10" />
          ))}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-surface p-5">
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
          </div>
          <div className="rounded-xl border border-white/10 bg-surface p-5">
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
          </div>
        </div>
      )}
    </div>
  );
}
