"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function StaticSiteLegacyRoute() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/wizard/static-site");
  }, [router]);

  return null;
}
