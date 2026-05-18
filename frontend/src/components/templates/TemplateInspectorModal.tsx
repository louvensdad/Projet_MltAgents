"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { ComponentType, ReactNode } from "react";
import Image from "next/image";
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

function safeArray(arr: any): any[] {
  if (Array.isArray(arr)) return arr;
  if (arr && typeof arr === "object") return Object.values(arr);
  return [];
}

export default function TemplateInspectorModal({
  isOpen,
  mode,
  template,
  onClose,
  onUseTemplate,
  onGenerateNow,
}: {
  isOpen: boolean;
  mode: "preview" | "architecture" | "blueprint";
  template: any;
  onClose: () => void;
  onUseTemplate: () => void | Promise<void>;
  onGenerateNow: () => void | Promise<void>;
}) {
  const Preview = PREVIEW_MAP[template?.preview_type] || BackendArchitectureMiniPreview;
  const isArchitectureMode = mode === "architecture" || mode === "blueprint";
  const images = safeArray(template?.demo_images);
  const heroImage = template?.image || images[0];

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
                <div className="grid gap-3 sm:grid-cols-[1.2fr_0.8fr]">
                  <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-950/80">
                    {heroImage ? (
                      <div className="relative aspect-[16/9] min-h-[220px] w-full overflow-hidden">
                        <Image src={heroImage} alt={template.name} fill sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" />
                      </div>
                    ) : (
                      <div className="p-3">
                        <Preview template={template} />
                      </div>
                    )}
                  </div>
                  <div className="space-y-3">
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                      <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500">Preview visual</p>
                      <p className="mt-2 text-sm leading-6 text-slate-200">{template.preview_summary || template.description}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                      <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500">Stack</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {(template.stack || []).map((item: string) => (
                          <span key={item} className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-slate-300">{item}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <TemplateArchitectureDiagram template={template} />
                  <TemplateFileTreePreview template={template} />
                </div>

                {images.length > 1 && (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {images.slice(0, 3).map((src: string, index: number) => (
                      <div key={`${src}-${index}`} className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/70">
                        <div className="relative aspect-[16/9] w-full overflow-hidden">
                          <Image src={src} alt={`${template.name} preview ${index + 1}`} fill sizes="(min-width: 640px) 50vw, 100vw" className="object-cover" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500">Live preview</p>
                  <div className="mt-3 overflow-hidden rounded-2xl border border-white/10 bg-slate-950/80">
                    <iframe title={`${template.name} live preview`} srcDoc={template.preview_html} className="h-[260px] w-full" />
                  </div>
                </div>
                <div className="flex flex-wrap gap-3 pt-2">
                  <button onClick={onUseTemplate} className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-slate-200 hover:bg-white/10">
                    <Sparkles size={16} />
                    Usar template
                  </button>
                  <button onClick={onGenerateNow} className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary/90">
                    <Sparkles size={16} />
                    Gerar agora
                  </button>
                </div>
                {isArchitectureMode && (
                  <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-4 text-sm text-cyan-100">
                    {mode === "blueprint" ? "Blueprint completo e arquivos previstos." : "Arquitetura real e blueprint t?cnico."}
                  </div>
                )}
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
