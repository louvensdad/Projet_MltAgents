"use client";

import { useMemo } from "react";
import type { Transition } from "framer-motion";
import type { LdcnAvatarMood, LdcnAvatarPosition } from "./useLdcnAvatarState";

export function useLdcnAvatarMotion(
  mood: LdcnAvatarMood,
  position: LdcnAvatarPosition,
  paused: boolean,
  reducedMotion: boolean,
) {
  return useMemo(() => {
    const isActive = !paused && !reducedMotion;
    const bob = isActive
      ? {
          y: mood === "waking" ? [0, -2, 0] : mood === "success" ? [0, -4, 0] : mood === "thinking" ? [0, -1, 0] : [0, -3, 0],
          scale: mood === "success" ? [1, 1.04, 1] : mood === "warning" || mood === "error" ? [1, 0.99, 1] : [1, 1.01, 1],
          rotate: mood === "waking" ? [-1.2, 1.2, -1.2] : mood === "listening" ? [-0.5, 0.5, -0.5] : [0, 0.5, 0],
        }
      : { y: 0, scale: 1, rotate: 0 };

    const transition: Transition = isActive
      ? {
          duration: mood === "success" ? 1.6 : mood === "waking" ? 2.2 : 3.2,
          repeat: Infinity,
          ease: "easeInOut",
        }
      : { duration: 0 };

    const pathMotion = isActive
      ? {
          strokeDashoffset: mood === "waking" ? [0, 18, 0] : [0, 8, 0],
          opacity: mood === "error" || mood === "warning" ? [0.35, 0.65, 0.35] : [0.18, 0.4, 0.18],
        }
      : { strokeDashoffset: 0, opacity: 0.28 };

    const routeLabel = {
      "bottom-right": "safe zone",
      "bottom-left": "guidance lane",
      "sidebar-edge": "sidebar edge",
      "hero-corner": "hero corner",
    }[position];

    return { bob, transition, pathMotion, routeLabel, isActive };
  }, [mood, paused, position, reducedMotion]);
}
