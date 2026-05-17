import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { ClientProviders } from "@/components/ClientProviders";
import { PageTransitionWrapper } from "@/components/PageTransitionWrapper";
import PremiumShell from "@/components/premium/PremiumShell";

export const metadata = {
  title: "SaaS Factory AI - Enterprise Orchestration Center",
  description: "Enterprise software factory powered by AI architecture intelligence.",
};

const LDCN_TAG = "LDCN";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html suppressHydrationWarning className="dark">
      <body className="bg-background text-foreground antialiased">
        <PremiumShell>
          <ClientProviders>
            <div className="flex min-h-screen">
              <Sidebar />
              <main className="relative z-0 min-w-0 flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
                <PageTransitionWrapper>{children}</PageTransitionWrapper>
                <div className="fixed bottom-4 right-6 z-50 select-none pointer-events-none">
                  <span className="text-xs font-bold tracking-[0.3em] text-gray-600 opacity-40">{LDCN_TAG}</span>
                </div>
              </main>
            </div>
          </ClientProviders>
        </PremiumShell>
      </body>
    </html>
  );
}
