"use client";

import { JAVA_VERSIONS, SPRING_BOOT_VERSIONS } from "../springBootConfig";

interface JavaVersionsStepProps {
  javaVersion: string;
  springBootVersion: string;
  onJavaChange: (v: string) => void;
  onSpringBootChange: (v: string) => void;
  t: (key: string) => string;
}

export default function JavaVersionsStep({
  javaVersion, springBootVersion,
  onJavaChange, onSpringBootChange, t
}: JavaVersionsStepProps) {
  const radioCard = (
    label: string,
    selected: string,
    options: string[],
    onSelect: (v: string) => void
  ) => (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onSelect(opt)}
          className={`rounded-lg border px-5 py-3 text-sm font-semibold transition-all ${
            selected === opt
              ? "border-primary bg-primary/10 text-primary shadow-[0_0_15px_rgba(59,130,246,0.2)]"
              : "border-white/10 bg-surface text-gray-400 hover:border-white/30 hover:text-gray-200"
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );

  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
      <h2 className="text-2xl font-bold text-foreground">{t("wizard.springboot.step2")}</h2>

      <div className="space-y-3">
        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] ml-1">
          {t("wizard.springboot.java_version")}
        </label>
        {radioCard(javaVersion, javaVersion, JAVA_VERSIONS, onJavaChange)}
      </div>

      <div className="space-y-3">
        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] ml-1">
          {t("wizard.springboot.spring_boot_version")}
        </label>
        {radioCard(springBootVersion, springBootVersion, SPRING_BOOT_VERSIONS, onSpringBootChange)}
      </div>
    </div>
  );
}
