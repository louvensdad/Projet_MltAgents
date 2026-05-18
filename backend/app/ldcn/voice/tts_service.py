from __future__ import annotations

from backend.app.ldcn.voice.elevenlabs_client import ElevenLabsClient
from backend.app.ldcn.voice.voice_config import load_voice_config


class LdcnTTSService:
    def __init__(self):
        self.config = load_voice_config()
        self.elevenlabs = ElevenLabsClient(self.config)

    def synthesize(self, text: str, locale: str = "pt-BR") -> dict[str, object]:
        clean_text = (text or "").strip()
        if not clean_text:
            return {
                "success": False,
                "provider": self.config.fallback,
                "error": "empty_text",
                "fallback_text": "",
            }

        if self.config.provider == "elevenlabs" and self.elevenlabs.is_configured():
            try:
                result = self.elevenlabs.synthesize(clean_text, locale=locale)
                return {
                    "success": True,
                    "provider": result.provider,
                    "audio_base64": result.audio_base64,
                    "content_type": result.content_type,
                    "voice_id": result.voice_id,
                    "model_id": result.model_id,
                    "fallback_text": clean_text,
                }
            except Exception as exc:
                return {
                    "success": False,
                    "provider": self.config.fallback,
                    "error": str(exc),
                    "fallback_text": clean_text,
                }

        return {
            "success": False,
            "provider": self.config.fallback,
            "error": "premium_tts_not_configured",
            "fallback_text": clean_text,
        }

