'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { Activity, Braces, Code2, Layers3, MonitorSmartphone, Sparkles } from 'lucide-react';
import { getApiBaseUrl } from '@/lib/config';
import AnimatedBadge from '@/components/premium/AnimatedBadge';
import HolographicCard from '@/components/premium/HolographicCard';
import SectionHeader from '@/components/premium/SectionHeader';
import EngineNodeGraph from '@/components/premium/EngineNodeGraph';
import LiveArchitecturePanel from '@/components/premium/LiveArchitecturePanel';

type LiveEvent = {
  type: string;
  timestamp?: string;
  message: string;
  progress?: number;
};

type LiveProjectState = {
  name?: string;
  stack?: string;
  live_events?: LiveEvent[];
  preview_html?: string;
  code_stream?: string;
  architecture_graph?: string;
  generated_files?: string[];
  status?: string;
};

const DEFAULT_PREVIEW = `<!doctype html>
<html lang="en">
  <body style="font-family:Inter,system-ui,sans-serif;background:#0f172a;color:#e2e8f0;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0">
    <div style="text-align:center;max-width:520px;padding:32px">
      <h1 style="margin:0 0 12px;font-size:28px">Awaiting generated preview</h1>
      <p style="margin:0;color:#94a3b8">The project preview will appear here once the live artifacts are available.</p>
    </div>
  </body>
</html>`;

export default function LiveEngineeringDashboard() {
  const params = useParams();
  const projectId = useMemo(() => {
    const value = params?.projectId;
    return Array.isArray(value) ? value[0] : value;
  }, [params]);

  const [project, setProject] = useState<LiveProjectState>({});
  const [logs, setLogs] = useState<string[]>(['[SYSTEM] Establishing secure connection to Orchestrator...']);
  const [code, setCode] = useState<string>('// Awaiting generation engine...\n');
  const [architecture, setArchitecture] = useState<string>('User -> Orchestrator -> Pending...');
  const [previewHtml, setPreviewHtml] = useState<string>(DEFAULT_PREVIEW);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  useEffect(() => {
    if (!projectId) return;

    const apiBase = getApiBaseUrl();
    let cancelled = false;

    const applyState = (data: LiveProjectState) => {
      if (cancelled) return;
      setProject(data);
      setArchitecture(data.architecture_graph || 'User -> Orchestrator -> API -> Workers -> Database');
      setCode(data.code_stream || data.generated_files?.join('\n') || '// No generated code found yet\n');
      setPreviewHtml(data.preview_html || DEFAULT_PREVIEW);

      const liveLogs = (data.live_events || []).map((event) => {
        const stamp = event.timestamp ? `[${new Date(event.timestamp).toLocaleTimeString()}] ` : '';
        return `${stamp}${event.type}: ${event.message}`;
      });
      if (liveLogs.length > 0) setLogs(liveLogs);
    };

    const refresh = async () => {
      try {
        const res = await fetch(`${apiBase}/api/projects/${projectId}/live`, { cache: 'no-store' });
        if (!res.ok) return;
        const data: LiveProjectState = await res.json();
        applyState(data);
      } catch {
        if (!cancelled) setLogs((prev) => [...prev, '[WARN] Live state fetch failed, using local state.']);
      }
    };

    refresh();
    const interval = window.setInterval(refresh, 2000);

    const wsUrl = apiBase.replace(/^http/, 'ws');
    const ws = new WebSocket(`${wsUrl}/ws/live/${projectId}`);

    ws.onopen = () => setLogs((prev) => [...prev, '[SYSTEM] WebSocket connected. Live stream active.']);
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'STREAM_TERMINAL' && data.payload?.message) setLogs((prev) => [...prev, data.payload.message]);
        if (data.type === 'STREAM_CODE' && data.payload?.chunk) setCode((prev) => prev + data.payload.chunk);
        if (data.type === 'STREAM_ARCH' && data.payload?.graph) setArchitecture(data.payload.graph);
      } catch (error) {
        console.error('Failed to parse websocket message', error);
      }
    };
    ws.onclose = () => setLogs((prev) => [...prev, '[SYSTEM] Connection closed.']);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
      ws.close();
    };
  }, [projectId]);

  const nodes = [
    { name: 'Generation Runner', status: 'online', hint: 'Files and blueprints are being assembled' },
    { name: 'Architecture Builder', status: 'online', hint: 'Dependency graph is live' },
    { name: 'Preview Engine', status: 'online', hint: 'Preview HTML is streaming' },
    { name: 'Download Guard', status: 'online', hint: 'Security scan and ZIP gate' },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="rounded-[32px] border border-white/10 bg-[linear-gradient(135deg,rgba(3,7,18,0.96),rgba(8,12,24,0.92),rgba(3,7,18,0.98))] p-6">
        <div className="flex flex-wrap items-center gap-3">
          <AnimatedBadge tone="cyan">live builder</AnimatedBadge>
          <span className="text-[11px] uppercase tracking-[0.3em] text-slate-500">{project.name || projectId}</span>
        </div>
        <SectionHeader
          eyebrow="runtime"
          title="Live generation system"
          subtitle="Arquitetura, preview, código e terminal atualizando em tempo real."
        />
      </section>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <HolographicCard className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-cyan-200">
              <Sparkles size={16} />
              <span className="text-sm font-semibold uppercase tracking-[0.25em]">Live Architecture View</span>
            </div>
            <span className="text-[10px] uppercase tracking-[0.25em] text-slate-500">{project.stack || 'orchestrator'}</span>
          </div>
          <EngineNodeGraph nodes={nodes} />
          <div className="mt-4 rounded-2xl border border-white/10 bg-black/30 p-4 text-sm leading-7 text-slate-200 whitespace-pre-wrap">
            {architecture}
          </div>
        </HolographicCard>

        <HolographicCard className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-cyan-200">
              <MonitorSmartphone size={16} />
              <span className="text-sm font-semibold uppercase tracking-[0.25em]">Live Site Preview</span>
            </div>
            <span className="text-[10px] uppercase tracking-[0.25em] text-slate-500">{project.name || projectId}</span>
          </div>
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/40">
            <iframe title="Live preview" className="h-[520px] w-full" srcDoc={previewHtml} sandbox="" />
          </div>
        </HolographicCard>

        <LiveArchitecturePanel title="Live code stream" graph={code} />

        <HolographicCard className="p-5">
          <div className="mb-4 flex items-center gap-2 text-rose-200">
            <Activity size={16} />
            <span className="text-sm font-semibold uppercase tracking-[0.25em]">Live terminal</span>
          </div>
          <div className="max-h-[520px] overflow-y-auto rounded-2xl border border-white/10 bg-black/40 p-4 font-mono text-xs leading-6 text-slate-300">
            {logs.map((log, i) => (
              <div key={i} className="mb-1">{log}</div>
            ))}
            <div ref={terminalEndRef} />
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3 text-sm text-slate-300">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3"><Braces size={16} className="mb-2 text-cyan-300" />Files {project.generated_files?.length || 0}</div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3"><Code2 size={16} className="mb-2 text-violet-300" />Status {project.status || 'running'}</div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3"><Layers3 size={16} className="mb-2 text-emerald-300" />Live stream</div>
          </div>
        </HolographicCard>
      </div>
    </div>
  );
}

