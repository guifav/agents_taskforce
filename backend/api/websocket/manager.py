"""
WebSocket connection manager for real-time updates
"""
import json
from typing import List, Dict
from datetime import datetime

from fastapi import WebSocket


class ConnectionManager:
    """Manages WebSocket connections"""
    
    def __init__(self):
        self.active_connections: List[WebSocket] = []
    
    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        await self.send_personal_message({
            "type": "connected",
            "message": "Connected to Agent Orchestrator Dashboard",
            "timestamp": datetime.utcnow().isoformat()
        }, websocket)
    
    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
    
    async def send_personal_message(self, message: dict, websocket: WebSocket):
        await websocket.send_text(json.dumps(message))
    
    async def broadcast(self, message: dict):
        """Broadcast to all connected clients"""
        disconnected = []
        for connection in self.active_connections:
            try:
                await connection.send_text(json.dumps(message))
            except Exception:
                disconnected.append(connection)
        
        # Clean up disconnected clients
        for conn in disconnected:
            if conn in self.active_connections:
                self.active_connections.remove(conn)
    
    async def handle_message(self, websocket: WebSocket, data: str):
        """Handle incoming WebSocket messages"""
        try:
            message = json.loads(data)
            msg_type = message.get("type")
            
            if msg_type == "ping":
                await self.send_personal_message({
                    "type": "pong",
                    "timestamp": datetime.utcnow().isoformat()
                }, websocket)
            
            elif msg_type == "subscribe":
                channel = message.get("channel")
                await self.send_personal_message({
                    "type": "subscribed",
                    "channel": channel,
                    "message": f"Subscribed to {channel}"
                }, websocket)
            
            elif msg_type == "agent_command":
                # Handle agent commands from UI
                agent_id = message.get("agent_id")
                command = message.get("command")
                await self.send_personal_message({
                    "type": "command_received",
                    "agent_id": agent_id,
                    "command": command,
                    "status": "processing"
                }, websocket)
            
            else:
                await self.send_personal_message({
                    "type": "error",
                    "message": f"Unknown message type: {msg_type}"
                }, websocket)
                
        except json.JSONDecodeError:
            await self.send_personal_message({
                "type": "error",
                "message": "Invalid JSON"
            }, websocket)
    
    async def broadcast_agent_update(self, agent_id: int, status: str, task: str = None):
        """Broadcast agent status update"""
        await self.broadcast({
            "type": "agent_update",
            "agent_id": agent_id,
            "status": status,
            "current_task": task,
            "timestamp": datetime.utcnow().isoformat()
        })
    
    async def broadcast_job_update(self, job_id: int, status: str, result: dict = None):
        """Broadcast job status update"""
        await self.broadcast({
            "type": "job_update",
            "job_id": job_id,
            "status": status,
            "result": result,
            "timestamp": datetime.utcnow().isoformat()
        })
