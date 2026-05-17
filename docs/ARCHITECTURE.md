# Arquitetura: SaaS Factory AI

## Fluxo de Trabalho Multiagente
1. O usuário envia a ideia do SaaS.
2. **Product Agent**: Transforma a ideia em requisitos de negócio e épicos.
3. **Architect Agent**: Define a arquitetura do sistema, modelos de banco de dados e padrões.
4. **Backend Agent**: Cria APIs e lógica de servidor (FastAPI/NestJS).
5. **Frontend Agent**: Cria as telas e componentes (Next.js + TailwindCSS).
6. **Security Agent**: Revisa a segurança do código, dependências e configurações.
7. **Test Agent**: Cria testes unitários e de integração para garantir a estabilidade.
8. **DevOps Agent**: Prepara Dockerfiles, CI/CD e arquivos de deploy.
9. **Reviewer Agent**: Valida tudo, executa os testes finais e aprova a entrega.

## Stack Recomendada
- **Frontend:** Next.js + TailwindCSS
- **Backend:** FastAPI ou NestJS
- **Banco:** PostgreSQL
- **ORM:** Prisma ou SQLAlchemy
- **IA:** Gemini API
- **Deploy:** Docker + Render/Railway/VPS
