export interface StaticSiteData {
  project_name: string;
  site_type: string;
  target_audience: string;
  business_goal: string;
  sections: string[];
  visual_style: string;
  brand_colors: string[];
  seo_keywords: string;
  seo_title: string;
  seo_description: string;
  open_graph_title: string;
  open_graph_description: string;
  contact_method: string;
  analytics: boolean;
  animations: string;
  accessibility_level: string;
  language: string;
  lazy_loading: boolean;
  semantic_html: boolean;
  alt_text: boolean;
  responsive: boolean;
  reduced_motion: boolean;
}

export const DEFAULT_STATIC_SITE_DATA: StaticSiteData = {
  project_name: "",
  site_type: "landing_page",
  target_audience: "",
  business_goal: "",
  sections: ["hero", "about", "services", "contact"],
  visual_style: "premium",
  brand_colors: ["blue", "violet"],
  seo_keywords: "",
  seo_title: "",
  seo_description: "",
  open_graph_title: "",
  open_graph_description: "",
  contact_method: "form",
  analytics: true,
  animations: "subtle",
  accessibility_level: "strong",
  language: "pt-BR",
  lazy_loading: true,
  semantic_html: true,
  alt_text: true,
  responsive: true,
  reduced_motion: true,
};

function splitKeywords(keywords: string): string[] {
  return keywords
    .split(/[,\n;]/g)
    .map((item) => item.trim())
    .filter(Boolean);
}

function buildFallbackDescription(data: StaticSiteData) {
  const projectName = data.project_name.trim() || "the site";
  const audience = data.target_audience.trim() || "the audience";
  const goal = data.business_goal.trim() || "convert visitors into leads";
  return `${projectName} is a static site focused on ${goal} for ${audience}.`;
}

export function buildStaticSitePromptAnswers(data: StaticSiteData, locale: string) {
  const projectDescription = [
    data.project_name.trim(),
    data.target_audience.trim(),
    data.business_goal.trim(),
  ].filter(Boolean).join(" - ") || buildFallbackDescription(data);
  const seoKeywords = splitKeywords(data.seo_keywords);
  const businessRules = [
    "semantic HTML required",
    "no backend or database",
    "SEO, accessibility and responsive behavior are mandatory",
  ];

  return {
    project_name: data.project_name.trim() || "Static Site Project",
    project_description: projectDescription,
    project_objective: data.business_goal.trim() || projectDescription,
    problem_solved: data.business_goal.trim() || "Deliver a fast SEO-first site",
    project_language: locale,
    generation_mode: data.animations === "premium" ? "premium_static" : "static_site",
    stack_id: "static_site",
    project_type: "static_site",
    site_type: data.site_type,
    target_audience: data.target_audience,
    business_goal: data.business_goal,
    sections: data.sections,
    visual_style: data.visual_style,
    brand_colors: data.brand_colors,
    seo_keywords: seoKeywords,
    seo_title: data.seo_title || data.project_name,
    seo_description: data.seo_description || projectDescription,
    open_graph_title: data.open_graph_title || data.seo_title || data.project_name,
    open_graph_description: data.open_graph_description || data.seo_description || projectDescription,
    open_graph: true,
    meta_title: data.seo_title || data.project_name,
    meta_description: data.seo_description || projectDescription,
    color_palette: data.brand_colors.join(", "),
    brand_tone: data.visual_style,
    dark_mode: data.visual_style === "dark_tech",
    contact_method: data.contact_method,
    analytics: data.analytics,
    animations: data.animations,
    accessibility_level: data.accessibility_level,
    language: data.language || locale,
    lazy_loading: data.lazy_loading,
    semantic_html: data.semantic_html,
    alt_text: data.alt_text,
    responsive: data.responsive,
    reduced_motion: data.reduced_motion,
    seo: {
      meta_title: data.seo_title || data.project_name,
      meta_description: data.seo_description || projectDescription,
      keywords: seoKeywords,
      open_graph: true,
      sitemap: true,
      robots_txt: true,
      lazy_loading: data.lazy_loading,
    },
    forms: {
      contact_method: data.contact_method,
      options: data.contact_method === "none" ? [] : [data.contact_method],
    },
    ux: {
      options: [data.animations, data.accessibility_level],
    },
    gatekeeper_active: true,
    confirmed_business_rules: businessRules,
    confirmed_entities: ["LandingPage", "MarketingSection", "ContactForm"],
    confirmed_features: [
      ...data.sections,
      ...data.brand_colors,
      ...seoKeywords,
      data.contact_method,
      data.animations,
      data.accessibility_level,
    ],
    required_files: [
      "index.html",
      "assets/css/style.css",
      "assets/js/main.js",
      "README.md",
      "docs/SEO.md",
      "docs/ACCESSIBILITY.md",
    ],
  };
}

export function buildStaticSitePayload(data: StaticSiteData, locale: string, aiMode: "local_build_90" | "agent_boost_100" = "local_build_90") {
  const promptAnswers = buildStaticSitePromptAnswers(data, locale);
  return {
    stack_id: "static_site",
    project_type: "static_site",
    project_name: promptAnswers.project_name,
    project_description: promptAnswers.project_description,
    site_type: data.site_type,
    target_audience: data.target_audience,
    business_goal: data.business_goal,
    sections: data.sections,
    visual_style: data.visual_style,
    brand_colors: data.brand_colors,
    seo_keywords: promptAnswers.seo_keywords,
    seo_title: promptAnswers.seo_title,
    seo_description: promptAnswers.seo_description,
    open_graph_title: promptAnswers.open_graph_title,
    open_graph_description: promptAnswers.open_graph_description,
    open_graph: true,
    contact_method: data.contact_method,
    analytics: data.analytics,
    animations: data.animations,
    accessibility_level: data.accessibility_level,
    language: data.language || locale,
    lazy_loading: data.lazy_loading,
    semantic_html: data.semantic_html,
    alt_text: data.alt_text,
    responsive: data.responsive,
    reduced_motion: data.reduced_motion,
    answers: promptAnswers,
    generation_quality_mode: aiMode,
    locale,
  };
}
