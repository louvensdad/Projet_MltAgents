"use client";

import { ArrowRight, CheckCircle2, Download, Route, ShieldCheck, Wand2 } from "lucide-react";

export interface LdcnAction {
  type: string;
  label: string;
  href?: string | null;
  payload?: Record<string, unknown>;
  requires_confirmation?: boolean;
}

const iconByType: Record<string, React.ElementType> = {
  navigate: Route,
  prefill_wizard: Wand2,
  run_validation: ShieldCheck,
  open_download: Download,
  generate_project: CheckCircle2,
};

export default function LdcnActionButtons({
  actions,
  onAction,
}: {
  actions: LdcnAction[];
  onAction: (action: LdcnAction) => void;
}) {
  if (!actions.length) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((action, index) => {
        const Icon = iconByType[action.type] ?? ArrowRight;
        return (
          <button
            key={`${action.type}-${index}`}
            type="button"
            onClick={() => onAction(action)}
            className="inline-flex min-h-9 items-center gap-2 rounded-md border border-cyan-300/20 bg-cyan-300/10 px-3 text-xs font-semibold text-cyan-50 transition hover:border-cyan-200/40 hover:bg-cyan-300/15"
          >
            <Icon className="h-3.5 w-3.5" />
            <span>{action.label}</span>
          </button>
        );
      })}
    </div>
  );
}
