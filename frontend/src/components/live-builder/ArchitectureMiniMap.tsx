"use client";

import { motion } from "framer-motion";
import type { BuilderProjectType } from "@/lib/live-builder";

interface NodeDef {
  id: string;
  label: string;
  color: string;
  icon: string;
}

interface Props {
  projectType: BuilderProjectType | null;
  modules: string[];
  activeFeatures?: string[];
}

const STATIC_NODES: NodeDef[] = [
  { id: "navbar", label: "Navbar", color: "bg-sky-500", icon: "≡" },
  { id: "hero", label: "Hero", color: "bg-blue-500", icon: "★" },
  { id: "sections", label: "Sections", color: "bg-teal-500", icon: "▣" },
  { id: "contact", label: "Contact", color: "bg-emerald-500", icon: "✉" },
];

const API_NODES: NodeDef[] = [
  { id: "client", label: "Client", color: "bg-purple-500", icon: "◉" },
  { id: "gateway", label: "API Gateway", color: "bg-indigo-500", icon: "⇶" },
  { id: "service", label: "Service", color: "bg-blue-500", icon: "⚙" },
  { id: "db", label: "Database", color: "bg-cyan-500", icon: "🗄" },
];

const FRONTEND_NODES: NodeDef[] = [
  { id: "sidebar", label: "Sidebar", color: "bg-violet-500", icon: "☰" },
  { id: "dashboard", label: "Dashboard", color: "bg-fuchsia-500", icon: "◈" },
  { id: "components", label: "Components", color: "bg-pink-500", icon: "◆" },
  { id: "api", label: "API Layer", color: "bg-rose-500", icon: "⇄" },
];

export default function ArchitectureMiniMap({ projectType, modules, activeFeatures }: Props) {
  const nodes = projectType === "static" ? STATIC_NODES
    : projectType === "api" ? API_NODES
    : projectType === "frontend" ? FRONTEND_NODES
    : [];

  if (!projectType) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-center gap-1">
        {nodes.map((node, i) => (
          <motion.div
            key={node.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: i * 0.08, type: "spring", stiffness: 200 }}
            className="flex flex-col items-center gap-1"
          >
            <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${node.color} text-white text-xs font-bold shadow-lg`}>
              {node.icon}
            </div>
            <span className="text-[8px] text-gray-500 font-medium">{node.label}</span>
          </motion.div>
        ))}
      </div>

      <div className="flex flex-wrap gap-1 justify-center">
        {modules.map((mod) => (
          <motion.span
            key={mod}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] font-medium text-emerald-300 border border-emerald-500/20"
          >
            {mod}
          </motion.span>
        ))}
      </div>
    </div>
  );
}
