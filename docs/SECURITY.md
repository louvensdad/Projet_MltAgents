# Segurança

- Nenhum código é colocado em produção antes da aprovação do **Security Agent** e do **Reviewer Agent**.
- As chaves de API não devem ser gravadas em repositório (uso restrito ao `.env`).
- Injeção de dependência e validação de input são obrigatórios no backend.
- O Frontend não pode conter lógicas sensíveis e deve usar HTTPS no deploy.
