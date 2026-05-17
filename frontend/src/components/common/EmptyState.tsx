"use client";

export default function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-xl border border-dashed border-white/15 bg-white/[0.02] p-8 text-center">
      <p className="text-base font-semibold text-gray-200">{title}</p>
      <p className="mt-2 text-sm text-gray-500">{description}</p>
    </div>
  );
}
