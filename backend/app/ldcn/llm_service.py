from __future__ import annotations

import logging
import os
from concurrent.futures import ThreadPoolExecutor, TimeoutError as FutureTimeoutError
from time import monotonic
from typing import Any

from openai import OpenAI

from backend.app.services.gemini_service import chat_with_ldcn

logger = logging.getLogger(__name__)


class LdcnLlmService:
    _last_health: dict[str, Any] = {
        "provider": "none",
        "model": "",
        "last_latency_ms": None,
        "last_error": None,
        "last_status": "idle",
        "fallback_used": False,
    }

    def __init__(self):
        self.refresh_config()

    def refresh_config(self) -> None:
        self.ai_provider = os.getenv("AI_PROVIDER", "openai").strip().lower()
        self.allow_mock_ai = os.getenv("ALLOW_MOCK_AI", "false").lower() == "true"
        self.openai_api_key = os.getenv("OPENAI_API_KEY", "").strip()
        self.openai_model = os.getenv("OPENAI_MODEL", os.getenv("AI_MODEL", "gpt-4.1-mini")).strip()
        self.openai_api_base = os.getenv("OPENAI_API_BASE", "").strip()
        self.gemini_enabled = os.getenv("GEMINI_ENABLED", "true").lower() == "true"
        self.gemini_api_key = os.getenv("GEMINI_API_KEY", "").strip()
        self.gemini_model = os.getenv("GEMINI_MODEL", "gemini-2.5-flash-lite").strip()

    def is_available(self, preferred_mode: str = "local") -> bool:
        self.refresh_config()
        provider = self._resolve_provider(preferred_mode)
        if provider == "openai":
            return self._openai_available()
        if provider == "gemini":
            return self._gemini_available()
        return self._openai_available() or (preferred_mode == "llm" and self._gemini_available())

    def generate(
        self,
        prompt: str,
        system_instruction: str,
        preferred_mode: str = "local",
        project_context: dict[str, Any] | None = None,
        timeout_seconds: float = 12.0,
        source: str = "chat",
    ) -> dict[str, Any]:
        self.refresh_config()
        provider = self._resolve_provider(preferred_mode)
        model = self._provider_model(provider)
        started_at = monotonic()
        logger.info("llm.started provider=%s model=%s timeout_seconds=%.2f source=%s", provider, model, timeout_seconds, source)

        if provider == "openai":
            result = self._generate_openai(prompt, system_instruction, timeout_seconds=timeout_seconds, source=source)
        elif provider == "gemini":
            result = self._generate_gemini(
                prompt,
                system_instruction=system_instruction,
                project_context=project_context,
                timeout_seconds=timeout_seconds,
            )
        else:
            result = {"success": False, "provider": provider, "response": "", "error_type": "unavailable"}

        latency_ms = round((monotonic() - started_at) * 1000, 2)
        self._record_health(
            provider=provider,
            model=model,
            latency_ms=latency_ms,
            error=None if result.get("success") else str(result.get("error") or result.get("error_type") or "unknown_error"),
            status="success" if result.get("success") else "error",
            fallback_used=not bool(result.get("success")),
        )
        if result.get("success"):
            logger.info("llm.done provider=%s model=%s latency_ms=%.2f", provider, model, latency_ms)
        else:
            logger.warning(
                "llm.failed provider=%s model=%s latency_ms=%.2f error_type=%s error=%s fallback=%s",
                provider,
                model,
                latency_ms,
                result.get("error_type"),
                result.get("error"),
                True,
            )
        return result

    def health(self) -> dict[str, Any]:
        self.refresh_config()
        provider = self._resolve_provider("llm")
        return {
            "provider": provider,
            "model": self._provider_model(provider),
            "key_present": self._provider_key_present(provider),
            "last_latency_ms": self._last_health.get("last_latency_ms"),
            "last_error": self._last_health.get("last_error"),
            "mock_enabled": self.allow_mock_ai,
        }

    def config_diagnostics(self) -> dict[str, Any]:
        self.refresh_config()
        provider = self._resolve_provider("llm")
        warnings: list[str] = []
        if provider == "openai" and self.openai_model != "gpt-4.1-mini":
            warnings.append("OPENAI_MODEL recomendado para LDCN: gpt-4.1-mini.")
        if provider == "gemini" and self.gemini_model != "gemini-2.5-flash-lite":
            warnings.append("GEMINI_MODEL recomendado para LDCN: gemini-2.5-flash-lite.")
        if self.allow_mock_ai:
            warnings.append("ALLOW_MOCK_AI deveria estar false para evitar fallback mock silencioso.")
        if not self._provider_key_present(provider):
            warnings.append(f"Chave ausente para o provider ativo: {provider}.")
        return {
            "provider": provider,
            "model": self._provider_model(provider),
            "key_present": self._provider_key_present(provider),
            "mock_enabled": self.allow_mock_ai,
            "warnings": warnings,
        }

    def _generate_openai(self, prompt: str, system_instruction: str, timeout_seconds: float, source: str) -> dict[str, Any]:
        if not self._openai_available():
            return {"success": False, "provider": "openai", "response": "", "error_type": "unavailable", "error": "OPENAI_API_KEY ou OPENAI_MODEL ausente."}
        try:
            kwargs: dict[str, Any] = {"api_key": self.openai_api_key}
            if self.openai_api_base:
                kwargs["base_url"] = self.openai_api_base
            kwargs["timeout"] = timeout_seconds
            client = OpenAI(**kwargs)
            response = client.chat.completions.create(
                model=self.openai_model,
                temperature=0.3 if source == "voice" else 0.35,
                max_tokens=120 if source == "voice" else 220,
                messages=[
                    {"role": "system", "content": system_instruction},
                    {"role": "user", "content": prompt},
                ],
                timeout=timeout_seconds,
            )
            content = response.choices[0].message.content if response.choices else ""
            return {
                "success": bool(content),
                "provider": "openai",
                "response": content or "",
                "model": self.openai_model,
            }
        except FutureTimeoutError:
            logger.exception("llm.exception provider=openai model=%s error=timeout", self.openai_model)
            return {"success": False, "provider": "openai", "response": "", "error_type": "timeout", "error": "OpenAI timeout."}
        except Exception as exc:
            logger.exception("llm.exception provider=openai model=%s", self.openai_model)
            return {"success": False, "provider": "openai", "response": "", "error_type": "provider_error", "error": str(exc)}

    def _generate_gemini(
        self,
        prompt: str,
        system_instruction: str,
        project_context: dict[str, Any] | None,
        timeout_seconds: float,
    ) -> dict[str, Any]:
        if not self._gemini_available():
            return {"success": False, "provider": "gemini", "response": "", "error_type": "unavailable", "error": "GEMINI_API_KEY ausente ou Gemini desabilitado."}
        with ThreadPoolExecutor(max_workers=1) as executor:
            future = executor.submit(
                chat_with_ldcn,
                prompt,
                project_context=project_context,
                system_instruction=system_instruction,
            )
            try:
                result = future.result(timeout=timeout_seconds)
            except FutureTimeoutError:
                logger.warning("llm.timeout provider=gemini model=%s", self.gemini_model)
                return {"success": False, "provider": "gemini", "response": "", "error_type": "timeout", "error": "Gemini timeout."}
        if result.get("success"):
            return {
                "success": True,
                "provider": "gemini",
                "response": str(result.get("response") or "").strip(),
                "model": self.gemini_model,
            }
        return {
            "success": False,
            "provider": "gemini",
            "response": "",
            "error_type": str(result.get("error_type") or "provider_error"),
            "error": str(result.get("error") or result.get("reason") or "Gemini request failed."),
        }

    def _resolve_provider(self, preferred_mode: str) -> str:
        if self.ai_provider in {"openai", "gemini"}:
            return self.ai_provider
        if preferred_mode == "llm" and self._gemini_available():
            return "gemini"
        if self._openai_available():
            return "openai"
        if self._gemini_available():
            return "gemini"
        return "none"

    def _provider_model(self, provider: str) -> str:
        if provider == "openai":
            return self.openai_model
        if provider == "gemini":
            return self.gemini_model
        return ""

    def _provider_key_present(self, provider: str) -> bool:
        if provider == "openai":
            return bool(self.openai_api_key)
        if provider == "gemini":
            return bool(self.gemini_api_key)
        return False

    @classmethod
    def _record_health(
        cls,
        provider: str,
        model: str,
        latency_ms: float,
        error: str | None,
        status: str,
        fallback_used: bool,
    ) -> None:
        cls._last_health = {
            "provider": provider,
            "model": model,
            "last_latency_ms": latency_ms,
            "last_error": error,
            "last_status": status,
            "fallback_used": fallback_used,
        }

    def _openai_available(self) -> bool:
        return bool(self.openai_api_key and self.openai_model)

    def _gemini_available(self) -> bool:
        return bool(self.gemini_enabled and self.gemini_api_key)
