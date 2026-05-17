"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Palette, Globe, CreditCard, Wand2, Cpu, Shield,
  Moon, Sun, Monitor, Check, Save, Languages, Sparkles,
  Bell, Mail, RefreshCw, ChevronRight, Brain
} from "lucide-react";
import { usePreferences } from "@/context/PreferencesContext";
import { apiGet, apiFallbacks } from "@/lib/api";
import AnimatedBadge from "@/components/premium/AnimatedBadge";
import HolographicCard from "@/components/premium/HolographicCard";
import MetricOrb from "@/components/premium/MetricOrb";

const languages = [
  { code: "pt" as const, name: "Português", native: "Português (Brasil)", flag: "🇧🇷" },
  { code: "en" as const, name: "English", native: "English (US)", flag: "🇺🇸" },
  { code: "es" as const, name: "Español", native: "Español (España)", flag: "🇪🇸" },
  { code: "fr" as const, name: "Français", native: "Français (France)", flag: "🇫🇷" },
];

const themes = [
  { id: "dark" as const, labelKey: "settings.theme_dark", icon: Moon, preview: "from-slate-900 to-slate-800" },
  { id: "light" as const, labelKey: "settings.theme_light", icon: Sun, preview: "from-stone-100 to-stone-200" },
  { id: "system" as const, labelKey: "settings.theme_system", icon: Monitor, preview: "from-violet-900 to-violet-800" },
];

function SectionCard({ icon: Icon, title, desc, children, accent = "from-blue-500 to-indigo-500" }: {
  icon: any; title: string; desc: string; children: React.ReactNode; accent?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group rounded-2xl border border-white/10 bg-surface/80 backdrop-blur-sm overflow-hidden transition-all hover:border-white/20 hover:shadow-[0_0_40px_rgba(59,130,246,0.06)]"
    >
      <div className={`h-1 bg-gradient-to-r ${accent}`} />
      <div className="p-6 space-y-5">
        <div className="flex items-start gap-4">
          <div className={`rounded-xl bg-gradient-to-br ${accent} p-2.5 text-white shadow-lg`}>
            <Icon size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-gray-100">{title}</h3>
            <p className="text-sm text-gray-500 mt-0.5">{desc}</p>
          </div>
        </div>
        {children}
      </div>
    </motion.div>
  );
}

function Toggle({ checked, onChange, label, desc }: { checked: boolean; onChange: (v: boolean) => void; label: string; desc: string }) {
  return (
    <label className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/5 cursor-pointer hover:bg-white/[0.05] transition-all">
      <div className="space-y-0.5">
        <p className="text-sm font-medium text-gray-200">{label}</p>
        <p className="text-xs text-gray-500">{desc}</p>
      </div>
      <div className={`relative w-11 h-6 rounded-full transition-all ${checked ? "bg-primary" : "bg-white/10"}`}>
        <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-all ${checked ? "translate-x-5" : ""}`} />
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="sr-only" />
      </div>
    </label>
  );
}

export default function SettingsPage() {
  const { theme, setTheme, lang, setLang, t, localeNames, localePreview, localeFull } = usePreferences();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [previewLang, setPreviewLang] = useState(lang);

  const [autoDocs, setAutoDocs] = useState(true);
  const [aiSuggestions, setAiSuggestions] = useState(true);
  const [securityScan, setSecurityScan] = useState(true);
  const [autoBackup, setAutoBackup] = useState(true);

  const [defaultAiMode, setDefaultAiMode] = useState("local_build_90");
  const [allowMockFallback, setAllowMockFallback] = useState(true);
  const [maxAiCalls, setMaxAiCalls] = useState(10);
  const [maxCostPerGen, setMaxCostPerGen] = useState("medium");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setAutoDocs(localStorage.getItem("ldcn_auto_docs") !== "false");
      setAiSuggestions(localStorage.getItem("ldcn_ai_suggestions") !== "false");
      setSecurityScan(localStorage.getItem("ldcn_security_scan") !== "false");
      setAutoBackup(localStorage.getItem("ldcn_auto_backup") !== "false");
      setDefaultAiMode(localStorage.getItem("ldcn_default_ai_mode") || "local_build_90");
      setAllowMockFallback(localStorage.getItem("ldcn_allow_mock_fallback") !== "false");
      setMaxAiCalls(Number(localStorage.getItem("ldcn_max_ai_calls")) || 10);
      setMaxCostPerGen(localStorage.getItem("ldcn_max_cost_per_gen") || "medium");
    }
  }, []);

  useEffect(() => {
    apiGet<any>("/api/settings", {})
      .then(() => setError(""))
      .catch(() => setError(t("settings.offline_mode")));
  }, [lang, t]);

  const save = async () => {
    setSaving(true);
    setSaved(false);
    await new Promise((r) => setTimeout(r, 800));
    localStorage.setItem("ldcn_auto_docs", String(autoDocs));
    localStorage.setItem("ldcn_ai_suggestions", String(aiSuggestions));
    localStorage.setItem("ldcn_security_scan", String(securityScan));
    localStorage.setItem("ldcn_auto_backup", String(autoBackup));
    localStorage.setItem("ldcn_default_ai_mode", defaultAiMode);
    localStorage.setItem("ldcn_allow_mock_fallback", String(allowMockFallback));
    localStorage.setItem("ldcn_max_ai_calls", String(maxAiCalls));
    localStorage.setItem("ldcn_max_cost_per_gen", maxCostPerGen);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleLangChange = (l: typeof lang) => {
    setLang(l);
    setPreviewLang(l);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 lg:py-10">
      <HolographicCard className="p-6 md:p-8">
        <div className="flex flex-wrap items-center gap-2">
          <AnimatedBadge tone="cyan">preferences cockpit</AnimatedBadge>
          <AnimatedBadge tone="violet">workspace policy</AnimatedBadge>
        </div>
        <h1 className="mt-5 text-4xl font-semibold tracking-tight text-white md:text-5xl">{t("settings.title")}</h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 md:text-base">{t("settings.subtitle")}</p>
        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          <MetricOrb label="Language" value={lang.toUpperCase()} accent="cyan" />
          <MetricOrb label="Theme" value={theme} accent="violet" />
          <MetricOrb label="AI Mode" value={defaultAiMode} accent="emerald" />
        </div>
      </HolographicCard>

      {error && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200 flex items-center gap-3">
          <RefreshCw size={16} className="shrink-0" />
          {error}
        </div>
      )}

      <div className="grid gap-6">
        {/* Appearance + Language */}
        <div className="grid gap-6 md:grid-cols-2">
          <SectionCard icon={Palette} title={t("settings.appearance")} desc={t("settings.appearance_desc")} accent="from-purple-500 to-pink-500">
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                {themes.map((item) => {
                  const Icon = item.icon;
                  const isActive = theme === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setTheme(item.id)}
                      className={`relative overflow-hidden rounded-xl p-3 transition-all border ${
                        isActive
                          ? "border-primary bg-primary/10 ring-1 ring-primary/30"
                          : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"
                      }`}
                    >
                      <div className={`absolute inset-0 bg-gradient-to-br ${item.preview} opacity-10`} />
                      <div className="relative flex flex-col items-center gap-1">
                        <Icon size={18} className={isActive ? "text-primary" : "text-gray-400"} />
                        <span className={`text-[10px] font-bold uppercase tracking-tight ${isActive ? "text-primary" : "text-gray-500"}`}>
                          {t(item.labelKey)}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </SectionCard>

          <SectionCard icon={Languages} title={t("settings.language")} desc={t("settings.language_desc")} accent="from-emerald-500 to-teal-500">
            <div className="space-y-3">
              <div className="grid gap-2">
                {languages.map((l) => {
                  const isActive = lang === l.code;
                  return (
                    <button
                      key={l.code}
                      onClick={() => handleLangChange(l.code)}
                      className={`flex items-center justify-between p-3 rounded-xl transition-all border ${
                        isActive
                          ? "border-primary bg-primary/10 ring-1 ring-primary/20"
                          : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{l.flag}</span>
                        <div className="text-left">
                          <p className={`text-sm font-semibold ${isActive ? "text-primary" : "text-gray-200"}`}>{l.name}</p>
                          <p className="text-[11px] text-gray-500">{l.native}</p>
                        </div>
                      </div>
                      {isActive && (
                        <div className="rounded-full bg-primary p-1">
                          <Check size={12} className="text-white" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Language Preview */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={previewLang}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="rounded-xl bg-gradient-to-r from-primary/[0.08] to-indigo-500/[0.08] border border-primary/20 p-3 text-center"
                >
                  <p className="text-xs font-medium text-primary">
                    {localePreview[previewLang]}
                  </p>
                  <p className="text-[10px] text-gray-500 mt-1">
                    {localeFull}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>
          </SectionCard>
        </div>

        {/* Subscription */}
        <SectionCard icon={CreditCard} title={t("settings.subscription")} desc={t("settings.subscription_desc")} accent="from-amber-500 to-orange-500">
          <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-amber-500/[0.06] to-orange-500/[0.06] border border-amber-500/20">
            <div className="space-y-1">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400">{t("settings.subscription_label")}</p>
              <p className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                {t("settings.subscription_value")}
              </p>
            </div>
            <div className="rounded-xl bg-amber-500/20 px-4 py-2 border border-amber-500/30">
              <p className="text-xs font-bold text-amber-300 uppercase tracking-wider">Enterprise</p>
            </div>
          </div>
        </SectionCard>

        {/* Wizard Preferences */}
        <SectionCard icon={Wand2} title={t("settings.wizard_preferences")} desc={t("settings.wizard_preferences_desc")} accent="from-cyan-500 to-blue-500">
          <div className="space-y-2">
            <Toggle
              checked={aiSuggestions}
              onChange={setAiSuggestions}
              label={t("settings.enable_ai_suggestions")}
              desc={t("settings.enable_ai_suggestions_desc")}
            />
            <Toggle
              checked={autoDocs}
              onChange={setAutoDocs}
              label={t("settings.auto_generate_docs")}
              desc={t("settings.auto_generate_docs_desc")}
            />
          </div>
        </SectionCard>

        {/* Generation Preferences */}
        <SectionCard icon={Cpu} title={t("settings.generation_preferences")} desc={t("settings.generation_preferences_desc")} accent="from-violet-500 to-purple-500">
          <div className="space-y-2">
            <Toggle
              checked={securityScan}
              onChange={setSecurityScan}
              label={t("settings.enable_security_scan")}
              desc={t("settings.enable_security_scan_desc")}
            />
            <Toggle
              checked={autoBackup}
              onChange={setAutoBackup}
              label={t("settings.enable_auto_backup")}
              desc={t("settings.enable_auto_backup_desc")}
            />
          </div>
        </SectionCard>

        {/* AI Generation Settings */}
        <SectionCard icon={Brain} title={t("ai_mode.settings_title")} desc={t("ai_mode.settings_desc")} accent="from-emerald-500 to-teal-500">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-400">{t("ai_mode.default_mode")}</label>
              <p className="text-[11px] text-gray-500">{t("ai_mode.default_mode_desc")}</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "local_build_90", label: t("ai_mode.local_build"), desc: t("ai_mode.local_build_desc") },
                  { id: "agent_boost_100", label: t("ai_mode.agent_boost"), desc: t("ai_mode.agent_boost_desc") },
                ].map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setDefaultAiMode(mode.id)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      defaultAiMode === mode.id
                        ? "border-emerald-500 bg-emerald-500/10"
                        : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"
                    }`}
                  >
                    <p className={`text-sm font-semibold ${defaultAiMode === mode.id ? "text-emerald-300" : "text-gray-200"}`}>{mode.label}</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">{mode.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <Toggle
              checked={allowMockFallback}
              onChange={setAllowMockFallback}
              label={t("ai_mode.allow_fallback")}
              desc={t("ai_mode.allow_fallback_desc")}
            />

            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-400">{t("ai_mode.max_calls")}</label>
              <select
                value={maxAiCalls}
                onChange={(e) => setMaxAiCalls(Number(e.target.value))}
                className="w-full bg-transparent text-sm text-gray-200 outline-none border-b border-white/10 pb-1 focus:border-primary/50"
              >
                <option value={3}>3</option>
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-400">{t("ai_mode.max_cost")}</label>
              <select
                value={maxCostPerGen}
                onChange={(e) => setMaxCostPerGen(e.target.value)}
                className="w-full bg-transparent text-sm text-gray-200 outline-none border-b border-white/10 pb-1 focus:border-primary/50"
              >
                <option value="low">{t("ai_mode.lower")}</option>
                <option value="medium">{t("ai_mode.medium")}</option>
                <option value="high">{t("ai_mode.high")}</option>
              </select>
            </div>
          </div>
        </SectionCard>

        {/* Panel Security */}
        <SectionCard icon={Shield} title={t("settings.security_preferences")} desc={t("settings.security_preferences_desc")} accent="from-rose-500 to-red-500">
          <div className="grid gap-3 md:grid-cols-1">
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-400">{t("settings.email")}</label>
              <input
                defaultValue="admin@ldcn.io"
                placeholder={t("settings.email_placeholder")}
                className="w-full bg-transparent text-sm text-gray-200 outline-none border-b border-white/10 pb-1 focus:border-primary/50"
              />
            </div>
          </div>
        </SectionCard>

        {/* Generation Mode */}
        <SectionCard icon={Brain} title={t("ai_mode.generation_mode")} desc={t("ai_mode.generation_mode_desc")} accent="from-violet-500 to-purple-500">
          <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-violet-500/[0.06] to-purple-500/[0.06] border border-violet-500/20">
            <div className="space-y-1">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400">{t("ai_mode.generation_mode")}</p>
              <p className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
                {t("ai_mode.local_build")}
              </p>
              <p className="text-[11px] text-gray-500">{t("ai_mode.no_key_needed")}</p>
            </div>
            <div className="rounded-xl bg-violet-500/20 px-4 py-2 border border-violet-500/30">
              <p className="text-xs font-bold text-violet-300 uppercase tracking-wider">{t("ai_mode.boost_active")}</p>
            </div>
          </div>
        </SectionCard>
      </div>

      {/* Save Button + Feedback */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky bottom-4 flex items-center justify-center gap-4"
      >
        <button
          onClick={save}
          disabled={saving}
          className="inline-flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-primary to-indigo-500 px-8 py-3 text-sm font-bold text-white shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 disabled:opacity-60 transition-all active:scale-[0.98]"
        >
          {saving ? (
            <RefreshCw size={16} className="animate-spin" />
          ) : (
            <Save size={16} />
          )}
          {saving ? t("common.saving") : t("settings.save")}
        </button>

        <AnimatePresence>
          {saved && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 px-4 py-3 text-sm font-medium text-emerald-300"
            >
              <Check size={16} />
              {t("settings.saved")}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
