"use client";

import { useState } from "react";
import { ShieldCheck, ShieldAlert, FlaskConical, Rocket, HelpCircle } from "lucide-react";

interface MaturityFeature {
  name: string;
  supported: boolean;
}

interface StatusBadgeProps {
  status: string;
  maturityScore?: number;
  maturityFeatures?: MaturityFeature[];
}

const LEVEL_CONFIG = {
  enterprise: {
    icon: Rocket,
    glow: "shadow-[0_0_12px_rgba(6,182,212,0.4)]",
    bg: "bg-cyan-500/15 border-cyan-500/40",
    text: "text-cyan-300",
    label: "Enterprise",
  },
  stable: {
    icon: ShieldCheck,
    glow: "shadow-[0_0_12px_rgba(52,211,153,0.4)]",
    bg: "bg-emerald-500/15 border-emerald-500/40",
    text: "text-emerald-300",
    label: "Stable",
  },
  beta: {
    icon: FlaskConical,
    glow: "shadow-[0_0_12px_rgba(251,191,36,0.4)]",
    bg: "bg-amber-500/15 border-amber-500/40",
    text: "text-amber-300",
    label: "Beta",
  },
  experimental: {
    icon: ShieldAlert,
    glow: "shadow-[0_0_12px_rgba(251,113,133,0.4)]",
    bg: "bg-rose-500/15 border-rose-500/40",
    text: "text-rose-300",
    label: "Experimental",
  },
};

function getLevel(status: string): keyof typeof LEVEL_CONFIG {
  const s = status.toLowerCase();
  if (s.includes("enterprise")) return "enterprise";
  if (s.includes("stable")) return "stable";
  if (s.includes("beta")) return "beta";
  if (s.includes("experimental")) return "experimental";
  if (s.includes("online") || s.includes("active") || s.includes("paid") || s.includes("dispon") || s.includes("cached") || s.includes("validado")) return "stable";
  if (s.includes("partial") || s.includes("parcial") || s.includes("pending") || s.includes("warning") || s.includes("mock") || s.includes("desenvolvimento")) return "beta";
  return "experimental";
}

export default function StatusBadge({ status, maturityScore, maturityFeatures }: StatusBadgeProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const level = getLevel(status);
  const cfg = LEVEL_CONFIG[level];
  const Icon = maturityScore !== undefined ? cfg.icon : HelpCircle;

  const maturityLabel = maturityScore !== undefined
    ? `${cfg.label} · ${maturityScore}%`
    : status;

  return (
    <div className="relative inline-flex">
      <div
        className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-semibold transition-all ${cfg.bg} ${cfg.text} ${maturityScore !== undefined ? cfg.glow : ""}`}
        onMouseEnter={() => maturityFeatures && setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {maturityScore !== undefined && <Icon size={12} className="shrink-0" />}
        {maturityLabel}
      </div>

      {showTooltip && maturityFeatures && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50">
          <div className="rounded-xl border border-white/10 bg-surface p-3 shadow-2xl shadow-black/40 min-w-[180px]">
            <p className="text-xs font-bold text-gray-200 mb-2 uppercase tracking-wider">Features</p>
            <div className="space-y-1.5">
              {maturityFeatures.map((f) => (
                <div key={f.name} className="flex items-center gap-2 text-xs">
                  <span className={`text-[10px] font-bold ${f.supported ? "text-emerald-400" : "text-rose-400"}`}>
                    {f.supported ? "✔" : "✖"}
                  </span>
                  <span className={f.supported ? "text-gray-300" : "text-gray-500"}>{f.name}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-surface" />
        </div>
      )}
    </div>
  );
}
