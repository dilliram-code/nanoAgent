import os
import time
from pathlib import Path
from typing import Any, Dict, Optional

from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

from .agent import Agent
from .config import OPENAI_MODEL
from .tools.registry import TOOLS, TOOL_METADATA

# Initialize FastAPI App
app = FastAPI(
    title="Natural AI Assistant API",
    description="Planner -> Tool -> Assistant AI Agent Architecture",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

# Enable CORS for flexible deployments
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Single Agent Instance
agent = Agent()

# Request / Response Models
class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000, description="User prompt to process")

class ToolExecuteRequest(BaseModel):
    tool: str = Field(..., description="Tool name to execute")
    arguments: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Tool parameters")

# API Routes
@app.api_route("/api/health", methods=["GET", "HEAD"], tags=["System"])
def health_check():
    return {
        "status": "healthy",
        "model": OPENAI_MODEL,
        "tools_count": len(TOOLS),
        "version": "1.0.0",
    }

@app.api_route("/api/info", methods=["GET", "HEAD"], tags=["System"])
def system_info():
    return {
        "name": "Natural AI Assistant",
        "description": "Demonstrating the Planner -> Tool -> Assistant AI pipeline",
        "architecture": {
            "step_1": "User Query submitted to Planner (OpenAI LLM)",
            "step_2": "Planner chooses exactly 1 tool & extracts arguments in structured JSON",
            "step_3": "Tool executes locally with safe sandboxing/logic",
            "step_4": "Assistant (OpenAI LLM) synthesizes raw tool output into a conversational response",
        },
        "model": OPENAI_MODEL,
        "tools": list(TOOL_METADATA.values()),
    }

@app.api_route("/api/tools", methods=["GET", "HEAD"], tags=["Tools"])
def list_tools():
    return {
        "count": len(TOOL_METADATA),
        "tools": list(TOOL_METADATA.values()),
    }


@app.post("/api/tools/execute", tags=["Tools"])
def execute_tool_direct(req: ToolExecuteRequest):
    if req.tool not in TOOLS:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Tool '{req.tool}' not found. Available tools: {list(TOOLS.keys())}",
        )

    tool_fn = TOOLS[req.tool]
    start_time = time.perf_counter()
    try:
        result = tool_fn(**(req.arguments or {}))
        duration_ms = round((time.perf_counter() - start_time) * 1000, 2)
        return {
            "success": True,
            "tool": req.tool,
            "arguments": req.arguments,
            "result": result,
            "duration_ms": duration_ms,
        }
    except Exception as exc:
        duration_ms = round((time.perf_counter() - start_time) * 1000, 2)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error executing tool '{req.tool}': {str(exc)}",
        )

@app.post("/api/chat", tags=["Agent"])
def chat(req: ChatRequest):
    user_message = req.message.strip()
    if not user_message:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Message cannot be empty.",
        )

    try:
        detailed_result = agent.handle_detailed(user_message)
        return {
            "success": True,
            "data": detailed_result,
        }
    except Exception as exc:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "success": False,
                "error": str(exc),
                "message": "Failed to process request through the AI pipeline.",
            },
        )

# Frontend Static Assets Serving
STATIC_DIR = Path(__file__).parent.parent / "static"
if not STATIC_DIR.exists():
    STATIC_DIR.mkdir(parents=True, exist_ok=True)

# Mount static folder
app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")

@app.api_route("/", methods=["GET", "HEAD"], response_class=FileResponse, tags=["Frontend"])
def serve_index():
    index_file = STATIC_DIR / "index.html"
    if index_file.exists():
        return FileResponse(str(index_file))
    return JSONResponse(
        content={"message": "Natural AI Assistant API running. Frontend static files not found."},
        status_code=status.HTTP_200_OK,
    )


@app.get("/{full_path:path}", response_class=FileResponse, include_in_schema=False)
def serve_fallback(full_path: str):
    target_path = STATIC_DIR / full_path
    if target_path.is_file():
        return FileResponse(str(target_path))
    index_file = STATIC_DIR / "index.html"
    if index_file.exists():
        return FileResponse(str(index_file))
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
