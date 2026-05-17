"use client";

import { AlertTriangle, CheckCircle, TrendingDown, TrendingUp } from "lucide-react";

function cn(...classes: (string | false | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

function computeHealth(model: any): { score: number; label: string; color: string; bg: string; border: string; icon: any } {
  const mode = model.mode || "";
  const status = model.status || "";

  if (mode === "GEMINI_CONNECTED" || (status === "active" && mode !== "MOCK_MODE" && mode !== "OFFLINE")) {
    return { score: 98, label: "Excellent", color: "text-emerald-300", bg: "bg-emerald-500/10", border: "border-emerald-500/20", icon: CheckCircle };
  }
  if (mode === "ACTIVE" && status !== "mock") {
    return { score: 94, label: "Healthy", color: "text-emerald-300", bg: "bg-emerald-500/8", border: "border-emerald-500/15", icon: TrendingUp };
  }
  if (mode === "MOCK_MODE" || status === "mock") {
    let score = 72;
    const reason = model.notes || "";
    if (reason.includes("RESOURCE_EXHAUSTED") || reason.includes("429")) score = 45;
    return { score, label: score >= 60 ? "Limited" : "Degraded", color: "text-amber-300", bg: "bg-amber-500/10", border: "border-amber-500/20", icon: AlertTriangle };
  }
  if (status === "offline" || mode === "OFFLINE" || status === "planned") {
    return { score: 0, label: "Unavailable", color: "text-gray-400", bg: "bg-gray-500/10", border: "border-gray-500/20", icon: TrendingDown };
  }
  return { score: 50, label: "Unknown", color: "text-gray-300", bg: "bg-gray-500/10", border: "border-gray-500/20", icon: AlertTriangle };
}

export default function AiModelHealthScore({ model }: { model: any }) {
  const { score, label, color, bg, border, icon: Icon } = computeHealth(model);
  const circumference = 2 * Math.PI * 28;
  const offset = circumference - (score / 100) * circumference;

  const strokeColor = score >= 90 ? "#34d399" : score >= 60 ? "#fbbf24" : score > 0 ? "#f87171" : "#6b7280";

  return (
    <div className={cn("rounded-xl border p-3 flex items-center gap-3", bg, border)}>
      <div className="relative shrink-0">
        <svg width="64" height="64" className="-rotate-90">
          <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="5" />
          <circle
            cx="32"
            cy="32"
            r="28"
            fill="none"
            stroke={strokeColor}
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <Icon size={16} className={color} />
        </div>
      </div>
      <div>
        <p className="text-[10px] uppercase tracking-widest text-gray-500">Health Score</p>
        <p className={cn("text-lg font-bold", color)}>
          {score > 0 ? `${score}%` : "N/A"}
        </p>
        <p className={cn("text-[11px] font-medium", color)}>{label}</p>
      </div>
    </div>
  );
}
