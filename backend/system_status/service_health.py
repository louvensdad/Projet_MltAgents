from datetime import datetime


def _ok(name: str):
    return {"name": name, "status": "online", "updated_at": datetime.utcnow().isoformat()}


def get_service_health():
    return [
        _ok("Validation Engine"),
        _ok("Security Gate"),
        _ok("Recommendation Engine"),
        _ok("Documentation Engine"),
        _ok("Generator Registry"),
        _ok("Download Service"),
        {"name": "Queue Status", "status": "partial", "updated_at": datetime.utcnow().isoformat()},
        {"name": "Cache Status", "status": "partial", "updated_at": datetime.utcnow().isoformat()},
    ]
