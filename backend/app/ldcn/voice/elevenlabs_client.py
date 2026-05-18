from __future__ import annotations

import base64
from dataclasses import dataclass

import requests

from backend.app.ldcn.voice.voice_config import LdcnVoiceConfig


@dataclass
class ElevenLabsTTSResult:
    provider: str
    audio_base64: str
    content_type: str
    voice_id: str
    model_id: str


class ElevenLabsClient:
    base_url = "https://api.elevenlabs.io/v1/text-to-speech"

    def __init__(self, config: LdcnVoiceConfig):
        self.config = config

    def is_configured(self) -> bool:
        return bool(self.config.api_key and self.config.voice_id)

    def synthesize(self, text: str, locale: str = "pt-BR") -> ElevenLabsTTSResult:
        url = f"{self.base_url}/{self.config.voice_id}?output_format=mp3_44100_128"
        response = requests.post(
            url,
            headers={
                "xi-api-key": self.config.api_key,
                "Content-Type": "application/json",
            },
            json={
                "text": text,
                "model_id": self.config.model_id,
                "language_code": locale.split("-")[0].lower(),
                "voice_settings": {
                    "stability": 0.45,
                    "similarity_boost": 0.8,
                },
            },
            timeout=20,
        )
        response.raise_for_status()
        return ElevenLabsTTSResult(
            provider="elevenlabs",
            audio_base64=base64.b64encode(response.content).decode("ascii"),
            content_type=response.headers.get("content-type", "audio/mpeg"),
            voice_id=self.config.voice_id,
            model_id=self.config.model_id,
        )

