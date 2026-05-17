"use client";

import { useEffect, useState } from "react";
import { API_BASE } from "@/lib/config";
import { usePreferences } from "@/context/PreferencesContext";

type Item = { rule: string; status: "validado" | "warning" | "erro"; detail: string };

export default function ValidationCenterPage() {
  const { t } = usePreferences();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/api/validation/summary`)
      .then((r) => r.json())
      .then((d) => setItems(d.items || []))
      .finally(() => setLoading(false));
  }, []);

  const tone = (s: Item["status"]) =>
    s === "validado"
      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
      : s === "warning"
      ? "border-amber-500/30 bg-amber-500/10 text-amber-200"
      : "border-rose-500/30 bg-rose-500/10 text-rose-200";

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-3xl font-bold">{t("validation.title")}</h1>
      <p className="mt-2 text-gray-400">{t("validation.subtitle")}</p>
      <div className="mt-6 rounded-xl border border-white/10 bg-surface p-5">
        {loading ? (
          <div className="space-y-2">
            <div className="h-14 animate-pulse rounded bg-white/10" />
            <div className="h-14 animate-pulse rounded bg-white/10" />
            <div className="h-14 animate-pulse rounded bg-white/10" />
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((item) => (
              <div key={item.rule} className={`rounded-lg border p-3 ${tone(item.status)}`}>
                <p className="font-semibold">{item.rule}</p>
                <p className="text-sm opacity-90">{item.detail}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
