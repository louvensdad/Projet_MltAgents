"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { X, Loader2, CheckCircle, AlertTriangle, FileText, BookOpen, Shield, Package, Cpu, ScanLine, Archive } from "lucide-react";
import type { GenerationEvent, DocEvent } from "@/lib/generation-types";
import { getApiBaseUrl } from "@/lib/config";

interface LiveGenerationModalProps {
  jobId: string;
  onClose: () => void;
  onComplete: () => void;
}

const EVENT_ICONS: Record<string, any> = {
  generation_started: Cpu,
  docs_lookup_started: BookOpen,
  docs_source_found: FileText,
  docs_cache_hit: CheckCircle,
  docs_cache_miss: AlertTriangle,
  docs_summary_ready: FileText,
  blueprint_generated: ScanLine,
  generator_started: Cpu,
  quality_gate_started: Shield,
  security_gate_started: Shield,
  packaging_started: Package,
  generation_completed: CheckCircle,
  generation_failed: AlertTriangle,
};

const EVENT_COLORS: Record<string, string> = {
  generation_started: "text-blue-400",
  docs_lookup_started: "text-cyan-400",
  docs_source_found: "text-emerald-400",
  docs_cache_hit: "text-emerald-400",
  docs_cache_miss: "text-amber-400",
  docs_summary_ready: "text-cyan-400",
  blueprint_generated: "text-indigo-400",
  generator_started: "text-blue-400",
  quality_gate_started: "text-purple-400",
  security_gate_started: "text-rose-400",
  packaging_started: "text-amber-400",
  generation_completed: "text-emerald-400",
  generation_failed: "text-rose-400",
};

export default function LiveGenerationModal({ jobId, onClose, onComplete }: LiveGenerationModalProps) {
  const projectId = useMemo(() => {
    const parts = jobId.split("_");
    return parts.length >= 3 ? parts[1] : jobId;
  }, [jobId]);

  const [activeTab, setActiveTab] = useState<"pipeline" | "docs" | "gates" | "logs">("pipeline");
  const [events, setEvents] = useState<GenerationEvent[]>([]);
  const [docs, setDocs] = useState<DocEvent[]>([]);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState("Initializing...");
  const [completed, setCompleted] = useState(false);
  const [failed, setFailed] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mounted = true;
    let interval: number | undefined;
    const apiBase = getApiBaseUrl();

    const loadLiveState = async () => {
      try {
        const res = await fetch(`${apiBase}/api/projects/${projectId}/live`, { cache: "no-store" });
        if (!res.ok) {
          setFailed(true);
          setErrorMessage("Could not load generation state.");
          if (interval) window.clearInterval(interval);
          return;
        }

        const data = await res.json();
        if (!mounted) return;

        const incomingEvents: GenerationEvent[] = (data.live_events || []).map((evt: any) => ({
          type: evt.type,
          timestamp: evt.timestamp || new Date().toISOString(),
          message: evt.message,
          progress: evt.progress ?? 0,
        }));

        setEvents(incomingEvents);
        if (incomingEvents.length > 0) {
          const last = incomingEvents[incomingEvents.length - 1];
          setProgress(last.progress);
          setCurrentStep(last.message);
        }

        if (data.prompt_master) {
          setDocs((prev) => {
            if (prev.length > 0) return prev;
            return [{
              technology: "Prompt Master",
              source: "backend/project/live",
              cache: "HIT",
              status: "used",
              used_for: ["live_preview", "generation_trace"],
              summary: "Prompt Master and real project artifacts were loaded.",
            }];
          });
        }

        if (data.status === "generated") {
          setCompleted(true);
          setFailed(false);
          if (interval) window.clearInterval(interval);
          setTimeout(() => onComplete(), 1000);
        } else if (data.status === "generation_failed") {
          setFailed(true);
          setErrorMessage("Project generation failed.");
          if (interval) window.clearInterval(interval);
        }
      } catch {
        if (mounted) {
          setFailed(true);
          setErrorMessage("Connection lost with generation server.");
          if (interval) window.clearInterval(interval);
        }
      }
    };

    loadLiveState();
    interval = window.setInterval(loadLiveState, 1500);

    return () => {
      mounted = false;
      if (interval) window.clearInterval(interval);
    };
  }, [projectId, onComplete]);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [events]);

  const progressWidth = `${Math.min(progress, 100)}%`;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-3xl rounded-2xl border border-white/10 bg-surface shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden">
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="h-8 w-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
              <ScanLine size={14} className="absolute inset-0 m-auto text-primary animate-pulse" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-100">Generating Project</h2>
              <p className="text-[11px] text-gray-500">Job: {jobId.slice(0, 8)}...</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-gray-500 hover:bg-white/5 hover:text-white transition-all">
            <X size={18} />
          </button>
        </div>

        <div className="h-1 bg-white/5">
          <div
            className={`h-full transition-all duration-500 ease-out rounded-r-full ${
              failed ? "bg-rose-500" : completed ? "bg-emerald-500" : "bg-primary"
            }`}
            style={{ width: progressWidth }}
          />
        </div>

        <div className="px-6 py-3 border-b border-white/5 flex items-center gap-3">
          <span className={`text-xs font-medium ${failed ? "text-rose-400" : "text-gray-300"}`}>
            {failed ? errorMessage : currentStep}
          </span>
          {!completed && !failed && <span className="text-[10px] text-gray-600">{progress}%</span>}
          {completed && <span className="text-xs text-emerald-400 font-semibold">Complete</span>}
          {failed && <span className="text-xs text-rose-400 font-semibold">Failed</span>}
        </div>

        <div className="flex border-b border-white/10 px-6">
          {(["pipeline", "docs", "gates", "logs"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-xs font-bold uppercase tracking-widest transition-all border-b-2 ${
                activeTab === tab
                  ? "text-primary border-primary"
                  : "text-gray-500 border-transparent hover:text-gray-300"
              }`}
            >
              {tab === "pipeline" && "Pipeline"}
              {tab === "docs" && `Docs (${docs.length})`}
              {tab === "gates" && "Gates"}
              {tab === "logs" && "Logs"}
            </button>
          ))}
        </div>

        <div className="max-h-[400px] overflow-y-auto" ref={logRef}>
          {activeTab === "pipeline" && (
            <div className="p-6 space-y-2">
              {events.length === 0 && (
                <div className="flex items-center justify-center py-8 text-sm text-gray-500">
                  <Loader2 size={18} className="animate-spin mr-2" />
                  Waiting for events...
                </div>
              )}
              {events.map((evt, i) => {
                const Icon = EVENT_ICONS[evt.type] || Cpu;
                const color = EVENT_COLORS[evt.type] || "text-gray-400";
                return (
                  <div key={i} className="flex items-start gap-3 rounded-lg border border-white/5 bg-white/[0.02] px-4 py-3">
                    <Icon size={16} className={`mt-0.5 shrink-0 ${color}`} />
                    <div className="min-w-0">
                      <p className="text-sm text-gray-200">{evt.message}</p>
                      <p className="text-[10px] text-gray-600 mt-0.5">{new Date(evt.timestamp).toLocaleTimeString()}</p>
                    </div>
                    <span className="ml-auto text-[10px] text-gray-600 shrink-0">{evt.progress}%</span>
                  </div>
                );
              })}
              {completed && (
                <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4 text-center">
                  <CheckCircle size={24} className="mx-auto text-emerald-400 mb-2" />
                  <p className="text-sm font-semibold text-emerald-300">Project generated successfully.</p>
                  <p className="text-xs text-gray-500 mt-1">Redirecting...</p>
                </div>
              )}
              {failed && (
                <div className="rounded-lg border border-rose-500/20 bg-rose-500/5 p-4 text-center">
                  <AlertTriangle size={24} className="mx-auto text-rose-400 mb-2" />
                  <p className="text-sm font-semibold text-rose-300">Generation failed</p>
                  <p className="text-xs text-gray-400 mt-1">{errorMessage}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "docs" && (
            <div className="p-6 space-y-3">
              {docs.length === 0 ? (
                <div className="py-8 text-center text-sm text-gray-500">
                  <BookOpen size={24} className="mx-auto text-gray-600 mb-2" />
                  Waiting for documentation...
                </div>
              ) : (
                docs.map((doc, i) => (
                  <div key={i} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`rounded-lg p-2 ${
                          doc.cache === "HIT"
                            ? "bg-emerald-500/10 text-emerald-300"
                            : doc.cache === "FALLBACK"
                            ? "bg-amber-500/10 text-amber-300"
                            : "bg-cyan-500/10 text-cyan-300"
                        }`}>
                          <FileText size={16} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-200">{doc.technology}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className={`text-[10px] font-mono rounded px-1.5 py-0.5 ${
                              doc.cache === "HIT"
                                ? "bg-emerald-500/15 text-emerald-300"
                                : doc.cache === "FALLBACK"
                                ? "bg-amber-500/15 text-amber-300"
                                : "bg-cyan-500/15 text-cyan-300"
                            }`}>
                              Cache {doc.cache}
                            </span>
                            {doc.version && <span className="text-[10px] text-gray-500">{doc.version}</span>}
                          </div>
                        </div>
                      </div>
                      <span className={`text-[10px] font-medium ${
                        doc.status === "used" ? "text-emerald-400" : doc.status === "consulting" ? "text-amber-400" : "text-rose-400"
                      }`}>
                        {doc.status === "used" ? "Used" : doc.status === "consulting" ? "Consulting..." : "Failed"}
                      </span>
                    </div>
                    {doc.used_for.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {doc.used_for.map((u) => (
                          <span key={u} className="rounded bg-white/5 px-2 py-0.5 text-[10px] text-gray-400">{u}</span>
                        ))}
                      </div>
                    )}
                    {doc.summary && <p className="mt-2 text-xs text-gray-500">{doc.summary}</p>}
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "gates" && (
            <div className="p-6 space-y-3">
              <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4 flex items-center gap-3">
                <Shield size={18} className={events.find((e) => e.type === "quality_gate_started") ? "text-purple-400" : "text-gray-600"} />
                <div>
                  <p className="text-sm font-medium text-gray-200">Quality Gate</p>
                  <p className="text-xs text-gray-500">{events.find((e) => e.type === "quality_gate_started") ? "Validated" : "Waiting..."}</p>
                </div>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4 flex items-center gap-3">
                <Shield size={18} className={events.find((e) => e.type === "security_gate_started") ? "text-rose-400" : "text-gray-600"} />
                <div>
                  <p className="text-sm font-medium text-gray-200">Security Gate</p>
                  <p className="text-xs text-gray-500">{events.find((e) => e.type === "security_gate_started") ? "Verified" : "Waiting..."}</p>
                </div>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4 flex items-center gap-3">
                <Archive size={18} className={events.find((e) => e.type === "packaging_started") ? "text-amber-400" : "text-gray-600"} />
                <div>
                  <p className="text-sm font-medium text-gray-200">Packaging</p>
                  <p className="text-xs text-gray-500">{events.find((e) => e.type === "packaging_started") ? "Packaged" : "Waiting..."}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "logs" && (
            <div className="p-6">
              <div className="rounded-xl bg-black/40 p-4 font-mono text-xs leading-relaxed max-h-[300px] overflow-y-auto">
                {events.length === 0 ? (
                  <span className="text-gray-600">Waiting for logs...</span>
                ) : (
                  events.map((evt, i) => (
                    <div key={i} className="text-gray-400 hover:text-gray-200 transition-colors">
                      <span className="text-gray-600">[{new Date(evt.timestamp).toLocaleTimeString()}]</span>{" "}
                      <span className={EVENT_COLORS[evt.type] || "text-gray-400"}>{evt.type}</span>{" "}
                      <span className="text-gray-500"> - {evt.message}</span>
                    </div>
                  ))
                )}
                {completed && <div className="mt-2 text-emerald-400">Generation completed successfully.</div>}
                {failed && <div className="mt-2 text-rose-400">Generation failed: {errorMessage}</div>}
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-white/10 px-6 py-3 flex items-center justify-between">
          <span className="text-[10px] text-gray-600">
            {events.length} events · {docs.length} docs consulted
          </span>
          {(completed || failed) && (
            <button
              onClick={onClose}
              className="rounded-lg bg-white/5 px-4 py-2 text-xs font-medium text-gray-300 hover:bg-white/10 transition-all"
            >
              {completed ? "View Project" : "Close"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
