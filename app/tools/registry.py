from .calculator_tool import calculate
from .password_tool import generate_password
from .time_tool import get_current_time

TOOLS = {
    "calculator": calculate,
    "password_generator": generate_password,
    "current_time": get_current_time,
}

TOOL_DESCRIPTIONS = {
    "calculator": "Calculate a basic arithmetic expression.",
    "password_generator": "Generate a secure random password.",
    "current_time": "Return the current local date and time.",
}
