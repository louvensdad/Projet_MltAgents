"use client";

import { Activity, Cpu, MapPin } from "lucide-react";

export default function LdcnContextBar({
  page,
  stackId,
  activeAgent,
  mode,
}: {
  page: string;
  stackId?: string | null;
  activeAgent?: string | null;
  mode: string;
}) {
  return (
    <div className="grid grid-cols-3 gap-2 border-b border-white/10 bg-white/[0.03] px-4 py-3 text-[11px] text-slate-300">
      <div className="min-w-0">
        <span className="mb-1 flex items-center gap-1.5 text-slate-500">
          <MapPin className="h-3 w-3" /> rota
        </span>
        <p className="truncate font-medium text-slate-100">{page || "/"}</p>
      </div>
      <div className="min-w-0">
        <span className="mb-1 flex items-center gap-1.5 text-slate-500">
          <Cpu className="h-3 w-3" /> stack
        </span>
        <p className="truncate font-medium text-slate-100">{stackId || "contextual"}</p>
      </div>
      <div className="min-w-0">
        <span className="mb-1 flex items-center gap-1.5 text-slate-500">
          <Activity className="h-3 w-3" /> agente
        </span>
        <p className="truncate font-medium text-slate-100">{activeAgent || mode}</p>
      </div>
    </div>
  );
}
