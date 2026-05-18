"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { ArrowRight, CheckCircle2, KeyRound, Languages, Lock } from "lucide-react";
import { motion } from "framer-motion";
import HolographicCard from "@/components/premium/HolographicCard";
import AnimatedBadge from "@/components/premium/AnimatedBadge";
import SectionHeader from "@/components/premium/SectionHeader";
import { usePreferences } from "@/context/PreferencesContext";
import { resetPassword } from "@/lib/auth";

export default function ResetPasswordPage() {
  const router = useRouter();
  const params = useParams<{ token: string }>();
  const token = useMemo(() => (Array.isArray(params?.token) ? params?.token[0] : params?.token) || "", [params]);
  const { lang, setLang, localeNames, t } = usePreferences();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [languageOpen, setLanguageOpen] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    if (password !== confirmPassword) {
      setLoading(false);
      setError(t("auth.passwords_not_match"));
      return;
    }

    try {
      const response = await resetPassword({ token, new_password: password });
      setMessage(t("auth.password_reset_success"));
      window.setTimeout(() => {
        router.push(response.login_url || "/login");
      }, 500);
    } catch (err) {
      setError(t("auth.reset_failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[300] overflow-hidden bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.14),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(139,92,246,0.16),transparent_28%),linear-gradient(180deg,#04060b_0%,#05070d_45%,#02040a_100%)]">
      <div className="pointer-events-none absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(148,163,184,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.12)_1px,transparent_1px)] [background-size:72px_72px]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(2,6,23,0.42)_78%)]" />

      <div className="relative flex min-h-screen items-center justify-center px-3 py-4 sm:px-4 sm:py-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="w-full max-w-3xl"
        >
          <HolographicCard className="p-5 sm:p-6 md:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <AnimatedBadge tone="violet">{t("auth.recovery_eyebrow")}</AnimatedBadge>
                <span className="text-[10px] uppercase tracking-[0.35em] text-slate-500 sm:text-xs">{t("auth.password_reset")}</span>
              </div>
              <button
                type="button"
                onClick={() => setLanguageOpen((value) => !value)}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-200 transition-all hover:bg-white/10"
                aria-label={t("auth.change_language")}
              >
                <Languages size={14} />
                {lang.toUpperCase()}
              </button>
            </div>

            {languageOpen && (
              <div className="mt-4 grid grid-cols-2 gap-2 rounded-2xl border border-white/10 bg-black/30 p-2 sm:grid-cols-4">
                {(["pt", "en", "es", "fr"] as const).map((code) => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => {
                      setLang(code);
                      setLanguageOpen(false);
                    }}
                    className={`rounded-xl px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition-all ${
                      lang === code
                        ? "border border-cyan-400/20 bg-cyan-500/15 text-cyan-100"
                        : "text-slate-300 hover:bg-white/5"
                    }`}
                  >
                    {localeNames[code]}
                  </button>
                ))}
              </div>
            )}

            <div className="mt-4 grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
              <div className="space-y-4">
                <SectionHeader
                  eyebrow={t("auth.security_cockpit")}
                  title={t("auth.set_new_password")}
                  subtitle={t("auth.use_strong_password")}
                />

                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    { label: t("auth.reset_token"), value: token ? t("auth.token_loaded") : t("auth.token_missing") },
                    { label: t("auth.session_policy"), value: t("auth.session_renewed") },
                    { label: t("auth.audit_logs"), value: t("auth.audit_logged") },
                    { label: t("auth.recovery_complete"), value: t("auth.recovery_complete") },
                  ].map((item) => (
                    <div key={item.label} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                      <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">{item.label}</p>
                      <p className="mt-2 text-sm font-semibold text-white">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <HolographicCard className="p-4 sm:p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.35em] text-slate-500">{t("auth.reset_panel")}</p>
                    <h2 className="mt-1 text-xl font-semibold text-white sm:text-2xl">{t("auth.create_password")}</h2>
                  </div>
                  <div className="rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-violet-200">
                    {t("auth.security_strict")}
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                  <label className="block space-y-2">
                    <span className="text-xs uppercase tracking-[0.28em] text-slate-500">{t("auth.new_password")}</span>
                    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
                      <Lock size={16} className="text-slate-500" />
                      <input
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        type="password"
                        required
                        placeholder={t("auth.enter_strong_password")}
                        className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-600"
                      />
                    </div>
                  </label>

                  <label className="block space-y-2">
                    <span className="text-xs uppercase tracking-[0.28em] text-slate-500">{t("auth.confirm_password")}</span>
                    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
                      <KeyRound size={16} className="text-slate-500" />
                      <input
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        type="password"
                        required
                        placeholder={t("auth.repeat_new_password")}
                        className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-600"
                      />
                    </div>
                  </label>

                  <button
                    type="submit"
                    disabled={loading || !token}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? t("auth.updating") : t("auth.update_password")}
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
                          {t("auth.go_to_login")}
                        </Link>
                        <button
                          type="button"
                          onClick={() => router.push("/login")}
                          className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm font-semibold text-slate-100 transition-all hover:bg-white/10"
                        >
                          {t("auth.continue_to_login")}
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
                    <p className="font-semibold text-white">{t("auth.password_policy")}</p>
                    <p className="mt-1 text-slate-400">{t("auth.password_policy_desc")}</p>
                  </div>
                </form>
              </HolographicCard>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-5">
              <Link href="/forgot-password" className="text-sm text-slate-400 transition-colors hover:text-white">
                {t("auth.back_to_recovery")}
              </Link>
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.35em] text-slate-500">
                <CheckCircle2 size={14} />
                {t("auth.recovery_audit_trail")}
              </div>
            </div>
          </HolographicCard>
        </motion.div>
      </div>
    </div>
  );
}
