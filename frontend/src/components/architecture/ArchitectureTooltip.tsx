"use client";

export default function ArchitectureTooltip({ text }: { text: string }) {
  return (
    <div className="pointer-events-none absolute -top-10 left-1/2 z-20 -translate-x-1/2 rounded-md border border-white/20 bg-black/90 px-2 py-1 text-[11px] text-gray-200 opacity-0 transition-opacity group-hover:opacity-100">
      {text}
    </div>
  );
}
