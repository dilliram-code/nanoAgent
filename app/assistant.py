from openai import OpenAI
from .config import OPENAI_API_KEY, OPENAI_MODEL

class Assistant:
    """Turns the raw tool result into a friendly response."""

    def __init__(self):
        self.client = OpenAI(api_key=OPENAI_API_KEY)

    def respond(self, user_request: str, tool_name: str, tool_result) -> str:
        response = self.client.responses.create(
            model=OPENAI_MODEL,
            instructions=(
                "You are a warm, concise AI assistant. "
                "Explain the tool result naturally. "
                "Do not claim to have done anything beyond the supplied result."
            ),
            input=(
                f"User request: {user_request}\n"
                f"Tool used: {tool_name}\n"
                f"Tool result: {tool_result}"
            ),
        )
        return response.output_text
