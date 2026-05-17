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
- **Stack principal:** Python + FastAPI
- **Versao do Python:** {python_version}
- **Extras FastAPI:** {fastapi_extras}
- **Tipo de projeto:** backend
- **Arquitetura:** {architecture}

## Decisoes de Arquitetura
- **Modo async:** {async_mode}
- **Fila de tarefas:** {task_queue}
- **Workers:** {workers}
- **OpenAPI/Swagger:** {openapi}
- **Versionamento de API:** {api_versioning}

## Banco de Dados
- **Banco:** {database}
- **ORM:** {orm}
- **Migracao:** {migration_tool}

## Seguranca
- **Estrategia de autenticacao:** {auth_strategy}
- **Validacao Pydantic:** {pydantic_validation}
- **Nivel de seguranca:** {security_level}

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
- requirements.txt
- main.py
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
- pip install -r requirements.txt deve funcionar
- Testes devem passar
- Nenhum codigo de outro stack (Java, Node, PHP, C#)

## Criterios de Download
- Projeto executavel com uvicorn
- requirements.txt completo com versoes
- Dockerfile e docker-compose.yml se Docker foi solicitado

## Gatekeepers Ativos
- Stack Gate → verifica se e Python + FastAPI
- Fidelity Gate → verifica fidelidade ao briefing
- Quality Gate → verifica completude do projeto
- Security Gate → verifica ausencia de segredos
- Locale Gate → verifica idioma do projeto

## Modo de Geracao
- **Modo:** {generation_mode}
- **Gatekeeper ativo:** {gatekeeper_active}
