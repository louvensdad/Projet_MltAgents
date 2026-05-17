"use client";

import { motion } from "framer-motion";
import HolographicCard from "@/components/premium/HolographicCard";

export default function ProjectHealthCard({
  architectureValid,
  securityPassed,
  docsSynced,
  stackCompatible,
  partialFeatures,
}: {
  architectureValid: boolean;
  securityPassed: boolean;
  docsSynced: boolean;
  stackCompatible: boolean;
  partialFeatures: number;
}) {
  const checks = [
    { label: "Architecture", ok: architectureValid },
    { label: "Security", ok: securityPassed },
    { label: "Docs", ok: docsSynced },
    { label: "Stack", ok: stackCompatible },
  ];

  const okCount = checks.filter((check) => check.ok).length;

  return (
    <HolographicCard className="p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.35em] text-slate-500">Project health</p>
          <h3 className="mt-2 text-lg font-semibold text-white">Live integrity map</h3>
        </div>
        <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-300">
          {okCount}/4 healthy
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        {checks.map((check, index) => (
          <motion.div
            key={check.label}
            whileHover={{ y: -2 }}
            transition={{ type: "spring", stiffness: 280, damping: 24 }}
            className={`rounded-2xl border px-3 py-3 text-xs uppercase tracking-[0.25em] ${
              check.ok
                ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-200"
                : "border-amber-500/20 bg-amber-500/10 text-amber-200"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <span>{check.label}</span>
              <span className="text-[10px] tracking-[0.2em]">{check.ok ? "OK" : "Review"}</span>
            </div>
            <div className={`mt-3 h-1.5 overflow-hidden rounded-full ${check.ok ? "bg-emerald-500/20" : "bg-amber-500/20"}`}>
              <div
                className={`h-full rounded-full ${check.ok ? "bg-emerald-400" : "bg-amber-400"}`}
                style={{ width: check.ok ? "100%" : index % 2 === 0 ? "65%" : "72%" }}
              />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
        <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">Partial features</p>
        <p className="mt-2 text-sm text-slate-200">{partialFeatures} signals require follow-up.</p>
      </div>
    </HolographicCard>
  );
}
