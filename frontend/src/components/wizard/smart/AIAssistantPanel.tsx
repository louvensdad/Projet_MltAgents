"use client";

interface AIAssistantPanelProps {
  suggestions: string[];
  warnings: string[];
}

export default function AIAssistantPanel({ suggestions, warnings }: AIAssistantPanelProps) {
  return (
    <aside className="rounded-xl border border-primary/20 bg-primary/5 p-4">
      <p className="text-xs font-bold uppercase tracking-widest text-primary">AI Assistant</p>
      <div className="mt-3 space-y-2">
        {suggestions.map((item) => (
          <p key={item} className="text-sm text-gray-200">{item}</p>
        ))}
      </div>
      {warnings.length > 0 && (
        <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
          <p className="text-[11px] font-bold uppercase tracking-widest text-amber-400">Alertas</p>
          <div className="mt-2 space-y-1">
            {warnings.map((item) => (
              <p key={item} className="text-xs text-amber-200">{item}</p>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}
