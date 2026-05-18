# Agents Full Audit

Data: 2026-05-17

## Resumo

Auditoria executada sobre `agents/`, `agents/core/`, `agents/stack/`, `agents/gatekeepers/` e `agents/core/project_runner.py`.

Correcoes aplicadas:

- Criados agentes globais faltantes: `PromptMasterAgent`, `StackRegistryAgent`, `QualityAgent`, `DownloadAgent`, `TemplateAgent`, `UIUXAgent`, `EngineeringAnalyzerAgent`.
- Conectados agentes globais ao `Pipeline` oficial dentro do `ProjectRunner`.
- Criados fiscais por stack para todas as stacks pedidas.
- Conectado `run_stack_agent(...)` ao `ProjectRunner` antes do gatekeeper.
- Substituidos agentes de stack que eram `pass` por validacao real via `StackFiscalBase`.

## Agentes globais

| agent_name | exists | registered | connected | used_by_pipeline | status | action_needed |
|---|---:|---:|---:|---:|---|---|
| ArchitectureAgent | yes | yes | yes | yes | ok via `ArchitectAgent`/core architecture | none |
| PromptMasterAgent | yes | yes | yes | yes | fixed | none |
| StackRegistryAgent | yes | yes | yes | yes | fixed | none |
| SecurityAgent | yes | yes | yes | yes | fixed: now extends pipeline `BaseAgent` | none |
| QualityAgent | yes | yes | yes | yes | fixed | none |
| DocumentationAgent | yes | partial | partial | no direct call | exists in `agents/core`; not in official list | optional connect later |
| DownloadAgent | yes | yes | yes | yes | fixed | none |
| TemplateAgent | yes | yes | yes | yes | fixed | none |
| UIUXAgent | yes | yes | yes | yes | fixed | none |
| RefactorAgent | yes | no | no | no | exists in core; not required in generation path yet | connect when refactor flow is official |
| AntiPatternAgent | yes | no | no | no | exists in core; separate root protocol | connect post-generation in future |
| EngineeringAnalyzerAgent | yes | yes | yes | yes | fixed | none |
| DevOpsAgent | yes | yes | yes | yes | ok | none |
| PerformanceAgent | yes | no | no | no | exists in core; not in generation path | optional |
| ObservabilityAgent | yes | no | no | no | exists in core; not in generation path | optional |
| DatabaseAgent | yes | no | no | no | exists in core; not in generation path | optional |
| FrontendAgent | yes | yes | yes | yes | ok | none |
| BackendAgent | yes | yes | yes | yes | ok | none |

## Agentes por stack

| agent_name | exists | registered | connected | used_by_pipeline | status | action_needed |
|---|---:|---:|---:|---:|---|---|
| StaticSiteAgent | yes | yes | yes | yes | fixed | none |
| SpringBootAgent | yes | yes | yes | yes | fixed | none |
| FastAPIAgent | yes | yes | yes | yes | fixed | none |
| NestJSAgent | yes | yes | yes | yes | fixed | none |
| ExpressAgent | yes | yes | yes | yes | fixed | none |
| LaravelAgent | yes | yes | yes | yes | fixed | none |
| DotnetAgent | yes | yes | yes | yes | fixed | none |
| AngularAgent | yes | yes | yes | yes | fixed | none |
| ReactAgent | yes | yes | yes | yes | fixed | none |
| NextJSAgent | yes | yes | yes | yes | fixed | none |
| VueAgent | yes | yes | yes | yes | fixed | none |
| BlazorAgent | yes | yes | yes | yes | fixed | none |
| AutomationAgent | yes | yes | yes | yes | fixed | none |
| AIAgentsAgent | yes | yes | yes | yes | fixed | none |

## Gatekeepers por stack

Todos os gatekeepers pedidos existem e estao registrados em `GatekeeperRegistry`: `static_site`, `spring_boot`, `fastapi`, `nestjs`, `express`, `laravel`, `dotnet`, `angular`, `react`, `nextjs`, `vue`, `blazor`, `automation`, `ai_agents`.

