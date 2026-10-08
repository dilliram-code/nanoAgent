from .planner import Planner
from .assistant import Assistant
from .tools.registry import TOOLS

class Agent:
    def __init__(self):
        self.planner = Planner()
        self.assistant = Assistant()

    def handle(self, user_request: str) -> str:
        plan = self.planner.plan(user_request)

        tool_name = plan["tool"]
        arguments = plan.get("arguments", {})

        tool = TOOLS[tool_name]
        result = tool(**arguments)

        return self.assistant.respond(
            user_request=user_request,
            tool_name=tool_name,
            tool_result=result,
        )

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
