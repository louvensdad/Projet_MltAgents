# Stacks Complete Validation

Data: 2026-05-17

## Matriz

| stack | registry | stack_id | prompt_template | wizard | create_card | generator | gatekeeper | agent | download | frontend_id | backend_normalize | status |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| static_site | yes | fixed | yes | yes | yes via static-site | yes | yes | yes | tested 200 | static-site/static_site | yes | ok |
| spring_boot | yes | yes | yes | yes | yes | yes | yes | yes | tested 200 | spring_boot | yes | ok |
| fastapi | yes | yes | yes | yes | yes | yes | yes | yes | tested 200 | fastapi | yes | ok |
| nestjs | yes | yes | yes | generic create | yes | yes | yes | yes | scaffold path ready | nestjs | yes | ok |
| express | yes | yes | yes | generic create | partial | yes | yes | yes | scaffold path ready | create config exists | yes | ok |
| laravel | yes | yes | yes | generic create | partial | yes | yes | yes | scaffold path ready | create config exists | yes | partial profile |
| dotnet | yes | yes | yes | generic create | partial | yes | yes | yes | scaffold path ready | create config exists | yes | partial profile |
| angular | yes | yes | yes | generic create | partial | yes | yes | yes | scaffold path ready | create config exists | yes | ok |
| react | yes | yes | yes | generic create | yes | yes | yes | yes | scaffold path ready | react | yes | ok |
| nextjs | yes | yes | yes | generic create | yes | yes | yes | yes | scaffold path ready | nextjs | yes | ok |
| vue | yes | yes | yes | generic create | partial | yes | yes | yes | scaffold path ready | create config exists | yes | ok |
| blazor | yes | yes | yes | generic create | partial | yes | yes | yes | scaffold path ready | create config exists | yes | ok |
| automation | yes | yes | added | generic create | yes | yes | yes | yes | scaffold path ready | automation | yes | ok |
| ai_agents | yes | yes | added | generic create | yes | yes | yes | yes | scaffold path ready | ai_agents | yes | ok |

## Observacoes

- `static_site` foi padronizado tambem em `backend/config/stack_profiles.py`.
- Templates agora usam `static_site` no `Static Brand Site`.

