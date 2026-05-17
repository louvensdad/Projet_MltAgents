import asyncio
from fastapi import WebSocket
from typing import Dict, List, Optional
import json
import logging

logger = logging.getLogger(__name__)

class WebSocketManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}
        self.loop: Optional[asyncio.AbstractEventLoop] = None

    async def connect(self, websocket: WebSocket, project_id: str):
        await websocket.accept()
        try:
            self.loop = asyncio.get_running_loop()
        except RuntimeError:
            self.loop = None
        if project_id not in self.active_connections:
            self.active_connections[project_id] = []
        self.active_connections[project_id].append(websocket)
        logger.info(f"WebSocket connected for project: {project_id}")

    def disconnect(self, websocket: WebSocket, project_id: str):
        if project_id in self.active_connections:
            self.active_connections[project_id].remove(websocket)
            if not self.active_connections[project_id]:
                del self.active_connections[project_id]

    async def broadcast(self, project_id: str, event_type: str, data: dict):
        if project_id in self.active_connections:
            payload = {"type": event_type, "payload": data}
            for connection in self.active_connections[project_id]:
                try:
                    await connection.send_text(json.dumps(payload))
                except Exception as e:
                    logger.error(f"Error broadcasting to WebSocket: {e}")

    def broadcast_sync(self, project_id: str, event_type: str, data: dict):
        if not self.loop or project_id not in self.active_connections:
            return
        future = asyncio.run_coroutine_threadsafe(self.broadcast(project_id, event_type, data), self.loop)
        try:
            future.result(timeout=2)
        except Exception as exc:
            logger.error("Error scheduling WebSocket broadcast: %s", exc)

streamer = WebSocketManager()
