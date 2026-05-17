from backend.generators.generator_status import get_generator_status


def get_registry_summary():
    generators = get_generator_status()
    stable = len([g for g in generators if g["support_level"] == "stable"])
    partial = len([g for g in generators if g["support_level"] == "partial"])
    planned = len([g for g in generators if g["support_level"] == "planned"])
    return {
        "total": len(generators),
        "stable": stable,
        "partial": partial,
        "planned": planned,
        "generators": generators,
    }
