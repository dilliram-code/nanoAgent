import time
from datetime import datetime, timezone
from .planner import Planner
from .assistant import Assistant
from .tools.registry import TOOLS

class Agent:
    def __init__(self):
        self.planner = Planner()
        self.assistant = Assistant()

    def handle_detailed(self, user_request: str) -> dict:
        """Executes the full Planner -> Tool -> Assistant pipeline and returns full telemetry."""
        start_time = time.perf_counter()
        
        # 1. Planner decides the tool and arguments
        plan = self.planner.plan(user_request)
        tool_name = plan.get("tool")
        arguments = plan.get("arguments", {})
        
        if tool_name not in TOOLS:
            raise ValueError(f"Unknown tool selected: {tool_name}")

        # 2. Tool Execution
        tool = TOOLS[tool_name]
        tool_start = time.perf_counter()
        tool_result = tool(**arguments)
        tool_duration_ms = round((time.perf_counter() - tool_start) * 1000, 2)

        # 3. Assistant generates natural response
        assistant_start = time.perf_counter()
        response_text = self.assistant.respond(
            user_request=user_request,
            tool_name=tool_name,
            tool_result=tool_result,
        )
        assistant_duration_ms = round((time.perf_counter() - assistant_start) * 1000, 2)
        total_duration_ms = round((time.perf_counter() - start_time) * 1000, 2)

        return {
            "user_request": user_request,
            "plan": {
                "tool": tool_name,
                "arguments": arguments,
            },
            "tool_result": tool_result,
            "response": response_text,
            "metrics": {
                "tool_duration_ms": tool_duration_ms,
                "assistant_duration_ms": assistant_duration_ms,
                "total_duration_ms": total_duration_ms,
            },
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }

    def handle(self, user_request: str) -> str:
        detailed = self.handle_detailed(user_request)
        return detailed["response"]

    def run(self):
        print("Natural AI Assistant")
        print("Type 'exit' to quit.\n")

        while True:
            user_request = input("You: ").strip()

            if user_request.lower() in {"exit", "quit"}:
                print("Goodbye!")
                break

            try:
                answer = self.handle(user_request)
                print(f"Assistant: {answer}\n")
            except Exception as exc:
                print(f"Assistant: Sorry, something went wrong: {exc}\n")

