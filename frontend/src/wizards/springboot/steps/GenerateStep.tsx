"use client";

import { Sparkles } from "lucide-react";
import type { SpringBootFormData } from "../springBootPayload";
import {
  JAVA_VERSIONS, SPRING_BOOT_VERSIONS, BUILD_TOOLS,
  ARCHITECTURES, DATABASES, JPA_OPTIONS,
  SECURITY_OPTIONS, EVENT_OPTIONS, OBSERVABILITY_OPTIONS, TEST_OPTIONS
} from "../springBootConfig";

interface GenerateStepProps {
  data: SpringBootFormData;
  t: (key: string) => string;
}

function Section({ label, items }: { label: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 text-xs text-gray-500 w-32 shrink-0">{label}</span>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item) => (
          <span key={item} className="rounded-md bg-primary/10 px-2 py-1 text-xs text-primary">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function GenerateStep({ data, t }: GenerateStepProps) {
  const archLabel = ARCHITECTURES.includes(data.architecture) ? t(data.architecture) : data.architecture;

  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
      <h2 className="text-2xl font-bold text-foreground">{t("wizard.springboot.step10")}</h2>

      <div className="rounded-2xl border border-white/10 bg-surface p-6 space-y-4">
        <Section label={t("wizard.springboot.project_name_label")} items={[data.project_name]} />
        <Section label={t("wizard.springboot.java_version")} items={[data.java_version]} />
        <Section label={t("wizard.springboot.spring_boot_version")} items={[data.spring_boot_version]} />
        <Section label={t("wizard.springboot.build_tool")} items={[data.build_tool]} />
        <Section label={t("wizard.springboot.architecture")} items={[archLabel]} />
        <Section label={t("wizard.springboot.database")} items={[data.database]} />
        <Section label={t("wizard.springboot.jpa_options")} items={data.jpa_options} />
        <Section label={t("wizard.springboot.security")} items={data.security_options} />
        <Section label={t("wizard.springboot.events")} items={data.event_options} />
        <Section label={t("wizard.springboot.observability")} items={data.observability_options} />
        <Section label={t("wizard.springboot.tests")} items={data.test_options} />
      </div>

      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.03] p-6 text-center">
        <Sparkles size={32} className="mx-auto text-emerald-400 mb-3" />
        <p className="text-gray-300 text-sm">{t("wizard.springboot.generate_ready")}</p>
      </div>
    </div>
  );
}
