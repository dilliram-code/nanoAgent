from unittest.mock import patch
from starlette.testclient import TestClient
from app.api import app

client = TestClient(app)

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "model" in data
    assert data["tools_count"] == 3

def test_system_info():
    response = client.get("/api/info")
    assert response.status_code == 200
    data = response.json()
    assert "architecture" in data
    assert len(data["tools"]) == 3

def test_tools_list():
    response = client.get("/api/tools")
    assert response.status_code == 200
    data = response.json()
    assert data["count"] == 3
    tool_names = [t["name"] for t in data["tools"]]
    assert "calculator" in tool_names
    assert "password_generator" in tool_names
    assert "current_time" in tool_names

def test_execute_calculator_tool_direct():
    response = client.post("/api/tools/execute", json={
        "tool": "calculator",
        "arguments": {"expression": "100 * 5"}
    })
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["result"] == 500
    assert "duration_ms" in data

def test_execute_password_tool_direct():
    response = client.post("/api/tools/execute", json={
        "tool": "password_generator",
        "arguments": {"length": 20}
    })
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert len(data["result"]) == 20

def test_execute_invalid_tool():
    response = client.post("/api/tools/execute", json={
        "tool": "non_existent_tool",
        "arguments": {}
    })
    assert response.status_code == 404

def test_serve_index():
    response = client.get("/")
    assert response.status_code == 200
    assert "Natural AI Assistant" in response.text

@patch("app.api.agent.handle_detailed")
def test_chat_endpoint_mock(mock_handle):
    mock_handle.return_value = {
        "user_request": "Calculate 5 + 5",
        "plan": {"tool": "calculator", "arguments": {"expression": "5 + 5"}},
        "tool_result": 10,
        "response": "5 plus 5 equals 10.",
        "metrics": {"tool_duration_ms": 0.5, "assistant_duration_ms": 120.0, "total_duration_ms": 150.0},
        "timestamp": "2026-10-08T00:00:00Z"
    }

    response = client.post("/api/chat", json={"message": "Calculate 5 + 5"})
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["data"]["response"] == "5 plus 5 equals 10."
    assert data["data"]["tool_result"] == 10
