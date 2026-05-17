# PROMPT MASTER - Automation

## Goal
Generate an automation/workflow project with clear triggers, actions, retries, logs and integrations.

## Required rules
- Define workflow_steps, triggers, actions, integrations, schedule and retries
- Use queue-backed processing when workflows are async
- Include logs and traceability
- Include tests and documentation
- Do not request backend stacks unrelated to automation unless explicitly required by the brief

## Forbidden
- Hardcoded secrets
- Hidden side effects
- Unbounded retries
- Missing logs
- Missing tests

