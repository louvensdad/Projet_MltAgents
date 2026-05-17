"use client";

export default function RecommendationCard({ text }: { text: string }) {
  return <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-200">{text}</div>;
}
