import os
import ast
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from shared.observability.logger import get_logger
from knowledge_engine.comparison_engine import ComparisonEngine
from knowledge_engine.educational_mode import EducationalMode
from stack_registry.registry import StackRegistry
from .streamer import streamer
from .routes.ai_boost import router as ai_boost_router
from .routes.auth import router as auth_router
from .routes.create import router as create_router
from .routes.downloads import router as downloads_router
from .routes.generate import router as generate_router
from .routes.payments import router as payments_router
from .routes.prompt_routes import router as prompt_router
from .routes.templates import router as templates_router
from .routes.system import router as system_router
from .routes.upgrades import router as projects_router

logger = get_logger("backend.main")

app = FastAPI(
    title="SaaS Factory AI - Enterprise API",
    version="2.0.0",
    description="Enterprise API using single-path generation pipeline.",
)

# Use env vars for CORS to avoid hardcoded ports
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

comparison_engine = ComparisonEngine()
educational_mode = EducationalMode()
stack_registry = StackRegistry()

app.include_router(create_router)
app.include_router(auth_router)
app.include_router(generate_router)
app.include_router(downloads_router)
app.include_router(payments_router)
app.include_router(ai_boost_router)
app.include_router(templates_router)
app.include_router(system_router)
app.include_router(projects_router)
app.include_router(prompt_router)

@app.websocket("/ws/live/{project_id}")
async def websocket_endpoint(websocket: WebSocket, project_id: str):
    await streamer.connect(websocket, project_id)
    try:
        while True:
            # We don't expect the client to send much, but keep connection alive
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        streamer.disconnect(websocket, project_id)

@app.get("/health")
def healthcheck():
    return {"status": "ok", "service": "Enterprise API"}

@app.post("/api/v1/generate")
def generate_project(request: dict):
    raise HTTPException(
        status_code=410,
        detail="Legacy generation route disabled. Use /api/generate as the single official generation path.",
    )

@app.get("/api/v1/stacks/{stack_id}/schema")
def get_stack_schema(stack_id: str):
    try:
        stack = stack_registry.get_stack(stack_id)
        return stack
    except ValueError:
        raise HTTPException(status_code=404, detail="Stack not found")

@app.post("/api/v1/stacks/{stack_id}/validate")
def validate_stack_live(stack_id: str, payload: dict):
    try:
        stack = stack_registry.get_stack(stack_id)
        rules = stack.get("validation_rules", [])
        warnings = []
        for rule in rules:
            try:
                if _evaluate_validation_condition(rule["condition"], payload):
                    warnings.append(rule["message"])
            except Exception as e:
                logger.warning("Ignoring malformed validation rule for %s: %s", stack_id, e)
        return {"warnings": warnings, "valid": len(warnings) == 0}
    except ValueError:
        raise HTTPException(status_code=404, detail="Stack not found")


def _evaluate_validation_condition(condition: str, payload: dict) -> bool:
    tree = ast.parse(condition, mode="eval")
    return bool(_evaluate_ast_node(tree.body, payload))


def _evaluate_ast_node(node: ast.AST, payload: dict):
    if isinstance(node, ast.BoolOp):
        values = [_evaluate_ast_node(value, payload) for value in node.values]
        if isinstance(node.op, ast.And):
            return all(values)
        if isinstance(node.op, ast.Or):
            return any(values)
        raise ValueError(f"Unsupported boolean operator: {type(node.op).__name__}")

    if isinstance(node, ast.UnaryOp) and isinstance(node.op, ast.Not):
        return not bool(_evaluate_ast_node(node.operand, payload))

    if isinstance(node, ast.Compare):
        left = _evaluate_ast_node(node.left, payload)
        for operator, comparator in zip(node.ops, node.comparators):
            right = _evaluate_ast_node(comparator, payload)
            if isinstance(operator, ast.Eq):
                ok = left == right
            elif isinstance(operator, ast.NotEq):
                ok = left != right
            elif isinstance(operator, ast.In):
                ok = left in right
            elif isinstance(operator, ast.NotIn):
                ok = left not in right
            else:
                raise ValueError(f"Unsupported comparison operator: {type(operator).__name__}")
            if not ok:
                return False
            left = right
        return True

    if isinstance(node, ast.Name):
        return payload.get(node.id)

    if isinstance(node, ast.Constant):
        return node.value

    raise ValueError(f"Unsupported validation expression: {type(node).__name__}")


@app.get("/api/v1/education/{topic}")
def get_educational_explanation(topic: str):
    explanation = educational_mode.explain(topic)
    if "error" in explanation:
        raise HTTPException(status_code=404, detail=explanation["error"])
    return explanation

@app.get("/api/v1/compare")
def compare_architecture(option_a: str, option_b: str):
    comparison = comparison_engine.compare(option_a, option_b)
    if "error" in comparison:
        raise HTTPException(status_code=404, detail=comparison["error"])
    return comparison
