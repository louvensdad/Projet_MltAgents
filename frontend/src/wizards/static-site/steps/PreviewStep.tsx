"use client";

import type { ReactNode } from "react";
import type { StaticSiteData } from "../staticSitePayload";

interface Props {
  data: StaticSiteData;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-white/5 py-2 text-sm last:border-b-0">
      <span className="text-gray-500">{label}</span>
      <span className="max-w-[60%] truncate font-medium text-gray-200">{value || "—"}</span>
    </div>
  );
}

function Chip({ children }: { children: ReactNode }) {
  return <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-gray-200">{children}</span>;
}

export default function PreviewStep({ data }: Props) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-4">
        <p className="text-sm font-semibold text-cyan-100">
          Preview the contract before generation. The backend expects the same values that appear here.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-gray-500">Project</p>
          <Row label="Project name" value={data.project_name} />
          <Row label="Site type" value={data.site_type} />
          <Row label="Target audience" value={data.target_audience} />
          <Row label="Business goal" value={data.business_goal} />
          <Row label="Contact method" value={data.contact_method} />
          <Row label="Language" value={data.language} />
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-gray-500">SEO</p>
          <Row label="Title" value={data.seo_title} />
          <Row label="Description" value={data.seo_description} />
          <Row label="Keywords" value={data.seo_keywords} />
          <Row label="Open Graph" value={data.open_graph_title || data.seo_title} />
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-gray-500">Sections</p>
        <div className="flex flex-wrap gap-2">
          {data.sections.map((section) => <Chip key={section}>{section}</Chip>)}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-gray-500">Identity</p>
          <Row label="Visual style" value={data.visual_style} />
          <Row label="Brand colors" value={data.brand_colors.join(", ")} />
          <Row label="Animations" value={data.animations} />
          <Row label="Accessibility" value={data.accessibility_level} />
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-gray-500">Performance</p>
          <Row label="Analytics" value={String(data.analytics)} />
          <Row label="Lazy loading" value={String(data.lazy_loading)} />
          <Row label="Semantic HTML" value={String(data.semantic_html)} />
          <Row label="Alt text" value={String(data.alt_text)} />
          <Row label="Reduced motion" value={String(data.reduced_motion)} />
          <Row label="Responsive" value={String(data.responsive)} />
        </div>
      </div>
    </div>
  );
}
