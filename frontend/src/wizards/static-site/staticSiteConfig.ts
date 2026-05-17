import type { WizardConfig, WizardStep } from "../types";

const STEPS: WizardStep[] = [
  { number: 1, key: "site_type", labelKey: "wizard.static.step1", descKey: "wizard.static.step1_desc" },
  { number: 2, key: "visual_identity", labelKey: "wizard.static.step2", descKey: "wizard.static.step2_desc" },
  { number: 3, key: "page_structure", labelKey: "wizard.static.step3", descKey: "wizard.static.step3_desc" },
  { number: 4, key: "content", labelKey: "wizard.static.step4", descKey: "wizard.static.step4_desc" },
  { number: 5, key: "ux_ui", labelKey: "wizard.static.step5", descKey: "wizard.static.step5_desc" },
  { number: 6, key: "seo_performance", labelKey: "wizard.static.step6", descKey: "wizard.static.step6_desc" },
  { number: 7, key: "forms_integrations", labelKey: "wizard.static.step7", descKey: "wizard.static.step7_desc" },
  { number: 8, key: "security_frontend", labelKey: "wizard.static.step8", descKey: "wizard.static.step8_desc" },
  { number: 9, key: "preview", labelKey: "wizard.static.step9", descKey: "wizard.static.step9_desc" },
  { number: 10, key: "generate", labelKey: "wizard.static.step10", descKey: "wizard.static.step10_desc" },
];

export const STATIC_SITE_CONFIG: WizardConfig = {
  slug: "static-site",
  stackKey: "static",
  titleKey: "wizard.static.title",
  subtitleKey: "wizard.static.subtitle",
  steps: STEPS,
  totalSteps: STEPS.length,
};

export const SITE_TYPES = [
  "wizard.static.site_type_landing",
  "wizard.static.site_type_institutional",
  "wizard.static.site_type_portfolio",
  "wizard.static.site_type_blog",
  "wizard.static.site_type_sales",
  "wizard.static.site_type_services",
  "wizard.static.site_type_catalog",
];

export const VISUAL_STYLES = [
  "wizard.static.style_modern",
  "wizard.static.style_minimal",
  "wizard.static.style_corporate",
  "wizard.static.style_creative",
  "wizard.static.style_luxury",
  "wizard.static.style_dark_tech",
];

export const COLOR_PALETTES = [
  "wizard.static.palette_blue",
  "wizard.static.palette_green",
  "wizard.static.palette_purple",
  "wizard.static.palette_orange",
  "wizard.static.palette_red",
  "wizard.static.palette_neutral",
];

export const BRAND_TONES = [
  "wizard.static.tone_professional",
  "wizard.static.tone_friendly",
  "wizard.static.tone_luxury",
  "wizard.static.tone_innovative",
  "wizard.static.tone_playful",
  "wizard.static.tone_urgent",
];

export const SECTIONS = [
  { key: "hero", labelKey: "wizard.static.section_hero" },
  { key: "about", labelKey: "wizard.static.section_about" },
  { key: "services", labelKey: "wizard.static.section_services" },
  { key: "products", labelKey: "wizard.static.section_products" },
  { key: "portfolio", labelKey: "wizard.static.section_portfolio" },
  { key: "testimonials", labelKey: "wizard.static.section_testimonials" },
  { key: "faq", labelKey: "wizard.static.section_faq" },
  { key: "contact", labelKey: "wizard.static.section_contact" },
  { key: "newsletter", labelKey: "wizard.static.section_newsletter" },
  { key: "blog", labelKey: "wizard.static.section_blog" },
];

export const UX_OPTIONS = [
  "wizard.static.ux_animations",
  "wizard.static.ux_glassmorphism",
  "wizard.static.ux_cards",
  "wizard.static.ux_navbar_fixed",
  "wizard.static.ux_smooth_scroll",
  "wizard.static.ux_mobile_first",
  "wizard.static.ux_accessibility",
];

export const FORM_OPTIONS = [
  "wizard.static.form_contact",
  "wizard.static.form_whatsapp",
  "wizard.static.form_email",
  "wizard.static.form_analytics",
  "wizard.static.form_lead_capture",
  "wizard.static.form_newsletter",
];
