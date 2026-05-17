"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Fingerprint, Github, Globe, Lock, Mail, ShieldCheck, Sparkles, TerminalSquare } from "lucide-react";
import { motion } from "framer-motion";
import PremiumShell from "@/components/premium/PremiumShell";
import HolographicCard from "@/components/premium/HolographicCard";
import MetricOrb from "@/components/premium/MetricOrb";
import AnimatedBadge from "@/components/premium/AnimatedBadge";
import SectionHeader from "@/components/premium/SectionHeader";

const FEATURES = [
  { label: "Zero Trust", value: "Active" },
  { label: "Audit Trail", value: "Enabled" },
  { label: "SSO", value: "Ready" },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const hint = useMemo(() => {
    if (email.includes("@")) return "Secure sign-in detected";
    return "Enter your workspace email";
  }, [email]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    window.setTimeout(() => {
      setLoading(false);
      setMessage("Access granted. Redirecting to the orchestration center.");
      router.push("/dashboard");
    }, 900);
  };

  return (
    <PremiumShell>
      <div className="fixed inset-0 z-[300] overflow-hidden bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.14),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(139,92,246,0.16),transparent_28%),linear-gradient(180deg,#04060b_0%,#05070d_45%,#02040a_100%)]">
        <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(148,163,184,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.12)_1px,transparent_1px)] [background-size:72px_72px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(2,6,23,0.42)_78%)]" />

        <div className="relative flex min-h-screen items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid w-full max-w-7xl gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <motion.section
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: "easeOut" }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3">
                <AnimatedBadge tone="cyan">Secure Access</AnimatedBadge>
                <span className="text-xs uppercase tracking-[0.35em] text-slate-500">Enterprise console</span>
              </div>

              <div className="space-y-4">
                <h1 className="max-w-2xl text-5xl font-semibold tracking-tight text-white md:text-6xl">
                  Futuristic login for the AI orchestration plane.
                </h1>
                <p className="max-w-2xl text-sm leading-7 text-slate-300 md:text-base">
                  Sign in to access live generation, template control, quality gates and the premium engineering workspace.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                {FEATURES.map((item, index) => (
                  <MetricOrb
                    key={item.label}
                    label={item.label}
                    value={item.value}
                    accent={index === 0 ? "cyan" : index === 1 ? "violet" : "emerald"}
                    icon={index === 0 ? <ShieldCheck size={18} /> : index === 1 ? <Fingerprint size={18} /> : <Sparkles size={18} />}
                  />
                ))}
              </div>

              <div className="grid gap-4 md:grid-cols-[1.15fr_0.85fr]">
                <HolographicCard className="p-5">
                  <SectionHeader eyebrow="control layer" title="Security cockpit" subtitle="Auditable access, passkeys and low-friction sign-in flows." />
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    {[
                      { label: "Passkeys", value: "Available" },
                      { label: "Audit logs", value: "On" },
                      { label: "Session policy", value: "Strict" },
                      { label: "MFA", value: "Recommended" },
                    ].map((item) => (
                      <div key={item.label} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                        <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">{item.label}</p>
                        <p className="mt-2 text-sm font-semibold text-white">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </HolographicCard>

                <HolographicCard className="p-5">
                  <SectionHeader eyebrow="runtime" title="Live status" subtitle="The workspace is online and ready for secure access." />
                  <div className="mt-5 space-y-3 text-sm text-slate-300">
                    <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                      <span>Generation engine</span>
                      <span className="text-emerald-300">Online</span>
                    </div>
                    <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                      <span>Prompt Master</span>
                      <span className="text-cyan-300">Synced</span>
                    </div>
                    <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                      <span>Gatekeepers</span>
                      <span className="text-violet-300">Ready</span>
                    </div>
                  </div>
                </HolographicCard>
              </div>
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 28, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.08 }}
              className="relative"
            >
              <div className="absolute -inset-6 rounded-[2rem] bg-cyan-500/10 blur-3xl" />
              <HolographicCard className="relative z-10 p-5 md:p-6">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.35em] text-slate-500">Login panel</p>
                    <h2 className="mt-1 text-2xl font-semibold text-white">Access the factory</h2>
                  </div>
                  <div className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-200">
                    Live
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                  <label className="block space-y-2">
                    <span className="text-xs uppercase tracking-[0.28em] text-slate-500">Workspace email</span>
                    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/30 px-4 py-3 transition-all focus-within:border-cyan-500/30">
                      <Mail size={16} className="text-slate-500" />
                      <input
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        type="email"
                        required
                        placeholder="louvens@company.com"
                        className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-600"
                      />
                    </div>
                  </label>

                  <label className="block space-y-2">
                    <span className="text-xs uppercase tracking-[0.28em] text-slate-500">Password</span>
                    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/30 px-4 py-3 transition-all focus-within:border-violet-500/30">
                      <Lock size={16} className="text-slate-500" />
                      <input
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        type="password"
                        required
                        placeholder="••••••••••••"
                        className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-600"
                      />
                    </div>
                  </label>

                  <div className="flex items-center justify-between gap-3">
                    <label className="flex items-center gap-2 text-sm text-slate-300">
                      <input
                        checked={remember}
                        onChange={(e) => setRemember(e.target.checked)}
                        type="checkbox"
                        className="h-4 w-4 rounded border-white/20 bg-black/40 text-cyan-400 focus:ring-cyan-400/50"
                      />
                      Remember this device
                    </label>
                    <span className="text-xs uppercase tracking-[0.28em] text-slate-500">{hint}</span>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? "Accessing..." : "Enter orchestration center"}
                    <ArrowRight size={16} />
                  </button>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-200 transition-all hover:bg-white/10"
                    >
                      <Globe size={16} />
                      Magic link
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-200 transition-all hover:bg-white/10"
                    >
                      <Github size={16} />
                      Continue with GitHub
                    </button>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-slate-300">
                    <p className="font-semibold text-white">Need a workspace?</p>
                    <p className="mt-1 text-slate-400">
                      Create an account to unlock templates, live generation and secure project downloads.
                    </p>
                  </div>

                  {message && (
                    <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-200">
                      {message}
                    </div>
                  )}
                </form>

                <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-5">
                  <Link href="/" className="text-sm text-slate-400 transition-colors hover:text-white">
                    Return to dashboard
                  </Link>
                  <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.35em] text-slate-500">
                    <TerminalSquare size={14} />
                    Enterprise login panel
                  </div>
                </div>
              </HolographicCard>
            </motion.section>
          </div>
        </div>
      </div>
    </PremiumShell>
  );
}
