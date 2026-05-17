"use client";

import { CheckCircle, AlertTriangle, Download, Loader2, FileArchive, Shield, X } from "lucide-react";
import { motion } from "framer-motion";
import HolographicCard from "@/components/premium/HolographicCard";

interface DownloadInfo {
  project_id: string;
  project_name: string;
  file_name: string;
  file_size_bytes: number;
  file_size_human: string;
  file_count?: number;
  sha256?: string;
  security_status: string;
  message: string;
  generated_with?: string;
}

interface DownloadStatusCardProps {
  info: DownloadInfo;
  onDownload: () => void;
  onClose: () => void;
  loading?: boolean;
}

export function DownloadStatusCard({ info, onDownload, onClose, loading = false }: DownloadStatusCardProps) {
  const isSecure = info.security_status === "passed";

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <HolographicCard className="w-full max-w-2xl p-0">
        <div className="border-b border-white/10 p-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className={`rounded-2xl border border-white/10 p-2 ${isSecure ? "bg-emerald-500/10" : "bg-rose-500/10"}`}>
                {isSecure ? <CheckCircle size={24} className="text-emerald-400" /> : <AlertTriangle size={24} className="text-rose-400" />}
              </div>
              <div>
                <h3 className={`text-lg font-semibold ${isSecure ? "text-emerald-300" : "text-rose-300"}`}>
                  {isSecure ? "Download preparado" : "Download bloqueado"}
                </h3>
                <p className="mt-1 text-xs text-slate-400">{info.message}</p>
              </div>
            </div>
            <button onClick={onClose} className="rounded-full border border-white/10 bg-white/[0.04] p-2 text-slate-400 transition-all hover:bg-white/[0.08] hover:text-white">
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="space-y-4 p-6">
          <div className="flex items-center gap-3 rounded-3xl border border-white/10 bg-white/[0.03] p-4">
            <FileArchive size={20} className="text-cyan-300" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">{info.project_name}</p>
              <p className="truncate text-xs text-slate-500">{info.file_name}</p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">Tamanho</p>
              <p className="mt-2 text-sm font-semibold text-white">{info.file_size_human}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">Arquivos</p>
              <p className="mt-2 text-sm font-semibold text-white">{info.file_count || "N/A"}</p>
            </div>
          </div>

          <div className={`rounded-3xl border p-4 ${isSecure ? "border-emerald-500/20 bg-emerald-500/10" : "border-rose-500/20 bg-rose-500/10"}`}>
            <div className="flex items-center gap-2">
              <Shield size={16} className={isSecure ? "text-emerald-300" : "text-rose-300"} />
              <span className={`text-xs font-semibold ${isSecure ? "text-emerald-300" : "text-rose-300"}`}>
                Segurança: {isSecure ? "verificada" : "falhou"}
              </span>
            </div>
          </div>

          {info.sha256 && (
            <div className="rounded-3xl border border-white/10 bg-black/25 p-4">
              <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">Checksum SHA-256</p>
              <p className="mt-2 break-all font-mono text-xs text-slate-300">{info.sha256}</p>
            </div>
          )}

          {info.generated_with && (
            <p className="text-right text-[10px] font-semibold uppercase tracking-[0.35em] text-slate-500">
              {info.generated_with}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3 border-t border-white/10 p-6">
          <button
            onClick={onClose}
            className="flex-1 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-slate-300 transition-all hover:bg-white/[0.08]"
          >
            Fechar
          </button>
          {isSecure && (
            <button
              onClick={onDownload}
              disabled={loading}
              className={`flex flex-1 items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition-all ${
                loading ? "cursor-wait bg-slate-700 text-slate-400" : "bg-primary text-white shadow-lg shadow-primary/20 hover:bg-primary/90"
              }`}
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
              {loading ? "Preparando..." : "Baixar agora"}
            </button>
          )}
        </div>
      </HolographicCard>
    </div>
  );
}

export function DownloadLoadingModal({ message = "Preparando ZIP com segurança..." }: { message?: string }) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 350, damping: 30 }}
      >
        <HolographicCard className="p-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-cyan-500/20 bg-cyan-500/10">
            <Loader2 size={32} className="animate-spin text-cyan-300" />
          </div>
          <h3 className="mt-5 text-lg font-semibold text-white">Preparing download</h3>
          <p className="mt-2 text-sm text-slate-400">{message}</p>
          <div className="mt-6 h-1.5 overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-cyan-400 to-violet-500" />
          </div>
        </HolographicCard>
      </motion.div>
    </div>
  );
}
