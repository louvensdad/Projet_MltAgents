"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, CreditCard, Gauge, ShieldCheck, Sparkles, WalletCards } from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import StatusBadge from "@/components/common/StatusBadge";
import { apiGet, apiFallbacks } from "@/lib/api";
import { usePreferences } from "@/context/PreferencesContext";

function safeArray(arr: any): any[] {
  if (Array.isArray(arr)) return arr;
  if (arr && typeof arr === "object") return Object.values(arr);
  return [];
}

export default function BillingPage() {
  const { t } = usePreferences();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    apiGet<any>("/api/billing", apiFallbacks["/api/billing"] as any)
      .then((r) => setData(r.data))
      .catch(() => setError("Nao foi possivel carregar a area de monetizacao."))
      .finally(() => setLoading(false));
  }, []);

  const plans = safeArray(data?.plans || []);
  const history = safeArray(data?.history || []);
  const usage = data?.usage || {};
  const agentBoost = data?.agent_boost || {};

  const usagePercent = useMemo(() => {
    const limit = Number(usage.projects_limit || 0);
    const value = Number(usage.projects_this_month || 0);
    if (!limit) return 0;
    return Math.min(100, Math.round((value / limit) * 100));
  }, [usage.projects_limit, usage.projects_this_month]);

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <section className="overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-8 shadow-2xl shadow-black/30 md:p-10">
        <div className="grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-200">
              <Sparkles size={12} />
              Agent Boost + Local Build
            </div>
            <PageHeader
              title={t("billing.title")}
              subtitle={t("billing.subtitle")}
            />
            <p className="max-w-2xl text-sm text-slate-300/80">
              A monetizacao agora exposta como contrato de produto: plano atual,
              limites, historico e estado do provider sem linguagem de fallback na UI.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/wizard" className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90">
                <Sparkles size={16} />
                Nova geracao
              </Link>
              <Link href="/ai-models" className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-medium text-slate-200 transition-all hover:bg-white/10">
                <ShieldCheck size={16} />
                Modelos e modos
              </Link>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <MetricCard label="Plano atual" value={data?.current_plan || "Enterprise"} icon={<CreditCard size={16} />} />
            <MetricCard label="Provider" value={data?.provider_status || "operational"} icon={<WalletCards size={16} />} />
            <MetricCard label="AI requests" value={`${usage.ai_requests_used || 0}/${usage.ai_requests_limit || 0}`} icon={<Gauge size={16} />} />
            <MetricCard label="Next billing" value={data?.next_billing || "-"} icon={<ArrowRight size={16} />} />
          </div>
        </div>
      </section>

      {loading && <div className="h-32 animate-pulse rounded-2xl bg-white/5" />}
      {error && <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-200">{error}</div>}

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-2xl border border-white/10 bg-surface p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-[0.25em] text-slate-400">Usage</h2>
            <span className="text-xs text-slate-500">{usagePercent}% do limite mensal</span>
          </div>
          <div className="mt-5 rounded-full bg-white/[0.06] p-1">
            <div className="h-3 rounded-full bg-gradient-to-r from-cyan-500 via-sky-500 to-emerald-400" style={{ width: `${usagePercent}%` }} />
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <MiniStat label="Projects this month" value={usage.projects_this_month || 0} />
            <MiniStat label="Project limit" value={usage.projects_limit || 0} />
            <MiniStat label="AI requests used" value={usage.ai_requests_used || 0} />
            <MiniStat label="AI requests limit" value={usage.ai_requests_limit || 0} />
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-surface p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-[0.25em] text-slate-400">Agent Boost</h2>
            <StatusBadge status={agentBoost.enabled ? "active" : "paused"} />
          </div>
          <div className="mt-4 space-y-3">
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Mode</p>
              <p className="mt-2 text-sm text-slate-200">{agentBoost.mode || "local_build_90"}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">API key source</p>
              <p className="mt-2 text-sm text-slate-200">{agentBoost.api_key_source || "platform_backend"}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {plans.map((plan: any) => (
          <div key={plan.name} className="rounded-2xl border border-white/10 bg-surface p-5 transition-all hover:border-cyan-500/30">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-white">{plan.name}</h3>
                <p className="mt-1 text-sm text-slate-400">{plan.price}</p>
              </div>
              <StatusBadge status={plan.status || "available"} />
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-300">{plan.highlight}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {safeArray(plan.limits || []).map((limit: string) => (
                <span key={limit} className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-slate-300">
                  {limit}
                </span>
              ))}
            </div>
          </div>
        ))}
      </section>

      <section className="rounded-2xl border border-white/10 bg-surface p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-[0.25em] text-slate-400">History</h2>
          <span className="text-xs text-slate-500">capta do contrato de billing</span>
        </div>
        <div className="mt-4 space-y-3">
          {history.map((entry: any) => (
            <div key={`${entry.item}-${entry.date}`} className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
              <div>
                <p className="text-sm font-medium text-slate-100">{entry.item}</p>
                <p className="text-xs text-slate-500">{entry.status || "recorded"}</p>
              </div>
              <span className="text-xs text-slate-500">{entry.date}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function MetricCard({ label, value, icon }: { label: string; value: string | number; icon: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <div className="flex items-center justify-between text-slate-500">
        <span className="text-[11px] uppercase tracking-[0.25em]">{label}</span>
        {icon}
      </div>
      <p className="mt-3 text-sm font-semibold text-white">{value}</p>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">{label}</p>
      <p className="mt-2 text-lg font-semibold text-white">{value}</p>
    </div>
  );
}
