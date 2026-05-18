"use client";

import { useEffect, useMemo } from "react";
import { usePathname } from "next/navigation";
import LdcnAvatar from "./LdcnAvatar";
import { LdcnAvatarContext } from "./useLdcnAvatarContext";
import { useLdcnAvatarState } from "./useLdcnAvatarState";
import { dispatchLdcnAvatarEvent } from "./ldcnAvatarEvents";

export default function LdcnAvatarController() {
  const pathname = usePathname();
  const runtime = useLdcnAvatarState(pathname);
  const visibleOnRoute = pathname === "/";

  useEffect(() => {
    if (pathname === "/") {
      dispatchLdcnAvatarEvent({
        type: "page_loaded",
        route: pathname,
        source: "app-shell",
        message: "Posso te acompanhar nessa etapa.",
      });
    }
  }, [pathname]);

  const contextValue = useMemo(() => runtime, [runtime]);

  return (
    <LdcnAvatarContext.Provider value={contextValue}>
      {visibleOnRoute && <LdcnAvatar />}
    </LdcnAvatarContext.Provider>
  );
}
