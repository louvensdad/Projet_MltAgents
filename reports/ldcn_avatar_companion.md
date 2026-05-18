# LDCN Avatar Companion

## Componentes criados

- `frontend/src/components/ldcn/avatar/LdcnAvatar.tsx`
- `frontend/src/components/ldcn/avatar/LdcnAvatarBody.tsx`
- `frontend/src/components/ldcn/avatar/LdcnAvatarFace.tsx`
- `frontend/src/components/ldcn/avatar/LdcnAvatarController.tsx`
- `frontend/src/components/ldcn/avatar/LdcnAvatarSpeechBubble.tsx`
- `frontend/src/components/ldcn/avatar/LdcnAvatarPath.tsx`
- `frontend/src/components/ldcn/avatar/LdcnAvatarSettings.tsx`

## Hooks criados

- `frontend/src/components/ldcn/avatar/useLdcnAvatarState.ts`
- `frontend/src/components/ldcn/avatar/useLdcnAvatarMotion.ts`
- `frontend/src/components/ldcn/avatar/useLdcnAvatarContext.ts`

## Estados implementados

- `idle`
- `walking`
- `listening`
- `thinking`
- `speaking`
- `celebrating`
- `warning`
- `error`
- `guiding`

## Eventos conectados

- `page_loaded`
- `project_generated`
- `generation_failed`
- `download_failed`
- `agent_boost_active`
- `validation_failed`
- `template_selected`
- `wizard_step_changed`
- `voice_listening`
- `voice_speaking`
- `voice_idle`
- `assistant_success`
- `assistant_error`

## Acessibilidade

- Respeita `prefers-reduced-motion`
- Controles com `aria-label`
- Elementos decorativos com `aria-hidden`
- Sem bloqueio de foco
- `pointer-events` isolado para não travar a navegação

## Performance

- Sem Three.js
- Sem animação 3D pesada
- Estado controlado por eventos leves no `window`
- Timers com cleanup
- Suspensão de animação quando a aba fica oculta
- Persistência simples em `localStorage`

## Preferências salvas

- Avatar ativado/desativado
- Voz ativada/desativada
- Movimento reduzido
- Posição preferida
- Tamanho
- Estilo
- Mutado
- Pausado
- Oculto

## Integrações feitas

- `AppShell` monta o controlador do avatar
- `LdcnAssistant` dispara estados de sucesso e erro
- `LdcnVoicePanel` dispara listening/speaking/idle
- `LiveGenerationModal` dispara geração concluída e falha
- `WizardShell` e a página do wizard disparam mudança de etapa e template selecionado
- `DownloadsPage` e `ValidationCenterPage` disparam falhas relevantes
- `SettingsPage` ganhou a seção `LDCN Companion`

## Testes realizados

- `cmd /c npm run build` no frontend
- `next dev --port 3001` iniciou com sucesso e confirmou o app pronto em `http://localhost:3001`

