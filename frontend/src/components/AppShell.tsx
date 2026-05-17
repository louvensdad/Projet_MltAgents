"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { ClientProviders } from "@/components/ClientProviders";
import { PageTransitionWrapper } from "@/components/PageTransitionWrapper";
import PremiumShell from "@/components/premium/PremiumShell";
import AuthGate from "@/components/AuthGate";

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
                <div className="fixed bottom-4 right-6 z-50 select-none pointer-events-none">
                  <span className="text-xs font-bold tracking-[0.3em] text-gray-600 opacity-40">LDCN</span>
                </div>
              </main>
            </div>
          )}
        </AuthGate>
      </ClientProviders>
    </PremiumShell>
  );
}
