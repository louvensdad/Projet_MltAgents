"use client";

export default function RecommendationCard({
  label,
  type
}: {
  label: string;
  type: "recommendation" | "risk";
}) {
  const style =
    type === "recommendation"
      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
      : "border-amber-500/30 bg-amber-500/10 text-amber-200";
  return <div className={`rounded-lg border p-3 text-sm ${style}`}>{label}</div>;
}
