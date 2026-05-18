"use client";

export interface LdcnTranscriptEntry {
  id: string;
  speaker: "user" | "ldcn";
  text: string;
}

export default function LdcnTranscript({ entries }: { entries: LdcnTranscriptEntry[] }) {
  return (
    <div className="max-h-44 space-y-2 overflow-y-auto rounded-lg border border-white/10 bg-white/[0.03] p-3">
      {entries.length === 0 ? (
        <p className="text-sm text-slate-500">A transcrição da conversa aparece aqui.</p>
      ) : (
        entries.map((entry) => (
          <div key={entry.id} className={entry.speaker === "user" ? "text-right" : "text-left"}>
            <span className="mb-1 block text-[10px] uppercase tracking-[0.18em] text-slate-500">
              {entry.speaker === "user" ? "Voce" : "Vens"}
            </span>
            <p className="rounded-md bg-white/[0.04] px-3 py-2 text-sm text-slate-100">{entry.text}</p>
          </div>
        ))
      )}
    </div>
  );
}
