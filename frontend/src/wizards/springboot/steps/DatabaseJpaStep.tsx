"use client";

import { DATABASES, JPA_OPTIONS } from "../springBootConfig";

interface DatabaseJpaStepProps {
  database: string;
  jpaOptions: string[];
  onDatabaseChange: (v: string) => void;
  onJpaToggle: (v: string) => void;
  t: (key: string) => string;
}

export default function DatabaseJpaStep({
  database, jpaOptions,
  onDatabaseChange, onJpaToggle, t
}: DatabaseJpaStepProps) {
  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
      <h2 className="text-2xl font-bold text-foreground">{t("wizard.springboot.step5")}</h2>

      <div className="space-y-3">
        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] ml-1">
          {t("wizard.springboot.database")}
        </label>
        <div className="flex flex-wrap gap-2">
          {DATABASES.map((db) => (
            <button
              key={db}
              onClick={() => onDatabaseChange(db)}
              className={`rounded-lg border px-5 py-3 text-sm font-semibold transition-all ${
                database === db
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-white/10 bg-surface text-gray-400 hover:border-white/30 hover:text-gray-200"
              }`}
            >
              {db}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] ml-1">
          {t("wizard.springboot.jpa_options")}
        </label>
        <div className="flex flex-wrap gap-2">
          {JPA_OPTIONS.map((opt) => {
            const isSelected = jpaOptions.includes(opt);
            return (
              <button
                key={opt}
                onClick={() => onJpaToggle(opt)}
                className={`rounded-lg border px-5 py-3 text-sm font-semibold transition-all ${
                  isSelected
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-white/10 bg-surface text-gray-400 hover:border-white/30 hover:text-gray-200"
                }`}
              >
                {isSelected && <span className="mr-1.5">✓</span>}
                {opt}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
