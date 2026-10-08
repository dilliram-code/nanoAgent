import json
from openai import OpenAI

from .config import OPENAI_API_KEY, OPENAI_MODEL
from .tools.registry import TOOL_DESCRIPTIONS

class Planner:
    """Decides which ONE tool should handle the user's request."""

    def __init__(self):
        self.client = OpenAI(api_key=OPENAI_API_KEY)

    def plan(self, user_request: str) -> dict:
        tools_text = "\n".join(
            f"- {name}: {description}"
            for name, description in TOOL_DESCRIPTIONS.items()
        )

        response = self.client.responses.create(
            model=OPENAI_MODEL,
            instructions=(
                "You are the planner of a small AI assistant. "
                "Choose exactly one tool. Do not answer the user directly. "
                "Return only valid JSON with keys: tool and arguments. "
                "arguments must be a JSON object. "
                f"Available tools:\n{tools_text}"
            ),
            input=user_request,
        )

        text = response.output_text.strip()
        if text.startswith("```"):
            lines = text.splitlines()
            if lines[0].startswith("```"):
                lines = lines[1:]
            if lines and lines[-1].startswith("```"):
                lines = lines[:-1]
            text = "\n".join(lines).strip()

        result = json.loads(text)

        if "tool" not in result or result["tool"] not in TOOL_DESCRIPTIONS:
            raise ValueError(f"Unknown or missing tool selected: {result.get('tool')}")

        if "arguments" not in result or not isinstance(result["arguments"], dict):
            result["arguments"] = {}

        return result

