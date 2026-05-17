"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle, CreditCard, Download, FileText, Folder, Loader2, Lock, Sparkles, AlertTriangle } from "lucide-react";
import { usePreferences } from "@/context/PreferencesContext";
import { DownloadStatusCard } from "@/components/ui/DownloadStatusCard";
import { API_BASE } from "@/lib/config";

const PLANS = [
  { id: "basic", price: "R$ 29,90" },
  { id: "with_docs", price: "R$ 49,90" },
  { id: "with_support", price: "R$ 79,90" },
];

export default function CheckoutPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { id } = params;
  const { t } = usePreferences();
  const [project, setProject] = useState<any>(null);
  const [selectedPlan, setSelectedPlan] = useState("basic");
  const [paymentStatus, setPaymentStatus] = useState<"pending" | "processing" | "paid">("pending");
  const [loading, setLoading] = useState(false);
  const [downloadInfo, setDownloadInfo] = useState<any>(null);
  const [downloadLoading, setDownloadLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE}/api/projects/${id}/details`)
      .then(r => r.json())
      .then(data => {
        setProject(data);
        if (data.payment_status === "paid") {
          setPaymentStatus("paid");
        }
      })
      .catch(() => setProject({ name: id, type: "saas", stack: "FastAPI" }))
      .finally(() => setLoading(false));
  }, [id]);

  const handleMockPayment = async () => {
    setLoading(true);
    setPaymentStatus("processing");

    // Simula delay de gateway
    await new Promise(r => setTimeout(r, 2000));

    try {
      const res = await fetch(`${API_BASE}/api/payments/mock-confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project_id: id })
      });
      if (res.ok) {
        setPaymentStatus("paid");
        // Atualiza o projeto com novo payment_status
        setProject((prev: any) => ({ ...prev, payment_status: "paid" }));
        router.push(`/downloads/${id}`);
      } else {
        const data = await res.json();
        alert(`Erro: ${data.detail || "Não foi possível confirmar o pagamento."}`);
        setPaymentStatus("pending");
      }
    } catch (e) {
      console.error("Payment error:", e);
      setPaymentStatus("pending");
      alert("Erro de conexão ao simular pagamento. Verifique se o backend está rodando.");
    }
    setLoading(false);
  };

  const handleDownload = async () => {
    setDownloadLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/downloads/${id}`);
      const data = await res.json();

      if (res.ok && data.security_status === "passed") {
        setDownloadInfo(data); // showDownloadCard derivado de downloadInfo
      } else {
        const msg = data.detail || data.message || data.error || "Erro ao preparar download.";
        alert(msg);
      }
    } catch (e) {
      console.error("Download info error:", e);
      alert("Erro ao conectar com o servidor para preparar download.");
    }
    setDownloadLoading(false);
  };

  const handleActualDownload = () => {
    const downloadUrl = `${API_BASE}/api/downloads/${id}/download`;
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.setAttribute("download", `${project?.name || id}.zip`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setDownloadInfo(null); // fecha o card
  };

  const handleCloseDownloadCard = () => {
    setDownloadInfo(null); // showDownloadCard derivado
    setDownloadLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="p-3 bg-green-500/10 rounded-xl border border-green-500/20 shadow-lg shadow-green-500/10">
          <CheckCircle size={32} className="text-green-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("checkout.success")}</h1>
          <p className="text-gray-500 font-medium">{t("checkout.subtitle")}</p>
        </div>
      </div>

      {/* Project Info Cards */}
      {project && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Sparkles, label: t("common.name"), value: project.name || id },
            { icon: Folder, label: t("common.type"), value: project.type || "saas" },
            { icon: FileText, label: t("common.stack"), value: project.stack || "FastAPI" },
            { icon: CreditCard, label: t("common.status"), value: paymentStatus === "paid" ? `✅ ${t("upgrade.status.paid")}` : `⏳ ${t("upgrade.status.pending_payment")}` },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="p-4 bg-surface border border-border rounded-xl shadow-sm hover:border-gray-700 transition-all">
              <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1">{label}</p>
              <p className="text-foreground font-bold text-sm truncate">{value}</p>
            </div>
          ))}
        </div>
      )}

      {paymentStatus !== "paid" ? (
        <>
          {/* Planos */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-foreground">{t("checkout.choose_plan")}</h2>
            <div className="space-y-3">
              {PLANS.map(plan => (
                <div
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan.id)}
                  className={`p-5 rounded-2xl border cursor-pointer transition-all flex justify-between items-center ${
                    selectedPlan === plan.id
                      ? "bg-primary/10 border-primary shadow-lg shadow-primary/10 ring-1 ring-primary/30"
                      : "bg-surface border-border hover:bg-white/5 hover:border-gray-700"
                  }`}
                >
                  <div className="space-y-1">
                    <h3 className={`font-bold ${selectedPlan === plan.id ? "text-primary" : "text-foreground"}`}>{t(`checkout.plan_${plan.id}_label`)}</h3>
                    <p className="text-xs text-gray-500 font-medium">{t(`checkout.plan_${plan.id}_desc`)}</p>
                  </div>
                  <span className={`text-xl font-black ${selectedPlan === plan.id ? "text-primary" : "text-gray-400"}`}>{plan.price}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Aviso MOCK */}
          <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl text-yellow-500 text-[11px] font-bold uppercase tracking-wider flex items-start gap-3">
            <AlertTriangle size={18} className="shrink-0" />
            <span>{t("upgrade.disclaimer")}</span>
          </div>

          {/* Botão de pagamento */}
          <button
            onClick={handleMockPayment}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-8 py-5 bg-primary hover:bg-blue-600 text-white font-black text-lg rounded-2xl transition-all shadow-xl shadow-primary/20 disabled:opacity-50 active:scale-95"
          >
            {loading ? <Loader2 className="animate-spin" size={24} /> : <CreditCard size={24} />}
            {loading ? t("common.loading") : t("upgrade.simulated_payment")}
          </button>
        </>
      ) : (
        /* Estado: PAGO - Liberar download */
        <div className="space-y-6 animate-in zoom-in-95 duration-500">
          <div className="p-8 bg-green-500/10 border border-green-500/20 rounded-3xl text-center space-y-4 shadow-xl shadow-green-500/5">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/30">
              <CheckCircle size={48} className="text-green-500" />
            </div>
            <h2 className="text-2xl font-black text-green-500 uppercase tracking-tighter">{t("upgrade.status.paid")}!</h2>
            <p className="text-gray-400 font-medium max-w-sm mx-auto leading-relaxed">{t("checkout.download_ready")}</p>
          </div>

          <button
            onClick={handleDownload}
            className="w-full flex items-center justify-center gap-3 px-8 py-5 bg-green-500 hover:bg-green-400 text-black font-black text-lg rounded-2xl transition-all shadow-xl shadow-green-500/20 active:scale-95"
          >
            <Download size={24} />
            {t("checkout.download_zip")}
          </button>

          <button
            onClick={() => router.push("/projects")}
            className="w-full px-8 py-4 bg-white/5 hover:bg-white/10 text-gray-400 font-bold rounded-2xl border border-white/10 transition-all uppercase text-xs tracking-widest active:scale-95"
          >
            {t("sidebar.projects")}
          </button>
        </div>
      )}

      {/* Download Status Card Modal - visibilidade derivada de downloadInfo */}
      {downloadInfo && (
        <DownloadStatusCard
          info={downloadInfo}
          onDownload={handleActualDownload}
          onClose={handleCloseDownloadCard}
          loading={downloadLoading}
        />
      )}
    </div>
  );
}
