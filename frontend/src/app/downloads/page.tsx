"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Download, FolderOpen, LayoutGrid, Loader2, Lock, ShieldCheck, Sparkles } from "lucide-react";
import { usePreferences } from "@/context/PreferencesContext";
import { API_BASE } from "@/lib/config";
import AnimatedBadge from "@/components/premium/AnimatedBadge";
import EmptyState3D from "@/components/premium/EmptyState3D";
import EngineNodeGraph from "@/components/premium/EngineNodeGraph";
import HolographicCard from "@/components/premium/HolographicCard";
import MetricOrb from "@/components/premium/MetricOrb";
import SectionHeader from "@/components/premium/SectionHeader";
import { DownloadStatusCard, DownloadLoadingModal } from "@/components/ui/DownloadStatusCard";
import { dispatchLdcnAvatarEvent } from "@/components/ldcn/avatar/ldcnAvatarEvents";

interface Project {
  id: string;
  name: string;
  type: string;
  stack: string;
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

export default function DownloadsPage() {
  const { t } = usePreferences();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadInfo, setDownloadInfo] = useState<DownloadInfo | null>(null);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);

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

  const handleDownloadClick = async (projectId: string, projectName: string) => {
    setDownloadLoading(true);
    setShowDownloadModal(true);

    try {
      const response = await fetch(`${API_BASE}/api/downloads/${projectId}`);
      const data = await response.json();

      if (!response.ok) {
        if (typeof window !== "undefined") {
          window.localStorage.setItem("ldcn_download_status", "failed");
          window.localStorage.setItem("ldcn_last_error", data.detail || data.error || data.message || "Error fetching project info");
          window.dispatchEvent(new Event("ldcn:context-update"));
        }
        dispatchLdcnAvatarEvent({
          type: "download_failed",
          route: "/downloads",
          source: "downloads-page",
          message: "Esse erro parece vir do download.",
        });
        setDownloadInfo({
          project_id: projectId,
          project_name: projectName,
          file_name: `${projectName.replace(/ /g, "_")}_generated_by_Ldcn.zip`,
          file_size_bytes: 0,
          file_size_human: "N/A",
          security_status: "failed",
          message: data.detail || data.error || data.message || "Error fetching project info",
        });
      } else {
        if (typeof window !== "undefined") {
          window.localStorage.setItem("ldcn_download_status", "ready");
          window.localStorage.removeItem("ldcn_last_error");
          window.dispatchEvent(new Event("ldcn:context-update"));
        }
        setDownloadInfo(data);
      }
    } catch {
      if (typeof window !== "undefined") {
        window.localStorage.setItem("ldcn_download_status", "failed");
        window.localStorage.setItem("ldcn_last_error", "Connection error");
        window.dispatchEvent(new Event("ldcn:context-update"));
      }
      dispatchLdcnAvatarEvent({
        type: "download_failed",
        route: "/downloads",
        source: "downloads-page",
        message: "Esse erro parece vir do download.",
      });
      setDownloadInfo({
        project_id: projectId,
        project_name: projectName,
        file_name: `${projectName.replace(/ /g, "_")}_generated_by_Ldcn.zip`,
        file_size_bytes: 0,
        file_size_human: "N/A",
        security_status: "failed",
        message: "Connection error",
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

  const securityNodes = [
    { name: "Artifact scan", status: "online", hint: "ZIP integrity and secret scan" },
    { name: "Payment gate", status: "live", hint: `${paidProjects.length} unlocked projects` },
    { name: "Delivery", status: "ready", hint: `${lockedProjects.length} awaiting payment` },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 lg:py-10">
      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <HolographicCard className="p-6 md:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <AnimatedBadge tone="emerald">artifact vault</AnimatedBadge>
            <AnimatedBadge tone="cyan">security gate</AnimatedBadge>
          </div>
          <div className="mt-6 max-w-3xl">
            <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-slate-500">Delivery surface</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white md:text-5xl">Downloads</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 md:text-base">
              Projects available for download with artifact metadata, security verification, and payment state.
            </p>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <MetricOrb label="Ready" value={paidProjects.length} icon={<CheckCircle2 size={16} />} accent="emerald" />
            <MetricOrb label="Locked" value={lockedProjects.length} icon={<Lock size={16} />} accent="violet" />
            <MetricOrb label="Total" value={projects.length} icon={<LayoutGrid size={16} />} accent="cyan" />
            <MetricOrb label="Security" value="Live" icon={<ShieldCheck size={16} />} accent="emerald" />
          </div>
        </HolographicCard>

        <div className="space-y-5">
          <HolographicCard className="p-6">
            <SectionHeader
              eyebrow="delivery"
              title="Artifact security mesh"
              subtitle="Each download is gated by payment state and ZIP verification before release."
            />
            <div className="mt-5">
              <EngineNodeGraph nodes={securityNodes} />
            </div>
          </HolographicCard>

          <HolographicCard className="p-6">
            <p className="text-[10px] uppercase tracking-[0.35em] text-slate-500">Quick actions</p>
            <div className="mt-4 grid gap-3">
              <Link href="/projects" className="rounded-3xl border border-white/10 bg-white/[0.04] px-4 py-4 text-sm font-semibold text-slate-200 transition-all hover:bg-white/[0.08]">
                Open project portfolio
              </Link>
              <Link href="/wizard" className="rounded-3xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-4 text-sm font-semibold text-cyan-200 transition-all hover:bg-cyan-500/20">
                Create new project
              </Link>
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
          title="No downloadable artifacts"
          description="Generate and pay for a project first to unlock the artifact vault."
          actionHref="/wizard"
          actionLabel="Create first project"
        />
      ) : (
        <div className="space-y-8">
          <section className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-500">
                Ready for download
              </h2>
              <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-400">
                {paidProjects.length} unlocked
              </span>
            </div>
            <div className="grid gap-5 lg:grid-cols-2">
              {paidProjects.map((project) => (
                <HolographicCard key={project.id} className="p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-2">
                      <AnimatedBadge tone="emerald">ready</AnimatedBadge>
                      <h3 className="text-xl font-semibold text-white">{project.name}</h3>
                      <p className="text-sm text-slate-400">{project.stack}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-slate-400">
                      <Download size={18} />
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                      <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">Type</p>
                      <p className="mt-2 text-sm text-white">{project.type?.toUpperCase()}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                      <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">Delivery</p>
                      <p className="mt-2 text-sm text-white">{project.download_status || "ready"}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                      <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">Created</p>
                      <p className="mt-2 text-sm text-white">{new Date(project.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => handleDownloadClick(project.id, project.name)}
                      className="rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90"
                    >
                      <Download size={14} className="inline mr-1" />
                      Download .zip
                    </button>
                    <Link href={`/projects/${project.id}`} className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-slate-200 transition-all hover:bg-white/[0.08]">
                      Open project
                    </Link>
                  </div>
                </HolographicCard>
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-500">
                Awaiting payment
              </h2>
              <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-400">
                {lockedProjects.length} locked
              </span>
            </div>
            <div className="grid gap-5 lg:grid-cols-2">
              {lockedProjects.map((project) => (
                <HolographicCard key={project.id} className="p-6 opacity-90">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-2">
                      <AnimatedBadge tone="violet">locked</AnimatedBadge>
                      <h3 className="text-xl font-semibold text-white">{project.name}</h3>
                      <p className="text-sm text-slate-400">{project.stack}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-slate-400">
                      <Lock size={18} />
                    </div>
                  </div>

                  <div className="mt-5 rounded-3xl border border-white/10 bg-black/25 p-4">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">Status</p>
                    <p className="mt-2 text-sm leading-7 text-slate-300">
                      Payment is required before artifact release. After checkout, this project becomes available in the vault.
                    </p>
                  </div>

                  <div className="mt-5 flex flex-wrap items-center gap-2">
                    <Link href={`/projects/${project.id}/checkout`} className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-3 text-sm font-semibold text-cyan-200 transition-all hover:bg-cyan-500/20">
                      Pay to unlock
                    </Link>
                    <Link href={`/projects/${project.id}`} className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-slate-200 transition-all hover:bg-white/[0.08]">
                      Open project
                    </Link>
                  </div>
                </HolographicCard>
              ))}
            </div>
          </section>
        </div>
      )}

      {showDownloadModal && downloadInfo && (
        <DownloadStatusCard info={downloadInfo} onDownload={handleDownloadNow} onClose={() => {
          setShowDownloadModal(false);
          setDownloadInfo(null);
        }} loading={downloadLoading} />
      )}

      {showDownloadModal && downloadLoading && !downloadInfo && <DownloadLoadingModal message={t("modals.download_preparing")} />}
    </div>
  );
}
