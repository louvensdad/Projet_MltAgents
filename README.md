# SaaS Factory AI

Plataforma multiagente capaz de criar aplicações SaaS completas, do zero até o deploy, seguindo padrões modernos de arquitetura, segurança, testes e documentação.

## 🚀 Visão Geral

O **SaaS Factory AI** atua como uma "fábrica" autônoma onde um usuário envia a ideia de um produto, e uma equipe de Agentes IA (Orchestrator, Product, Architect, Backend, Frontend, Security, Test, DevOps e Reviewer) colaboram para planejar, codificar, testar e realizar o deploy do SaaS.

### 🎯 Principais Funcionalidades
1. **Pipeline de Agentes Especialistas**: Orquestra um fluxo que vai desde o Product Manager até o DevOps.
2. **Geradores de Código Seguro**: Gera backend em **Python+FastAPI** com Clean Architecture e proteção de falhas.
3. **Múltiplas Stacks (Arquitetura Pronta)**: Node.js (Nest/Express), PHP (Laravel) e **Java (Spring Boot)**.
4. **Sanitização Inteligente**: Filtra automaticamente "falsas entidades" (ex: relatórios, dashboards) e higieniza caracteres inválidos.
5. **Local-first**: Funciona offline via banco SQLite nativo para fácil desenvolvimento, sem forçar uso de Docker.

## 🛠 Stack Tecnológica Recomendada

- **Frontend:** Next.js + TailwindCSS
- **Backend:** FastAPI ou NestJS
- **Banco de Dados:** PostgreSQL
- **ORM:** Prisma ou SQLAlchemy
- **IA:** Gemini API
- **Deploy:** Docker + Render/Railway/VPS

## 📂 Estrutura de Diretórios

- `/agents` - Contém a lógica de todos os agentes do sistema.
- `/backend` - Base do sistema backend (APIs).
- `/frontend` - Aplicação visual.
- `/shared` - Tipos, utilitários e lógicas compartilhadas entre os serviços.
- `/docs` - Documentação técnica (Arquitetura, Segurança, Roadmap).
- `/infra` - Configurações de infraestrutura (Terraform, CI/CD).
- `/tests` - Testes integrados de toda a plataforma.

## 🤖 AI Boost Usage

O **Gemini AI Boost** é um add-on pago que permite usar o Gemini para melhorar, gerar ou evoluir o projeto.

### Funcionalidades
- Melhorar código (refactor)
- Gerar novas features automaticamente
- Gerar documentação avançada
- Gerar testes adicionais
- Otimizar arquitetura
- Gerar conteúdo (para sites)
- Criar automações inteligentes
- Responder dúvidas dentro do projeto (assistente)

### Planos
- **Básico (R$ 29,90)**: 50 requests - Melhorar código, gerar documentação
- **Pro (R$ 79,90)** - Recomendado: 150 requests - Inclui features, testes
- **Avançado (R$ 149,90)**: 500 requests - Recursos completos + assistente IA

### Como usar
1. Acesse `/projects/{id}/ai-boost`
2. Escolha o plano desejado
3. Confirme o pagamento (mock inicialmente)
4. Use as funcionalidades no painel do projeto

### Configuração
```bash
# .env
GEMINI_API_KEY=sua_chave_aqui
AI_BOOST_ENABLED=false
AI_BOOST_MAX_REQUESTS=50
```

### Regras de Segurança
- Backend valida status de pagamento
- Frontend não decide acesso
- Fallback para modo mock se sem API key
- Controle de uso por projeto
- Limite de requests por plano

## 📖 Documentação

- [Arquitetura](docs/ARCHITECTURE.md)
- [Segurança](docs/SECURITY.md)
- [Roadmap](docs/ROADMAP.md)

## 🔧 Configuração e Execução (Fases 2, 3 e 4)

Nesta fase, a pipeline gera o Blueprint estruturado e **cria automaticamente o código fonte do Backend em FastAPI** (Clean Architecture).

1. Instale as dependências usando Python 3.10+:
   ```bash
   pip install -r requirements.txt
   ```
2. Copie o arquivo `.env.example` para `.env` e insira sua `GEMINI_API_KEY` (opcional, o sistema roda 100% offline via mock por padrão).
3. Execute a pipeline principal:
   ```bash
   python main.py
   ```
4. Ao final da execução:
   - Os Blueprints ficarão na pasta `/output`.
   - O projeto backend completo ficará em `/generated_projects/{NomeDoProjeto}/backend`.
5. Vá até a pasta do backend gerado e siga o `README.md` dele para testar seu código!
