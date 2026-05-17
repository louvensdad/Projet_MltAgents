"use client";

import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { usePreferences } from "@/context/PreferencesContext";

const WIZARD_MAP: Record<string, any> = {
  "static-site": dynamic(() => import("@/wizards/static-site/StaticSiteWizard")),
  springboot: dynamic(() => import("@/wizards/springboot/SpringBootWizard")),
  fastapi: dynamic(() => import("@/wizards/fastapi/FastAPIWizard")),
};

const FALLBACK_LABELS: Record<string, string> = {
  "static-site": "Static Site",
  springboot: "Spring Boot",
  fastapi: "FastAPI",
  nestjs: "NestJS",
  express: "Express",
  laravel: "Laravel",
  dotnet: "ASP.NET Core",
  angular: "Angular",
  react: "React",
  nextjs: "Next.js",
  vue: "Vue",
  blazor: "Blazor",
};

const PLANNED_WIZARDS = ["nestjs", "express", "laravel", "dotnet", "angular", "react", "nextjs", "vue", "blazor"];

function PlannedWizard({ slug }: { slug: string }) {
  const { t } = usePreferences();
  const label = FALLBACK_LABELS[slug] || slug;
  return (
    <div className="mx-auto max-w-3xl px-4 py-20 text-center">
      <Link href="/wizard" className="mb-8 inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
        <ArrowLeft size={16} /> {t("common.back")}
      </Link>
      <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-12">
        <h1 className="text-2xl font-bold text-white">{label}</h1>
        <p className="mt-4 text-gray-400">
          {t("wizard.coming_soon").replace("{stack}", label)}
        </p>
        <p className="mt-3 text-sm text-amber-200/80">
          This stack is marked as planned and is not connected to the official generation pipeline yet.
        </p>
        <Link
          href="/wizard"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary/90 transition-all"
        >
          <ArrowLeft size={16} /> {t("wizard.back_to_selector")}
        </Link>
      </div>
    </div>
  );
}

function NotFoundWizard() {
  const { t } = usePreferences();
  return (
    <div className="mx-auto max-w-3xl px-4 py-20 text-center">
      <div className="rounded-2xl border border-white/10 bg-surface p-12">
        <h1 className="text-2xl font-bold text-white">{t("wizard.not_found")}</h1>
        <Link href="/wizard" className="mt-4 inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors">
          <ArrowLeft size={16} /> {t("wizard.back_to_selector")}
        </Link>
      </div>
    </div>
  );
}

export default function SlugWizardPage() {
  const params = useParams();
  const slug = params?.slug as string;

  if (!slug) return null;

  if (PLANNED_WIZARDS.includes(slug)) {
    return <PlannedWizard slug={slug} />;
  }

  const WizardComponent = WIZARD_MAP[slug];
  if (!WizardComponent) {
    return <NotFoundWizard />;
  }

  return <WizardComponent />;
}
