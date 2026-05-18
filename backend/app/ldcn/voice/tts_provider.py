from __future__ import annotations

from dataclasses import dataclass
from typing import Protocol


@dataclass(frozen=True)
class TTSResult:
    text: str
    provider: str
    voice: str | None = None


class TTSProvider(Protocol):
    name: str

    def synthesize(self, text: str, *, locale: str = "pt-BR", voice: str | None = None) -> TTSResult:
        ...


@dataclass
class BrowserTTSProvider:
    name: str = "browser_tts"

    def synthesize(self, text: str, *, locale: str = "pt-BR", voice: str | None = None) -> TTSResult:
        return TTSResult(text=text, provider=self.name, voice=voice)


@dataclass
class OpenAITTSProvider:
    name: str = "openai_tts"

    def synthesize(self, text: str, *, locale: str = "pt-BR", voice: str | None = None) -> TTSResult:
        return TTSResult(text=text, provider=self.name, voice=voice)


@dataclass
class ElevenLabsTTSProvider:
    name: str = "elevenlabs_tts"

    def synthesize(self, text: str, *, locale: str = "pt-BR", voice: str | None = None) -> TTSResult:
        return TTSResult(text=text, provider=self.name, voice=voice)


@dataclass
class AzureTTSProvider:
    name: str = "azure_tts"

    def synthesize(self, text: str, *, locale: str = "pt-BR", voice: str | None = None) -> TTSResult:
        return TTSResult(text=text, provider=self.name, voice=voice)

