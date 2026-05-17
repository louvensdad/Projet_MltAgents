/**
 * Route Separation Tests
 *
 * Verifies that Wizard and Download routes are completely separate.
 * Run: npx tsx src/__tests__/route-separation.test.ts
 */

const TESTS: { name: string; pass: boolean; detail: string }[] = [];
let passed = 0;
let failed = 0;

function assert(condition: boolean, name: string, detail: string) {
  TESTS.push({ name, pass: condition, detail });
  if (condition) passed++;
  else failed++;
}

async function run() {
  // ── 1. Sidebar routes ──────────────────────────────────────────
  const sidebarSrc = await Bun
    ? null
    : await (await import("fs")).promises.readFile(
        __dirname + "/../components/Sidebar.tsx",
        "utf-8"
      ).catch(() => null);

  // If we can read the source, check it
  if (sidebarSrc) {
    const wizardLinks = sidebarSrc.match(/href:\s*["']\/wizard["']/g);
    const downloadLinks = sidebarSrc.match(/href:\s*["']\/downloads["']/g);
    const wizardDownload = sidebarSrc.match(/download.*href.*\/wizard|href.*\/wizard.*download/is);

    assert(
      !wizardDownload,
      "Sidebar: Download link nao aponta para /wizard",
      "Nenhuma entrada 'download' com href='/wizard' encontrada"
    );

    const downloadEntry = sidebarSrc.match(/sidebar\.downloads.*href.*["'](\/[^"']+)["']/);
    assert(
      downloadEntry?.[1] === "/downloads",
      `Sidebar: Downloads href deve ser /downloads, obtido: ${downloadEntry?.[1]}`,
      "Sidebar sidebar.downloads href aponta para /downloads"
    );
  }

  // ── 2. Frontend page routes exist ──────────────────────────────
  const fs = await (await import("fs")).promises;
  const path = await import("path");

  const appDir = path.resolve(__dirname + "/../app");
  const wizardPageExists = fs.existsSync(path.join(appDir, "wizard/page.tsx"));
  const wizardSlugPageExists = fs.existsSync(path.join(appDir, "wizard/[slug]/page.tsx"));
  const downloadsPageExists = fs.existsSync(path.join(appDir, "downloads/page.tsx"));
  const projectsPageExists = fs.existsSync(path.join(appDir, "projects/page.tsx"));

  assert(wizardPageExists, "Pagina /wizard existe", "/wizard/page.tsx encontrado");
  assert(wizardSlugPageExists, "Pagina /wizard/[slug] existe", "/wizard/[slug]/page.tsx encontrado");
  assert(downloadsPageExists, "Pagina /downloads existe", "/downloads/page.tsx encontrado");
  assert(projectsPageExists, "Pagina /projects existe", "/projects/page.tsx encontrado");

  // ── 3. Frontend never uses /api/downloads in wizard code ───────
  const wizardDir = path.resolve(__dirname + "/../wizards");
  const wizardFiles: string[] = [];

  function walkDir(dir: string) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const e of entries) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) walkDir(full);
      else if (e.name.endsWith(".tsx") || e.name.endsWith(".ts")) wizardFiles.push(full);
    }
  }
  if (fs.existsSync(wizardDir)) walkDir(wizardDir);

  for (const f of wizardFiles) {
    const content = fs.readFileSync(f, "utf-8");
    const hasDownloadApi = content.includes("/api/download");
    assert(
      !hasDownloadApi,
      `Wizard nao chama /api/download: ${path.relative(appDir, f)}`,
      `Arquivo ${path.relative(appDir, f)} nao contem /api/download`
    );
  }

  // ── 4. Download pages never use /api/wizard ────────────────────
  const downloadPageFiles = [
    path.join(appDir, "downloads/page.tsx"),
    path.join(appDir, "projects", "[id]", "checkout", "page.tsx"),
    path.join(appDir, "projects/page.tsx"),
  ];

  for (const f of downloadPageFiles) {
    if (!fs.existsSync(f)) continue;
    const content = fs.readFileSync(f, "utf-8");
    const hasWizardApi = content.includes("/api/wizard");
    assert(
      !hasWizardApi,
      `Download nao chama /api/wizard: ${path.relative(appDir, f)}`,
      `Arquivo ${path.relative(appDir, f)} nao contem /api/wizard`
    );
  }

  // ── 5. API calls use correct prefixes ──────────────────────────
  const allSourceFiles: string[] = [];
  const srcDir = path.resolve(__dirname + "/..");
  function walkAll(dir: string) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const e of entries) {
      const full = path.join(dir, e.name);
      if (e.isDirectory() && !e.name.startsWith("__") && e.name !== "node_modules") walkAll(full);
      else if ((e.name.endsWith(".tsx") || e.name.endsWith(".ts")) && !e.name.endsWith(".spec.ts")) allSourceFiles.push(full);
    }
  }
  if (fs.existsSync(srcDir)) walkAll(srcDir);

  const downloadApis: { file: string; line: string }[] = [];
  const wizardApis: { file: string; line: string }[] = [];

  for (const f of allSourceFiles) {
    const content = fs.readFileSync(f, "utf-8");
    const lines = content.split("\n");
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.includes("/api/downloads")) {
        downloadApis.push({ file: path.relative(srcDir, f), line: line.trim() });
      }
      if (line.includes("/api/wizard")) {
        wizardApis.push({ file: path.relative(srcDir, f), line: line.trim() });
      }
    }
  }

  // All download API calls should use /api/downloads prefix
  const oldDownloadApis = allSourceFiles.filter((f) => {
    const content = fs.readFileSync(f, "utf-8");
    return content.includes("/api/projects/") && (content.includes("download-info") || content.includes('/download"'));
  });

  assert(
    oldDownloadApis.length === 0,
    "Nenhuma chamada antiga /api/projects/*/download ou /download-info",
    `Encontradas ${oldDownloadApis.length} chamadas antigas`
  );

  // ── 6. Sidebar /wizard exists only for wizard entries ──────────
  if (sidebarSrc) {
    const wizardEntry = sidebarSrc.match(/sidebar\.wizard.*href.*["'](\/[^"']+)["']/);
    assert(
      wizardEntry?.[1] === "/wizard",
      `Sidebar: Wizard href deve ser /wizard, obtido: ${wizardEntry?.[1]}`,
      "Sidebar sidebar.wizard href aponta para /wizard"
    );
  }

  // ── Results ────────────────────────────────────────────────────
  console.log("\n" + "=".repeat(50));
  console.log("  TESTE DE SEPARACAO DE ROTAS");
  console.log("=".repeat(50));
  for (const t of TESTS) {
    const icon = t.pass ? "  PASS" : "  FAIL";
    console.log(`${icon} | ${t.name}`);
    if (!t.pass) console.log(`       → ${t.detail}`);
  }
  console.log("-".repeat(50));
  console.log(`  Total: ${TESTS.length}  Passed: ${passed}  Failed: ${failed}`);
  console.log("=".repeat(50));

  process.exit(failed > 0 ? 1 : 0);
}

run().catch(console.error);
