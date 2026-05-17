"use client";

import { type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { MotionPage } from "@/components/motion";

export function PageTransitionWrapper({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return <MotionPage key={pathname}>{children}</MotionPage>;
}
