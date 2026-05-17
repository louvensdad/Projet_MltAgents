"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import HolographicBadge from "./HolographicBadge";
import HolographicCard from "@/components/premium/HolographicCard";

export default function EnterpriseHero({
  title,
  subtitle,
  stats,
}: {
  title: string;
  subtitle: string;
  stats: { label: string; value: string }[];
}) {
  return (
    <section className="relative overflow-hidden rounded-[36px] border border-white/10 bg-[linear-gradient(135deg,rgba(3,7,18,0.96),rgba(8,12,24,0.92),rgba(3,7,18,0.98))] p-6 shadow-[0_18px_80px_rgba(0,0,0,0.35)] md:p-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(94,160,255,0.16),transparent_30%),radial-gradient(circle_at_top_right,rgba(124,92,255,0.12),transparent_26%)]" />
      <motion.div
        className="absolute -right-10 -top-10 h-72 w-72 rounded-full bg-cyan-500/10 blur-[120px]"
        animate={{ opacity: [0.45, 0.85, 0.45], scale: [1, 1.08, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="relative z-10 grid gap-6 xl:grid-cols-[1.1fr_0.9fr] xl:items-center">
        <div className="space-y-4">
          <HolographicBadge tone="cyan">Enterprise marketplace</HolographicBadge>
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-white md:text-6xl">
            {title}
          </h1>
          <p className="max-w-2xl text-sm leading-7 text-slate-300 md:text-base">{subtitle}</p>
          <div className="flex flex-wrap gap-3">
            <Link href="/wizard" className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90">
              <Sparkles size={16} />
              Open wizard
            </Link>
            <Link href="/templates" className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-medium text-slate-200 transition-all hover:bg-white/10">
              Browse templates
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
        <HolographicCard className="p-5">
          <div className="grid grid-cols-2 gap-3">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500">{stat.label}</p>
                <p className="mt-2 text-2xl font-semibold text-white">{stat.value}</p>
              </div>
            ))}
          </div>
        </HolographicCard>
      </div>
    </section>
  );
}

