"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Wand2,
  FolderGit2,
  FileText,
  Layers,
  Brain,
  ShieldCheck,
  Download,
  CreditCard,
  Settings,
  PlusSquare,
  Cpu,
  Activity,
  Server,
  MessagesSquare,
  ChevronDown,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { usePreferences } from "@/context/PreferencesContext";
import { API_BASE } from "@/lib/config";
import PreferencesMenu from "./PreferencesMenu";
import AnimatedBadge from "@/components/premium/AnimatedBadge";
import HolographicCard from "@/components/premium/HolographicCard";

export default function Sidebar() {
  const pathname = usePathname();
  const { t } = usePreferences();
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [aiMode, setAiMode] = useState("Local Build 90%");

  useEffect(() => {
    fetch(`${API_BASE}/api/ai/status`)
      .then((res) => res.json())
      .then((data) => setAiMode(data?.generation_quality_mode === "agent_boost_100" ? "Agent Boost 100%" : "Local Build 90%"))
      .catch(() => {});
  }, []);

  const mainLinks = useMemo(() => ([
    { name: t("sidebar.dashboard"), href: "/", icon: LayoutDashboard },
    { name: t("sidebar.create_project"), href: "/create", icon: PlusSquare },
    { name: t("sidebar.wizard"), href: "/wizard", icon: Wand2 },
    { name: t("sidebar.my_projects"), href: "/projects", icon: FolderGit2 },
    { name: t("sidebar.documentation"), href: "/documentation", icon: FileText },
    { name: t("sidebar.templates"), href: "/templates", icon: Layers },
    { name: t("sidebar.ai_models"), href: "/ai-models", icon: Brain },
    { name: t("sidebar.security"), href: "/security-status", icon: ShieldCheck },
    { name: t("sidebar.downloads"), href: "/downloads", icon: Download },
    { name: t("sidebar.billing"), href: "/billing", icon: CreditCard },
    { name: t("sidebar.settings"), href: "/settings", icon: Settings },
  ]), [t]);

  const advancedLinks = useMemo(() => ([
    { name: t("sidebar.generators"), href: "/generators", icon: Cpu },
    { name: t("sidebar.activity"), href: "/activity", icon: Activity },
    { name: t("sidebar.system"), href: "/system", icon: Server },
    { name: t("sidebar.recommendations"), href: "/recommendations", icon: MessagesSquare },
    { name: t("sidebar.validation"), href: "/validation-center", icon: ShieldCheck },
  ]), [t]);

  const isActive = (href: string) => pathname === href || (href !== "/" && pathname.startsWith(href + "/"));

  return (
    <aside className="sticky top-4 z-40 hidden h-[calc(100vh-2rem)] w-[18rem] shrink-0 overflow-hidden rounded-[28px] border border-white/10 bg-slate-950/70 backdrop-blur-2xl shadow-[0_18px_60px_rgba(0,0,0,0.35)] lg:flex lg:flex-col">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(94,160,255,0.12),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.02),transparent)]" />
      <div className="relative z-10 flex h-full flex-col">
        <div className="border-b border-white/10 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-500/20 bg-cyan-500/10 text-cyan-200 shadow-[0_0_30px_rgba(34,211,238,0.12)]">
              <Sparkles size={20} />
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-base font-semibold text-white">{t("dashboard.enterprise_title")}</h1>
              <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">LDCN OS v1.0</p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <AnimatedBadge tone="cyan">cockpit</AnimatedBadge>
            <AnimatedBadge tone="violet">{aiMode}</AnimatedBadge>
          </div>
        </div>

        <motion.nav
          className="flex-1 space-y-1 overflow-y-auto px-3 py-4 no-scrollbar"
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.03 } } }}
        >
          {mainLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.href);
            return (
              <motion.div
                key={link.href}
                variants={{ hidden: { opacity: 0, x: -12 }, show: { opacity: 1, x: 0 } }}
                whileHover={{ x: 4 }}
                transition={{ type: "spring", stiffness: 320, damping: 24 }}
              >
                <Link
                  href={link.href}
                  className={`group flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm transition-all ${
                    active
                      ? "border-cyan-500/25 bg-cyan-500/10 text-cyan-100 shadow-[0_0_24px_rgba(34,211,238,0.08)]"
                      : "border-transparent text-slate-400 hover:border-white/10 hover:bg-white/[0.04] hover:text-slate-100"
                  }`}
                >
                  <span className={`rounded-xl border p-2 transition-colors ${active ? "border-cyan-400/20 bg-cyan-400/10 text-cyan-200" : "border-white/10 bg-white/[0.03] text-slate-400 group-hover:text-cyan-200"}`}>
                    <Icon size={16} />
                  </span>
                  <span className="font-medium">{link.name}</span>
                </Link>
              </motion.div>
            );
          })}

          <div className="pt-2">
            <button
              onClick={() => setAdvancedOpen(!advancedOpen)}
              className="flex w-full items-center justify-between rounded-2xl border border-white/5 bg-white/[0.02] px-4 py-3 text-xs font-semibold uppercase tracking-[0.25em] text-slate-500 transition-colors hover:text-slate-300"
            >
              <span>{t("sidebar.advanced")}</span>
              {advancedOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
            {advancedOpen && (
              <div className="mt-2 space-y-1 pl-2">
                {advancedLinks.map((link) => {
                  const Icon = link.icon;
                  const active = isActive(link.href);
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`flex items-center gap-3 rounded-2xl px-4 py-2.5 text-sm transition-all ${
                        active
                          ? "bg-white/[0.06] text-white"
                          : "text-slate-500 hover:bg-white/[0.03] hover:text-slate-300"
                      }`}
                    >
                      <Icon size={15} />
                      <span>{link.name}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </motion.nav>

        <div className="border-t border-white/10 p-4">
          <HolographicCard className="p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500">System status</p>
                <p className="mt-1 text-sm font-medium text-white">{aiMode}</p>
              </div>
              <div className="h-10 w-10 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 shadow-[0_0_24px_rgba(16,185,129,0.12)]" />
            </div>
          </HolographicCard>
          <div className="mt-4">
            <PreferencesMenu />
          </div>
        </div>
      </div>
    </aside>
  );
}
