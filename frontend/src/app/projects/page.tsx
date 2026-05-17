"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  CheckCircle2,
  CreditCard,
  Download,
  FolderOpen,
  LayoutGrid,
  Loader2,
  Lock,
  RefreshCw,
  Trash2,
  Zap,
} from "lucide-react";
import { usePreferences } from "@/context/PreferencesContext";
import { DownloadLoadingModal, DownloadStatusCard } from "@/components/ui/DownloadStatusCard";
import AnimatedBadge from "@/components/premium/AnimatedBadge";
import EngineNodeGraph from "@/components/premium/EngineNodeGraph";
import EmptyState3D from "@/components/premium/EmptyState3D";
import FloatingActionCard from "@/components/premium/FloatingActionCard";
import HolographicCard from "@/components/premium/HolographicCard";
import MetricOrb from "@/components/premium/MetricOrb";
import SectionHeader from "@/components/premium/SectionHeader";
import { API_BASE } from "@/lib/config";

interface Project {
  id: string;
  name: string;
  type: string;
  stack: string;
  path: string;
  payment_status: string;
  download_status: string;
  created_at: string;
}

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

function getStatusTone(status: string) {
  if (status === "paid") return "emerald";
  if (status === "generated") return "cyan";
  if (status === "downloaded") return "violet";
  return "amber";
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadInfo, setDownloadInfo] = useState<DownloadInfo | null>(null);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { t, lang } = usePreferences();

  const fetchProjects = () => {
    setLoading(true);
    fetch(`${API_BASE}/api/projects`)
      .then((response) => response.json())
      .then((data) => {
        setProjects(data.projects || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const paidProjects = useMemo(() => projects.filter((project) => project.payment_status === "paid"), [projects]);
  const lockedProjects = useMemo(() => projects.filter((project) => project.payment_status !== "paid"), [projects]);
  const downloadReady = useMemo(() => projects.filter((project) => project.download_status === "downloaded" || project.payment_status === "paid"), [projects]);

  const handleDownloadClick = async (projectId: string, projectName: string) => {
    setDownloadLoading(true);
    setShowDownloadModal(true);

    try {
      const response = await fetch(`${API_BASE}/api/downloads/${projectId}`);
      const data = await response.json();

      if (!response.ok) {
        setDownloadInfo({
          project_id: projectId,
          project_name: projectName,
          file_name: `${projectName.replace(/ /g, "_")}_generated_by_Ldcn.zip`,
          file_size_bytes: 0,
          file_size_human: "N/A",
          security_status: "failed",
          message: data.detail || data.error || data.message || "Erro ao obter informações",
        });
      } else {
        setDownloadInfo(data);
      }
    } catch {
      setDownloadInfo({
        project_id: projectId,
        project_name: projectName,
        file_name: `${projectName.replace(/ /g, "_")}_generated_by_Ldcn.zip`,
        file_size_bytes: 0,
        file_size_human: "N/A",
        security_status: "failed",
        message: "Erro de conexão",
      });
    } finally {
      setDownloadLoading(false);
    }
  };

  const handleDownloadNow = () => {
    if (!downloadInfo) return;
    setDownloadLoading(true);

    const downloadUrl = `${API_BASE}/api/downloads/${downloadInfo.project_id}/download`;
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.setAttribute("download", downloadInfo.file_name);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      setShowDownloadModal(false);
      setDownloadInfo(null);
      setDownloadLoading(false);
    }, 1800);
  };

  const handleCloseModal = () => {
    setShowDownloadModal(false);
    setDownloadInfo(null);
    setDownloadLoading(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    setDeleting(true);
    try {
      const response = await fetch(`${API_BASE}/api/projects/${deleteId}`, { method: "DELETE" });
      if (response.ok) {
        setProjects((current) => current.filter((project) => project.id !== deleteId));
        setDeleteId(null);
      } else {
        const data = await response.json();
        alert(data.detail || "Erro ao deletar projeto");
      }
    } catch {
      alert("Erro de conexão ao deletar");
    } finally {
      setDeleting(false);
    }
  };

  const pipelineNodes = [
    { name: "Projects", status: `${projects.length} total`, hint: "Visão do portfólio" },
    { name: "Paid", status: `${paidProjects.length} ready`, hint: "Cofre de artefatos desbloqueado" },
    { name: "Downloads", status: `${downloadReady.length} ready`, hint: "Portão de segurança + ZIP" },
    { name: "Upgrade", status: "live", hint: "AI boost e checkout disponíveis" },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 lg:py-10">
      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <HolographicCard className="p-6 md:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <AnimatedBadge tone="cyan">project vault</AnimatedBadge>
            <AnimatedBadge tone="violet">enterprise portfolio</AnimatedBadge>
          </div>
          <div className="mt-6 max-w-3xl">
            <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-slate-500">Workspace</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white md:text-5xl">{t("projects.title")}</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 md:text-base">{t("projects.subtitle")}</p>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <MetricOrb label="Projects" value={projects.length} icon={<LayoutGrid size={16} />} accent="cyan" />
            <MetricOrb label="Paid" value={paidProjects.length} icon={<CheckCircle2 size={16} />} accent="emerald" />
            <MetricOrb label="Downloads" value={downloadReady.length} icon={<Download size={16} />} accent="violet" />
            <MetricOrb label="Locked" value={lockedProjects.length} icon={<Lock size={16} />} accent="cyan" />
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              onClick={fetchProjects}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-[0_16px_40px_rgba(34,211,238,0.18)] transition-all hover:translate-y-[-1px]"
            >
              <RefreshCw size={16} />
              {t("projects.refresh")}
            </button>
            <Link href="/wizard" className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-slate-200 transition-all hover:bg-white/[0.08]">
              <Zap size={16} />
              {t("projects.create_first")}
            </Link>
          </div>
        </HolographicCard>

        <div className="space-y-5">
          <HolographicCard className="p-6">
            <SectionHeader
              eyebrow="pipeline"
              title="Project delivery mesh"
              subtitle="Projetos passam da geracao ao pagamento e download por uma unica superficie operacional."
            />
            <div className="mt-5">
              <EngineNodeGraph nodes={pipelineNodes} />
            </div>
          </HolographicCard>

          <HolographicCard className="p-6">
            <p className="text-[10px] uppercase tracking-[0.35em] text-slate-500">Ações rápidas</p>
            <div className="mt-4 grid gap-3">
              <FloatingActionCard href="/wizard" title="Criar projeto" description="Abrir o wizard de stack com orientação premium." icon={<FolderOpen size={18} />} />
              <FloatingActionCard href="/templates" title="Usar template" description="Começar de um blueprint real e contrato de geração." icon={<LayoutGrid size={18} />} />
            </div>
          </HolographicCard>
        </div>
      </section>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-primary" size={40} />
        </div>
      ) : projects.length === 0 ? (
        <EmptyState3D
          title="Nenhum projeto ainda"
          description="Crie o primeiro projeto gerado para popular o cofre de entrega e o pipeline de download."
          actionHref="/wizard"
          actionLabel={t("projects.create_first")}
        />
      ) : (
        <section className="space-y-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-500">Catálogo de projetos</h2>
            <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-400">
              {projects.length} itens
            </span>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            {projects.map((project) => (
              <HolographicCard key={project.id} className="p-6">
                <div className="flex flex-col gap-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <AnimatedBadge tone={getStatusTone(project.payment_status) as "cyan" | "violet" | "emerald"}>{project.payment_status}</AnimatedBadge>
                        <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-300">
                          {project.type?.toUpperCase()}
                        </span>
                      </div>
                      <h3 className="text-xl font-semibold text-white">{project.name}</h3>
                      <p className="text-sm text-slate-400">{project.stack}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-slate-400">
                      <LayoutGrid size={18} />
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                      <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">Stack</p>
                      <p className="mt-2 text-sm text-white">{project.stack}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                      <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">Status</p>
                      <p className="mt-2 text-sm text-white">{project.download_status || "ready"}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                      <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">Criado</p>
                      <p className="mt-2 text-sm text-white">{new Date(project.created_at).toLocaleString(lang === "pt" ? "pt-BR" : "en-US")}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
                    <div className="text-[10px] uppercase tracking-[0.3em] text-slate-500">
                      <code className="text-cyan-200">ID {project.id}</code>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <Link href={`/projects/${project.id}`} className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-semibold text-slate-200 transition-all hover:bg-white/[0.08]">
                        {t("projects.view_details")}
                      </Link>
                      <Link href={`/projects/${project.id}/upgrade`} className="rounded-2xl border border-violet-500/20 bg-violet-500/10 px-4 py-2.5 text-sm font-semibold text-violet-200 transition-all hover:bg-violet-500/20">
                        <Zap size={14} className="inline mr-1" /> {t("projects.upgrade")}
                      </Link>
                      {project.payment_status !== "paid" ? (
                        <Link href={`/projects/${project.id}/checkout`} className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-2.5 text-sm font-semibold text-cyan-200 transition-all hover:bg-cyan-500/20">
                          <CreditCard size={14} className="inline mr-1" /> {t("projects.pay")}
                        </Link>
                      ) : (
                        <button
                          onClick={() => handleDownloadClick(project.id, project.name)}
                          className="rounded-2xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90"
                        >
                          <Download size={14} className="inline mr-1" /> {t("projects.download")}
                        </button>
                      )}
                      <button
                        onClick={() => setDeleteId(project.id)}
                        className="rounded-2xl border border-white/10 bg-white/[0.04] p-2.5 text-slate-500 transition-all hover:border-red-500/20 hover:bg-red-500/10 hover:text-red-300"
                        title={t("projects.title_delete")}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </HolographicCard>
            ))}
          </div>
        </section>
      )}

      {showDownloadModal && downloadInfo && (
        <DownloadStatusCard info={downloadInfo} onDownload={handleDownloadNow} onClose={handleCloseModal} loading={downloadLoading} />
      )}

      {showDownloadModal && downloadLoading && !downloadInfo && <DownloadLoadingModal message={t("modals.download_preparing")} />}

      {deleteId && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <HolographicCard className="w-full max-w-md p-6">
            <div className="flex items-center gap-3 text-red-400">
              <AlertCircle size={24} />
              <h3 className="text-lg font-semibold">{t("modals.delete_title")}</h3>
            </div>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              {t("projects.delete_confirm")} <span className="font-semibold text-white">{projects.find((project) => project.id === deleteId)?.name}</span>? {t("projects.delete_cannot_undo")}
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                disabled={deleting}
                className="flex-1 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-slate-300 transition-all hover:bg-white/[0.08] disabled:opacity-50"
              >
                {t("modals.cancel")}
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 rounded-2xl bg-red-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-red-500/20 transition-all hover:bg-red-600 disabled:opacity-50"
              >
                {deleting ? <Loader2 size={16} className="inline animate-spin" /> : <Trash2 size={16} className="inline" />}{" "}
                {deleting ? t("common.deleting") : t("modals.delete_confirm")}
              </button>
            </div>
          </HolographicCard>
        </div>
      )}
    </div>
  );
}
