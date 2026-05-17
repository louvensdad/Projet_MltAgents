"""
StaticSiteGatekeeper — Valida projetos de site estático (HTML/CSS/JS puro).

Atua em 4 fases:
1. pre_generation_check  — Garante que o briefing é compatível com site estático
2. generation_plan_check — Valida o plano de geração (semântica, SEO, acessibilidade)
3. post_generation_check — Verifica arquivos gerados
4. download_gate_check   — Validação final de segurança e integridade
"""

import os
from typing import Dict, Any, List

from agents.gatekeepers.base_gatekeeper import BaseGatekeeper


class StaticSiteGatekeeper(BaseGatekeeper):
    """Gatekeeper para projetos de site estático (HTML, CSS, JS vanilla)."""

    def __init__(self):
        super().__init__(name="StaticSiteGatekeeper", stack_id="static_site")

    # ══════════════════════════════════════════════════════════════════════
    # FASE 1: PRE-GENERATION CHECK
    # ══════════════════════════════════════════════════════════════════════

    def pre_generation_check(self, blueprint: Dict[str, Any]) -> Dict[str, Any]:
        """
        Bloqueia se o blueprint pede backend, autenticação, banco de dados
        ou arquitetura distribuída — incompatíveis com site estático.
        """
        checks: List[Dict[str, Any]] = []

        # ── backend_stack deve ser "Static HTML" ou "Static Site" ──────────
        backend = blueprint.get("backend_stack", "").strip()
        backend_lower = backend.lower()
        allowed_backends = ["static html", "static site", "static", "none", "", "html", "css"]
        if backend_lower not in allowed_backends:
            forbidden_backend_keywords = [
                "fastapi", "springboot", "spring", "express", "nestjs",
                "django", "flask", "laravel", "asp.net", "dotnet",
                "node", "python", "java", "php", "c#", "ruby", "go",
                "next.js", "nextjs", "nuxt", "sveltekit",
            ]
            if any(kw in backend_lower for kw in forbidden_backend_keywords):
                checks.append(self._block(
                    "backend_stack_check",
                    f"Stack de backend '{backend}' não é compatível com site estático. "
                    f"Use 'Static HTML' ou 'Static Site'."
                ))
            else:
                checks.append(self._warn(
                    "backend_stack_check",
                    f"Backend stack '{backend}' não reconhecido como estático. "
                    f"Certifique-se de que nenhum código server-side será gerado."
                ))
        else:
            checks.append(self._ok("backend_stack_check"))

        # ── Sem autenticação ───────────────────────────────────────────────
        auth_required = blueprint.get("auth_required", False)
        auth_strategy = blueprint.get("auth_strategy", "")
        jwt_mentioned = "jwt" in str(blueprint).lower()
        oauth_mentioned = "oauth" in str(blueprint).lower()
        auth_keywords_present = any(
            keyword in str(blueprint).lower()
            for keyword in ["autenticação", "login", "usuário", "user", "password", "senha"]
        )

        if auth_required or auth_strategy or jwt_mentioned or oauth_mentioned or auth_keywords_present:
            checks.append(self._block(
                "auth_check",
                "Sites estáticos não suportam autenticação (JWT, OAuth2, login). "
                "Remova requisitos de auth ou escolha um stack com backend."
            ))
        else:
            checks.append(self._ok("auth_check"))

        # ── Sem banco de dados ─────────────────────────────────────────────
        db_required = blueprint.get("database_required", False)
        db_type = blueprint.get("database_type", "")
        db_keywords = ["postgres", "mysql", "mongodb", "sqlite", "redis", "dynamodb", "firebase"]
        db_in_blueprint = any(kw in str(blueprint).lower() for kw in db_keywords)

        if db_required or db_type or db_in_blueprint:
            checks.append(self._block(
                "database_check",
                "Sites estáticos não utilizam banco de dados. "
                "Remova requisitos de banco de dados ou escolha um stack com backend."
            ))
        else:
            checks.append(self._ok("database_check"))

        # ── Sem microserviços / Kafka ─────────────────────────────────────
        distributed_keywords = ["microserviço", "microservice", "kafka", "rabbitmq",
                                 "grpc", "message broker", "service mesh", "kubernetes"]
        found_distributed = [kw for kw in distributed_keywords
                             if kw in str(blueprint).lower()]
        if found_distributed:
            checks.append(self._block(
                "distributed_architecture_check",
                f"Site estático não suporta arquitetura distribuída. "
                f"Termos encontrados: {', '.join(found_distributed)}."
            ))
        else:
            checks.append(self._ok("distributed_architecture_check"))

        # ── design_brief deve ter info de estilo ───────────────────────────
        design_brief = blueprint.get("design_brief", {})
        if isinstance(design_brief, dict):
            has_style = any(
                design_brief.get(k)
                for k in ["color_palette", "typography", "style_guide",
                           "branding", "primary_color", "font_family"]
            )
            if not has_style and not design_brief.get("description"):
                checks.append(self._warn(
                    "design_brief_check",
                    "design_brief não contém informações de estilo (cores, tipografia, branding). "
                    "O site pode ser gerado sem identidade visual definida."
                ))
            else:
                checks.append(self._ok("design_brief_check"))
        else:
            checks.append(self._warn(
                "design_brief_check",
                "design_brief ausente ou em formato inesperado."
            ))

        return self._aggregate_checks(checks, "pre_generation")

    # ══════════════════════════════════════════════════════════════════════
    # FASE 2: GENERATION PLAN CHECK
    # ══════════════════════════════════════════════════════════════════════

    def generation_plan_check(self, blueprint: Dict[str, Any]) -> Dict[str, Any]:
        """
        Valida que o plano de geração cobre HTML semântico, acessibilidade,
        SEO, design responsivo e organização de assets.
        """
        checks: List[Dict[str, Any]] = []
        plan = blueprint.get("generation_plan", blueprint)
        plan_str = str(plan).lower()

        # ── HTML5 semântico ────────────────────────────────────────────────
        semantic_tags = ["<header", "<nav", "<main", "<section",
                          "<article", "<footer", "<aside"]
        found_semantic = [tag.strip("<") for tag in semantic_tags if tag in plan_str]
        if len(found_semantic) >= 4:
            checks.append(self._ok("semantic_html5_check"))
        elif len(found_semantic) > 0:
            checks.append(self._warn(
                "semantic_html5_check",
                f"Estrutura semântica HTML5 parcial. Tags encontradas: {', '.join(found_semantic)}. "
                f"Recomendado usar header, nav, main, section, article e footer."
            ))
        else:
            checks.append(self._fail(
                "semantic_html5_check",
                "Estrutura semântica HTML5 não planejada. "
                "Utilize tags semânticas: header, nav, main, section, article, footer."
            ))

        # ── Acessibilidade ──────────────────────────────────────────────────
        aria_keywords = ["aria-", "role=", "alt=", "tabindex", "keyboard nav", "focus"]
        found_aria = [k for k in aria_keywords if k in plan_str]
        if len(found_aria) >= 3:
            checks.append(self._ok("accessibility_check"))
        elif len(found_aria) > 0:
            checks.append(self._warn(
                "accessibility_check",
                f"Acessibilidade parcialmente planejada. Elementos encontrados: {', '.join(found_aria)}. "
                f"Inclua atributos ARIA, textos alternativos e navegação por teclado."
            ))
        else:
            checks.append(self._fail(
                "accessibility_check",
                "Acessibilidade não planejada. Inclua ARIA labels, alt text em imagens, "
                "e suporte a navegação por teclado."
            ))

        # ── SEO ─────────────────────────────────────────────────────────────
        seo_keywords = ["meta", "description", "og:", "twitter:", "structured data",
                         "schema.org", "sitemap", "canonical", "title"]
        found_seo = [k for k in seo_keywords if k in plan_str]
        if len(found_seo) >= 4:
            checks.append(self._ok("seo_check"))
        elif len(found_seo) > 0:
            checks.append(self._warn(
                "seo_check",
                f"SEO parcialmente planejado. Elementos encontrados: {', '.join(found_seo)}. "
                f"Inclua meta tags, Open Graph, dados estruturados e sitemap."
            ))
        else:
            checks.append(self._fail(
                "seo_check",
                "SEO não planejado. Inclua meta description, Open Graph tags, "
                "dados estruturados (schema.org) e sitemap.xml."
            ))

        # ── Design responsivo ───────────────────────────────────────────────
        responsive_keywords = ["media query", "@media", "mobile-first",
                                "viewport", "responsive", "breakpoint",
                                "flexbox", "grid", "clamp", "fluid"]
        found_responsive = [k for k in responsive_keywords if k in plan_str]
        if len(found_responsive) >= 3:
            checks.append(self._ok("responsive_design_check"))
        elif len(found_responsive) > 0:
            checks.append(self._warn(
                "responsive_design_check",
                f"Design responsivo parcialmente planejado. Elementos: {', '.join(found_responsive)}. "
                f"Adicione media queries, breakpoints e abordagem mobile-first."
            ))
        else:
            checks.append(self._fail(
                "responsive_design_check",
                "Design responsivo não planejado. Inclua media queries, "
                "viewport meta tag e abordagem mobile-first."
            ))

        # ── Organização de assets ──────────────────────────────────────────
        asset_dirs = ["css/", "js/", "images/", "fonts/"]
        found_assets = [d for d in asset_dirs if d in plan_str]
        if len(found_assets) >= 3:
            checks.append(self._ok("asset_organization_check"))
        elif len(found_assets) > 0:
            checks.append(self._warn(
                "asset_organization_check",
                f"Organização de assets parcial. Pastas planejadas: {', '.join(found_assets)}. "
                f"Organize assets em css/, js/, images/, fonts/."
            ))
        else:
            checks.append(self._fail(
                "asset_organization_check",
                "Assets não organizados em diretórios dedicados. "
                "Crie pastas css/, js/, images/, fonts/."
            ))

        # ── Seções de conteúdo ─────────────────────────────────────────────
        content_sections = ["hero", "features", "about", "contact", "footer",
                             "testimonial", "pricing", "faq", "services"]
        found_sections = [s for s in content_sections if s in plan_str]
        if len(found_sections) >= 3:
            checks.append(self._ok("content_sections_check"))
        elif len(found_sections) > 0:
            checks.append(self._warn(
                "content_sections_check",
                f"Poucas seções de conteúdo planejadas: {', '.join(found_sections)}. "
                f"Considere incluir hero, features, about, contact e footer."
            ))
        else:
            checks.append(self._warn(
                "content_sections_check",
                "Nenhuma seção de conteúdo identificada no plano. "
                "Defina seções como hero, features, about, contact, footer."
            ))

        return self._aggregate_checks(checks, "generation_plan")

    # ══════════════════════════════════════════════════════════════════════
    # FASE 3: POST-GENERATION CHECK
    # ══════════════════════════════════════════════════════════════════════

    def post_generation_check(self, project_path: str, blueprint: Dict[str, Any]) -> Dict[str, Any]:
        """
        Verifica arquivos gerados: estrutura, HTML semântico, acessibilidade,
        SEO, hierarquia de headings, ausência de código backend.
        """
        checks: List[Dict[str, Any]] = []

        # ── Arquivos obrigatórios ──────────────────────────────────────────
        required_files = [
            "index.html",
            "assets/css/style.css",
            "assets/js/main.js",
            "assets/images/",
            "sections/",
            "README.md",
        ]
        req_check = self._check_required_files(project_path, required_files, "static_site")
        checks.append(req_check)

        # ── Diretórios esperados ───────────────────────────────────────────
        expected_dirs = ["assets/css", "assets/js", "assets/images", "sections"]
        dir_check = self._check_directory_structure(project_path, expected_dirs, "static_site")
        checks.append(dir_check)

        # ── Tags HTML semânticas ───────────────────────────────────────────
        html_files = self._scan_filenames(project_path, [".html", ".htm"])
        if html_files:
            main_html = os.path.join(project_path, "index.html")
            if os.path.exists(main_html):
                semantic_tags = ["<header", "<nav", "<main", "<section", "<article", "<footer"]
                tag_check = self._check_file_contains(main_html, semantic_tags)
                tag_check["check"] = "semantic_html_elements"
                # Override: warn instead of fail for partial results
                missing_count = len(tag_check.get("missing_patterns", []))
                if missing_count == 0:
                    tag_check["status"] = "passed"
                elif missing_count <= 2:
                    tag_check["status"] = "warning"
                    tag_check["message"] = (
                        f"Tags semânticas ausentes: {', '.join(tag_check.get('missing_patterns', []))}. "
                        f"Adicione-as para melhor estrutura HTML5."
                    )
                checks.append(tag_check)
            else:
                checks.append(self._fail("semantic_html_elements",
                                          "index.html não encontrado para verificação de tags semânticas."))
        else:
            checks.append(self._fail("semantic_html_elements",
                                      "Nenhum arquivo HTML encontrado no projeto."))

        # ── Meta viewport (responsivo) ─────────────────────────────────────
        if os.path.exists(os.path.join(project_path, "index.html")):
            vp_check = self._check_file_contains(
                os.path.join(project_path, "index.html"),
                ['meta name="viewport"']
            )
            vp_check["check"] = "viewport_meta_tag"
            if vp_check.get("status") != "passed":
                vp_check["status"] = "failed"
                vp_check["message"] = "Meta viewport não encontrada. Adicione <meta name='viewport' content='width=device-width, initial-scale=1.0'>."
            checks.append(vp_check)
        else:
            checks.append(self._fail("viewport_meta_tag", "index.html não encontrado."))

        # ── Alt attributes em imagens ──────────────────────────────────────
        if os.path.exists(os.path.join(project_path, "index.html")):
            alt_check = self._check_file_contains(
                os.path.join(project_path, "index.html"),
                ["alt="]
            )
            alt_check["check"] = "image_alt_attributes"
            if alt_check.get("status") != "passed":
                alt_check["status"] = "warning"
                alt_check["message"] = (
                    "Nem todas as imagens possuem atributo alt. "
                    "Adicione alt text descritivo para acessibilidade."
                )
            checks.append(alt_check)

        # ── Hierarquia de headings ─────────────────────────────────────────
        if os.path.exists(os.path.join(project_path, "index.html")):
            heading_check = self._check_file_contains(
                os.path.join(project_path, "index.html"),
                ["<h1", "<h2", "<h3"]
            )
            heading_check["check"] = "heading_hierarchy"
            missing_headings = heading_check.get("missing_patterns", [])
            if "<h1" in missing_headings:
                heading_check["status"] = "failed"
                heading_check["message"] = "Tag <h1> ausente. Toda página deve ter um heading principal (h1)."
            elif len(missing_headings) >= 2:
                heading_check["status"] = "warning"
                heading_check["message"] = (
                    f"Hierarquia de headings incompleta. Ausentes: {', '.join(missing_headings)}. "
                    f"Use h1 → h2 → h3 em ordem hierárquica."
                )
            else:
                heading_check["status"] = "passed"
            checks.append(heading_check)

        # ── SEO meta tags ──────────────────────────────────────────────────
        if os.path.exists(os.path.join(project_path, "index.html")):
            seo_check = self._check_file_contains(
                os.path.join(project_path, "index.html"),
                ['meta name="description"', 'og:title', 'og:description']
            )
            seo_check["check"] = "seo_meta_tags"
            missing_seo = seo_check.get("missing_patterns", [])
            if len(missing_seo) == 0:
                seo_check["status"] = "passed"
            elif len(missing_seo) <= 1:
                seo_check["status"] = "warning"
                seo_check["message"] = (
                    f"Meta tag SEO ausente: {', '.join(missing_seo)}. "
                    f"Adicione para melhor indexação."
                )
            else:
                seo_check["status"] = "warning"
                seo_check["message"] = (
                    f"Meta tags SEO ausentes: {', '.join(missing_seo)}. "
                    f"Adicione description, og:title e og:description."
                )
            checks.append(seo_check)

        # ── Favicon ou site.webmanifest ────────────────────────────────────
        fav_files = self._scan_filenames(project_path, [".ico", ".webmanifest"])
        fav_found = any("favicon" in f.lower() or "site.webmanifest" in f.lower()
                         or "manifest.json" in f.lower()
                        for f in fav_files)
        if fav_found:
            checks.append(self._ok("favicon_check"))
        else:
            # Also check if favicon is referenced in HTML
            fav_present = False
            if os.path.exists(os.path.join(project_path, "index.html")):
                fav_check = self._check_file_contains(
                    os.path.join(project_path, "index.html"),
                    ["favicon", "apple-touch-icon", "manifest"]
                )
                fav_present = fav_check.get("status") == "passed"
            if fav_present:
                checks.append(self._ok("favicon_check"))
            else:
                checks.append(self._warn(
                    "favicon_check",
                    "Favicon ou site.webmanifest não encontrado. "
                    "Adicione favicon.ico e site.webmanifest para PWA readiness."
                ))

        # ── BLOCK: arquivos de backend ─────────────────────────────────────
        backend_files = [
            ".py", ".java", ".cs", ".go", ".rb", ".php",
            "package.json", "pom.xml", "requirements.txt", "composer.json",
            "Gemfile", "go.mod", "Cargo.toml", ".csproj", ".sln",
        ]
        found_backend = self._scan_filenames(project_path, backend_files)
        if found_backend:
            checks.append(self._block(
                "no_backend_files",
                f"Arquivos de backend encontrados em projeto estático: {', '.join(found_backend[:10])}. "
                f"Remova-os ou altere o stack para backend."
            ))
        else:
            checks.append(self._ok("no_backend_files"))

        # ── BLOCK: JWT / auth em código ────────────────────────────────────
        auth_patterns = ["jsonwebtoken", "jwt", "oauth", "passport",
                          "bcrypt", "argon2", "auth", "session"]
        all_text_files = self._scan_filenames(project_path, [".html", ".js", ".css", ".json", ".md"])
        auth_violations = []
        for fpath in all_text_files:
            full = os.path.join(project_path, fpath)
            try:
                with open(full, "r", encoding="utf-8", errors="ignore") as fh:
                    content = fh.read().lower()
                found_auth = [p for p in auth_patterns if p in content]
                if found_auth:
                    auth_violations.append(f"{fpath}: {', '.join(found_auth)}")
            except Exception:
                pass

        if auth_violations:
            checks.append(self._block(
                "no_auth_code",
                f"Referências a autenticação encontradas em projeto estático: "
                f"{'; '.join(auth_violations[:5])}. Sites estáticos não devem conter lógica de auth."
            ))
        else:
            checks.append(self._ok("no_auth_code"))

        # ── CSS organizado (não tudo inline) ──────────────────────────────
        if os.path.exists(os.path.join(project_path, "index.html")):
            inline_check = self._check_file_contains(
                os.path.join(project_path, "index.html"),
                ['style="']
            )
            # Inline styles are a warning; we want CSS organized in files
            if inline_check.get("status") == "passed":
                checks.append(self._warn(
                    "inline_styles_check",
                    "Estilos inline detectados no HTML. Prefira usar classes CSS no arquivo style.css "
                    "para manter separação de responsabilidades."
                ))
            else:
                checks.append(self._ok("inline_styles_check"))
        else:
            checks.append(self._ok("inline_styles_check"))

        return self._aggregate_checks(checks, "post_generation")

    # ══════════════════════════════════════════════════════════════════════
    # FASE 4: DOWNLOAD GATE CHECK
    # ══════════════════════════════════════════════════════════════════════

    def download_gate_check(self, project_path: str, blueprint: Dict[str, Any]) -> Dict[str, Any]:
        """
        Validação final: links relativos, robots.txt, sitemap, codificação,
        degradação graciosa (sem dependência JS) e peso das páginas.
        """
        checks: List[Dict[str, Any]] = []

        # ── Links relativos ou absolutos corretos ──────────────────────────
        index_path = os.path.join(project_path, "index.html")
        if os.path.exists(index_path):
            try:
                with open(index_path, "r", encoding="utf-8", errors="ignore") as f:
                    html_content = f.read()
                # Check for absolute URLs pointing to localhost or file://
                problematic_links = []
                if "http://localhost" in html_content or "http://127.0.0.1" in html_content:
                    problematic_links.append("localhost URLs")
                if "file://" in html_content:
                    problematic_links.append("file:// URLs")
                if "C:\\" in html_content or "/home/" in html_content:
                    problematic_links.append("absolute filesystem paths")

                if problematic_links:
                    checks.append(self._fail(
                        "link_quality_check",
                        f"Links problemáticos encontrados: {', '.join(problematic_links)}. "
                        f"Use caminhos relativos (./ ou ../) ou URLs absolutas de produção."
                    ))
                else:
                    checks.append(self._ok("link_quality_check"))
            except Exception:
                checks.append(self._warn("link_quality_check",
                                          "Não foi possível verificar links no index.html."))
        else:
            checks.append(self._warn("link_quality_check",
                                      "index.html não encontrado para verificação de links."))

        # ── robots.txt e sitemap.xml ───────────────────────────────────────
        robots_path = os.path.join(project_path, "robots.txt")
        sitemap_path = os.path.join(project_path, "sitemap.xml")

        if os.path.exists(robots_path):
            checks.append(self._ok("robots_txt_check"))
        else:
            checks.append(self._warn(
                "robots_txt_check",
                "robots.txt não encontrado. Crie um arquivo robots.txt para orientar crawlers."
            ))

        if os.path.exists(sitemap_path):
            checks.append(self._ok("sitemap_xml_check"))
        else:
            checks.append(self._warn(
                "sitemap_xml_check",
                "sitemap.xml não encontrado. Crie um sitemap para melhor indexação nos buscadores."
            ))

        # ── Degradação graciosa (página funciona sem JS) ───────────────────
        if os.path.exists(index_path):
            try:
                with open(index_path, "r", encoding="utf-8", errors="ignore") as f:
                    html_content = f.read()
                # If all content is loaded via JS (empty body), that's a problem
                body_start = html_content.lower().find("<body")
                body_end = html_content.lower().find("</body>")
                if body_start >= 0 and body_end >= 0:
                    body_content = html_content[body_start:body_end]
                    # Count meaningful content outside of script tags
                    import re
                    body_no_scripts = re.sub(r'<script[^>]*>.*?</script>', '', body_content,
                                             flags=re.DOTALL | re.IGNORECASE)
                    text_content = re.sub(r'<[^>]+>', '', body_no_scripts).strip()
                    if len(text_content) < 50:
                        checks.append(self._warn(
                            "graceful_degradation_check",
                            "Conteúdo visível sem JavaScript é muito reduzido. "
                            "Garanta que o conteúdo principal seja renderizado no HTML, "
                            "não apenas injetado via JS."
                        ))
                    else:
                        checks.append(self._ok("graceful_degradation_check"))
                else:
                    checks.append(self._warn("graceful_degradation_check",
                                              "Estrutura do body não encontrada no index.html."))
            except Exception:
                checks.append(self._warn("graceful_degradation_check",
                                          "Erro ao verificar degradação graciosa."))
        else:
            checks.append(self._warn("graceful_degradation_check",
                                      "index.html não encontrado."))

        # ── Codificação UTF-8 ─────────────────────────────────────────────
        if os.path.exists(index_path):
            try:
                with open(index_path, "r", encoding="utf-8") as f:
                    f.read(100)
                # Also check for charset meta
                charset_check = self._check_file_contains(
                    index_path,
                    ['charset', 'charset="utf-8"', "charset='utf-8'",
                     'charset=UTF-8', 'charset=utf-8']
                )
                charset_check["check"] = "utf8_encoding_check"
                if charset_check.get("status") == "passed":
                    checks.append(self._ok("utf8_encoding_check"))
                else:
                    checks.append(self._warn(
                        "utf8_encoding_check",
                        "Declaração de charset UTF-8 não encontrada. "
                        "Adicione <meta charset='UTF-8'> no <head>."
                    ))
            except UnicodeDecodeError:
                checks.append(self._fail(
                    "utf8_encoding_check",
                    "Arquivo não está em codificação UTF-8. "
                    "Converta todos os arquivos para UTF-8."
                ))
            except Exception as e:
                checks.append(self._warn(
                    "utf8_encoding_check",
                    f"Erro ao verificar codificação: {e}."
                ))
        else:
            checks.append(self._fail("utf8_encoding_check", "index.html não encontrado."))

        # ── Peso das imagens (otimização) ──────────────────────────────────
        image_extensions = [".png", ".jpg", ".jpeg", ".gif", ".svg", ".webp", ".ico"]
        image_files = self._scan_filenames(project_path, image_extensions)
        large_images = []
        for img_rel in image_files:
            img_path = os.path.join(project_path, img_rel)
            try:
                size_kb = os.path.getsize(img_path) / 1024
                if size_kb > 500:  # 500KB threshold for static site images
                    large_images.append(f"{img_rel} ({size_kb:.0f}KB)")
            except Exception:
                pass

        if large_images:
            checks.append(self._warn(
                "image_optimization_check",
                f"Imagens pesadas encontradas (>{500}KB): {', '.join(large_images[:5])}. "
                f"Otimize imagens para web (WebP, compressão, lazy loading)."
            ))
        elif image_files:
            checks.append(self._ok("image_optimization_check"))
        else:
            checks.append(self._ok("image_optimization_check"))

        return self._aggregate_checks(checks, "download_gate")
