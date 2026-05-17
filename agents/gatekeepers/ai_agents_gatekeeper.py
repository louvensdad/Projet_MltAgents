"""
AIAgentsGatekeeper — Valida projetos de sistemas multi-agente com IA.

Atua em 4 fases:
1. pre_generation_check  — Bloqueia se não for multi-agente, valida framework e LLM
2. generation_plan_check — Orquestrador, ferramentas, memória, routing, segurança
3. post_generation_check — Verifica agentes, tools, memória, retry, safety, logging
4. download_gate_check   — Bloqueia sem safety layer, sem API keys hardcoded
"""

import os
from typing import Dict, Any, List

from agents.gatekeepers.base_gatekeeper import BaseGatekeeper


class AIAgentsGatekeeper(BaseGatekeeper):
    """Gatekeeper para projetos de sistemas multi-agente com IA."""

    VALID_FRAMEWORKS = ["langchain", "crewai", "autogen", "langgraph",
                         "semantic kernel", "llamaindex", "haystack",
                         "openai swarm", "boto3 bedrock", "custom"]
    VALID_PROVIDERS = ["openai", "anthropic", "gemini", "google",
                        "deepseek", "mistral", "llama", "local", "ollama",
                        "azure openai", "bedrock", "vertex ai", "groq"]

    def __init__(self):
        super().__init__(name="AIAgentsGatekeeper", stack_id="ai_agents")

    # ══════════════════════════════════════════════════════════════════════
    # FASE 1: PRE-GENERATION CHECK
    # ══════════════════════════════════════════════════════════════════════

    def pre_generation_check(self, blueprint: Dict[str, Any]) -> Dict[str, Any]:
        """
        Bloqueia se o projeto não for multi-agente.
        Valida framework de agentes e provider LLM.
        """
        checks: List[Dict[str, Any]] = []

        # ── Deve ser projeto multi-agente ──────────────────────────────────
        project_type = str(blueprint.get("project_type", "")).lower()
        stack = str(blueprint.get("stack_id", "")).lower()
        architecture = str(blueprint.get("architecture", "")).lower()
        description = str(blueprint.get("description", "")).lower()

        multi_agent_keywords = ["multi.agent", "multiagent", "ai_agents",
                                 "ai agent", "agente", "orchestrat",
                                 "multi agent", "multi-agent", "crew",
                                 "swarm", "multiagente"]
        is_multi_agent = any(
            kw in project_type or kw in stack or kw in architecture or kw in description
            for kw in multi_agent_keywords
        )

        # Also check number of agents
        agent_count = blueprint.get("agent_count", 0)
        if isinstance(agent_count, list):
            agent_count = len(agent_count)
        if isinstance(agent_count, str):
            try:
                agent_count = int(agent_count)
            except (ValueError, TypeError):
                agent_count = 0

        if not is_multi_agent and agent_count < 2:
            checks.append(self._block(
                "multi_agent_check",
                "Este projeto não parece ser do tipo multi-agente. "
                "O AIAgentsGatekeeper só atua em sistemas multi-agente. "
                "Se este for um agente único, use outro stack."
            ))
            # Return early — nothing else matters
            return self._aggregate_checks(checks, "pre_generation")
        else:
            checks.append(self._ok("multi_agent_check"))

        # ── Framework de agentes ───────────────────────────────────────────
        agent_framework = str(blueprint.get("agent_framework", "")).lower().strip()
        if not agent_framework:
            checks.append(self._warn(
                "agent_framework_check",
                "Framework de agentes não especificado. "
                f"Escolha um: {', '.join(self.VALID_FRAMEWORKS)}."
            ))
        else:
            matched = any(fw in agent_framework or agent_framework in fw
                          for fw in self.VALID_FRAMEWORKS)
            if matched:
                checks.append(self._ok("agent_framework_check"))
            else:
                checks.append(self._warn(
                    "agent_framework_check",
                    f"Framework '{agent_framework}' não reconhecido. "
                    f"Frameworks suportados: {', '.join(self.VALID_FRAMEWORKS)}."
                ))

        # ── Provedor LLM ───────────────────────────────────────────────────
        llm_provider = str(blueprint.get("llm_provider", "")).lower().strip()
        if not llm_provider:
            checks.append(self._warn(
                "llm_provider_check",
                "Provedor LLM não especificado. "
                f"Escolha um: {', '.join(self.VALID_PROVIDERS)}."
            ))
        else:
            matched = any(prov in llm_provider or llm_provider in prov
                          for prov in self.VALID_PROVIDERS)
            if matched:
                checks.append(self._ok("llm_provider_check"))
            else:
                checks.append(self._warn(
                    "llm_provider_check",
                    f"Provedor '{llm_provider}' não reconhecido. "
                    f"Suportados: {', '.join(self.VALID_PROVIDERS)}."
                ))

        # ── Complexidade da tarefa vs número de agentes ────────────────────
        if agent_count >= 2:
            # Check task complexity
            task_complexity = str(blueprint.get("task_complexity", "")).lower()
            if agent_count <= 2 and task_complexity in ("high", "complex", "complexa", "alta"):
                checks.append(self._warn(
                    "task_agent_ratio_check",
                    f"Tarefa de alta complexidade ({task_complexity}) "
                    f"com apenas {agent_count} agentes pode ser insuficiente. "
                    f"Considere adicionar agentes especializados."
                ))
            elif agent_count > 10 and task_complexity in ("low", "simple", "baixa", "simples"):
                checks.append(self._warn(
                    "task_agent_ratio_check",
                    f"Muitos agentes ({agent_count}) para tarefa de baixa complexidade. "
                    f"Reduza o número de agentes para evitar over-engineering."
                ))
            else:
                checks.append(self._ok("task_agent_ratio_check"))
        else:
            checks.append(self._ok("task_agent_ratio_check"))

        return self._aggregate_checks(checks, "pre_generation")

    # ══════════════════════════════════════════════════════════════════════
    # FASE 2: GENERATION PLAN CHECK
    # ══════════════════════════════════════════════════════════════════════

    def generation_plan_check(self, blueprint: Dict[str, Any]) -> Dict[str, Any]:
        """
        Valida todos os componentes essenciais de um sistema multi-agente:
        orquestrador, agentes, ferramentas, memória, routing, ciclo de vida,
        retry/fallback, safety, observabilidade, human-in-the-loop.
        """
        checks: List[Dict[str, Any]] = []
        plan = blueprint.get("generation_plan", blueprint)
        plan_str = str(plan).lower()

        # ── Orquestrador ───────────────────────────────────────────────────
        orchestrator_keywords = ["orchestrat", "coordinator", "supervisor",
                                  "dispatcher", "controller", "manager agent"]
        if any(kw in plan_str for kw in orchestrator_keywords):
            checks.append(self._ok("orchestrator_agent_check"))
        else:
            checks.append(self._fail(
                "orchestrator_agent_check",
                "Agente orquestrador não planejado. "
                "Todo sistema multi-agente precisa de um orquestrador/coordenador central."
            ))

        # ── Registro de agentes ────────────────────────────────────────────
        registry_keywords = ["registry", "registro", "agent list", "agent catalog",
                              "agent directory", "agent pool"]
        if any(kw in plan_str for kw in registry_keywords):
            checks.append(self._ok("agent_registry_check"))
        else:
            checks.append(self._warn(
                "agent_registry_check",
                "Registro de agentes não planejado. "
                "Implemente um registro central para descoberta e gerenciamento de agentes."
            ))

        # ── Definições de ferramentas ──────────────────────────────────────
        tool_keywords = ["tool", "function calling", "tool_def", "tool definition",
                          "custom tool", "api tool", "ferramenta"]
        if any(kw in plan_str for kw in tool_keywords):
            checks.append(self._ok("tool_definitions_check"))
        else:
            checks.append(self._fail(
                "tool_definitions_check",
                "Definições de ferramentas não planejadas. "
                "Cada agente precisa de ferramentas com schemas de entrada/saída definidos."
            ))

        # ── Sistema de memória ─────────────────────────────────────────────
        memory_keywords = ["short.term memory", "long.term memory", "vector store",
                            "embedd", "memory module", "context window",
                            "memória", "chat history", "persist"]
        if len([kw for kw in memory_keywords if kw in plan_str]) >= 2:
            checks.append(self._ok("memory_system_check"))
        elif any(kw in plan_str for kw in memory_keywords):
            checks.append(self._warn(
                "memory_system_check",
                "Sistema de memória parcial. Planeje memória de curto prazo (contexto) "
                "e longo prazo (vector store, embeddings)."
            ))
        else:
            checks.append(self._fail(
                "memory_system_check",
                "Sistema de memória não planejado. "
                "Agentes precisam de memória de curto prazo e longo prazo para contexto."
            ))

        # ── Routing / dispatch ─────────────────────────────────────────────
        routing_keywords = ["routing", "dispatch", "route", "direct",
                             "delegate", "assign", "task queue"]
        if any(kw in plan_str for kw in routing_keywords):
            checks.append(self._ok("routing_dispatch_check"))
        else:
            checks.append(self._warn(
                "routing_dispatch_check",
                "Lógica de routing/dispatch não planejada. "
                "Defina como tarefas são roteadas para os agentes corretos."
            ))

        # ── Ciclo de vida de tarefas ───────────────────────────────────────
        lifecycle_keywords = ["task lifecycle", "task status", "task state",
                               "pending", "in.progress", "complete",
                               "ciclo de vida", "workflow"]
        if any(kw in plan_str for kw in lifecycle_keywords):
            checks.append(self._ok("task_lifecycle_check"))
        else:
            checks.append(self._warn(
                "task_lifecycle_check",
                "Ciclo de vida de tarefas não definido. "
                "Implemente estados: pending → in_progress → completed/failed."
            ))

        # ── Retry e fallback ───────────────────────────────────────────────
        retry_keywords = ["retry", "exponential backoff", "fallback",
                           "retentativa", "error recovery", "circuit breaker"]
        if any(kw in plan_str for kw in retry_keywords):
            checks.append(self._ok("retry_fallback_check"))
        else:
            checks.append(self._fail(
                "retry_fallback_check",
                "Estratégia de retry e fallback não planejada. "
                "Implemente retry com exponential backoff e agentes de fallback."
            ))

        # ── Camada de safety/guardrails ────────────────────────────────────
        safety_keywords = ["safety", "guardrail", "content filter",
                            "moderation", "harmful", "blocklist",
                            "segurança", "proteção"]
        if any(kw in plan_str for kw in safety_keywords):
            checks.append(self._ok("safety_guardrails_check"))
        else:
            checks.append(self._warn(
                "safety_guardrails_check",
                "Camada de segurança/guardrails não planejada. "
                "Implemente filtros de conteúdo e validação de outputs dos agentes."
            ))

        # ── Observabilidade / logging ──────────────────────────────────────
        obs_keywords = ["log", "observ", "trace", "monitor", "telemetry",
                         "structured log", "json log", "track"]
        if any(kw in plan_str for kw in obs_keywords):
            checks.append(self._ok("observability_check"))
        else:
            checks.append(self._warn(
                "observability_check",
                "Observabilidade/logging não planejado. "
                "Registre decisões dos agentes, chamadas de ferramentas e métricas."
            ))

        # ── Human-in-the-loop (se necessário) ──────────────────────────────
        human_keywords = ["human.in.the.loop", "human review", "approval",
                           "human feedback", "aprov", "revisão humana"]
        if any(kw in plan_str for kw in human_keywords):
            checks.append(self._ok("human_in_the_loop_check"))
        else:
            # Only warn if the project seems to involve critical actions
            critical_keywords = ["payment", "pagamento", "delete", "deploy",
                                  "production", "customer", "cliente"]
            if any(kw in plan_str for kw in critical_keywords):
                checks.append(self._warn(
                    "human_in_the_loop_check",
                    "Ações críticas detectadas sem human-in-the-loop. "
                    "Adicione checkpoints de aprovação humana para operações sensíveis."
                ))
            else:
                checks.append(self._ok("human_in_the_loop_check"))

        return self._aggregate_checks(checks, "generation_plan")

    # ══════════════════════════════════════════════════════════════════════
    # FASE 3: POST-GENERATION CHECK
    # ══════════════════════════════════════════════════════════════════════

    def post_generation_check(self, project_path: str, blueprint: Dict[str, Any]) -> Dict[str, Any]:
        """
        Verifica componentes gerados: orquestrador, agentes, ferramentas,
        memória, routing, retry, safety, logging.
        """
        checks: List[Dict[str, Any]] = []

        # ── Estrutura de diretórios esperada ───────────────────────────────
        expected_dirs = ["agents", "tools", "memory", "routing", "tasks", "utils"]
        dir_check = self._check_directory_structure(project_path, expected_dirs, "ai_agents")
        checks.append(dir_check)

        # ── Orquestrador ──────────────────────────────────────────────────
        orchestrator_indicators = self._scan_filenames(project_path, [".py", ".ts", ".js", ".go"])
        orchestrator_keywords = ["orchestrat", "coordinator", "supervisor",
                                  "dispatcher", "controller"]
        orchestrator_found = [
            f for f in orchestrator_indicators
            if any(kw in os.path.basename(f).lower() for kw in orchestrator_keywords)
        ]
        if orchestrator_found:
            checks.append({
                "check": "orchestrator_agent_exists",
                "status": "passed",
                "found": orchestrator_found,
            })
        else:
            checks.append(self._fail(
                "orchestrator_agent_exists",
                "Agente orquestrador não encontrado. "
                "Crie um módulo orchestrator ou coordinator central."
            ))

        # ── Registro de agentes ────────────────────────────────────────────
        registry_files = self._scan_filenames(project_path, [".py", ".ts", ".js", ".json", ".yaml"])
        registry_found = [
            f for f in registry_files
            if any(kw in os.path.basename(f).lower()
                   for kw in ["registry", "agent_registry", "agent_list", "agent_catalog"])
        ]
        if registry_found:
            checks.append({
                "check": "agent_registry_exists",
                "status": "passed",
                "found": registry_found,
            })
        else:
            checks.append(self._warn(
                "agent_registry_exists",
                "Registro de agentes não encontrado. "
                "Crie um registry ou catalog para descoberta de agentes."
            ))

        # ── Definições de ferramentas ──────────────────────────────────────
        tool_files = self._scan_filenames(project_path, [".py", ".ts", ".js", ".json", ".yaml"])
        tool_found = [
            f for f in tool_files
            if any(kw in os.path.basename(f).lower()
                   for kw in ["tool", "tools", "function", "plugin"])
        ]
        if tool_found:
            checks.append({
                "check": "tool_definitions_exist",
                "status": "passed",
                "found": tool_found,
            })
        else:
            checks.append(self._warn(
                "tool_definitions_exist",
                "Definições de ferramentas não encontradas. "
                "Crie módulo tools/ com schemas de entrada/saída."
            ))

        # ── Módulo de memória ──────────────────────────────────────────────
        memory_files = self._scan_filenames(project_path, [".py", ".ts", ".js"])
        memory_found = [
            f for f in memory_files
            if any(kw in os.path.basename(f).lower()
                   for kw in ["memory", "vector_store", "embedding", "context"])
        ]
        if memory_found:
            checks.append({
                "check": "memory_module_exists",
                "status": "passed",
                "found": memory_found,
            })
        else:
            checks.append(self._warn(
                "memory_module_exists",
                "Módulo de memória não encontrado. "
                "Implemente memória de curto e longo prazo."
            ))

        # ── Módulo de routing ──────────────────────────────────────────────
        routing_files = self._scan_filenames(project_path, [".py", ".ts", ".js"])
        routing_found = [
            f for f in routing_files
            if any(kw in os.path.basename(f).lower()
                   for kw in ["routing", "router", "dispatch", "dispatcher"])
        ]
        if routing_found:
            checks.append({
                "check": "routing_module_exists",
                "status": "passed",
                "found": routing_found,
            })
        else:
            checks.append(self._warn(
                "routing_module_exists",
                "Módulo de routing não encontrado. "
                "Implemente lógica de roteamento de tarefas para agentes."
            ))

        # ── Ciclo de vida de tarefas ───────────────────────────────────────
        task_files = self._scan_filenames(project_path, [".py", ".ts", ".js"])
        task_found = [
            f for f in task_files
            if any(kw in os.path.basename(f).lower()
                   for kw in ["task", "lifecycle", "workflow", "state_machine"])
        ]
        if task_found:
            checks.append({
                "check": "task_lifecycle_exists",
                "status": "passed",
                "found": task_found,
            })
        else:
            checks.append(self._warn(
                "task_lifecycle_exists",
                "Gerenciador de ciclo de vida de tarefas não encontrado. "
                "Implemente estados: pending, running, completed, failed."
            ))

        # ── Sistema de logging ─────────────────────────────────────────────
        log_files = self._scan_filenames(project_path, [".py", ".ts", ".js", ".yaml", ".yml", ".conf"])
        log_found = [
            f for f in log_files
            if any(kw in os.path.basename(f).lower()
                   for kw in ["log", "logger", "logging", "telemetry", "tracing"])
        ]
        if log_found:
            checks.append({
                "check": "logging_system_exists",
                "status": "passed",
                "found": log_found,
            })
        else:
            checks.append(self._warn(
                "logging_system_exists",
                "Sistema de logging não encontrado. "
                "Implemente logging estruturado para decisões e tool calls."
            ))

        # ── Verificar schemas de entrada/saída nas tools ───────────────────
        if tool_found:
            schema_indicators = ["input_schema", "output_schema", "parameters",
                                  "args_schema", "BaseModel", "pydantic", "@dataclass",
                                  "TypedDict", "interface", "zod"]
            tools_with_schemas = 0
            tools_total = len(tool_found)
            for tf in tool_found[:20]:
                full = os.path.join(project_path, tf)
                try:
                    with open(full, "r", encoding="utf-8", errors="ignore") as fh:
                        content = fh.read()
                    if any(si in content for si in schema_indicators):
                        tools_with_schemas += 1
                except Exception:
                    pass

            if tools_total > 0 and tools_with_schemas == 0:
                checks.append(self._warn(
                    "tool_schemas_check",
                    "Ferramentas sem schemas de entrada/saída definidos. "
                    "Use Pydantic, TypedDict ou Zod para validar parâmetros."
                ))
            else:
                checks.append(self._ok("tool_schemas_check"))
        else:
            checks.append(self._ok("tool_schemas_check"))

        # ── Retry com exponential backoff ──────────────────────────────────
        retry_indicators = self._scan_filenames(project_path, [".py", ".ts", ".js"])
        retry_patterns = ["exponential backoff", "backoff", "retry",
                           "max_retries", "retry_after", "tenacity",
                           "retry.exponential", "retry_with_backoff"]
        retry_found = False
        for rf in retry_indicators:
            full = os.path.join(project_path, rf)
            try:
                with open(full, "r", encoding="utf-8", errors="ignore") as fh:
                    content = fh.read()
                if any(rp in content for rp in retry_patterns):
                    retry_found = True
                    break
            except Exception:
                pass

        if retry_found:
            checks.append(self._ok("retry_logic_check"))
        else:
            checks.append(self._warn(
                "retry_logic_check",
                "Lógica de retry com exponential backoff não encontrada. "
                "Implemente retry automático para falhas transitórias."
            ))

        # ── Fallback agents ────────────────────────────────────────────────
        fallback_found = False
        for f_path in routing_files + task_found:
            full = os.path.join(project_path, f_path)
            try:
                with open(full, "r", encoding="utf-8", errors="ignore") as fh:
                    content = fh.read()
                if "fallback" in content.lower():
                    fallback_found = True
                    break
            except Exception:
                pass

        if fallback_found:
            checks.append(self._ok("fallback_agents_check"))
        else:
            checks.append(self._warn(
                "fallback_agents_check",
                "Agentes de fallback não definidos. "
                "Configure agentes reserva para quando o principal falhar."
            ))

        # ── Safety layer ──────────────────────────────────────────────────
        safety_indicators = self._scan_filenames(project_path, [".py", ".ts", ".js"])
        safety_patterns = ["guardrail", "safety", "content_filter", "moderation",
                            "harmful", "blocklist", "validator", "sanitize"]
        safety_found = False
        for sf in safety_indicators:
            full = os.path.join(project_path, sf)
            try:
                with open(full, "r", encoding="utf-8", errors="ignore") as fh:
                    content = fh.read()
                if any(sp in content.lower() for sp in safety_patterns):
                    safety_found = True
                    break
            except Exception:
                pass

        if safety_found:
            checks.append(self._ok("safety_layer_check"))
        else:
            checks.append(self._warn(
                "safety_layer_check",
                "Camada de segurança não encontrada. "
                "Implemente guardrails e filtros de conteúdo nos outputs."
            ))

        # ── Logging captura decisões e tool calls ──────────────────────────
        if log_found:
            log_decision_patterns = ["agent_decision", "tool_call", "action",
                                      "llm_call", "chain_of_thought"]
            log_detailed = False
            for lf in log_found[:10]:
                full = os.path.join(project_path, lf)
                try:
                    with open(full, "r", encoding="utf-8", errors="ignore") as fh:
                        content = fh.read().lower()
                    if any(ldp in content for ldp in log_decision_patterns):
                        log_detailed = True
                        break
                except Exception:
                    pass
            if log_detailed:
                checks.append(self._ok("logging_decisions_check"))
            else:
                checks.append(self._warn(
                    "logging_decisions_check",
                    "Logging não captura decisões dos agentes nem tool calls. "
                    "Adicione logs de agent_decision, tool_call e llm_call."
                ))
        else:
            checks.append(self._warn(
                "logging_decisions_check",
                "Sistema de logging ausente — decisões dos agentes não serão rastreáveis."
            ))

        # ── Persistência de memória ────────────────────────────────────────
        if memory_found:
            persistence_patterns = ["save", "persist", "store", "write", "dump",
                                     "chroma", "pinecone", "weaviate", "qdrant",
                                     "sqlite", "redis", "json", "pickle"]
            persistence_found = False
            for mf in memory_found[:10]:
                full = os.path.join(project_path, mf)
                try:
                    with open(full, "r", encoding="utf-8", errors="ignore") as fh:
                        content = fh.read().lower()
                    if any(pp in content for pp in persistence_patterns):
                        persistence_found = True
                        break
                except Exception:
                    pass
            if persistence_found:
                checks.append(self._ok("memory_persistence_check"))
            else:
                checks.append(self._warn(
                    "memory_persistence_check",
                    "Memória não persiste entre sessões. "
                    "Implemente persistência (vector DB, SQLite, JSON) para contexto duradouro."
                ))
        else:
            checks.append(self._ok("memory_persistence_check"))

        return self._aggregate_checks(checks, "post_generation")

    # ══════════════════════════════════════════════════════════════════════
    # FASE 4: DOWNLOAD GATE CHECK
    # ══════════════════════════════════════════════════════════════════════

    def download_gate_check(self, project_path: str, blueprint: Dict[str, Any]) -> Dict[str, Any]:
        """
        Bloqueia se falta safety layer ou API keys hardcoded.
        Verifica rate limiting, cost tracking, error handling,
        validação de outputs, timeouts e checkpoints humanos.
        """
        checks: List[Dict[str, Any]] = []
        import re

        # ── BLOCK: sem safety layer ────────────────────────────────────────
        all_source = self._scan_filenames(project_path, [".py", ".ts", ".js", ".go"])
        safety_patterns = ["guardrail", "safety", "content_filter", "moderation",
                            "harmful", "blocklist", "output_validator", "sanitize"]
        safety_found = False
        for src in all_source:
            full = os.path.join(project_path, src)
            try:
                with open(full, "r", encoding="utf-8", errors="ignore") as fh:
                    content = fh.read().lower()
                if any(sp in content for sp in safety_patterns):
                    safety_found = True
                    break
            except Exception:
                pass

        if not safety_found:
            checks.append(self._block(
                "safety_guardrails_required",
                "Nenhuma camada de safety/guardrails detectada. "
                "Sistemas multi-agente com LLM DEVEM ter filtros de segurança. "
                "Implemente validação de outputs, content filters e blocklists."
            ))
        else:
            checks.append(self._ok("safety_guardrails_required"))

        # ── BLOCK: API keys hardcoded ──────────────────────────────────────
        api_key_patterns = [
            (r"(?:api_key|apikey|api_key|OPENAI_API_KEY|ANTHROPIC_API_KEY|"
             r"GEMINI_API_KEY|DEEPSEEK_API_KEY|GROQ_API_KEY)\s*[=:]\s*['\"](sk-|sk-ant-|AIza)[^'\"]+['\"]",
             "API key de LLM hardcoded"),
            (r"(?:OPENAI_API_KEY|OPENAI_KEY)\s*=\s*['\"](sk-)[^'\"]+['\"]",
             "OpenAI API key hardcoded"),
            (r"(?:ANTHROPIC_API_KEY)\s*=\s*['\"](sk-ant-)[^'\"]+['\"]",
             "Anthropic API key hardcoded"),
            (r"(?:GEMINI_API_KEY)\s*=\s*['\"](AIza)[^'\"]+['\"]",
             "Gemini API key hardcoded"),
        ]
        key_violations = []
        for src in all_source:
            full = os.path.join(project_path, src)
            # Skip test fixtures and docs
            if "test" in src.lower() or "example" in src.lower() or "doc" in src.lower():
                continue
            try:
                with open(full, "r", encoding="utf-8", errors="ignore") as fh:
                    content = fh.read()
                for pattern, label in api_key_patterns:
                    if re.search(pattern, content, re.IGNORECASE):
                        line_no = 0
                        match = re.search(pattern, content, re.IGNORECASE)
                        if match:
                            line_no = content[:match.start()].count("\n") + 1
                        key_violations.append(f"{src}:{line_no} → {label}")
                        break
            except Exception:
                pass

        # Also check .env files for real keys (not template)
        env_files = self._scan_filenames(project_path, [".env"])
        for env_f in env_files:
            full = os.path.join(project_path, env_f)
            try:
                with open(full, "r", encoding="utf-8", errors="ignore") as fh:
                    content = fh.read()
                # Only flag .env if it has real-looking keys (not "your_key_here")
                if re.search(r'(?:API_KEY|SECRET|TOKEN)\s*=\s*(?:sk-|sk-ant-|AIza)', content, re.IGNORECASE):
                    key_violations.append(f"{env_f} → chave real em arquivo .env (deve estar no .gitignore e .env.example)")
            except Exception:
                pass

        if key_violations:
            checks.append(self._block(
                "no_hardcoded_api_keys",
                f"API keys hardcoded detectadas: {'; '.join(key_violations[:5])}. "
                f"Use variáveis de ambiente (.env no .gitignore) e secrets manager."
            ))
        else:
            checks.append(self._ok("no_hardcoded_api_keys"))

        # ── Rate limiting em chamadas LLM ──────────────────────────────────
        rate_limit_patterns = ["rate_limit", "rate_limiter", "max_rpm", "max_tpm",
                                "throttle", "semaphore", "asyncio.Semaphore",
                                "tokens_per_minute", "requests_per_minute"]
        rate_limit_found = False
        for src in all_source:
            full = os.path.join(project_path, src)
            try:
                with open(full, "r", encoding="utf-8", errors="ignore") as fh:
                    content = fh.read().lower()
                if any(rp in content for rp in rate_limit_patterns):
                    rate_limit_found = True
                    break
            except Exception:
                pass

        if rate_limit_found:
            checks.append(self._ok("rate_limiting_check"))
        else:
            checks.append(self._warn(
                "rate_limiting_check",
                "Rate limiting não implementado para chamadas LLM. "
                "Adicione controle de RPM/TPM para evitar throttling e custos excessivos."
            ))

        # ── Cost tracking ──────────────────────────────────────────────────
        cost_patterns = ["cost", "token_usage", "token_count", "pricing",
                          "budget", "usage_tracker", "cost_estimator"]
        cost_found = False
        for src in all_source:
            full = os.path.join(project_path, src)
            try:
                with open(full, "r", encoding="utf-8", errors="ignore") as fh:
                    content = fh.read().lower()
                if any(cp in content for cp in cost_patterns):
                    cost_found = True
                    break
            except Exception:
                pass

        if cost_found:
            checks.append(self._ok("cost_tracking_check"))
        else:
            checks.append(self._warn(
                "cost_tracking_check",
                "Rastreamento de custos não implementado. "
                "Monitore uso de tokens e estime custos para evitar surpresas na fatura."
            ))

        # ── Error handling sem silent failures ─────────────────────────────
        error_patterns = ["try", "except", "try{", "catch", "on_error",
                           "error_handler", "handle_error"]
        silent_fail_patterns = ["pass", "pass;", "// ignore", "/* ignore */",
                                 "logger.debug", "console.debug"]
        files_with_proper_errors = 0
        files_with_silent_fails = 0
        for src in all_source[:30]:  # Check first 30 source files
            full = os.path.join(project_path, src)
            try:
                with open(full, "r", encoding="utf-8", errors="ignore") as fh:
                    content = fh.read().lower()
                has_error_handling = any(ep in content for ep in error_patterns)
                has_silent = any(sp in content for sp in silent_fail_patterns)
                if has_error_handling and not has_silent:
                    files_with_proper_errors += 1
                elif has_error_handling and has_silent:
                    files_with_silent_fails += 1
            except Exception:
                pass

        if files_with_silent_fails > 0:
            checks.append(self._warn(
                "error_handling_check",
                f"Possíveis silent failures detectados em {files_with_silent_fails} arquivos. "
                f"Nunca use try/except com pass vazio. Sempre logue o erro."
            ))
        elif files_with_proper_errors > 0:
            checks.append(self._ok("error_handling_check"))
        else:
            checks.append(self._ok("error_handling_check"))

        # ── Validação de outputs entre agentes ─────────────────────────────
        validation_patterns = ["validate_output", "output_validator",
                                "schema validation", "type_check",
                                "assert_valid", "validate_response"]
        validation_found = False
        for src in all_source:
            full = os.path.join(project_path, src)
            try:
                with open(full, "r", encoding="utf-8", errors="ignore") as fh:
                    content = fh.read().lower()
                if any(vp in content for vp in validation_patterns):
                    validation_found = True
                    break
            except Exception:
                pass

        if validation_found:
            checks.append(self._ok("output_validation_check"))
        else:
            checks.append(self._warn(
                "output_validation_check",
                "Outputs dos agentes não são validados antes de passar para o próximo. "
                "Implemente validação de schema/type para evitar propagação de erros."
            ))

        # ── Timeout handling ───────────────────────────────────────────────
        timeout_patterns = ["timeout", "max_time", "time_limit", "deadline",
                             "asyncio.timeout", "setTimeout", "set_timeout"]
        timeout_found = False
        for src in all_source:
            full = os.path.join(project_path, src)
            try:
                with open(full, "r", encoding="utf-8", errors="ignore") as fh:
                    content = fh.read().lower()
                if any(tp in content for tp in timeout_patterns):
                    timeout_found = True
                    break
            except Exception:
                pass

        if timeout_found:
            checks.append(self._ok("timeout_handling_check"))
        else:
            checks.append(self._warn(
                "timeout_handling_check",
                "Tratamento de timeout não implementado. "
                "Defina timeouts para chamadas LLM e execução de tarefas."
            ))

        # ── Human approval checkpoints ─────────────────────────────────────
        approval_patterns = ["human_approval", "approval_checkpoint",
                              "require_approval", "confirm_action",
                              "human_in_the_loop", "human_review"]
        critical_actions = ["delete", "deploy", "payment", "send_email",
                             "publish", "destroy", "remove"]
        has_critical = False
        has_approval = False

        for src in all_source[:30]:
            full = os.path.join(project_path, src)
            try:
                with open(full, "r", encoding="utf-8", errors="ignore") as fh:
                    content = fh.read().lower()
                if any(ca in content for ca in critical_actions):
                    has_critical = True
                if any(ap in content for ap in approval_patterns):
                    has_approval = True
            except Exception:
                pass

        if has_critical and not has_approval:
            checks.append(self._warn(
                "human_approval_checkpoints_check",
                "Ações críticas detectadas sem checkpoints de aprovação humana. "
                "Implemente confirmação humana para operações como delete, deploy e payment."
            ))
        else:
            checks.append(self._ok("human_approval_checkpoints_check"))

        return self._aggregate_checks(checks, "download_gate")
