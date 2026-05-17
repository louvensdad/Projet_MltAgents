import type { Locale, TranslationDict } from "./types";
import pt from "./dictionaries/pt-BR";
import en from "./dictionaries/en-US";
import es from "./dictionaries/es-ES";
import fr from "./dictionaries/fr-FR";

export const dictionaries: Record<Locale, TranslationDict> = {
  pt,
  en,
  es,
  fr,
};

const FALLBACK_LOCALE: Locale = "en";

const NAMESPACE_LOADERS: Record<string, Record<Locale, () => Promise<Record<string, any>>>> = {};

export function registerNamespace(
  namespace: string,
  loaders: Record<Locale, () => Promise<Record<string, any>>>
) {
  NAMESPACE_LOADERS[namespace] = loaders as any;
}

const cachedNamespaces: Record<string, Record<string, any>> = {};

export async function loadNamespace(namespace: string, lang: Locale): Promise<Record<string, any>> {
  const cacheKey = `${lang}:${namespace}`;
  if (cachedNamespaces[cacheKey]) return cachedNamespaces[cacheKey];

  const loaders = NAMESPACE_LOADERS[namespace];
  if (!loaders) return {};

  try {
    const data = await loaders[lang]();
    cachedNamespaces[cacheKey] = data;
    return data;
  } catch {
    try {
      const fallbackData = await loaders[FALLBACK_LOCALE]();
      cachedNamespaces[cacheKey] = fallbackData;
      return fallbackData;
    } catch {
      return {};
    }
  }
}

function resolveNested(obj: any, keys: string[]): any {
  let current = obj;
  for (const k of keys) {
    if (current && typeof current === "object" && k in current) {
      current = current[k];
    } else {
      return undefined;
    }
  }
  return current;
}

const FALLBACK_VALUES: Record<string, string> = {
  "wizard.springboot.project_name_required": "Project name is required",
  "wizard.static.csp_enabled": "CSP (Content Security Policy)",
  "wizard.static.csp_enabled_desc": "Enable Content Security Policy headers",
  "wizard.static.js_sanitization": "JS Sanitization",
  "wizard.static.js_sanitization_desc": "Enable JavaScript sanitization",
  "wizard.static.unsafe_link_protection": "Unsafe Link Protection",
  "wizard.static.unsafe_link_protection_desc": "Block unsafe external links",
  "wizard.static.no_credentials_frontend": "No Credentials in Frontend",
  "wizard.static.no_credentials_frontend_desc": "Ensure no credentials are exposed",
  "wizard.static.form_validation": "Form Validation",
  "wizard.static.form_validation_desc": "Enable frontend form validation",
  "wizard.static.generate_subtitle": "All set! Review and generate your site.",
  "wizard.static.generate_missing_fields": "Missing required fields",
  "wizard.static.generate_ready": "Ready to generate",
  "wizard.static.generate_success": "Project generated successfully!",
  "wizard.static.generate_redirecting": "Redirecting to project page...",
  "wizard.static.generating": "Generating your project...",
  "wizard.static.generate_button": "Generate Project",
  "wizard.static.site_type": "Site Type",
  "wizard.static.visual_style": "Visual Style",
  "wizard.static.color_palette": "Color Palette",
  "wizard.static.brand_tone": "Brand Tone",
  "wizard.static.has_logo": "Include logo",
  "wizard.static.dark_mode": "Dark mode",
  "wizard.static.site_name": "Site name",
  "wizard.static.slogan": "Slogan",
  "wizard.static.company_description": "Company description",
  "wizard.static.target_audience": "Target audience",
  "wizard.static.meta_title": "Meta Title",
  "wizard.static.open_graph": "Open Graph",
  "wizard.static.sitemap": "Sitemap",
  "wizard.static.robots_txt": "Robots.txt",
  "wizard.static.lazy_loading": "Lazy Loading",
};

export function t(lang: Locale, key: string): string {
  if (!key || typeof key !== "string") return "";
  const keys = key.split(".");
  const namespace = keys[0];

  const tryResolve = (dict: any): string | undefined => {
    if (!dict) return undefined;
    let current = dict;
    for (const k of keys) {
      if (current && typeof current === "object" && k in current) {
        current = current[k];
      } else {
        return undefined;
      }
    }
    return typeof current === "string" ? current : undefined;
  };

  let value = tryResolve(dictionaries[lang]);
  if (value) return value;

  const cached = cachedNamespaces[`${lang}:${namespace}`];
  if (cached) {
    const nsKeys = keys.slice(1);
    let current = cached;
    let found = true;
    for (const k of nsKeys) {
      if (current && typeof current === "object" && k in current) {
        current = current[k];
      } else {
        found = false;
        break;
      }
    }
    if (found && typeof current === "string") return current;
  }

  if (lang !== FALLBACK_LOCALE) {
    value = tryResolve(dictionaries[FALLBACK_LOCALE]);
    if (value) return value;

    const fallbackCached = cachedNamespaces[`${FALLBACK_LOCALE}:${namespace}`];
    if (fallbackCached) {
      const nsKeys = keys.slice(1);
      let current = fallbackCached;
      let found = true;
      for (const k of nsKeys) {
        if (current && typeof current === "object" && k in current) {
          current = current[k];
        } else {
          found = false;
          break;
        }
      }
      if (found && typeof current === "string") return current;
    }
  }

  const fallbackValue = FALLBACK_VALUES[key];
  if (fallbackValue) return fallbackValue;

  const lastKey = keys[keys.length - 1];
  const humanKey = lastKey.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  if (typeof window !== "undefined") {
    console.warn(`[i18n] Missing translation: ${key} for locale ${lang}`);
  }

  return humanKey;
}

export type { Locale, LocaleFull, TranslationDict } from "./types";
export { LOCALE_MAP, LOCALE_SHORT, LOCALE_NAMES, LOCALE_PREVIEW } from "./types";
