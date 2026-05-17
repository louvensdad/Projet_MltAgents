"use client";

import { useEffect, useMemo, useState } from "react";
import { apiGet, apiFallbacks } from "@/lib/api";
import StatusBadge from "@/components/common/StatusBadge";
import { getStackMaturity } from "@/lib/stack-maturity";
import type { MaturityLevel } from "@/lib/stack-maturity";
import { usePreferences } from "@/context/PreferencesContext";

type Generator = { stack: string; generator: string; support_level: MaturityLevel; last_validation: string; maturity_score?: number };

export default function GeneratorsPage() {
  const { t } = usePreferences();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet<any>("/api/system/status", apiFallbacks["/api/system/status"] as any)
      .then((d) => setData(d.data))
      .catch(() => setData(apiFallbacks["/api/system/status"]))
      .finally(() => setLoading(false));
  }, []);

  const generators: Generator[] = useMemo(() => data?.generators?.generators || [], [data]);

  const grouped = useMemo(() => {
    const map: Record<string, Generator[]> = {};
    generators.forEach((g) => {
      const m = getStackMaturity(g.stack);
      const type = m?.type || "backend";
      if (!map[type]) map[type] = [];
      map[type].push(g);
    });
    return map;
  }, [generators]);

  return (
    <div className="mx-auto max-w-6xl animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("generators.title")}</h1>
        <p className="mt-2 text-gray-400">{t("generators.subtitle")}</p>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-white/10" />
          ))}
        </div>
      ) : generators.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/15 bg-white/[0.02] py-16 text-center">
          <p className="text-base font-semibold text-gray-200">{t("generators.no_generators")}</p>
          <p className="mt-1 text-sm text-gray-500">{t("generators.no_generators_desc")}</p>
        </div>
      ) : (
        <>
          {Object.entries(grouped).map(([type, gens]) => (
            <div key={type} className="space-y-3">
              <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500 capitalize">{type}</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {gens.map((g) => {
                  const maturity = getStackMaturity(g.stack);
                  return (
                    <div key={g.generator} className="rounded-xl border border-white/10 bg-surface p-5 transition-all hover:border-primary/30">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-gray-100">{g.generator}</p>
                        <StatusBadge
                          status={g.support_level}
                          maturityScore={g.maturity_score ?? maturity?.score}
                          maturityFeatures={maturity?.features}
                        />
                      </div>
                      <div className="mt-3 flex items-center gap-3 text-xs text-gray-500">
                        <span className="rounded-md bg-white/5 px-2 py-1 font-mono text-[10px] uppercase text-gray-400">{g.stack}</span>
                        <span>{g.last_validation}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
