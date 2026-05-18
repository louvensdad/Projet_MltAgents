export type Locale = "pt" | "en" | "es" | "fr";

export type LocaleFull = "pt-BR" | "en-US" | "es-ES" | "fr-FR";

export const LOCALE_MAP: Record<Locale, LocaleFull> = {
  pt: "pt-BR",
  en: "en-US",
  es: "es-ES",
  fr: "fr-FR",
};

export const LOCALE_SHORT: Record<LocaleFull, Locale> = {
  "pt-BR": "pt",
  "en-US": "en",
  "es-ES": "es",
  "fr-FR": "fr",
};

export const LOCALE_NAMES: Record<Locale, string> = {
  pt: "Português",
  en: "English",
  es: "Español",
  fr: "Français",
};

export const LOCALE_PREVIEW: Record<Locale, string> = {
  pt: "Seu painel será exibido em Português.",
  en: "Your dashboard will be displayed in English.",
  es: "Tu panel se mostrará en español.",
  fr: "Votre tableau de bord sera affiché en français.",
};

export interface TranslationDict {
  common: Record<string, string>;
  sidebar: Record<string, string>;
  dashboard: Record<string, string>;
  wizard: Record<string, any>;
  create: Record<string, string>;
  projects: Record<string, string>;
  upgrade: Record<string, any>;
  ai_mode: Record<string, string>;
  ai_boost: Record<string, string>;
  auth: Record<string, string>;
  settings: Record<string, string>;
  documentation: Record<string, string>;
  templates: Record<string, string>;
  ai_models: Record<string, string>;
  security: Record<string, string>;
  billing: Record<string, string>;
  generators: Record<string, string>;
  activity: Record<string, string>;
  system: Record<string, string>;
  recommendations: Record<string, string>;
  validation: Record<string, string>;
  errors: Record<string, string>;
  modals: Record<string, string>;
  advanced: Record<string, string>;
  empty: Record<string, string>;
  locale: Record<string, string>;
}

export type TranslationKey = string;
