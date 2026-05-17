const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");

function read(relPath) {
  return fs.readFileSync(path.join(root, relPath), "utf8");
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const sidebar = read("src/components/Sidebar.tsx");
assert(sidebar.includes('href: "/wizard"'), "Sidebar deve manter /wizard");
assert(sidebar.includes('href: "/templates"'), "Sidebar deve manter /templates");
assert(sidebar.includes('href: "/downloads"'), "Sidebar deve manter /downloads");
assert(sidebar.includes("pointer-events-auto"), "Sidebar deve permanecer clicável");

const shell = read("src/wizards/core/WizardShell.tsx");
assert(shell.includes("xl:flex-row"), "Wizard shell deve manter layout responsivo");

const liveBuilder = read("src/components/live-builder/LiveProjectBuilder.tsx");
assert(liveBuilder.includes("pointer-events-auto"), "Live builder não pode capturar cliques indevidamente");

const premiumShell = read("src/components/premium/PremiumShell.tsx");
assert(premiumShell.includes("pointer-events-none"), "Background premium não pode bloquear cliques");

const actions = read("src/wizards/core/WizardActions.tsx");
assert(actions.includes("back_to_selector"), "Botão voltar deve funcionar no step 1");

const staticPayload = read("src/wizards/static-site/staticSitePayload.ts");
assert(staticPayload.includes("buildFallbackDescription"), "Payload estático precisa de fallback descritivo");
assert(staticPayload.includes("generation_quality_mode"), "Payload estático precisa de generation_quality_mode");
assert(staticPayload.includes('stack: "static-site"'), "Payload estático precisa do stack legível");
assert(staticPayload.includes("project_description"), "Payload estático precisa de project_description");

const staticWizard = read("src/wizards/static-site/StaticSiteWizard.tsx");
assert(staticWizard.includes('router.push("/wizard")'), "Voltar no static-site deve sair para /wizard quando necessário");
assert(staticWizard.includes("Falha ao gerar projeto."), "Erro de geração deve ser detalhado");
assert(staticWizard.includes('generation_quality_mode = aiMode === "agent_boost_100" ? "agent_boost_100" : "local_90"'), "Modo de geração deve ser mapeado corretamente");

console.log("static-site-wizard-navigation.test: ok");
