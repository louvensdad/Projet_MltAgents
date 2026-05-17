"use client";

import { PreferencesProvider } from "@/context/PreferencesContext";
import { LiveBuilderProvider } from "@/context/LiveBuilderContext";

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <PreferencesProvider>
      <LiveBuilderProvider>
        {children}
      </LiveBuilderProvider>
    </PreferencesProvider>
  );
}
