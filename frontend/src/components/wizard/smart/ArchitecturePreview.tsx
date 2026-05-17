"use client";

interface ArchitecturePreviewProps {
  frontend: string;
  architecture: string;
  security: string[];
  messaging: string[];
  database: string;
}

export default function ArchitecturePreview({
  frontend,
  architecture,
  security,
  messaging,
  database
}: ArchitecturePreviewProps) {
  const nodes = [
    frontend || "Frontend",
    architecture || "Gateway / API",
    security[0] || "Auth",
    messaging[0] || "Services",
    database || "Database"
  ];

  return (
    <div className="rounded-xl border border-white/10 bg-black/30 p-4">
      <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Architecture Preview</p>
      <div className="mt-4 flex flex-col items-center gap-2">
        {nodes.map((node, idx) => (
          <div key={`${node}-${idx}`} className="flex w-full flex-col items-center gap-2">
            <div className="w-full rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-center text-sm text-white">{node}</div>
            {idx < nodes.length - 1 && <div className="h-4 w-px bg-primary/40" />}
          </div>
        ))}
      </div>
    </div>
  );
}
