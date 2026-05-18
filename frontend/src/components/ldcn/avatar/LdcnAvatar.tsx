"use client";

import { useState } from "react";
import { BellRing, EyeOff, Minimize2, PauseCircle, Volume2 } from "lucide-react";
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

  if (!visible) return null;

  const anchorClass = {
    "bottom-right": "bottom-5 right-5",
    "bottom-left": "bottom-5 left-5",
    "sidebar-edge": "bottom-5 left-[19.5rem]",
    "hero-corner": "top-5 right-5",
  }[position];

  return (
    <div className={`pointer-events-none fixed ${anchorClass} z-40`}>
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
    </div>
  );
}
