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

export function buildStaticSitePayload(data: StaticSiteData, locale: string) {
  return {
    wizard_type: "static_site",
    project_type: "static_site",
    project_name: data.site_name || "Meu Site",
    backend_stack: "Static HTML",
    project_language: locale,
    stack_profile_id: "static_site",
    frontend_stack: "html_css_js",
    site_type: data.site_type,
    sections: data.sections,
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
      company_description: data.company_description,
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
    locale,
  };
}
