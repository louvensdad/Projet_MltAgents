# PROMPT MASTER — {project_name}

## Metadados do Projeto
- **Nome:** {project_name}
- **Objetivo:** {project_objective}
- **Problema resolvido:** {problem_solved}
- **Idioma:** {project_language}
- **Publico-alvo:** {target_audience}
- **Modo de geracao:** {generation_mode}
- **Timestamp:** {generation_timestamp}

## Stack & Versoes
- **Stack principal:** Blazor
- **Versao do .NET:** {dotnet_version}
- **Modo Blazor:** {blazor_mode}
- **Modo de renderizacao:** {rendering_mode}
- **Tipo de projeto:** frontend

## Estilizacao
- **Framework CSS:** {styling}

## Roteamento
- **Roteador:** {router}

## Estado & DI
- **Gerenciamento de estado:** {state_management}
- **HTTP Client:** {http_client}

## Autenticacao
- **Estrategia:** {auth_strategy}
- **AuthStateProvider customizado:** {auth_state_provider}

## Funcionalidades Extras
- SignalR (tempo real): {signalr}
- i18n: {i18n}
- JSInterop modules: {js_interop}

## Entidades & Funcionalidades
- **Entidades:** {confirmed_entities}
- **Funcionalidades:** {confirmed_features}
- **Regras de negocio:** {confirmed_business_rules}

## Testes
- **Estrategia:** {testing_strategy}

## Arquivos Obrigatorios
- *.csproj
- Program.cs
- App.razor
- README.md

## Arquivos Proibidos
- .env (nunca copiar .env real)
- credentials.json, secrets.yaml
- appsettings.Development.json com secrets reais
- Qualquer segredo real

## Constraints (PROIBICOES)
{constraints}

## Criterios de Qualidade
- Todas as paginas e componentes devem ser gerados
- Roteamento deve funcionar
- dotnet build deve passar
- Testes devem passar
- Nenhum codigo de outro stack frontend (React, Angular, Vue, etc.)

## Criterios de Download
- Projeto compilavel com dotnet CLI
- dotnet run deve iniciar o projeto
- Backend esperado: {recommended_backends}

## Gatekeepers Ativos
- Stack Gate → verifica se e Blazor
- Fidelity Gate → verifica fidelidade ao briefing
- Quality Gate → verifica completude do projeto
- Security Gate → verifica ausencia de segredos
- Locale Gate → verifica idioma do projeto

## Modo de Geracao
- **Modo:** {generation_mode}
- **Gatekeeper ativo:** {gatekeeper_active}
