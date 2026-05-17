export interface StaticSiteData {
  site_type: string;
  visual_style: string;
  color_palette: string;
  brand_tone: string;
  has_logo: boolean;
  dark_mode: boolean;
  sections: string[];
  site_name: string;
  slogan: string;
  company_description: string;
  main_texts: string;
  ctas: string;
  target_audience: string;
  ux_options: string[];
  meta_title: string;
  meta_description: string;
  keywords: string;
  open_graph: boolean;
  sitemap: boolean;
  robots_txt: boolean;
  lazy_loading: boolean;
  form_options: string[];
  csp_enabled: boolean;
  js_sanitization: boolean;
  unsafe_link_protection: boolean;
  no_credentials_frontend: boolean;
  form_validation: boolean;
}

export const DEFAULT_STATIC_SITE_DATA: StaticSiteData = {
  site_type: "",
  visual_style: "",
  color_palette: "",
  brand_tone: "",
  has_logo: false,
  dark_mode: true,
  sections: [],
  site_name: "",
  slogan: "",
  company_description: "",
  main_texts: "",
  ctas: "",
  target_audience: "",
  ux_options: [],
  meta_title: "",
  meta_description: "",
  keywords: "",
  open_graph: true,
  sitemap: true,
  robots_txt: true,
  lazy_loading: true,
  form_options: [],
  csp_enabled: true,
  js_sanitization: true,
  unsafe_link_protection: true,
  no_credentials_frontend: true,
  form_validation: true,
};

function buildFallbackDescription(data: StaticSiteData) {
  const name = data.site_name.trim() || "o site";
  const type = data.site_type.trim() || "landing page";
  const audience = data.target_audience.trim() || "seu público";
  return `${name} é uma ${type} independente, criada para apresentar a marca, capturar leads e converter ${audience} com SEO, acessibilidade e performance.`;
}

export function buildStaticSitePromptAnswers(data: StaticSiteData, locale: string) {
  const projectDescription = data.company_description.trim() || buildFallbackDescription(data);
  const projectObjective = data.main_texts.trim() || data.slogan.trim() || projectDescription;
  const problemSolved = data.ctas.trim() || `Converter ${data.target_audience.trim() || "visitantes"} em leads e oportunidades com uma landing page independente.`;
  const generationMode = data.dark_mode ? "premium_dark" : "premium_light";
  const businessRules = [
    "No backend, no secrets, no hardcoded credentials",
    "SEO, accessibility and responsive-first rendering",
    "Single-page static delivery with optional analytics and forms",
  ];

  return {
    project_name: data.site_name || "Meu Site",
    project_description: projectDescription,
    project_objective: projectObjective,
    problem_solved: problemSolved,
    project_language: locale,
    generation_mode: generationMode,
    site_type: data.site_type,
    visual_style: data.visual_style,
    color_palette: data.color_palette,
    brand_tone: data.brand_tone,
    dark_mode: data.dark_mode,
    lazy_loading: data.lazy_loading,
    meta_title: data.meta_title || data.site_name,
    meta_description: data.meta_description || projectDescription,
    open_graph: data.open_graph,
    sitemap: data.sitemap,
    robots_txt: data.robots_txt,
    csp_enabled: data.csp_enabled,
    js_sanitization: data.js_sanitization,
    unsafe_link_protection: data.unsafe_link_protection,
    form_validation: data.form_validation,
    sections: data.sections,
    ux_options: data.ux_options,
    form_options: data.form_options,
    gatekeeper_active: true,
    confirmed_business_rules: businessRules,
    confirmed_entities: ["LandingPage", "MarketingSection"],
    confirmed_features: [
      ...data.sections,
      ...data.ux_options,
      ...data.form_options,
    ],
  };
}

export function buildStaticSitePayload(data: StaticSiteData, locale: string) {
  const promptAnswers = buildStaticSitePromptAnswers(data, locale);
  return {
    wizard_type: "static_site",
    project_type: "static_site",
    ...promptAnswers,
    user_idea: promptAnswers.project_description,
    stack: "static-site",
    backend_stack: "Static HTML",
    stack_profile_id: "static_site",
    frontend_stack: "html_css_js",
    design: {
      visual_style: data.visual_style,
      color_palette: data.color_palette,
      brand_tone: data.brand_tone,
      has_logo: data.has_logo,
      dark_mode: data.dark_mode,
    },
    content: {
      site_name: data.site_name,
      slogan: data.slogan,
      company_description: promptAnswers.project_description,
      main_texts: data.main_texts,
      ctas: data.ctas,
      target_audience: data.target_audience,
    },
    ux: {
      options: data.ux_options,
    },
    seo: {
      meta_title: data.meta_title,
      meta_description: data.meta_description,
      keywords: data.keywords,
      open_graph: data.open_graph,
      sitemap: data.sitemap,
      robots_txt: data.robots_txt,
      lazy_loading: data.lazy_loading,
    },
    forms: {
      options: data.form_options,
    },
    security_frontend: {
      csp_enabled: data.csp_enabled,
      js_sanitization: data.js_sanitization,
      unsafe_link_protection: data.unsafe_link_protection,
      no_credentials_frontend: data.no_credentials_frontend,
      form_validation: data.form_validation,
    },
    answers: promptAnswers,
    generation_quality_mode: "local_90",
    locale,
  };
}
