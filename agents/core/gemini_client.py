import os
import warnings
import logging
import hashlib
from datetime import datetime, timezone
from typing import Optional, Dict, Any, Tuple

warnings.filterwarnings("ignore", category=FutureWarning)

logger = logging.getLogger(__name__)

AI_MODE_UNKNOWN = "UNKNOWN"
AI_MODE_GEMINI = "GEMINI_CONNECTED"
AI_MODE_MOCK = "MOCK_MODE"
AI_MODE_ERROR = "GEMINI_ERROR"

AI_GENERATION_MODE_LOCAL = "local_build_90"
AI_GENERATION_MODE_AGENT_BOOST = "agent_boost_100"

_prompt_cache: Dict[str, str] = {}


def check_agent_boost_allowed(payload: Optional[Dict[str, Any]] = None) -> Tuple[bool, str]:
    """Verifica se Agent Boost esta permitido.

    Checks:
      - Platform API key exists in env
      - If payload provided: agent_boost_status == "active"
      - If payload provided: payment_status == "paid"

    Returns:
        (allowed: bool, reason: str)
    """
    platform_key = os.getenv("GEMINI_API_KEY", "").strip()
    if not platform_key:
        return False, "Agent Boost temporariamente indisponivel. Chave de plataforma ausente."

    if payload:
        agent_boost_status = payload.get("agent_boost_status", "")
        payment_status = payload.get("payment_status", "")

        if agent_boost_status != "active":
            return False, "Agent Boost nao esta ativo para este projeto."

        if payment_status != "paid":
            return False, "Pagamento nao confirmado. Agent Boost requer pagamento ativo."

    return True, "Agent Boost disponivel"


def check_gemini_availability() -> dict:
    """Check if Google Gemini is available and working.

    Returns:
        dict with keys: mode, model, mock, reason, last_check, provider
    """
    gemini_api_key = os.getenv("GEMINI_API_KEY", "").strip()
    gemini_enabled = os.getenv("GEMINI_ENABLED", "true").lower() == "true"
    model_name = os.getenv("GEMINI_MODEL", "gemini-2.5-flash-lite")

    if not gemini_enabled:
        return {
            "mode": AI_MODE_ERROR,
            "model": model_name,
            "mock": False,
            "reason": "Agent Boost desabilitado (GEMINI_ENABLED=false).",
            "last_check": datetime.now(timezone.utc).isoformat(),
            "provider": "none",
        }

    if not gemini_api_key:
        return {
            "mode": AI_MODE_ERROR,
            "model": model_name,
            "mock": False,
            "reason": "Agent Boost temporariamente indisponivel. Chave de plataforma nao configurada.",
            "last_check": datetime.now(timezone.utc).isoformat(),
            "provider": "none",
        }

    try:
        import google.genai as genai
    except ImportError:
        return {
            "mode": AI_MODE_ERROR,
            "model": model_name,
            "mock": False,
            "reason": "Biblioteca google.genai nao instalada.",
            "last_check": datetime.now(timezone.utc).isoformat(),
            "provider": "none",
        }

    try:
        client = genai.Client(api_key=gemini_api_key)
        response = client.models.generate_content(
            model=model_name,
            contents="Responda apenas: OK",
        )
        return {
            "mode": AI_MODE_GEMINI,
            "model": model_name,
            "mock": False,
            "reason": "",
            "last_check": datetime.now(timezone.utc).isoformat(),
            "provider": "google",
        }
    except Exception as e:
        reason = f"Erro ao conectar no Gemini: {e}"
        logger.error(reason)
        return {
            "mode": AI_MODE_ERROR,
            "model": model_name,
            "mock": False,
            "reason": f"Falha na conexao: {str(e)[:150]}",
            "last_check": datetime.now(timezone.utc).isoformat(),
            "provider": "google",
        }


def _cache_key(prompt: str, system_instruction: Optional[str]) -> str:
    raw = f"{prompt}|{system_instruction or ''}"
    return hashlib.md5(raw.encode()).hexdigest()


class GeminiClient:
    """Cliente Gemini usando google.genai. Requer Agent Boost ativo.

    NUNCA faz fallback silencioso para mock.
    Sempre reporta o motivo quando AI nao esta disponivel.
    """

    def __init__(self, generation_mode: str = AI_GENERATION_MODE_LOCAL, payload: Optional[Dict[str, Any]] = None):
        self.api_key = os.getenv("GEMINI_API_KEY", "").strip()
        self.model_name = os.getenv("GEMINI_MODEL", "gemini-2.5-flash-lite")
        self.gemini_enabled = os.getenv("GEMINI_ENABLED", "true").lower() == "true"
        self._client: Optional[any] = None
        self._status: Optional[dict] = None
        self.generation_mode = generation_mode
        self.payload = payload or {}

    def check_agent_boost_allowed(self) -> Tuple[bool, str]:
        """Verifica se Agent Boost esta permitido para este cliente."""
        return check_agent_boost_allowed(self.payload if self.payload else None)

    def _ensure_client(self):
        if self._client is not None:
            return True
        if not self.gemini_enabled:
            return False
        if not self.api_key:
            return False
        try:
            import google.genai as genai
            self._client = genai.Client(api_key=self.api_key)
            return True
        except ImportError:
            logger.warning("google.genai nao instalado")
            return False
        except Exception as e:
            logger.error("Erro ao criar cliente Gemini: %s", e)
            return False

    def health_check(self) -> dict:
        if not self._ensure_client():
            allowed, reason = self.check_agent_boost_allowed()
            self._status = {
                "mode": AI_MODE_ERROR,
                "model": self.model_name,
                "mock": False,
                "reason": reason if not allowed else "Cliente Gemini nao disponivel",
                "last_check": datetime.now(timezone.utc).isoformat(),
                "provider": "none",
            }
            return self._status
        try:
            _ = self._client.models.generate_content(
                model=self.model_name,
                contents="Responda apenas: OK",
            )
            self._status = {
                "mode": AI_MODE_GEMINI,
                "model": self.model_name,
                "mock": False,
                "reason": "",
                "last_check": datetime.now(timezone.utc).isoformat(),
                "provider": "google",
            }
        except Exception as e:
            reason = "Modelo %s nao disponivel: %s" % (self.model_name, e)
            logger.warning(reason)
            self._status = {
                "mode": AI_MODE_ERROR,
                "model": self.model_name,
                "mock": False,
                "reason": reason,
                "last_check": datetime.now(timezone.utc).isoformat(),
                "provider": "google",
            }
        return self._status

    def generate(self, prompt: str, system_instruction: Optional[str] = None, task: str = "general") -> str:
        """Gera resposta usando Gemini.

        Verifica Agent Boost permission primeiro.
        Se nao permitido, retorna mensagem controlada - NUNCA mock silencioso.
        """
        ckey = _cache_key(prompt, system_instruction)
        if ckey in _prompt_cache:
            logger.info("[AI_ENGINE] Cache hit for prompt (%s)", task)
            return _prompt_cache[ckey]

        # Check Agent Boost permission first
        if self.generation_mode == AI_GENERATION_MODE_AGENT_BOOST:
            allowed, reason = self.check_agent_boost_allowed()
            if not allowed:
                msg = "[Agent Boost Required] %s" % reason
                logger.warning("[AI_ENGINE] Agent Boost bloqueado: %s", reason)
                _prompt_cache[ckey] = msg
                return msg

        status = self.health_check()
        if status["mode"] == AI_MODE_GEMINI:
            try:
                kwargs = {}
                if system_instruction:
                    kwargs["config"] = {"system_instruction": system_instruction}
                response = self._client.models.generate_content(
                    model=self.model_name,
                    contents=prompt,
                    **kwargs,
                )
                result = response.text
                logger.info("[AI_ENGINE] mode=GEMINI_CONNECTED model=%s mode=%s", self.model_name, self.generation_mode)
                _prompt_cache[ckey] = result
                return result
            except Exception as e:
                logger.error("[AI_ENGINE] mode=GEMINI_ERROR model=%s error=%s", self.model_name, e)
                msg = "[Agent Boost Error] Falha na geracao: %s" % str(e)[:200]
                _prompt_cache[ckey] = msg
                return msg
        else:
            reason = status.get("reason", "Agent Boost indisponivel")
            logger.info("[AI_ENGINE] Agent Boost indisponivel: %s", reason)
            msg = "[Agent Boost Required] %s" % reason
            _prompt_cache[ckey] = msg
            return msg

    def generate_local(self, prompt: str, system_instruction: Optional[str] = None) -> str:
        """Geracao local (nao chama Gemini). Para uso no modo Local Build 90%."""
        return "[Local Build 90%] Resposta local para: %s..." % prompt[:100]

    def clear_cache(self):
        _prompt_cache.clear()
