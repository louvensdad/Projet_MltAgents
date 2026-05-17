from backend.app.services.payment_service import get_all_projects
from .service_health import get_service_health
from .generator_registry import get_registry_summary
from .performance_monitor import get_performance_metrics
from .activity_feed import parse_recent_activity


def get_engine_overview():
    projects = get_all_projects()
    services = get_service_health()
    generators = get_registry_summary()
    performance = get_performance_metrics()
    activity = parse_recent_activity(limit=8)
    return {
        "services": services,
        "generators": generators,
        "performance": performance,
        "projects_total": len(projects),
        "recent_activity": activity,
        "last_project": projects[-1] if projects else None,
    }
