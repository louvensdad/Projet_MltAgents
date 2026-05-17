# AI Usage Report

Este documento é gerado automaticamente para cada projeto e descreve como a inteligência artificial foi utilizada durante a geração.

## Modos de IA Disponíveis

| Modo | Descrição | Custo | Qualidade |
|------|-----------|-------|-----------|
| **Premium** | Gemini real para todas as etapas (arquitetura, backend, frontend, docs, testes, segurança, UX) | Alto | Alta |
| **Econômico** | Gemini apenas para decisões críticas (arquitetura, README). Templates locais para o restante | Baixo | Média |
| **Mock/Local** | Nenhuma chamada ao Gemini. Geração 100% por templates e regras locais | Grátis | Baixa |

## Transparência

- O modo de IA escolhido pelo usuário **nunca** é alterado silenciosamente
- Se o Gemini falhar (quota 429), o sistema respeita `allow_mock_fallback`
- Todas as chamadas de IA são registradas em `generation_trace.json`
- O usuário vê o modo ativo durante toda a geração

## Rastreabilidade

Cada projeto contém:
- `generation_trace.json` — dados detalhados de chamadas, tokens e custo
- `docs/AI_USAGE.md` — este relatório legível
- Modo, provedor, fallback e chamadas registrados

## Fallback

Se a cota do Gemini for excedida (erro 429):
- Se `allow_mock_fallback=true`: sistema cai para `LocalEngine` automaticamente
- Uma mensagem clara é exibida: "Gemini quota exceeded. Local fallback used."
- Se `allow_mock_fallback=false`: a geração é bloqueada e o motivo é explicado
