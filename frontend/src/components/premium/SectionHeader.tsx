"use client";

import type { ReactNode } from "react";

export default function SectionHeader({
  eyebrow,
  title,
  subtitle,
  action,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        {eyebrow && <p className="text-[10px] uppercase tracking-[0.35em] text-slate-500">{eyebrow}</p>}
        <h2 className="mt-1 text-sm font-bold uppercase tracking-[0.25em] text-slate-300">{title}</h2>
        {subtitle && <p className="mt-2 max-w-2xl text-sm text-slate-400">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
