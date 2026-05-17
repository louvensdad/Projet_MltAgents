"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { t as translate, dictionaries } from "@/i18n";
import type { Locale } from "@/i18n";
import { LOCALE_NAMES, LOCALE_PREVIEW, LOCALE_MAP } from "@/i18n";

type Theme = "dark" | "light" | "system";

interface PreferencesContextProps {
  theme: Theme;
  lang: Locale;
  setTheme: (t: Theme) => void;
  setLang: (l: Locale) => void;
  t: (key: string) => string;
  localeNames: Record<Locale, string>;
  localePreview: Record<Locale, string>;
  localeFull: string;
}

const PreferencesContext = createContext<PreferencesContextProps>({
  theme: "dark",
  lang: "pt",
  setTheme: () => {},
  setLang: () => {},
  t: (key: string) => key,
  localeNames: LOCALE_NAMES,
  localePreview: LOCALE_PREVIEW,
  localeFull: "pt-BR",
});

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");
  const [lang, setLangState] = useState<Locale>("pt");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedTheme = (localStorage.getItem("panel_theme") as Theme) || "dark";
    const savedLang = (localStorage.getItem("panel_language") as Locale) || "pt";
    
    setThemeState(savedTheme);
    setLangState(savedLang);
    applyTheme(savedTheme);
    setMounted(true);

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if ((localStorage.getItem("panel_theme") as Theme) === "system") {
        applyTheme("system");
      }
    };
    
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const applyTheme = (t: Theme) => {
    if (typeof window === "undefined") return;
    
    const root = document.documentElement;
    let effectiveTheme = t;
    
    if (t === "system") {
      effectiveTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    
    if (effectiveTheme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  };

  const setTheme = (t: Theme) => {
    setThemeState(t);
    localStorage.setItem("panel_theme", t);
    applyTheme(t);
  };

  const setLang = (l: Locale) => {
    setLangState(l);
    localStorage.setItem("panel_language", l);
  };

  const t = (key: string): string => {
    return translate(lang, key);
  };

  if (!mounted) {
    return <div style={{ visibility: 'hidden' }}>{children}</div>;
  }

  return (
    <PreferencesContext.Provider value={{
      theme, lang, setTheme, setLang, t,
      localeNames: LOCALE_NAMES,
      localePreview: LOCALE_PREVIEW,
      localeFull: LOCALE_MAP[lang],
    }}>
      {children}
    </PreferencesContext.Provider>
  );
}

export const usePreferences = () => useContext(PreferencesContext);
export const useTheme = () => {
    const { theme, setTheme } = usePreferences();
    return { theme, setTheme };
};
