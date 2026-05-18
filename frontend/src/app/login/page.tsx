"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Fingerprint, Globe, KeyRound, Languages, ShieldCheck, Sparkles, TerminalSquare } from "lucide-react";
import { motion } from "framer-motion";
import HolographicCard from "@/components/premium/HolographicCard";
import MetricOrb from "@/components/premium/MetricOrb";
import AnimatedBadge from "@/components/premium/AnimatedBadge";
import SectionHeader from "@/components/premium/SectionHeader";
import { usePreferences } from "@/context/PreferencesContext";
import { loginWithPassword, storeAuthSession } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const { lang, setLang, localeNames, t } = usePreferences();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [languageOpen, setLanguageOpen] = useState(false);

  const hint = useMemo(() => {
    if (email.includes("@")) return t("auth.sign_in_hint_secure");
    return t("auth.sign_in_hint_enter_email");
  }, [email, t]);

  const features = [
    { label: t("auth.passkeys"), value: t("auth.passkeys_available"), accent: "cyan" as const, icon: <ShieldCheck size={18} /> },
    { label: t("auth.audit_logs"), value: t("auth.audit_logs_on"), accent: "violet" as const, icon: <Fingerprint size={18} /> },
    { label: t("auth.mfa"), value: t("auth.mfa_recommended"), accent: "emerald" as const, icon: <Sparkles size={18} /> },
  ];

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await loginWithPassword({
        email,
        password,
        remember_device: remember,
      });
      storeAuthSession(response, remember);
      setMessage(t("auth.login_success"));
      window.setTimeout(() => {
        router.push(response.redirect_url || "/");
      }, 400);
    } catch (err) {
      const messageText = err instanceof Error ? t("auth.login_failed") : t("common.error");
      setError(messageText);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[300] overflow-hidden bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.14),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(139,92,246,0.16),transparent_28%),linear-gradient(180deg,#04060b_0%,#05070d_45%,#02040a_100%)]">
      <div className="pointer-events-none absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(148,163,184,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.12)_1px,transparent_1px)] [background-size:72px_72px]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(2,6,23,0.42)_78%)]" />

      <div className="relative flex min-h-screen items-center justify-center px-3 py-4 sm:px-6 sm:py-8 lg:px-8">
        <div className="grid w-full max-w-7xl gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <motion.section
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
            className="order-2 space-y-6 lg:order-1"
          >
            <div className="flex flex-wrap items-center gap-3">
              <AnimatedBadge tone="cyan">{t("auth.secure_access")}</AnimatedBadge>
              <span className="text-[10px] uppercase tracking-[0.35em] text-slate-500 sm:text-xs">{t("auth.enterprise_console")}</span>
            </div>

            <div className="space-y-4">
              <h1 className="max-w-2xl text-3xl font-semibold tracking-tight text-white sm:text-4xl md:text-6xl">
                {t("auth.login_title")}
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-slate-300 md:text-base md:leading-7">
                {t("auth.workspace_online")}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 sm:gap-4">
              {features.map((item) => (
                <MetricOrb key={item.label} label={item.label} value={item.value} accent={item.accent} icon={item.icon} />
              ))}
            </div>

            <div className="grid gap-4 md:grid-cols-[1.15fr_0.85fr]">
              <HolographicCard className="p-5">
                <SectionHeader eyebrow={t("auth.security_cockpit")} title={t("auth.security_cockpit")} subtitle={t("auth.security_cockpit_subtitle")} />
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {[
                    { label: t("auth.passkeys"), value: t("auth.passkeys_available") },
                    { label: t("auth.audit_logs"), value: t("auth.audit_logs_on") },
                    { label: t("auth.session_policy"), value: t("auth.session_strict") },
                    { label: t("auth.mfa"), value: t("auth.mfa_recommended") },
                  ].map((item) => (
                    <div key={item.label} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                      <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">{item.label}</p>
                      <p className="mt-2 text-sm font-semibold text-white">{item.value}</p>
                    </div>
                  ))}
                </div>
              </HolographicCard>

              <HolographicCard className="p-5">
                <SectionHeader eyebrow={t("auth.runtime")} title={t("auth.live_status")} subtitle={t("auth.workspace_online")} />
                <div className="mt-5 space-y-3 text-sm text-slate-300">
                  <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                    <span>{t("auth.generation_engine")}</span>
                    <span className="text-emerald-300">{t("auth.online")}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                    <span>{t("auth.prompt_master")}</span>
                    <span className="text-cyan-300">{t("auth.synced")}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                    <span>{t("auth.gatekeepers")}</span>
                    <span className="text-violet-300">{t("auth.ready")}</span>
                  </div>
                </div>
              </HolographicCard>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 28, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.08 }}
            className="relative order-1 lg:order-2"
          >
            <div className="absolute -inset-6 rounded-[2rem] bg-cyan-500/10 blur-3xl" />
            <HolographicCard className="relative z-10 p-4 sm:p-5 md:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.35em] text-slate-500">{t("auth.login_eyebrow")}</p>
                  <h2 className="mt-1 text-xl font-semibold text-white sm:text-2xl">{t("auth.login_title")}</h2>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setLanguageOpen((value) => !value)}
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-200 transition-all hover:bg-white/10"
                    aria-label={t("auth.change_language")}
                  >
                    <Languages size={14} />
                    {lang.toUpperCase()}
                  </button>
                  <div className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-200">
                    {t("auth.login_live")}
                  </div>
                </div>
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

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <label className="block space-y-2">
                  <span className="text-xs uppercase tracking-[0.28em] text-slate-500">{t("auth.login_workspace_email")}</span>
                  <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/30 px-4 py-3 transition-all focus-within:border-cyan-500/30">
                    <input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      type="email"
                      required
                      placeholder={t("auth.login_email_placeholder")}
                      className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-600"
                    />
                  </div>
                </label>

                <label className="block space-y-2">
                  <span className="text-xs uppercase tracking-[0.28em] text-slate-500">{t("auth.login_password")}</span>
                  <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/30 px-4 py-3 transition-all focus-within:border-violet-500/30">
                    <input
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      type="password"
                      required
                      placeholder={t("auth.login_password_placeholder")}
                      className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-600"
                    />
                  </div>
                </label>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <label className="flex items-center gap-2 text-sm text-slate-300">
                    <input
                      checked={remember}
                      onChange={(e) => setRemember(e.target.checked)}
                      type="checkbox"
                      className="h-4 w-4 rounded border-white/20 bg-black/40 text-cyan-400 focus:ring-cyan-400/50"
                    />
                    {t("auth.remember_device")}
                  </label>
                  <span className="text-[10px] uppercase tracking-[0.28em] text-slate-500 sm:text-xs">{hint}</span>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? t("common.loading") : t("auth.enter_center")}
                  <ArrowRight size={16} />
                </button>

                <div className="grid gap-3 sm:grid-cols-2">
                  <Link
                    href="/forgot-password"
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-200 transition-all hover:bg-white/10"
                  >
                    <Globe size={16} />
                    {t("auth.magic_link")}
                  </Link>
                  <Link
                    href="/forgot-password"
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-200 transition-all hover:bg-white/10"
                  >
                    <KeyRound size={16} />
                    {t("auth.recover_password")}
                  </Link>
                </div>

                {message && (
                  <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-200">
                    {message}
                  </div>
                )}

                {error && (
                  <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-200">
                    {error}
                  </div>
                )}
              </form>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-5">
                <Link href="/" className="text-sm text-slate-400 transition-colors hover:text-white">
                  {t("auth.enter_panel")}
                </Link>
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.35em] text-slate-500">
                  <TerminalSquare size={14} />
                  {t("auth.enterprise_login_panel")}
                </div>
              </div>
            </HolographicCard>
          </motion.section>
        </div>
      </div>
    </div>
  );
}
