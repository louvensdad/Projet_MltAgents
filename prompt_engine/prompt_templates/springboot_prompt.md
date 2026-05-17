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
- **Stack principal:** Java + Spring Boot
- **Versao do Java:** {java_version}
- **Versao do Spring Boot:** {spring_boot_version}
- **Ferramenta de build:** {build_tool}
- **Tipo de projeto:** backend
- **Arquitetura:** {architecture}

## Decisoes de Arquitetura
- **Organizacao de pacotes:** {package_structure}
- **Mensageria:** {messaging}
- **Service Discovery:** {service_discovery}
- **API Gateway:** {api_gateway}
- **OpenAPI/Swagger:** {openapi}

## Banco de Dados
- **Banco:** {database}
- **ORM:** {orm}

## Seguranca
- **Estrategia de autenticacao:** {auth_strategy}
- **Modulos de seguranca:** {security_modules}
- **Keycloak:** {keycloak_integration}
- **Nivel de seguranca:** {security_level}

## Observabilidade
- **Monitoramento:** {monitoring}

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
- pom.xml (ou build.gradle)
- src/main/java/
- src/main/resources/application.yml
- README.md

## Arquivos Proibidos
- .env (nunca copiar .env real)
- credentials.json, secrets.yaml
- Qualquer segredo real

## Constraints (PROIBICOES)
{constraints}

## Criterios de Qualidade
- Todas entidades devem ser geradas
- Todas funcionalidades devem ser implementadas
- Arquivos obrigatorios devem existir
- Build Maven/Gradle deve passar
- Testes devem passar
- Nenhum codigo de outro stack (Python, Node, PHP, C#)

## Criterios de Download
- Projeto compilavel com Maven ou Gradle
- application.yml com placeholders (nunca valores reais)
- Dockerfile e docker-compose.yml se Docker foi solicitado

## Gatekeepers Ativos
- Stack Gate → verifica se e Java + Spring Boot
- Fidelity Gate → verifica fidelidade ao briefing
- Quality Gate → verifica completude do projeto
- Security Gate → verifica ausencia de segredos
- Locale Gate → verifica idioma do projeto

## Modo de Geracao
- **Modo:** {generation_mode}
- **Gatekeeper ativo:** {gatekeeper_active}
