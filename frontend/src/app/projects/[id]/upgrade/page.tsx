"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CreditCard, History, LayoutGrid, Loader2, Plus, Sparkles, Terminal, Zap, AlertTriangle, RefreshCw, Clock, CheckCircle, ChevronUp, ChevronDown } from "lucide-react";
import { usePreferences } from "@/context/PreferencesContext";
import { getApiBaseUrl } from "@/lib/config";
import AnimatedBadge from "@/components/premium/AnimatedBadge";
import HolographicCard from "@/components/premium/HolographicCard";
import MetricOrb from "@/components/premium/MetricOrb";
import SectionHeader from "@/components/premium/SectionHeader";

const UPGRADE_CATALOG = [
  { id: "connect_frontend_backend", price: "R$ 19,90", tier: "simples" },
  { id: "add_external_api",         price: "R$ 49,90", tier: "médio" },
  { id: "add_feature",              price: "R$ 49,90", tier: "médio" },
  { id: "add_entity_crud",          price: "R$ 49,90", tier: "médio" },
  { id: "add_automation",           price: "R$ 49,90", tier: "médio" },
  { id: "add_agent",                price: "R$ 99,90", tier: "avançado" },
  { id: "add_authentication",       price: "R$ 49,90", tier: "médio" },
  { id: "add_payment",              price: "R$ 99,90", tier: "avançado" },
  { id: "improve_design_ux",        price: "R$ 19,90", tier: "simples" },
  { id: "fix_configuration",        price: "R$ 19,90", tier: "simples" },
  { id: "generate_extra_docs",      price: "R$ 19,90", tier: "simples" },
];

const TIER_COLOR: Record<string, string> = {
  simples:  "bg-green-500/10 text-green-400 border-green-500/20",
  médio:    "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  avançado: "bg-purple-500/10 text-purple-400 border-purple-500/20",
};

export default function UpgradePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { id } = params;
  const { t, lang } = usePreferences();

  const [selected, setSelected] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [upgrades, setUpgrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [expandedLog, setExpandedLog] = useState<string | null>(null);

  const fetchUpgrades = useCallback(() => {
    fetch(`${getApiBaseUrl()}/api/projects/${id}/upgrades`)
      .then(r => r.json())
      .then(d => setUpgrades(d.upgrades || []));
  }, [id]);

  useEffect(() => {
    fetchUpgrades();
  }, [fetchUpgrades]);

  const handleRequest = async () => {
    if (!selected) return;
    setLoading(true);
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/projects/${id}/upgrades/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ upgrade_type: selected, description })
      });
      if (!res.ok) throw new Error(await res.text());
      setSelected(null);
      setDescription("");
      fetchUpgrades();
    } catch (e: any) {
      alert("Erro: " + e.message);
    }
    setLoading(false);
  };

  const handleMockPay = async (upgradeId: string) => {
    setApplyingId(upgradeId + "_pay");
    await fetch(`${getApiBaseUrl()}/api/projects/${id}/upgrades/mock-confirm`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ upgrade_id: upgradeId })
    });
    setApplyingId(null);
    fetchUpgrades();
  };

  const handleApply = async (upgradeId: string) => {
    setApplyingId(upgradeId + "_apply");
    const res = await fetch(`${getApiBaseUrl()}/api/projects/${id}/upgrades/apply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ upgrade_id: upgradeId })
    });
    setApplyingId(null);
    fetchUpgrades();
    if (!res.ok) alert("Erro ao aplicar upgrade. Ver log.");
  };

  const selectedCatalog = UPGRADE_CATALOG.find(u => u.id === selected);

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 lg:py-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <HolographicCard className="p-6 md:p-8">
        <div className="flex flex-wrap items-center gap-2">
          <AnimatedBadge tone="cyan">upgrade studio</AnimatedBadge>
          <AnimatedBadge tone="violet">delivery backlog</AnimatedBadge>
        </div>
        <div className="mt-5 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <button onClick={() => router.back()} className="mb-4 flex items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-gray-200">
              <ArrowLeft size={16} /> {t("common.back")}
            </button>
            <div className="flex items-center gap-4">
              <div className="rounded-xl border border-purple-500/20 bg-purple-500/10 p-3 shadow-lg shadow-purple-500/10">
                <Zap size={32} className="text-purple-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">{t("upgrade.title")}</h1>
                <p className="text-gray-400">{t("upgrade.subtitle")} {t("upgrade.project")}: <code className="font-mono text-primary">{id}</code></p>
              </div>
            </div>
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <MetricOrb label="Upgrades" value={upgrades.length} accent="cyan" />
            <MetricOrb label="Selected" value={selected || "-"} accent="violet" />
            <MetricOrb label="State" value={selected ? "Draft" : "Idle"} accent="emerald" />
          </div>
        </div>
      </HolographicCard>

      <HolographicCard className="p-6 space-y-6">
        <SectionHeader eyebrow="catalog" title="Upgrade catalog" subtitle="Request and apply enhancements with clear operational status." />
        <div className="absolute top-0 right-0 p-6 opacity-[0.03] pointer-events-none">
          <Zap size={150} />
        </div>

        <h2 className="text-lg font-bold text-foreground">{t("upgrade.request_new")}</h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {UPGRADE_CATALOG.map(item => (
            <div
              key={item.id}
              onClick={() => setSelected(item.id)}
              className={`cursor-pointer rounded-xl border p-4 transition-all ${
                selected === item.id
                  ? "border-primary bg-primary/10 shadow-[0_0_15px_rgba(59,130,246,0.15)] ring-1 ring-primary/30"
                  : "border-border hover:border-gray-700 hover:bg-white/5"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className={`text-sm font-bold ${selected === item.id ? "text-primary" : "text-foreground"}`}>{t(`upgrade.catalog.${item.id}`)}</p>
                  <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-gray-500">{item.tier}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className={`text-sm font-bold ${selected === item.id ? "text-primary" : "text-gray-300"}`}>{item.price}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {selected && (
          <div className="space-y-4 border-t border-border pt-6 animate-in slide-in-from-top-2 duration-300">
            <div className="flex items-center justify-between rounded-xl border border-primary/20 bg-primary/5 p-4">
              <p className="text-sm text-gray-300">
                {t("common.status")}: <strong className="text-primary">{t(`upgrade.catalog.${selected}`)}</strong>
              </p>
              <span className="font-bold text-primary">{selectedCatalog?.price}</span>
            </div>
            <textarea
              rows={3}
              placeholder={t("upgrade.placeholder")}
              className="w-full rounded-xl border border-border bg-black/20 px-4 py-3 text-sm text-white shadow-inner transition-all focus:border-primary focus:outline-none"
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
            <div className="flex items-start gap-3 rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-3 text-[11px] leading-relaxed text-yellow-500">
              <AlertTriangle size={16} className="shrink-0" />
              <span>{t("upgrade.disclaimer")}</span>
            </div>
            <button
              onClick={handleRequest}
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-8 py-3 font-bold text-white shadow-lg shadow-primary/20 transition-all hover:bg-blue-600 disabled:opacity-50 active:scale-95 md:w-auto"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : <Zap size={18} />}
              {t("upgrade.request_new")}
            </button>
          </div>
        )}
      </HolographicCard>

      {/* Histórico de Upgrades */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">{t("upgrade.history")}</h2>
          <button onClick={fetchUpgrades} className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-primary transition-colors uppercase tracking-widest">
            <RefreshCw size={12} /> {t("projects.refresh")}
          </button>
        </div>

        {upgrades.length === 0 ? (
          <div className="text-center py-16 bg-surface/30 border border-dashed border-border rounded-2xl text-gray-600">
            <Clock size={40} className="mx-auto mb-4 opacity-20" />
            <p className="font-medium">{t("upgrade.no_upgrades")}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {[...upgrades].reverse().map((u: any) => (
              <HolographicCard key={u.upgrade_id} className="p-6 space-y-4">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="space-y-1">
                    <p className="font-bold text-lg text-foreground">{t(`upgrade.catalog.${u.upgrade_type}`) || u.upgrade_label}</p>
                     {u.description && <p className="text-sm text-gray-400 italic">&quot;{u.description}&quot;</p>}
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                      {new Date(u.created_at).toLocaleString(lang === "pt" ? "pt-BR" : "en-US")} · ID: <code className="text-primary/70">{u.upgrade_id}</code>
                    </p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="font-black text-primary text-lg">R$ {u.price?.toFixed(2)}</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter border ${TIER_COLOR[u.tier] || ""}`}>{u.tier}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between flex-wrap gap-4 pt-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-300">
                      {t(`upgrade.status.${u.upgrade_status}`) || u.upgrade_status}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    {u.payment_status === "pending_payment" && (
                      <button
                        onClick={() => handleMockPay(u.upgrade_id)}
                        disabled={applyingId === u.upgrade_id + "_pay"}
                        className="flex items-center gap-2 px-4 py-2 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 border border-yellow-500/30 rounded-lg text-sm font-bold transition-all disabled:opacity-50"
                      >
                        {applyingId === u.upgrade_id + "_pay" ? <Loader2 className="animate-spin" size={14} /> : <CreditCard size={14} />}
                        {t("upgrade.simulated_payment")}
                      </button>
                    )}

                    {u.payment_status === "paid" && u.upgrade_status !== "applied" && (
                      <button
                        onClick={() => handleApply(u.upgrade_id)}
                        disabled={applyingId === u.upgrade_id + "_apply"}
                        className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-blue-600 text-white rounded-lg text-sm font-bold transition-all disabled:opacity-50 shadow-lg shadow-primary/20"
                      >
                        {applyingId === u.upgrade_id + "_apply" ? <Loader2 className="animate-spin" size={14} /> : <Zap size={14} />}
                        {t("upgrade.apply")}
                      </button>
                    )}

                    {u.upgrade_status === "applied" && (
                      <span className="flex items-center gap-2 text-green-500 text-sm font-bold bg-green-500/10 px-3 py-1.5 rounded-lg border border-green-500/20">
                        <CheckCircle size={16} /> {t("upgrade.applied")}
                      </span>
                    )}
                  </div>
                </div>

                {u.log && u.log.length > 0 && (
                  <div className="pt-4 border-t border-white/5">
                    <button
                      onClick={() => setExpandedLog(expandedLog === u.upgrade_id ? null : u.upgrade_id)}
                      className="flex items-center gap-2 text-[10px] font-bold text-gray-500 hover:text-gray-300 transition-colors uppercase tracking-widest"
                    >
                      {expandedLog === u.upgrade_id ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                      {t("upgrade.view_log")} ({u.log.length})
                    </button>
                    {expandedLog === u.upgrade_id && (
                      <pre className="mt-3 bg-black/60 border border-white/5 p-4 rounded-xl text-[10px] text-green-400 font-mono overflow-x-auto shadow-inner leading-relaxed">
                        {u.log.join("\n")}
                      </pre>
                    )}
                  </div>
                )}
              </HolographicCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
