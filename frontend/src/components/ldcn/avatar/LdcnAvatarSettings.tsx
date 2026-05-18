"use client";

import { motion, AnimatePresence } from "framer-motion";
import { EyeOff, Minus, Pause, Settings2, Volume2, VolumeX, X } from "lucide-react";
import type { LdcnAvatarRuntimeState, LdcnAvatarSettings } from "./useLdcnAvatarState";

export default function LdcnAvatarSettings({
  open,
  onOpenChange,
  runtime,
}: {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  runtime: Pick<LdcnAvatarRuntimeState, "settings" | "setSetting" | "toggleHidden" | "toggleMinimized" | "toggleMuted" | "togglePaused">;
}) {
  const { settings, setSetting, toggleHidden, toggleMinimized, toggleMuted, togglePaused } = runtime;

  const sizeOptions: Array<{ id: LdcnAvatarSettings["size"]; label: string }> = [
    { id: "small", label: "Pequeno" },
    { id: "medium", label: "Médio" },
  ];

  const styleOptions: Array<{ id: LdcnAvatarSettings["style"]; label: string }> = [
    { id: "holographic", label: "Holográfico" },
    { id: "minimalist", label: "Minimalista" },
  ];

  const positionOptions: Array<{ id: LdcnAvatarSettings["positionPreference"]; label: string }> = [
    { id: "bottom-right", label: "Bottom-right" },
    { id: "bottom-left", label: "Bottom-left" },
    { id: "sidebar-edge", label: "Sidebar edge" },
    { id: "hero-corner", label: "Hero corner" },
  ];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => onOpenChange(!open)}
        aria-label="Abrir ajustes do avatar"
        className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-slate-950/80 text-slate-300 transition hover:text-white"
      >
        <Settings2 className="h-3.5 w-3.5" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-10 right-0 w-[min(20rem,calc(100vw-2rem))] rounded-2xl border border-white/10 bg-slate-950/95 p-3 shadow-[0_20px_50px_rgba(0,0,0,0.45)] backdrop-blur-xl"
          >
            <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">LDCN Companion</p>
                <p className="mt-0.5 text-[11px] text-slate-500">Controle rápido de presença visual</p>
              </div>
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="rounded-full border border-white/10 p-1.5 text-slate-400 transition hover:bg-white/5 hover:text-white"
                aria-label="Fechar ajustes"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="mt-3 space-y-2">
              <button type="button" onClick={toggleMinimized} className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-left text-sm text-slate-200 transition hover:bg-white/[0.06]" aria-label="Minimizar avatar">
                <span className="inline-flex items-center gap-2"><Minus className="h-4 w-4" /> Minimizar</span>
                <span className="text-[10px] uppercase tracking-[0.2em] text-slate-500">{settings.paused ? "paused" : "active"}</span>
              </button>
              <button type="button" onClick={toggleMuted} className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-left text-sm text-slate-200 transition hover:bg-white/[0.06]" aria-label="Silenciar avatar">
                <span className="inline-flex items-center gap-2">{settings.muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />} Silenciar</span>
                <span className="text-[10px] uppercase tracking-[0.2em] text-slate-500">{settings.muted ? "on" : "off"}</span>
              </button>
              <button type="button" onClick={togglePaused} className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-left text-sm text-slate-200 transition hover:bg-white/[0.06]" aria-label="Pausar animações">
                <span className="inline-flex items-center gap-2"><Pause className="h-4 w-4" /> Pausar animações</span>
                <span className="text-[10px] uppercase tracking-[0.2em] text-slate-500">{settings.paused ? "on" : "off"}</span>
              </button>
              <button type="button" onClick={toggleHidden} className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-left text-sm text-slate-200 transition hover:bg-white/[0.06]" aria-label="Esconder avatar">
                <span className="inline-flex items-center gap-2"><EyeOff className="h-4 w-4" /> Esconder avatar</span>
                <span className="text-[10px] uppercase tracking-[0.2em] text-slate-500">{settings.hidden ? "on" : "off"}</span>
              </button>
            </div>

            <div className="mt-3 grid gap-3 border-t border-white/10 pt-3">
              <div className="grid gap-1.5">
                <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500">Posição</p>
                <div className="grid grid-cols-2 gap-2">
                  {positionOptions.map((option) => {
                    const active = settings.positionPreference === option.id;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => setSetting("positionPreference", option.id)}
                        className={`rounded-xl border px-2 py-2 text-[11px] transition ${active ? "border-cyan-400/30 bg-cyan-400/10 text-cyan-100" : "border-white/10 bg-white/[0.03] text-slate-300 hover:bg-white/[0.06]"}`}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid gap-1.5">
                <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500">Tamanho</p>
                <div className="grid grid-cols-2 gap-2">
                  {sizeOptions.map((option) => {
                    const active = settings.size === option.id;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => setSetting("size", option.id)}
                        className={`rounded-xl border px-2 py-2 text-[11px] transition ${active ? "border-cyan-400/30 bg-cyan-400/10 text-cyan-100" : "border-white/10 bg-white/[0.03] text-slate-300 hover:bg-white/[0.06]"}`}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid gap-1.5">
                <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500">Estilo</p>
                <div className="grid grid-cols-2 gap-2">
                  {styleOptions.map((option) => {
                    const active = settings.style === option.id;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => setSetting("style", option.id)}
                        className={`rounded-xl border px-2 py-2 text-[11px] transition ${active ? "border-cyan-400/30 bg-cyan-400/10 text-cyan-100" : "border-white/10 bg-white/[0.03] text-slate-300 hover:bg-white/[0.06]"}`}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
