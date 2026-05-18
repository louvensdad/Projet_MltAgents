"use client";

import { createContext, useContext } from "react";
import type { LdcnAvatarRuntimeState } from "./useLdcnAvatarState";

export const LdcnAvatarContext = createContext<LdcnAvatarRuntimeState | null>(null);

export function useLdcnAvatarContext() {
  const context = useContext(LdcnAvatarContext);
  if (!context) {
    throw new Error("useLdcnAvatarContext must be used within LdcnAvatarContext.Provider");
  }
  return context;
}

