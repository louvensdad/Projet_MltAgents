"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light" | "system";
type Lang = "pt" | "en" | "es" | "fr";

interface ThemeContextProps {
  theme: Theme;
  lang: Lang;
  setTheme: (t: Theme) => void;
  setLang: (l: Lang) => void;
}

const ThemeContext = createContext<ThemeContextProps>({
  theme: "dark", lang: "pt",
  setTheme: () => {}, setLang: () => {}
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");
  const [lang, setLangState] = useState<Lang>("pt");

  useEffect(() => {
    const savedTheme = (localStorage.getItem("ldcn_theme") as Theme) || "dark";
    const savedLang = (localStorage.getItem("ldcn_lang") as Lang) || "pt";
    setThemeState(savedTheme);
    setLangState(savedLang);
    applyTheme(savedTheme);
  }, []);

  const applyTheme = (t: Theme) => {
    const root = document.documentElement;
    if (t === "dark") {
      root.classList.add("dark");
      root.classList.remove("light");
    } else if (t === "light") {
      root.classList.add("light");
      root.classList.remove("dark");
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      root.classList.toggle("dark", prefersDark);
      root.classList.toggle("light", !prefersDark);
    }
  };

  const setTheme = (t: Theme) => {
    setThemeState(t);
    localStorage.setItem("ldcn_theme", t);
    applyTheme(t);
  };

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem("ldcn_lang", l);
  };

  return (
    <ThemeContext.Provider value={{ theme, lang, setTheme, setLang }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
