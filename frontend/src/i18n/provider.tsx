"use client";

import { useEffect, useState, useCallback, createContext, useContext } from "react";
import { t as translate } from "./index";
import type { Locale } from "./types";
import { LOCALE_NAMES, LOCALE_PREVIEW, LOCALE_MAP } from "./types";

interface LanguageContextProps {
  lang: Locale;
  setLang: (l: Locale) => void;
  t: (key: string) => string;
  localeNames: Record<Locale, string>;
  localePreview: Record<Locale, string>;
  localeFull: string;
}

const LanguageContext = createContext<LanguageContextProps>({
  lang: "en",
  setLang: () => {},
  t: (key: string) => key,
  localeNames: LOCALE_NAMES,
  localePreview: LOCALE_PREVIEW,
  localeFull: "en-US",
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Locale>("en");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const detected = detectLocale();
    setLangState(detected);
    applyLocale(detected);
    setMounted(true);
  }, []);

  const setLang = useCallback((l: Locale) => {
    setLangState(l);
    applyLocale(l);
    if (typeof window !== "undefined") {
      localStorage.setItem("panel_language", l);
      try {
        document.cookie = `panel_language=${l};path=/;max-age=31536000`;
      } catch {}
    }
  }, []);

  const t = useCallback(
    (key: string): string => translate(lang, key),
    [lang]
  );

  if (!mounted) {
    return <div style={{ visibility: "hidden" }}>{children}</div>;
  }

  return (
    <LanguageContext.Provider
      value={{
        lang,
        setLang,
        t,
        localeNames: LOCALE_NAMES,
        localePreview: LOCALE_PREVIEW,
        localeFull: LOCALE_MAP[lang],
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}

function detectLocale(): Locale {
  if (typeof window === "undefined") return "en";

  const saved = localStorage.getItem("panel_language") as Locale | null;
  if (saved && ["pt", "en", "es", "fr"].includes(saved)) return saved;

  try {
    const cookieMatch = document.cookie.match(/(?:^|;\s*)panel_language=([^;]*)/);
    if (cookieMatch) {
      const cookie = cookieMatch[1] as Locale;
      if (["pt", "en", "es", "fr"].includes(cookie)) return cookie;
    }
  } catch {}

  try {
    const browserLang = navigator.language || (navigator as any).userLanguage || "";
    if (browserLang.startsWith("pt")) return "pt";
    if (browserLang.startsWith("es")) return "es";
    if (browserLang.startsWith("fr")) return "fr";
  } catch {}

  return "en";
}

function applyLocale(l: Locale) {
  if (typeof window === "undefined") return;
  const full = LOCALE_MAP[l];
  document.documentElement.lang = full;
}
