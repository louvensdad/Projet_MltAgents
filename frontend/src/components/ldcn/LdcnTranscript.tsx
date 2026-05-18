"use client";

export default function LdcnTranscript({
  transcript,
  interimTranscript,
}: {
  transcript: string;
  interimTranscript: string;
}) {
  if (!transcript && !interimTranscript) return null;

  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <p className="text-[10px] uppercase tracking-[0.28em] text-slate-500">Transcricao</p>
      <p className="mt-2 text-sm text-cyan-50">{transcript || interimTranscript}</p>
    </div>
  );
}
