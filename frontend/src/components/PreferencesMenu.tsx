"use client";

import { useState, useRef, useEffect } from "react";
import { Settings, Moon, Sun, Monitor, Languages, Check, ChevronRight } from "lucide-react";
import { usePreferences } from "@/context/PreferencesContext";

export default function PreferencesMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, setTheme, lang, setLang, t } = usePreferences();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const languages = [
    { code: "pt", label: "Português" },
    { code: "en", label: "English" },
    { code: "es", label: "Español" },
    { code: "fr", label: "Français" },
  ];

  const themes = [
    { id: "dark", label: t("common.dark"), icon: Moon },
    { id: "light", label: t("common.light"), icon: Sun },
    { id: "system", label: t("common.system"), icon: Monitor },
  ];

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 cursor-pointer transition-all group"
        title={t("common.settings")}
      >
        <Languages size={16} className={`${isOpen ? "rotate-90" : ""} transition-transform duration-300 group-hover:text-primary`} />
        <span className="text-xs font-medium">{lang.toUpperCase()}</span>
        {theme === "dark" ? <Moon size={14} /> : theme === "light" ? <Sun size={14} /> : <Monitor size={14} />}
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-0 mb-2 w-56 bg-[#0a0a0f]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in slide-in-from-bottom-2 duration-200 z-[100]">
          <div className="p-5 border-b border-white/10 bg-white/[0.03]">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">{t("common.settings")}</h3>
          </div>

          <div className="p-3 space-y-4">
            {/* Theme Selector */}
            <div className="space-y-2">
              <div className="px-2 text-[9px] font-black text-white/30 uppercase tracking-widest">{t("common.theme")}</div>
              <div className="grid grid-cols-3 gap-1.5">
                {themes.map((item) => {
                  const Icon = item.icon;
                  const isActive = theme === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setTheme(item.id as any)}
                      className={`py-2 rounded-xl flex flex-col items-center gap-1 transition-all active:scale-90 border ${
                        isActive
                          ? "bg-primary/20 border-primary/50 text-primary"
                          : "bg-white/5 border-transparent text-white/40 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <Icon size={16} />
                      <span className="text-[7px] font-bold uppercase tracking-tighter">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="h-px bg-white/10" />

            {/* Language Selector */}
            <div className="space-y-2">
              <div className="px-2 text-[9px] font-black text-white/30 uppercase tracking-widest">{t("common.language")}</div>
              <div className="space-y-1">
                {languages.map((l) => {
                  const isActive = lang === l.code;
                  return (
                    <button
                      key={l.code}
                      onClick={() => setLang(l.code as any)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all active:scale-[0.98] ${
                        isActive
                          ? "bg-primary/10 text-primary font-bold ring-1 ring-primary/20"
                          : "text-gray-500 hover:text-gray-200 hover:bg-white/5"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-1 h-1 rounded-full transition-all ${isActive ? "bg-primary" : "bg-transparent"}`} />
                        <span>{l.label}</span>
                      </div>
                      {isActive && <Check size={12} className="text-primary" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          
          <div className="p-2 bg-black/40 text-[8px] font-black text-center text-gray-700 tracking-[0.3em] uppercase border-t border-white/5">
            Ldcn v0.1
          </div>
        </div>
      )}
    </div>
  );
}
