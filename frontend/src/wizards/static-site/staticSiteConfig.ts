import type { WizardConfig, WizardStep } from "../types";

export interface OptionItem {
  value: string;
  label: string;
}

export interface ToggleItem {
  key: string;
  label: string;
  description: string;
}

const STEPS: WizardStep[] = [
  { number: 1, key: "site_type", labelKey: "wizard.static.step1", descKey: "wizard.static.step1_desc" },
  { number: 2, key: "project_info", labelKey: "wizard.static.step2", descKey: "wizard.static.step2_desc" },
  { number: 3, key: "sections", labelKey: "wizard.static.step3", descKey: "wizard.static.step3_desc" },
  { number: 4, key: "visual_identity", labelKey: "wizard.static.step4", descKey: "wizard.static.step4_desc" },
  { number: 5, key: "seo", labelKey: "wizard.static.step5", descKey: "wizard.static.step5_desc" },
  { number: 6, key: "contact", labelKey: "wizard.static.step6", descKey: "wizard.static.step6_desc" },
  { number: 7, key: "performance", labelKey: "wizard.static.step7", descKey: "wizard.static.step7_desc" },
  { number: 8, key: "animations", labelKey: "wizard.static.step8", descKey: "wizard.static.step8_desc" },
  { number: 9, key: "preview", labelKey: "wizard.static.step9", descKey: "wizard.static.step9_desc" },
  { number: 10, key: "generate", labelKey: "wizard.static.step10", descKey: "wizard.static.step10_desc" },
];

export const STATIC_SITE_CONFIG: WizardConfig = {
  slug: "static-site",
  stackKey: "static_site",
  titleKey: "wizard.static.title",
  subtitleKey: "wizard.static.subtitle",
  steps: STEPS,
  totalSteps: STEPS.length,
};

export const SITE_TYPES: OptionItem[] = [
  { value: "landing_page", label: "Landing Page" },
  { value: "institutional", label: "Institutional" },
  { value: "portfolio", label: "Portfolio" },
  { value: "sales_page", label: "Sales Page" },
  { value: "service_site", label: "Service Site" },
  { value: "catalog_site", label: "Catalog Site" },
  { value: "blog", label: "Blog" },
];

export const SECTIONS: OptionItem[] = [
  { value: "hero", label: "Hero" },
  { value: "about", label: "About" },
  { value: "services", label: "Services" },
  { value: "products", label: "Products" },
  { value: "portfolio", label: "Portfolio" },
  { value: "testimonials", label: "Testimonials" },
  { value: "faq", label: "FAQ" },
  { value: "contact", label: "Contact" },
  { value: "newsletter", label: "Newsletter" },
  { value: "blog", label: "Blog" },
];

export const VISUAL_STYLES: OptionItem[] = [
  { value: "modern", label: "Modern" },
  { value: "premium", label: "Premium" },
  { value: "corporate", label: "Corporate" },
  { value: "minimalist", label: "Minimalist" },
  { value: "dark_tech", label: "Dark Tech" },
  { value: "colorful", label: "Colorful" },
];

export const BRAND_COLORS: OptionItem[] = [
  { value: "blue", label: "Blue" },
  { value: "violet", label: "Violet" },
  { value: "cyan", label: "Cyan" },
  { value: "emerald", label: "Emerald" },
  { value: "amber", label: "Amber" },
  { value: "rose", label: "Rose" },
];

export const CONTACT_METHODS: OptionItem[] = [
  { value: "whatsapp", label: "WhatsApp" },
  { value: "email", label: "Email" },
  { value: "form", label: "Form" },
  { value: "none", label: "None" },
];

export const ANIMATION_LEVELS: OptionItem[] = [
  { value: "none", label: "None" },
  { value: "subtle", label: "Subtle" },
  { value: "premium", label: "Premium" },
];

export const ACCESSIBILITY_LEVELS: OptionItem[] = [
  { value: "basic", label: "Basic" },
  { value: "strong", label: "Strong" },
];

export const PERFORMANCE_OPTIONS: ToggleItem[] = [
  { key: "lazy_loading", label: "Lazy loading", description: "Defer media and heavy assets" },
  { key: "semantic_html", label: "Semantic HTML", description: "Use proper landmarks and headings" },
  { key: "alt_text", label: "Alt text", description: "Require descriptive image alternatives" },
  { key: "responsive", label: "Responsive", description: "Adapt across breakpoints" },
  { key: "reduced_motion", label: "Reduced motion", description: "Respect prefers-reduced-motion" },
];
