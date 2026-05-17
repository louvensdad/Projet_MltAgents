"""
navigator.py — Camada de Navegação Inteligente para o CLI
Permite voltar à pergunta anterior e corrige automaticamente erros de digitação.
"""
import unicodedata
import re


# ─── Palavras que significam "voltar" ────────────────────────────
BACK_KEYWORDS = {"voltar", "back", "anterior", "b", "<", "<<", "retornar"}

# ─── Correções automáticas de texto (typos comuns) ───────────────
TYPO_MAP = {
    # Português comuns
    "potuguês": "Português", "portugues": "Português", "pt": "Português",
    "ptbr": "Português", "br": "Português",
    "ingles": "Inglês", "english": "Inglês", "en": "Inglês", "ing": "Inglês",
    "frances": "Francês", "french": "Francês", "fr": "Francês",
    "espanol": "Espanhol", "spanish": "Espanhol", "es": "Espanhol",
    # Stacks
    "fastapi": "Python + FastAPI", "fast api": "Python + FastAPI",
    "python": "Python + FastAPI", "py": "Python + FastAPI",
    "nestjs": "Node.js + NestJS", "nest": "Node.js + NestJS",
    "expressjs": "Node.js + Express", "express": "Node.js + Express",
    "laravel": "PHP + Laravel", "php": "PHP + Laravel",
    "spring": "Java + Spring Boot", "java": "Java + Spring Boot",
    "springboot": "Java + Spring Boot",
    "spring_boot": "Java + Spring Boot",
    "java_springboot": "Java + Spring Boot",
    # Estilos de site
    "futurista": "Futurista", "futuro": "Futurista",
    "minimal": "Minimalista", "minimalista": "Minimalista",
    "corp": "Corporativo", "corporativo": "Corporativo", "empresa": "Corporativo",
    "dark": "Dark Tech", "dark tech": "Dark Tech", "tech": "Dark Tech",
    "luxo": "Luxo Moderno", "luxury": "Luxo Moderno", "elegante": "Luxo Moderno",
    # Respostas sim/não
    "sim": "s", "yes": "s", "y": "s",
    "nao": "n", "não": "n", "no": "n",
}


def normalize(text: str) -> str:
    """Remove acentos e coloca em minúsculo para comparação."""
    nfkd = unicodedata.normalize('NFKD', text)
    return nfkd.encode('ASCII', 'ignore').decode('utf-8').lower().strip()


def auto_correct(text: str) -> str:
    """Corrige automaticamente erros de digitação conhecidos."""
    key = normalize(text)
    if key in TYPO_MAP:
        corrected = TYPO_MAP[key]
        if corrected != text.strip():
            print(f"  📝 Corrigido automaticamente: '{text.strip()}' → '{corrected}'")
        return corrected
    return text.strip()


def is_back(text: str) -> bool:
    """Verifica se o usuário quer voltar à pergunta anterior."""
    return normalize(text) in BACK_KEYWORDS


class Navigator:
    """
    Wizard de navegação estilo passo-a-passo.
    Permite avançar, voltar e corrigir respostas automaticamente.
    """

    def __init__(self):
        self.history: list[dict] = []  # [{key, prompt, answer}, ...]
        self.current_step = 0

    def ask(self, key: str, prompt: str, options: dict = None,
            default: str = "", required: bool = True, correct: bool = True) -> str:
        """
        Faz uma pergunta e retorna a resposta.
        - Se o usuário digitar keyword de voltar, retorna "__BACK__".
        - Aplica auto_correct se correct=True.
        - Se options fornecido, valida que a resposta é uma chave válida.
        """
        hint = " (ou 'voltar' para retornar)"
        if default:
            hint = f" [padrão: {default}]{hint}"

        while True:
            raw = input(f"{prompt}{hint}: ").strip()

            if not raw and default:
                raw = default

            if is_back(raw):
                return "__BACK__"

            if correct:
                raw = auto_correct(raw)

            if options:
                # Aceitar número ou valor direto
                if raw in options:
                    answer = options[raw]
                else:
                    # Tentar match por valor (ex: digitou "FastAPI" ao invés de "1")
                    match = next((v for k, v in options.items()
                                  if normalize(v) == normalize(raw)), None)
                    if match:
                        answer = match
                    else:
                        valid = ", ".join([f"{k}={v}" for k, v in options.items()])
                        print(f"  ⚠️  Opção inválida. Válidas: {valid}")
                        continue
            else:
                answer = raw

            if required and not answer:
                print("  ⚠️  Este campo é obrigatório.")
                continue

            # Salvar no histórico
            self._save(key, prompt, answer)
            return answer

    def _save(self, key: str, prompt: str, answer: str):
        # Atualiza se já existe, senão adiciona
        for entry in self.history:
            if entry["key"] == key:
                entry["answer"] = answer
                return
        self.history.append({"key": key, "prompt": prompt, "answer": answer})

    def get(self, key: str, default=None):
        """Recupera uma resposta salva no histórico."""
        for entry in self.history:
            if entry["key"] == key:
                return entry["answer"]
        return default

    def confirm(self, prompt: str) -> bool:
        raw = input(f"{prompt} (s/n): ").strip()
        raw = auto_correct(raw)
        return normalize(raw) in ("s", "sim", "yes", "y")

    def show_history(self):
        """Exibe o histórico de respostas do usuário."""
        if not self.history:
            return
        print("\n  📋 Respostas anteriores:")
        for e in self.history:
            print(f"     {e['key']}: {e['answer']}")
        print()


def wizard_run(steps: list) -> dict:
    """
    Executa uma lista de steps de forma navegável (avançar/voltar).
    Cada step é uma função que recebe Navigator e retorna True (ok) ou False (back).

    steps = [fn1, fn2, fn3]
    """
    nav = Navigator()
    i = 0
    results = {}

    while i < len(steps):
        nav.show_history() if i > 0 else None
        result = steps[i](nav)
        if result == "__BACK__" and i > 0:
            print("  ↩️  Voltando à etapa anterior...\n")
            i -= 1
        elif result == "__BACK__" and i == 0:
            print("  ℹ️  Já estamos no início. Não é possível voltar mais.")
        else:
            results.update(result if isinstance(result, dict) else {})
            i += 1

    return results
