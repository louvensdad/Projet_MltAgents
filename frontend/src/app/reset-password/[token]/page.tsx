"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { ArrowRight, CheckCircle2, KeyRound, Lock } from "lucide-react";
import { motion } from "framer-motion";
import HolographicCard from "@/components/premium/HolographicCard";
import AnimatedBadge from "@/components/premium/AnimatedBadge";
import SectionHeader from "@/components/premium/SectionHeader";
import { resetPassword } from "@/lib/auth";

export default function ResetPasswordPage() {
  const router = useRouter();
  const params = useParams<{ token: string }>();
  const token = useMemo(() => (Array.isArray(params?.token) ? params?.token[0] : params?.token) || "", [params]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    if (password !== confirmPassword) {
      setLoading(false);
      setError("As senhas não coincidem.");
      return;
    }

    try {
      const response = await resetPassword({ token, new_password: password });
      setMessage(response.message || "Senha redefinida com sucesso.");
      window.setTimeout(() => {
        router.push(response.login_url || "/login");
      }, 500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao redefinir a senha.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[300] overflow-hidden bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.14),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(139,92,246,0.16),transparent_28%),linear-gradient(180deg,#04060b_0%,#05070d_45%,#02040a_100%)]">
      <div className="pointer-events-none absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(148,163,184,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.12)_1px,transparent_1px)] [background-size:72px_72px]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(2,6,23,0.42)_78%)]" />

      <div className="relative flex min-h-screen items-center justify-center px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="w-full max-w-3xl"
        >
            <HolographicCard className="p-6 md:p-8">
              <div className="flex items-center gap-3">
                <AnimatedBadge tone="violet">Reset</AnimatedBadge>
                <span className="text-xs uppercase tracking-[0.35em] text-slate-500">Password reset</span>
              </div>

              <div className="mt-4 grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
                <div className="space-y-4">
                  <SectionHeader
                    eyebrow="security"
                    title="Set your new password"
                    subtitle="Use a strong password and return to the login panel to access the workspace again."
                  />

                  <div className="grid gap-3 sm:grid-cols-2">
                    {[
                      { label: "Token", value: token ? "Loaded" : "Missing" },
                      { label: "Session", value: "Will be renewed" },
                      { label: "Audit", value: "Logged" },
                      { label: "Recovery", value: "Complete" },
                    ].map((item) => (
                      <div key={item.label} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                        <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">{item.label}</p>
                        <p className="mt-2 text-sm font-semibold text-white">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <HolographicCard className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.35em] text-slate-500">Reset panel</p>
                      <h2 className="mt-1 text-2xl font-semibold text-white">Create password</h2>
                    </div>
                    <div className="rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-violet-200">
                      Secure
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                    <label className="block space-y-2">
                      <span className="text-xs uppercase tracking-[0.28em] text-slate-500">New password</span>
                      <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
                        <Lock size={16} className="text-slate-500" />
                        <input
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          type="password"
                          required
                          placeholder="Enter a strong password"
                          className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-600"
                        />
                      </div>
                    </label>

                    <label className="block space-y-2">
                      <span className="text-xs uppercase tracking-[0.28em] text-slate-500">Confirm password</span>
                      <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
                        <KeyRound size={16} className="text-slate-500" />
                        <input
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          type="password"
                          required
                          placeholder="Repeat the new password"
                          className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-600"
                        />
                      </div>
                    </label>

                    <button
                      type="submit"
                      disabled={loading || !token}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {loading ? "Updating..." : "Update password"}
                      <ArrowRight size={16} />
                    </button>

                    {message && (
                      <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-200">
                        <p className="font-semibold text-white">{message}</p>
                        <div className="mt-3 flex flex-wrap gap-3">
                          <Link
                            href="/login"
                            className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-sm font-semibold text-emerald-100 transition-all hover:bg-emerald-400/20"
                          >
                            Go to login
                          </Link>
                          <button
                            type="button"
                            onClick={() => router.push("/login")}
                            className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm font-semibold text-slate-100 transition-all hover:bg-white/10"
                          >
                            Continue to login
                          </button>
                        </div>
                      </div>
                    )}

                    {error && (
                      <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-200">
                        {error}
                      </div>
                    )}

                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-slate-300">
                      <p className="font-semibold text-white">Password policy</p>
                      <p className="mt-1 text-slate-400">
                        Use at least 8 characters and avoid trivial combinations. This route is local and does not send email.
                      </p>
                    </div>
                  </form>
                </HolographicCard>
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-5">
                <Link href="/forgot-password" className="text-sm text-slate-400 transition-colors hover:text-white">
                  Back to recovery
                </Link>
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.35em] text-slate-500">
                  <CheckCircle2 size={14} />
                  Secure reset flow
                </div>
              </div>
            </HolographicCard>
        </motion.div>
      </div>
    </div>
  );
}
