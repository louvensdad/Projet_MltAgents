"use client";

import type { StaticSiteData } from "../staticSitePayload";
import { SECTIONS } from "../staticSiteConfig";

interface Props {
  data: StaticSiteData;
  t: (k: string) => string;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-primary">{title}</h3>
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-white/5 py-2 text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-200">{value || "—"}</span>
    </div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return <span className="inline-block rounded-md bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">{children}</span>;
}

function BoolBadge({ value }: { value: boolean }) {
  return value
    ? <span className="text-emerald-400">&#10003;</span>
    : <span className="text-gray-600">&#10007;</span>;
}

function ListTags({ items, t }: { items: string[]; t: (k: string) => string }) {
  if (items.length === 0) return <span className="text-gray-600 italic">Nenhum</span>;
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map(item => <Tag key={item}>{t(item)}</Tag>)}
    </div>
  );
}

export default function PreviewStep({ data, t }: Props) {
  return (
    <div className="space-y-4 animate-in slide-in-from-right-4">
      <Section title={t("wizard.static.preview_site_type")}>
        <Row label={t("wizard.static.site_type")} value={data.site_type ? t(data.site_type) : "—"} />
      </Section>

      <Section title={t("wizard.static.preview_visual")}>
        <Row label={t("wizard.static.visual_style")} value={data.visual_style ? t(data.visual_style) : "—"} />
        <Row label={t("wizard.static.color_palette")} value={data.color_palette ? t(data.color_palette) : "—"} />
        <Row label={t("wizard.static.brand_tone")} value={data.brand_tone ? t(data.brand_tone) : "—"} />
        <Row label={t("wizard.static.has_logo")} value={<BoolBadge value={data.has_logo} />} />
        <Row label={t("wizard.static.dark_mode")} value={<BoolBadge value={data.dark_mode} />} />
      </Section>

      <Section title={t("wizard.static.preview_sections")}>
        <div className="flex flex-wrap gap-1.5">
          {data.sections.length > 0
            ? data.sections.map(s => {
                const found = SECTIONS.find(opt => opt.key === s);
                return <Tag key={s}>{found ? t(found.labelKey) : s}</Tag>;
              })
            : <span className="text-gray-600 italic">Nenhuma seção selecionada</span>
          }
        </div>
      </Section>

      <Section title={t("wizard.static.preview_content")}>
        <Row label={t("wizard.static.site_name")} value={data.site_name} />
        <Row label={t("wizard.static.slogan")} value={data.slogan} />
        <Row label={t("wizard.static.company_description")} value={data.company_description?.slice(0, 80)} />
        <Row label={t("wizard.static.target_audience")} value={data.target_audience} />
      </Section>

      <Section title={t("wizard.static.preview_ux")}>
        <ListTags items={data.ux_options} t={t} />
      </Section>

      <Section title={t("wizard.static.preview_seo")}>
        <Row label={t("wizard.static.meta_title")} value={data.meta_title} />
        <Row label={t("wizard.static.open_graph")} value={<BoolBadge value={data.open_graph} />} />
        <Row label={t("wizard.static.sitemap")} value={<BoolBadge value={data.sitemap} />} />
        <Row label={t("wizard.static.robots_txt")} value={<BoolBadge value={data.robots_txt} />} />
        <Row label={t("wizard.static.lazy_loading")} value={<BoolBadge value={data.lazy_loading} />} />
      </Section>

      <Section title={t("wizard.static.preview_forms")}>
        <ListTags items={data.form_options} t={t} />
      </Section>

      <Section title={t("wizard.static.preview_security")}>
        <Row label={t("wizard.static.csp_enabled")} value={<BoolBadge value={data.csp_enabled} />} />
        <Row label={t("wizard.static.js_sanitization")} value={<BoolBadge value={data.js_sanitization} />} />
        <Row label={t("wizard.static.unsafe_link_protection")} value={<BoolBadge value={data.unsafe_link_protection} />} />
        <Row label={t("wizard.static.no_credentials_frontend")} value={<BoolBadge value={data.no_credentials_frontend} />} />
        <Row label={t("wizard.static.form_validation")} value={<BoolBadge value={data.form_validation} />} />
      </Section>
    </div>
  );
}
