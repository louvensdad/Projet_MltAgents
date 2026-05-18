"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { hasAuthSession } from "@/lib/auth";

function isAuthRoute(pathname: string) {
  return pathname === "/login" || pathname === "/forgot-password" || pathname.startsWith("/reset-password/");
}

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const authRoute = useMemo(() => isAuthRoute(pathname), [pathname]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const signedIn = hasAuthSession();
    if (authRoute) {
      if (signedIn) {
        router.replace("/");
        return;
      }
      setReady(true);
      return;
    }

    if (!signedIn) {
      router.replace("/login");
      return;
    }

    setReady(true);
  }, [authRoute, router, pathname]);

  if (!ready && !authRoute) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-300">
        Verificando acesso...
      </div>
    );
  }

  if (!ready && authRoute) {
    return null;
  }

  return <>{children}</>;
}
