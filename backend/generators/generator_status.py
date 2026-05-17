from datetime import datetime
from backend.config.implemented_stacks import IMPLEMENTED_STACKS
from backend.config.feature_support_matrix import FEATURE_SUPPORT_MATRIX


def get_generator_status():
    now = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
    rows = []
    for stack, data in IMPLEMENTED_STACKS.items():
        rows.append(
            {
                "stack": stack,
                "generator": f"{stack.upper()} Generator",
                "support_level": data["status"],
                "last_validation": now,
                "supported_features": FEATURE_SUPPORT_MATRIX.get(stack, {}),
            }
        )
    return rows
