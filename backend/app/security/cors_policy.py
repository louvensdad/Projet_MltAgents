from fastapi.middleware.cors import CORSMiddleware
import os

# Origens obrigatórias do frontend (desenvolvimento local)
_MANDATORY_FRONTEND_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:4321",
    "http://127.0.0.1:4321",
    "http://localhost:8001",
    "http://127.0.0.1:8001",
]

def setup_cors(app):
    """
    Configura CORS. As origens do frontend (portas 3000, 4321) são sempre incluídas.
    Em produção, defina ALLOWED_ORIGINS com os domínios reais no .env.
    """
    env_origins_raw = os.getenv("ALLOWED_ORIGINS", "")
    env_origins = [o.strip() for o in env_origins_raw.split(",") if o.strip()]

    # Mescla origens obrigatórias + extras do env (sem duplicatas)
    origins = list(dict.fromkeys(_MANDATORY_FRONTEND_ORIGINS + env_origins))

    print(f"[CORS] Origens permitidas: {origins}")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
        expose_headers=["*"],
    )
