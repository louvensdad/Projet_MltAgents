"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BellRing, EyeOff, Minimize2, PauseCircle, Sparkles, Volume2 } from "lucide-react";
import LdcnAvatarBody from "./LdcnAvatarBody";
import LdcnAvatarPath from "./LdcnAvatarPath";
import LdcnAvatarSettings from "./LdcnAvatarSettings";
import LdcnAvatarSpeechBubble from "./LdcnAvatarSpeechBubble";
import { useLdcnAvatarContext } from "./useLdcnAvatarContext";
import { useLdcnAvatarMotion } from "./useLdcnAvatarMotion";

export default function LdcnAvatar() {
  const runtime = useLdcnAvatarContext();
  const { mood, position, message, visible, minimized, settings, pageVisible, toggleMinimized, setSetting } = runtime;
  const motionState = useLdcnAvatarMotion(mood, position, settings.paused || !pageVisible, settings.reducedMotion);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const saved = localStorage.getItem("ldcn_avatar_drag_offset");
      if (!saved) return;
      const parsed = JSON.parse(saved) as { x?: number; y?: number };
      setDragOffset({
        x: Number(parsed.x) || 0,
        y: Number(parsed.y) || 0,
      });
    } catch {
      localStorage.removeItem("ldcn_avatar_drag_offset");
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("ldcn_avatar_drag_offset", JSON.stringify(dragOffset));
  }, [dragOffset]);

  const anchorClass = {
    "bottom-right": "bottom-5 right-5",
    "bottom-left": "bottom-5 left-5",
    "sidebar-edge": "bottom-5 left-[19.5rem]",
    "hero-corner": "top-5 right-5",
  }[position];

  if (!visible) {
    return (
      <div className={`pointer-events-none fixed ${anchorClass} z-40`}>
        <button
          type="button"
          onClick={() => setSetting("hidden", false)}
          aria-label="Mostrar avatar"
          className="pointer-events-auto flex h-11 items-center gap-2 rounded-full border border-cyan-300/20 bg-slate-950/90 px-3 text-sm text-cyan-50 shadow-[0_12px_30px_rgba(0,0,0,0.35)] backdrop-blur-xl transition hover:bg-cyan-300/10 hover:text-white"
        >
          <Sparkles className="h-4 w-4" />
          <span>Mostrar Vens</span>
        </button>
      </div>
    );
  }

  return (
    <motion.div
      className={`pointer-events-auto fixed select-none ${anchorClass} z-40`}
      style={{ x: dragOffset.x, y: dragOffset.y, touchAction: "none" }}
      drag
      dragMomentum={false}
      dragElastic={0.08}
      onDragEnd={(_, info) => {
        setDragOffset((current) => ({
          x: current.x + info.offset.x,
          y: current.y + info.offset.y,
        }));
      }}
    >
      <LdcnAvatarPath mood={mood} position={position} active={!settings.reducedMotion} />

      <div className="pointer-events-auto relative">
        <div className="relative">
          <LdcnAvatarBody
            mood={mood}
            size={settings.size}
            style={settings.style}
            minimized={minimized}
            animate={motionState.bob}
            transition={motionState.transition}
          />
        </div>

        <LdcnAvatarSpeechBubble message={message} muted={settings.muted} />

        <div className="absolute -bottom-12 right-0 flex items-center gap-1 rounded-full border border-white/10 bg-slate-950/90 p-1 shadow-[0_12px_30px_rgba(0,0,0,0.35)] backdrop-blur-xl">
          <button
            type="button"
            onClick={toggleMinimized}
            aria-label={minimized ? "Expandir avatar" : "Minimizar avatar"}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-white/0 text-slate-300 transition hover:bg-white/5 hover:text-white"
          >
            <Minimize2 className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setSetting("muted", !settings.muted)}
            aria-label={settings.muted ? "Ativar som do avatar" : "Silenciar avatar"}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-white/0 text-slate-300 transition hover:bg-white/5 hover:text-white"
          >
            {settings.muted ? <BellRing className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
          </button>
          <button
            type="button"
            onClick={() => setSetting("paused", !settings.paused)}
            aria-label={settings.paused ? "Retomar animações" : "Pausar animações"}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-white/0 text-slate-300 transition hover:bg-white/5 hover:text-white"
          >
            <PauseCircle className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setSetting("hidden", true)}
            aria-label="Esconder avatar"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-white/0 text-slate-300 transition hover:bg-white/5 hover:text-white"
          >
            <EyeOff className="h-3.5 w-3.5" />
          </button>
          <LdcnAvatarSettings
            open={settingsOpen}
            onOpenChange={setSettingsOpen}
            runtime={runtime}
          />
        </div>
      </div>
    </motion.div>
  );
}
