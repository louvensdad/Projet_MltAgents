"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { ClientProviders } from "@/components/ClientProviders";
import { PageTransitionWrapper } from "@/components/PageTransitionWrapper";
import PremiumShell from "@/components/premium/PremiumShell";
import AuthGate from "@/components/AuthGate";
import LdcnAssistant from "@/components/ldcn/LdcnAssistant";
import LdcnAvatarController from "@/components/ldcn/avatar/LdcnAvatarController";

function isAuthRoute(pathname: string) {
  return pathname === "/login" || pathname === "/forgot-password" || pathname.startsWith("/reset-password/");
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const authRoute = useMemo(() => isAuthRoute(pathname), [pathname]);

  return (
    <PremiumShell>
      <ClientProviders>
        <AuthGate>
          {authRoute ? (
            <main className="min-h-screen">{children}</main>
          ) : (
            <div className="flex min-h-screen">
              <Sidebar />
              <main className="relative z-0 min-w-0 flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
                <PageTransitionWrapper>{children}</PageTransitionWrapper>
                <LdcnAssistant />
              </main>
            </div>
          )}
          <LdcnAvatarController />
        </AuthGate>
      </ClientProviders>
    </PremiumShell>
  );
}
