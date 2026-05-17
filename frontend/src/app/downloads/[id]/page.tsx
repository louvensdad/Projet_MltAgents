"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Download, Loader2, ShieldCheck, ArrowLeft } from "lucide-react";
import { API_BASE } from "@/lib/config";
import AnimatedBadge from "@/components/premium/AnimatedBadge";
import HolographicCard from "@/components/premium/HolographicCard";
import MetricOrb from "@/components/premium/MetricOrb";

export default function DownloadDetailPage({ params }: { params: { id: string } }) {
  const [info, setInfo] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    let active = true;
    fetch(`${API_BASE}/api/downloads/${params.id}`)
      .then(async (res) => {
        const data = await res.json();
        if (!active) return;
        if (!res.ok) {
          setError(data.message || data.detail || "Falha ao carregar o download.");
        } else {
          setInfo(data);
        }
      })
      .catch(() => {
        if (active) setError("Falha de conexão ao consultar o download.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [params.id]);

  const triggerDownload = () => {
    setDownloading(true);
    const link = document.createElement("a");
    link.href = `${API_BASE}/api/downloads/${params.id}/download`;
    link.setAttribute("download", info?.file_name || `${params.id}.zip`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => setDownloading(false), 1200);
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" size={34} /></div>;
  }

  if (error) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10">
        <Link href="/downloads" className="mb-6 inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white">
          <ArrowLeft size={16} /> Voltar
        </Link>
        <HolographicCard className="p-8">
          <p className="text-sm text-rose-200">{error}</p>
        </HolographicCard>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-10">
      <AnimatedBadge tone="cyan">artifact detail</AnimatedBadge>
      <Link href="/downloads" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white">
        <ArrowLeft size={16} /> Voltar para downloads
      </Link>
      <HolographicCard className="p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">Download Pipeline</p>
            <h1 className="mt-3 text-3xl font-bold text-white">{info.project_name}</h1>
            <p className="mt-2 text-sm text-gray-400">{info.message}</p>
          </div>
          <button
            onClick={triggerDownload}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3 font-bold text-white shadow-lg shadow-primary/25"
          >
            <Download size={16} /> Baixar ZIP
          </button>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Tamanho</p>
            <p className="mt-2 text-lg font-semibold text-white">{info.file_size_human}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Arquivos</p>
            <p className="mt-2 text-lg font-semibold text-white">{info.file_count}</p>
          </div>
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-300">Seguranca</p>
            <p className="mt-2 inline-flex items-center gap-2 text-lg font-semibold text-emerald-200"><ShieldCheck size={18} /> {info.security_status}</p>
          </div>
        </div>
      </HolographicCard>
    </div>
  );
}
