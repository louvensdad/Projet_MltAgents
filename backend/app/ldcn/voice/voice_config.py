from __future__ import annotations

import os
from dataclasses import dataclass


@dataclass(frozen=True)
class LdcnVoiceConfig:
    provider: str
    fallback: str
    api_key: str
    voice_id: str
    model_id: str


def load_voice_config() -> LdcnVoiceConfig:
    return LdcnVoiceConfig(
        provider=os.getenv("LDCN_VOICE_PROVIDER", "browser").strip().lower() or "browser",
        fallback=os.getenv("LDCN_VOICE_FALLBACK", "browser").strip().lower() or "browser",
        api_key=os.getenv("ELEVENLABS_API_KEY", "").strip(),
        voice_id=os.getenv("ELEVENLABS_VOICE_ID", "").strip(),
        model_id=os.getenv("ELEVENLABS_MODEL_ID", "eleven_multilingual_v2").strip() or "eleven_multilingual_v2",
    )

