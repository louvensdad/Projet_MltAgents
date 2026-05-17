# Gatekeeper Validation

## Resumo

Os gatekeepers e o `StackGate` não estão validados como parte do fluxo principal do painel.

Eles existem e possuem implementação, mas a auditoria mostrou que o `/api/generate` atual não usa esse pipeline.

## O que existe no código

Pipeline completo com gatekeepers:

- `src/agents/core/project_runner.py`
- `src/agents/gatekeepers/gatekeeper_registry.py`
- `src/validators/stack_gate.py`
- `src/validators/quality_gate.py`
- `src/validators/security_gate.py`

Fluxo principal atual:

- `control_panel/backend/app/routes/generate.py`
- chama `ProjectGeneratorFactory.generate(...)`
- não chama `AIRouter`
- não chama `project_runner.run_project(...)`
- não chama `StackGate`

## Evidência executada

### Quality Gate

Teste controlado:

- projeto static vazio: `failed`
- projeto static mínimo: `passed`

Conclusão:

- `QualityGate` funciona isoladamente
- e também participa do download pipeline via `zip_service.create_project_zip()`

### Security Gate

Teste controlado:

- `.env.example` com placeholder: `passed`
- `os.getenv(...)`: `passed`
- `.env` com segredo real: `failed`

Conclusão:

- `SecurityGate` funciona isoladamente
- e participa do pipeline de download

### Stack Gate

Nenhuma execução do `StackGate` foi provada no fluxo `/api/generate` atual.

Motivo:

- não há chamada ao `StackGate` em `control_panel/backend/app/routes/generate.py`
- a chamada ao `StackGate` está em `src/agents/core/project_runner.py`

## Requisitos pedidos vs estado real

### Spring Boot bloqueando arquivo FastAPI

Não provado.

### Static Site bloqueando backend desnecessário

Parcial.

O Prompt Validator detecta incompatibilidades semânticas, mas o gerador continua mesmo com `status: rejected`.

Logo:

- há detecção
- não há bloqueio efetivo no pipeline principal

### Angular sem `angular.json`

Não provado.

Não houve geração Angular real no fluxo atual, e o wizard Angular ainda está em estado planejado no roteamento dinâmico.

## Conclusão

Estado real dos gates:

- `QualityGate`: real e usado
- `SecurityGate`: real e usado
- `StackGate`: implementado, mas não usado no fluxo principal
- GatekeeperRegistry: implementado, mas fora do fluxo principal do painel

Veredito:

- os gatekeepers não estão totalmente conectados ao produto atual
- a proteção de stack ainda não é garantida ponta a ponta
