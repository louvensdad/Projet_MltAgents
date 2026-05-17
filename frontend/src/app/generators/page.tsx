"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Cpu, Layers3, Sparkles } from "lucide-react";
import { apiGet, apiFallbacks } from "@/lib/api";
import StatusBadge from "@/components/common/StatusBadge";
import { getStackMaturity } from "@/lib/stack-maturity";
import type { MaturityLevel } from "@/lib/stack-maturity";
import { usePreferences } from "@/context/PreferencesContext";
import AnimatedBadge from "@/components/premium/AnimatedBadge";
import HolographicCard from "@/components/premium/HolographicCard";
import MetricOrb from "@/components/premium/MetricOrb";
import SectionHeader from "@/components/premium/SectionHeader";

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
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 lg:py-10">
      <motion.section initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <HolographicCard className="p-6 md:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <AnimatedBadge tone="cyan">generator control plane</AnimatedBadge>
            <AnimatedBadge tone="violet">stack registry</AnimatedBadge>
          </div>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight text-white md:text-5xl">{t("generators.title")}</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 md:text-base">{t("generators.subtitle")}</p>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <MetricOrb label="Generators" value={generators.length} icon={<Cpu size={16} />} accent="cyan" />
            <MetricOrb label="Groups" value={Object.keys(grouped).length} icon={<Layers3 size={16} />} accent="violet" />
            <MetricOrb label="Live state" value="Ready" icon={<Sparkles size={16} />} accent="emerald" />
          </div>
        </HolographicCard>

        <HolographicCard className="p-6">
          <SectionHeader eyebrow="runtime" title="Support matrix" subtitle="Grouped by stack family and maturity level." />
        </HolographicCard>
      </motion.section>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-white/10" />
          ))}
        </div>
      ) : generators.length === 0 ? (
        <HolographicCard className="py-16 text-center">
          <p className="text-base font-semibold text-gray-200">{t("generators.no_generators")}</p>
          <p className="mt-1 text-sm text-gray-500">{t("generators.no_generators_desc")}</p>
        </HolographicCard>
      ) : (
        <>
          {Object.entries(grouped).map(([type, gens]) => (
            <div key={type} className="space-y-3">
              <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500 capitalize">{type}</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {gens.map((g) => {
                  const maturity = getStackMaturity(g.stack);
                  return (
                    <HolographicCard key={g.generator} className="p-5">
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
                    </HolographicCard>
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
