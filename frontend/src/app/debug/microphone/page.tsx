"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mic, PlayCircle, RefreshCcw, Square } from "lucide-react";
import { useMicrophoneDiagnostics } from "@/ldcn/voice/useMicrophoneDiagnostics";

export default function MicrophoneDebugPage() {
  const mic = useMicrophoneDiagnostics("pt-BR");
  const [copyLabel, setCopyLabel] = useState("Copiar diagnóstico");
  const { refreshDevices } = mic;

  useEffect(() => {
    void refreshDevices();
  }, [refreshDevices]);

  const diagnosis = useMemo(
    () => ({
      isSecureContext: mic.isSecureContext,
      hasMediaDevices: mic.hasMediaDevices,
      permissionState: mic.permissionState,
      devices: mic.devices.map((device) => ({
        deviceId: device.deviceId,
        label: device.label || "Dispositivo sem nome",
        kind: device.kind,
      })),
      selectedDeviceId: mic.selectedDeviceId,
      volumeLevel: mic.volumeLevel,
      streamActive: mic.streamActive,
      error: mic.error,
      speechRecognitionSupported: mic.speechRecognitionSupported,
      transcript: mic.transcript,
      interimTranscript: mic.interimTranscript,
      isRecognizing: mic.isRecognizing,
      timestamp: new Date().toISOString(),
    }),
    [mic]
  );

  const copyDiagnosis = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(diagnosis, null, 2));
      setCopyLabel("Copiado");
    } catch {
      setCopyLabel("Falhou");
    } finally {
      window.setTimeout(() => setCopyLabel("Copiar diagnóstico"), 1500);
    }
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.12),transparent_30%),linear-gradient(180deg,#020617,#0f172a)] px-4 py-8 text-white">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-200">Debug</p>
            <h1 className="text-3xl font-semibold">Teste de microfone</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
              Esta tela testa apenas permissão, getUserMedia, volume real e SpeechRecognition. Nenhum agente, avatar ou LDCN é carregado aqui.
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

        <section className="grid gap-4 rounded-3xl border border-white/10 bg-white/[0.03] p-5 shadow-2xl shadow-black/30 md:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <div className="rounded-2xl border border-cyan-400/15 bg-cyan-400/5 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-cyan-200">Status</p>
                  <h2 className="text-lg font-semibold">{mic.streamActive ? "Microfone ativo" : "Pronto para testar"}</h2>
                </div>
                <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-slate-300">
                  {mic.permissionState}
                </span>
              </div>

              <div className="mt-4 h-3 overflow-hidden rounded-full border border-white/10 bg-black/20">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-sky-400 to-emerald-400 transition-all"
                  style={{ width: `${Math.max(4, mic.volumeLevel)}%` }}
                />
              </div>

              <p className="mt-3 text-sm text-slate-300">
                {mic.error
                  ? mic.error
                  : mic.streamActive && !mic.isRecognizing
                    ? "O navegador capturou áudio, mas o reconhecimento de fala falhou."
                    : mic.streamActive
                      ? "Estou capturando áudio e transcrevendo."
                      : "Clique em Testar microfone para pedir permissão e iniciar a captura."}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => void mic.startTest()}
                className="inline-flex items-center gap-2 rounded-full border border-cyan-400/25 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-50 transition hover:bg-cyan-400/15"
              >
                <PlayCircle className="h-4 w-4" />
                Testar microfone
              </button>
              <button
                type="button"
                onClick={mic.stopTest}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/[0.08]"
              >
                <Square className="h-4 w-4" />
                Parar teste
              </button>
              <button
                type="button"
                onClick={mic.requestPermission}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/[0.08]"
              >
                <RefreshCcw className="h-4 w-4" />
                Pedir permissão
              </button>
              <button
                type="button"
                onClick={copyDiagnosis}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/[0.08]"
              >
                <Mic className="h-4 w-4" />
                {copyLabel}
              </button>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold">Transcrição</h3>
                <button
                  type="button"
                  onClick={mic.clearTranscript}
                  className="text-[11px] uppercase tracking-[0.2em] text-slate-400 transition hover:text-white"
                >
                  Limpar
                </button>
              </div>
              <p className="min-h-12 whitespace-pre-wrap text-sm text-cyan-50">{mic.transcript || "Nenhuma transcrição final."}</p>
              {!!mic.interimTranscript && <p className="mt-2 text-sm text-slate-300">Parcial: {mic.interimTranscript}</p>}
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Checklist</p>
              <ul className="mt-3 space-y-2 text-slate-300">
                <li>{mic.isSecureContext ? "• Ambiente seguro OK" : "• Abra em localhost / 127.0.0.1 / HTTPS"}</li>
                <li>{mic.hasMediaDevices ? "• getUserMedia disponível" : "• getUserMedia indisponível"}</li>
                <li>{mic.speechRecognitionSupported ? "• SpeechRecognition disponível" : "• SpeechRecognition indisponível"}</li>
                <li>{mic.devices.length > 0 ? `• ${mic.devices.length} microfone(s) detectado(s)` : "• Nenhum dispositivo de áudio encontrado"}</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Dispositivos</h3>
                <span className="text-[11px] uppercase tracking-[0.2em] text-slate-500">{mic.selectedDeviceInfo?.label || "default"}</span>
              </div>
              <div className="mt-3 space-y-2">
                {mic.devices.map((device) => (
                  <button
                    key={device.deviceId}
                    type="button"
                    onClick={() => mic.selectDevice(device.deviceId)}
                    className={`w-full rounded-xl border px-3 py-2 text-left text-sm transition ${
                      device.deviceId === mic.selectedDeviceId
                        ? "border-cyan-400/30 bg-cyan-400/10 text-cyan-50"
                        : "border-white/10 bg-white/[0.03] text-slate-300 hover:bg-white/[0.06]"
                    }`}
                  >
                    <div className="font-medium">{device.label || "Microfone sem nome"}</div>
                    <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">{device.kind}</div>
                  </button>
                ))}
                {mic.devices.length === 0 && <p className="text-sm text-slate-400">Nenhum dispositivo listado ainda. Clique em testar ou pedir permissão.</p>}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <h3 className="text-sm font-semibold">Erro atual</h3>
              <p className="mt-2 text-sm leading-6 text-rose-200">
                {mic.error || "Nenhum erro no momento."}
              </p>
              <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs leading-6 text-slate-300">
                Chrome / Edge bloqueando?
                <br />
                Abra o cadeado da URL, entre em Configurações do site, localize Microfone e marque Permitir.
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
