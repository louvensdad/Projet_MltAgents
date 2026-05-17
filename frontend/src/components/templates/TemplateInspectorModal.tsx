"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { ComponentType, ReactNode } from "react";
import { X, Sparkles, GitBranch, FileCode2, Layers3 } from "lucide-react";
import StaticSiteMiniPreview from "./previews/StaticSiteMiniPreview";
import BackendArchitectureMiniPreview from "./previews/BackendArchitectureMiniPreview";
import DashboardMiniPreview from "./previews/DashboardMiniPreview";
import MarketplaceMiniPreview from "./previews/MarketplaceMiniPreview";
import AiSaasMiniPreview from "./previews/AiSaasMiniPreview";
import TemplateArchitectureDiagram from "./previews/TemplateArchitectureDiagram";
import TemplateFileTreePreview from "./previews/TemplateFileTreePreview";

const PREVIEW_MAP: Record<string, ComponentType<{ template: any }>> = {
  static_site: StaticSiteMiniPreview,
  backend_architecture: BackendArchitectureMiniPreview,
  dashboard: DashboardMiniPreview,
  marketplace: MarketplaceMiniPreview,
  ai_saas: AiSaasMiniPreview,
};

export default function TemplateInspectorModal({
  isOpen,
  mode,
  template,
  onClose,
  onBuild,
}: {
  isOpen: boolean;
  mode: "preview" | "architecture" | "blueprint";
  template: any;
  onClose: () => void;
  onBuild: () => void | Promise<void>;
}) {
  const Preview = PREVIEW_MAP[template?.preview_type] || BackendArchitectureMiniPreview;
  const isArchitectureMode = mode === "architecture" || mode === "blueprint";

  return (
    <AnimatePresence>
      {isOpen && template && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-black/70 p-3 backdrop-blur-sm md:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="w-full max-w-6xl overflow-hidden rounded-3xl border border-white/10 bg-slate-950 shadow-2xl shadow-black/50"
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
          >
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500">{template.category}</p>
                <h3 className="text-lg font-semibold text-white">{template.name}</h3>
              </div>
              <button onClick={onClose} className="rounded-lg border border-white/10 bg-white/[0.04] p-2 text-slate-300 hover:bg-white/10">
                <X size={18} />
              </button>
            </div>

            <div className="grid gap-5 p-5 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2 text-[11px]">
                  <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-slate-300">{template.stack?.join(" + ")}</span>
                  <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-cyan-200">{template.status}</span>
                  <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-slate-300">{template.architecture_label}</span>
                </div>

                <Preview template={template} />

                <div className="grid gap-3 sm:grid-cols-2">
                  <TemplateArchitectureDiagram template={template} />
                  <TemplateFileTreePreview template={template} />
                </div>
              </div>

              <div className="space-y-4">
                <InfoCard
                  icon={<Layers3 size={16} />}
                  title="Blueprint"
                  body={template.blueprint?.overview || template.description}
                />
                <InfoCard
                  icon={<GitBranch size={16} />}
                  title="Prompt Master"
                  body={template.prompt_master_seed}
                />
                <InfoCard
                  icon={<FileCode2 size={16} />}
                  title="Security"
                  body={(template.security_requirements || []).join(", ")}
                />
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500">Modules</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(template.modules || []).map((module: string) => (
                      <span key={module} className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-slate-300">
                        {module}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 pt-2">
                  <button onClick={onBuild} className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary/90">
                    <Sparkles size={16} />
                    Build
                  </button>
                  <button onClick={onBuild} className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-slate-200 hover:bg-white/10">
                    Use template
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function InfoCard({ icon, title, body }: { icon: ReactNode; title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div className="flex items-center gap-2 text-slate-400">
        {icon}
        <span className="text-[10px] uppercase tracking-[0.25em]">{title}</span>
      </div>
      <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-200">{body}</p>
    </div>
  );
}
