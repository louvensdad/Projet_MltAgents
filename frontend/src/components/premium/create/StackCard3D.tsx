"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Layers3 } from "lucide-react";
import type { ReactNode } from "react";
import HolographicBadge from "./HolographicBadge";
import LiveTechPreview from "./LiveTechPreview";
import StackMetrics from "./StackMetrics";

export type CreateStackCard = {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: ReactNode;
  badge: string;
  tone: "cyan" | "violet" | "amber" | "emerald" | "rose";
  score: number;
  complexity: string;
  scalability: string;
  performance: string;
  architecture: string[];
  chips: string[];
  previewTitle: string;
  previewSubtitle: string;
  href: string;
  ready: boolean;
  techBadge: string;
};

export default function StackCard3D({
  stack,
  active,
  onHover,
}: {
  stack: CreateStackCard;
  active: boolean;
  onHover: () => void;
}) {
  return (
    <motion.div
      onHoverStart={onHover}
      whileHover={{ y: -6, rotateX: 2, rotateY: -2 }}
      transition={{ type: "spring", stiffness: 220, damping: 20 }}
      className={`relative overflow-hidden rounded-[28px] border bg-slate-950/70 p-5 backdrop-blur-xl transition-all ${
        active ? "border-cyan-500/30 shadow-[0_0_40px_rgba(34,211,238,0.12)]" : "border-white/10"
      }`}
      style={{ transformStyle: "preserve-3d" }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(94,160,255,0.08),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(124,92,255,0.08),transparent_24%)]" />
      <div className="relative z-10 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-white">{stack.icon}</div>
            <div className="min-w-0">
              <div className="flex flex-wrap gap-2">
                <HolographicBadge tone={stack.tone}>{stack.badge}</HolographicBadge>
                <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] text-slate-300">
                  {stack.techBadge}
                </span>
              </div>
              <h3 className="mt-3 text-lg font-semibold text-white">{stack.name}</h3>
              <p className="mt-1 text-sm leading-6 text-slate-400">{stack.description}</p>
            </div>
          </div>
          <div className="rounded-full border border-white/10 bg-white/[0.03] p-2 text-slate-400">
            <Layers3 size={16} />
          </div>
        </div>

        <LiveTechPreview
          title={stack.previewTitle}
          subtitle={stack.previewSubtitle}
          chips={stack.chips}
        />

        <StackMetrics
          score={stack.score}
          complexity={stack.complexity}
          scalability={stack.scalability}
          performance={stack.performance}
        />

        <div className="grid gap-2 rounded-2xl border border-white/10 bg-black/20 p-3 text-[11px] text-slate-300 sm:grid-cols-2">
          {stack.architecture.slice(0, 4).map((node) => (
            <div key={node} className="rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2">{node}</div>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="text-[11px] uppercase tracking-[0.25em] text-slate-500">
            {active ? "Hover active" : "Ready to generate"}
          </div>
          <Link href={stack.href} className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold transition-all ${
            stack.ready ? "bg-primary text-white shadow-lg shadow-primary/20 hover:bg-primary/90" : "border border-white/10 bg-white/[0.04] text-slate-300"
          }`}>
            {stack.ready ? "Open builder" : "In construction"}
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

