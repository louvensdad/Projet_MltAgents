"use client";

export default function WarningCard({ text }: { text: string }) {
  return <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-200">{text}</div>;
}
