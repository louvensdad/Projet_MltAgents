"use client";

import ArchitectureTooltip from "./ArchitectureTooltip";

export interface FlowNode {
  id: string;
  label: string;
  layer: "frontend" | "gateway" | "backend" | "security" | "messaging" | "database";
  hint: string;
}

const LAYER_CLASS: Record<FlowNode["layer"], string> = {
  frontend: "border-sky-500/40 bg-sky-500/15 text-sky-200",
  gateway: "border-indigo-500/40 bg-indigo-500/15 text-indigo-200",
  backend: "border-blue-500/40 bg-blue-500/15 text-blue-200",
  security: "border-amber-500/40 bg-amber-500/15 text-amber-200",
  messaging: "border-fuchsia-500/40 bg-fuchsia-500/15 text-fuchsia-200",
  database: "border-emerald-500/40 bg-emerald-500/15 text-emerald-200"
};

export default function StackFlowNode({ node }: { node: FlowNode }) {
  return (
    <div className="group relative flex w-full justify-center">
      <ArchitectureTooltip text={node.hint} />
      <div className={`w-[88%] rounded-lg border px-3 py-2 text-center text-sm transition-transform duration-200 group-hover:scale-[1.01] ${LAYER_CLASS[node.layer]}`}>
        {node.label}
      </div>
    </div>
  );
}
