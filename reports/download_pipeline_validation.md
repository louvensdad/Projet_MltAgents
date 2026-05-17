# Download Pipeline Validation

## Veredito

O pipeline de download foi provado funcional para o fluxo `static-site`.

## Fluxo validado

### 1. Registry

Projeto gerado `427b93c6` registrado com:

- `project_path: generated_projects/audit_site_427b93c6`
- `absolute_project_path` dentro de `generated_projects/`

### 2. Pagamento e redirect

Fluxo comprovado:

- geração retorna `redirect_url: /projects/427b93c6/checkout`
- checkout mock redireciona para `/downloads/[id]`

### 3. Download info

Após marcar pagamento como `paid`, `get_download_info()` retornou:

- `file_name: Audit_Site_generated_by_Ldcn.zip`
- `file_count: 20`
- `file_size_bytes: 50660`
- `security_status: passed`

### 4. ZIP real

`zip_service.create_project_zip()` retornou:

- arquivo: `Audit_Site_generated_by_Ldcn.zip`
- bytes: `15779`
- checksum SHA-256 gerado

## Segurança de path

Arquivos relevantes:

- `control_panel/backend/app/security/path_guard.py`
- `control_panel/backend/app/services/payment_service.py`
- `control_panel/backend/app/routes/downloads.py`

Estado validado:

- download resolve caminho pelo registry
- path é restrito a `generated_projects`
- frontend não define raiz arbitrária de download
- ZIP não pega a raiz da Factory

## `project_path_not_found`

Na auditoria atual, o erro não ocorreu no fluxo validado.

O caminho do projeto foi encontrado corretamente via registry e `PathGuard`.

## O que ainda não foi provado

- E2E em navegador com clique real de download
- cenários de múltiplos stacks além de `static-site`

## Conclusão

Para `static-site`, o download pipeline está funcional e no lugar certo:

- usa `project_id`
- resolve `generated_projects/{project_id ou nome_id}`
- cria ZIP válido
- aplica `QualityGate` e `SecurityGate`
