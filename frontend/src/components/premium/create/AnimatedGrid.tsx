"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

export default function AnimatedGrid({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <motion.div
      className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
      initial="hidden"
      animate="show"
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
    >
      {children}
    </motion.div>
  );
}

