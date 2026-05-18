"use client";

import { PreferencesProvider } from "@/context/PreferencesContext";
import { LiveBuilderProvider } from "@/context/LiveBuilderContext";
import { LdcnContextProvider } from "@/ldcn/context/LdcnContextProvider";
import { LdcnVoiceProvider } from "@/ldcn/voice/LdcnVoiceProvider";

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <PreferencesProvider>
      <LiveBuilderProvider>
        <LdcnContextProvider>
          <LdcnVoiceProvider>{children}</LdcnVoiceProvider>
        </LdcnContextProvider>
      </LiveBuilderProvider>
    </PreferencesProvider>
  );
}
