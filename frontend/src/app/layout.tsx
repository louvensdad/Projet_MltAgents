import "./globals.css";
import AppShell from "@/components/AppShell";

export const metadata = {
  title: "SaaS Factory AI - Enterprise Orchestration Center",
  description: "Enterprise software factory powered by AI architecture intelligence.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html suppressHydrationWarning className="dark">
      <body className="bg-background text-foreground antialiased">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
