"use client";

import HolographicCard from "./HolographicCard";
import { PremiumButton } from "./PremiumButton";

export default function EmptyState3D({
  title,
  description,
  actionHref,
  actionLabel,
}: {
  title: string;
  description: string;
  actionHref: string;
  actionLabel: string;
}) {
  return (
    <HolographicCard className="p-8 text-center">
      <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full border border-cyan-500/20 bg-cyan-500/10 shadow-[0_0_60px_rgba(34,211,238,0.08)]">
        <div className="h-14 w-14 rounded-2xl border border-white/10 bg-white/[0.05]" />
      </div>
      <h3 className="mt-6 text-2xl font-semibold text-white">{title}</h3>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-400">{description}</p>
      <div className="mt-6 flex justify-center">
        <PremiumButton href={actionHref}>{actionLabel}</PremiumButton>
      </div>
    </HolographicCard>
  );
}

