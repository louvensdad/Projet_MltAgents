"use client";

import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock,
  MinusCircle,
  HelpCircle,
  RefreshCw,
  Zap,
  LucideIcon,
} from "lucide-react";

export type StatusType =
  | "active"
  | "partial"
  | "mock"
  | "offline"
  | "planned"
  | "fallback"
  | "limited"
  | "GEMINI_CONNECTED"
  | "MOCK_MODE"
  | "GEMINI_ERROR"
  | "PLATFORM_ERROR"
  | "ACTIVE"
  | "OFFLINE";

const STATUS_CONFIG: Record<
  string,
  {
    label: string;
    icon: LucideIcon;
    color: string;
    glow: string;
    dot: string;
  }
> = {
  active: {
    label: "Active",
    icon: CheckCircle,
    color: "text-emerald-300",
    glow: "shadow-emerald-500/30",
    dot: "bg-emerald-400",
  },
  partial: {
    label: "Partial",
    icon: AlertTriangle,
    color: "text-yellow-300",
    glow: "shadow-yellow-500/30",
    dot: "bg-yellow-400",
  },
  mock: {
    label: "Local Build",
    icon: RefreshCw,
    color: "text-emerald-300",
    glow: "shadow-emerald-500/30",
    dot: "bg-emerald-400",
  },
  offline: {
    label: "Offline",
    icon: XCircle,
    color: "text-rose-300",
    glow: "shadow-rose-500/30",
    dot: "bg-rose-400",
  },
  planned: {
    label: "Planned",
    icon: Clock,
    color: "text-blue-300",
    glow: "shadow-blue-500/30",
    dot: "bg-blue-400",
  },
  fallback: {
    label: "Fallback",
    icon: Zap,
    color: "text-orange-300",
    glow: "shadow-orange-500/30",
    dot: "bg-orange-400",
  },
  limited: {
    label: "Limited",
    icon: MinusCircle,
    color: "text-orange-300",
    glow: "shadow-orange-500/30",
    dot: "bg-orange-400",
  },
  GEMINI_CONNECTED: {
    label: "Agent Boost",
    icon: CheckCircle,
    color: "text-violet-300",
    glow: "shadow-violet-500/30",
    dot: "bg-violet-400",
  },
  MOCK_MODE: {
    label: "Local Build",
    icon: RefreshCw,
    color: "text-emerald-300",
    glow: "shadow-emerald-500/30",
    dot: "bg-emerald-400",
  },
  GEMINI_ERROR: {
    label: "Platform Error",
    icon: XCircle,
    color: "text-rose-300",
    glow: "shadow-rose-500/30",
    dot: "bg-rose-400",
  },
  PLATFORM_ERROR: {
    label: "Platform Error",
    icon: XCircle,
    color: "text-rose-300",
    glow: "shadow-rose-500/30",
    dot: "bg-rose-400",
  },
  ACTIVE: {
    label: "Active",
    icon: CheckCircle,
    color: "text-emerald-300",
    glow: "shadow-emerald-500/30",
    dot: "bg-emerald-400",
  },
  OFFLINE: {
    label: "Offline",
    icon: XCircle,
    color: "text-rose-300",
    glow: "shadow-rose-500/30",
    dot: "bg-rose-400",
  },
};

function cn(...classes: (string | false | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

export default function AiModelStatusBadge({
  status,
  large,
  tooltip,
}: {
  status: StatusType | string;
  large?: boolean;
  tooltip?: string;
}) {
  const cfg = STATUS_CONFIG[status] || {
    label: status,
    icon: HelpCircle,
    color: "text-gray-300",
    glow: "shadow-gray-500/30",
    dot: "bg-gray-400",
  };
  const Icon = cfg.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5",
        "rounded-lg border px-2.5 py-1",
        "border-white/10 bg-white/[0.03]",
        "shadow-lg",
        cfg.glow,
        large ? "text-xs gap-2 px-3 py-1.5" : "text-[10px]"
      )}
      title={tooltip}
    >
      <span
        className={cn(
          "relative inline-flex h-1.5 w-1.5 rounded-full",
          cfg.dot,
          status === "active" || status === "ACTIVE" || status === "GEMINI_CONNECTED"
            ? "animate-pulse"
            : ""
        )}
      >
        <span
          className={cn(
            "absolute inset-0 rounded-full animate-ping opacity-40",
            cfg.dot
          )}
        />
      </span>
      <Icon
        size={large ? 14 : 11}
        className={cn(cfg.color, "shrink-0")}
      />
      <span className={cn("font-semibold uppercase tracking-wider", cfg.color)}>
        {cfg.label}
      </span>
    </span>
  );
}
