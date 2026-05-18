"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Square, Volume2 } from "lucide-react";
import { useLdcnVoice } from "@/ldcn/voice/LdcnVoiceProvider";

export default function LdcnVoiceDebugPage() {
  const voice = useLdcnVoice();
  const [text, setText] = useState("Teste de voz do LDCN.");

  const debug = useMemo(
    () => ({
      supported: voice.supported,
      status: voice.status,
      voiceUnlocked: voice.voiceUnlocked,
      selectedVoice: voice.selectedVoice ? { name: voice.selectedVoice.name, lang: voice.selectedVoice.lang } : null,
      voices: voice.voices.map((item) => ({ name: item.name, lang: item.lang, default: item.default })),
      error: voice.error,
    }),
    [voice]
  );

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.14),transparent_30%),linear-gradient(180deg,#020617,#0f172a)] px-4 py-8 text-white">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-200">Debug</p>
            <h1 className="text-3xl font-semibold">LDCN voice output</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
              Esta tela testa somente o speech synthesis. Sem avatar, sem chat e sem wake word.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Link>
        </div>

        <section className="grid gap-4 rounded-3xl border border-white/10 bg-white/[0.03] p-5 shadow-2xl shadow-black/30 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <div className="rounded-2xl border border-cyan-400/15 bg-cyan-400/5 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-cyan-200">Status</p>
              <h2 className="mt-1 text-lg font-semibold">{voice.status}</h2>
              <p className="mt-2 text-sm text-slate-300">
                {voice.voiceUnlocked ? "Voz desbloqueada pelo usuario." : "O navegador ainda exige clique para liberar a voz."}
              </p>
              {!!voice.error && <p className="mt-3 text-sm text-rose-200">{voice.error}</p>}
            </div>

            <label className="block space-y-2">
              <span className="text-xs uppercase tracking-[0.18em] text-slate-500">Texto de teste</span>
              <textarea
                value={text}
                onChange={(event) => setText(event.target.value)}
                className="min-h-28 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300/40"
              />
            </label>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => void voice.unlockVoice()}
                className="rounded-full border border-cyan-400/25 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-50 transition hover:bg-cyan-400/15"
              >
                Ativar voz do LDCN
              </button>
              <button
                type="button"
                onClick={() => void voice.speak(text)}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/[0.08]"
              >
                <Volume2 className="h-4 w-4" />
                Falar teste
              </button>
              <button
                type="button"
                onClick={voice.stop}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/[0.08]"
              >
                <Square className="h-4 w-4" />
                Parar
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Vozes disponiveis</p>
              <div className="mt-3 max-h-80 space-y-2 overflow-auto">
                {voice.voices.map((item) => (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => voice.setSelectedVoiceName(item.name)}
                    className={`w-full rounded-xl border px-3 py-2 text-left text-sm transition ${
                      voice.selectedVoiceName === item.name
                        ? "border-cyan-400/30 bg-cyan-400/10 text-cyan-50"
                        : "border-white/10 bg-white/[0.03] text-slate-300 hover:bg-white/[0.06]"
                    }`}
                  >
                    <div className="font-medium">{item.name}</div>
                    <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">{item.lang}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Debug</p>
              <pre className="mt-3 overflow-auto rounded-xl border border-white/10 bg-black/30 p-3 text-[11px] leading-5 text-slate-300">
                {JSON.stringify(debug, null, 2)}
              </pre>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
