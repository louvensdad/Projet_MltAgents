"use client";

import { useCallback } from "react";
import { usePreferences } from "@/context/PreferencesContext";
import type { Locale } from "./types";

export function useI18n() {
  const { t: translate, lang, setLang, localeNames, localeFull } = usePreferences();

  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      let result = translate(key);
      if (params) {
        Object.entries(params).forEach(([k, v]) => {
          result = result.replace(`{${k}}`, String(v));
        });
      }
      return result;
    },
    [translate]
  );

  const changeLanguage = useCallback(
    (locale: Locale) => {
      setLang(locale);
      if (typeof window !== "undefined") {
        document.documentElement.lang = locale === "pt" ? "pt-BR" : locale === "en" ? "en-US" : locale === "es" ? "es-ES" : "fr-FR";
      }
    },
    [setLang]
  );

  return { t, lang, changeLanguage, localeNames, localeFull };
}
