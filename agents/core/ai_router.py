import os
import logging
from typing import Optional, Dict, Any, Tuple
from datetime import datetime, timezone

logger = logging.getLogger(__name__)

AI_GENERATION_MODE_LOCAL = "local_build_90"
AI_GENERATION_MODE_AGENT_BOOST = "agent_boost_100"

MODE_CONFIGS = {
    "local_build_90": {
        "label": "Local Build 90%",
        "description": "Geracao local, sem custo, qualidade base",
        "max_ai_calls": 0,
        "max_tokens_budget": 0,
        "agents_to_use_gemini": [],
        "use_gemini_for": [],
    },
    "agent_boost_100": {
        "label": "Agent Boost 100%",
        "description": "Qualidade maxima com IA, requer Agent Boost ativo",
        "max_ai_calls": 10,
        "max_tokens_budget": 12000,
        "agents_to_use_gemini": [
            "ProductAgent", "ArchitectAgent", "BackendAgent",
            "FrontendAgent", "SecurityAgent", "TestAgent",
            "DevOpsAgent", "ReviewerAgent", "DesignAgent", "UXAgent"
        ],
        "use_gemini_for": ["architecture", "backend", "frontend", "docs", "tests", "security", "ux", "readme", "general"],
    },
}

GENERATION_TRACE_DEFAULT = {
    "generation_quality_mode": "local_build_90",
    "api_key_source": "none",
    "api_key_exposed": False,
    "fallback_used": False,
    "fallback_reason": "",
    "estimated_cost": "free",
    "ai_calls": 0,
    "budget": 0,
}


def check_agent_boost_allowed(payload: Dict[str, Any]) -> Tuple[bool, str]:
    """Verifica se Agent Boost esta permitido para este payload.

    Checks:
      - agent_boost_status == "active"
      - payment_status == "paid"
      - platform API key exists in env

    Returns:
        (allowed: bool, reason: str)
    """
    agent_boost_status = payload.get("agent_boost_status", "")
    payment_status = payload.get("payment_status", "")

    if agent_boost_status != "active":
        return False, "Agent Boost nao esta ativo para este projeto."

    if payment_status != "paid":
        return False, "Pagamento nao confirmado. Agent Boost requer pagamento ativo."

    platform_key = os.getenv("GEMINI_API_KEY", "").strip()
    if not platform_key:
        return False, "Agent Boost temporariamente indisponivel. Voce pode continuar com Local Build 90%."

    return True, "Agent Boost disponivel"


def resolve_ai_mode(payload: Dict[str, Any]) -> str:
    """Resolve o modo de geracao AI baseado no payload.

    Mapeia "local_build_90" e "agent_boost_100".
    Se nao especificado, verifica Agent Boost permission para decidir.
    """
    mode = payload.get("ai_generation_mode", "").strip().lower()

    if mode in (AI_GENERATION_MODE_LOCAL, AI_GENERATION_MODE_AGENT_BOOST):
        return mode

    # Auto-detect: check if agent boost is allowed
    allowed, _ = check_agent_boost_allowed(payload)
    if allowed:
        return AI_GENERATION_MODE_AGENT_BOOST

    return AI_GENERATION_MODE_LOCAL


def get_mode_config(mode: str) -> Dict[str, Any]:
    return MODE_CONFIGS.get(mode, MODE_CONFIGS[AI_GENERATION_MODE_LOCAL])


def should_use_gemini(mode: str, agent_name: str, payload: Dict[str, Any] = None) -> bool:
    """Decide if Gemini should be used for a given agent.

    Checks Agent Boost permission first. If not allowed, NEVER calls Gemini.
    """
    if mode == AI_GENERATION_MODE_LOCAL:
        return False

    if mode == AI_GENERATION_MODE_AGENT_BOOST:
        if payload:
            allowed, reason = check_agent_boost_allowed(payload)
            if not allowed:
                logger.info("[AI_ROUTER] Agent Boost bloqueado: %s", reason)
                return False

        config = get_mode_config(mode)
        return agent_name in config.get("agents_to_use_gemini", [])

    return False


def should_use_gemini_for(mode: str, task: str, payload: Dict[str, Any] = None) -> bool:
    """Decide if Gemini should be used for a given task."""
    if mode == AI_GENERATION_MODE_LOCAL:
        return False

    if mode == AI_GENERATION_MODE_AGENT_BOOST:
        if payload:
            allowed, reason = check_agent_boost_allowed(payload)
            if not allowed:
                logger.info("[AI_ROUTER] Agent Boost bloqueado para task '%s': %s", task, reason)
                return False

        config = get_mode_config(mode)
        return task in config.get("use_gemini_for", [])

    return False


def get_max_ai_calls(mode: str) -> int:
    return get_mode_config(mode).get("max_ai_calls", 0)


def get_max_tokens_budget(mode: str) -> int:
    return get_mode_config(mode).get("max_tokens_budget", 0)


def estimate_cost(mode: str, calls: int) -> str:
    if mode == AI_GENERATION_MODE_LOCAL:
        return "free"
    if mode == AI_GENERATION_MODE_AGENT_BOOST:
        return "medium" if calls <= 5 else "high"
    return "unknown"


def estimate_quality(mode: str) -> str:
    return {
        AI_GENERATION_MODE_AGENT_BOOST: "high",
        AI_GENERATION_MODE_LOCAL: "medium"
    }.get(mode, "medium")


def estimate_time(mode: str) -> str:
    return {
        AI_GENERATION_MODE_AGENT_BOOST: "medium",
        AI_GENERATION_MODE_LOCAL: "fast"
    }.get(mode, "fast")


def build_generation_trace(mode: str, fallback_used: bool = False, fallback_reason: str = "", ai_calls: int = 0) -> Dict[str, Any]:
    config = get_mode_config(mode)
    platform_key_exists = bool(os.getenv("GEMINI_API_KEY", "").strip())
    return {
        "generation_quality_mode": mode,
        "api_key_source": "platform_backend" if (mode == AI_GENERATION_MODE_AGENT_BOOST and platform_key_exists) else "none",
        "api_key_exposed": False,
        "fallback_used": fallback_used,
        "fallback_reason": fallback_reason,
        "estimated_cost": estimate_cost(mode, ai_calls),
        "estimated_quality": estimate_quality(mode),
        "estimated_time": estimate_time(mode),
        "ai_calls": ai_calls,
        "budget": config.get("max_tokens_budget", 0),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }


class AIRouter:
    def __init__(self, payload: Dict[str, Any]):
        self.payload = payload
        self.mode = resolve_ai_mode(payload)
        self.config = get_mode_config(self.mode)
        self.fallback_used = False
        self.fallback_reason = ""
        self.ai_calls = 0
        self.max_calls = self.config.get("max_ai_calls", 0)
        self.tokens_used = 0
        self.max_tokens = self.config.get("max_tokens_budget", 0)

    @property
    def is_local_build(self) -> bool:
        return self.mode == AI_GENERATION_MODE_LOCAL

    @property
    def is_agent_boost(self) -> bool:
        return self.mode == AI_GENERATION_MODE_AGENT_BOOST

    def can_call_ai(self) -> bool:
        if self.is_local_build:
            return False
        if self.ai_calls >= self.max_calls:
            logger.info("[AI_ROUTER] Limite de chamadas atingido: %d/%d", self.ai_calls, self.max_calls)
            return False
        # Check agent boost permission
        allowed, reason = check_agent_boost_allowed(self.payload)
        if not allowed:
            logger.info("[AI_ROUTER] Agent Boost nao permitido: %s", reason)
            return False
        return True

    def record_ai_call(self, tokens: int = 0):
        self.ai_calls += 1
        self.tokens_used += tokens

    def should_use_gemini_for_agent(self, agent_name: str) -> bool:
        return should_use_gemini(self.mode, agent_name, self.payload)

    def should_use_gemini_for_task(self, task: str) -> bool:
        return should_use_gemini_for(self.mode, task, self.payload)

    def on_gemini_error(self, error: Exception) -> bool:
        error_str = str(error)
        is_quota = "429" in error_str or "RESOURCE_EXHAUSTED" in error_str

        if is_quota:
            self.fallback_used = True
            self.fallback_reason = "Agent Boost: quota exceeded. Usando fallback local."
            logger.warning("[AI_ROUTER] %s", self.fallback_reason)
            return True

        self.fallback_used = True
        self.fallback_reason = f"Agent Boost error: {error_str[:100]}. Usando fallback local."
        logger.warning("[AI_ROUTER] %s", self.fallback_reason)
        return True

    def get_trace(self) -> Dict[str, Any]:
        return build_generation_trace(
            mode=self.mode,
            fallback_used=self.fallback_used,
            fallback_reason=self.fallback_reason,
            ai_calls=self.ai_calls,
        )

    def get_display_info(self) -> Dict[str, Any]:
        return {
            "mode": self.mode,
            "label": self.config.get("label", "Local Build 90%"),
            "description": self.config.get("description", ""),
            "ai_calls": self.ai_calls,
            "max_ai_calls": self.max_calls,
            "tokens_used": self.tokens_used,
            "max_tokens_budget": self.max_tokens,
            "fallback_used": self.fallback_used,
            "fallback_reason": self.fallback_reason,
            "estimated_cost": estimate_cost(self.mode, self.ai_calls),
            "estimated_quality": estimate_quality(self.mode),
            "estimated_time": estimate_time(self.mode),
        }
