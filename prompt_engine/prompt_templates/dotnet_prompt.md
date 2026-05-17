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
- **Stack principal:** C# + ASP.NET Core
- **Versao do .NET:** {dotnet_version}
- **Tipo de projeto:** {project_type}
- **Arquitetura:** {architecture}

## Decisoes de Arquitetura
- Padrao C#: {csharp_pattern}

## Banco de Dados
- **Banco:** {database}
- **ORM:** {orm}

## Seguranca
- **Estrategia de autenticacao:** {auth_strategy}
- **Swagger/OpenAPI:** {openapi}
- **Nivel de seguranca:** {security_level}

## Observabilidade
- Serilog: {serilog}
- Health Checks: {health_checks}

## Entidades & Funcionalidades
- **Entidades:** {confirmed_entities}
- **Funcionalidades:** {confirmed_features}
- **Regras de negocio:** {confirmed_business_rules}

## Testes
- **Estrategia:** {testing_strategy}

## DevOps
- **Containerizacao:** {containerization}
- **Orquestracao:** {orchestration}

## Arquivos Obrigatorios
- *.csproj
- Program.cs
- appsettings.json
- README.md

## Arquivos Proibidos
- .env (nunca copiar .env real)
- credentials.json, secrets.yaml
- Qualquer segredo real
- appsettings.Development.json com secrets reais

## Constraints (PROIBICOES)
{constraints}

## Criterios de Qualidade
- Todas entidades devem ser geradas
- Todas funcionalidades devem ser implementadas
- Arquivos obrigatorios devem existir
- dotnet build deve passar
- Testes devem passar
- Nenhum codigo de outro stack (Java, Python, Node, PHP)

## Criterios de Download
- Projeto compilavel com dotnet CLI
- appsettings.json com placeholders
- Dockerfile e docker-compose.yml se Docker foi solicitado

## Gatekeepers Ativos
- Stack Gate → verifica se e C# + ASP.NET Core
- Fidelity Gate → verifica fidelidade ao briefing
- Quality Gate → verifica completude do projeto
- Security Gate → verifica ausencia de segredos
- Locale Gate → verifica idioma do projeto

## Modo de Geracao
- **Modo:** {generation_mode}
- **Gatekeeper ativo:** {gatekeeper_active}
