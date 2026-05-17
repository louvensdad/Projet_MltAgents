import os
import time
from pathlib import Path
from backend.config.implemented_stacks import IMPLEMENTED_STACKS

_START_TS = time.time()


def _dir_size_bytes(path: Path) -> int:
    if not path.exists():
        return 0
    total = 0
    for p in path.rglob("*"):
        if p.is_file():
            total += p.stat().st_size
    return total


def get_performance_metrics():
    docs_cache_path = Path("documentation_engine")
    queue_size = 0  # queue engine ainda não implementado
    memory_mb = 0
    try:
        import resource  # Unix-like
        memory_mb = round(resource.getrusage(resource.RUSAGE_SELF).ru_maxrss / 1024, 2)
    except Exception:
        memory_mb = -1

    return {
        "memory_mb": memory_mb,
        "generators_loaded": len(IMPLEMENTED_STACKS),
        "docs_cache_size_bytes": _dir_size_bytes(docs_cache_path),
        "queue_size": queue_size,
        "uptime_seconds": int(time.time() - _START_TS),
        "pid": os.getpid(),
    }
