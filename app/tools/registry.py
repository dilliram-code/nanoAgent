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

TOOL_METADATA = {
    "calculator": {
        "name": "calculator",
        "displayName": "Math Calculator",
        "description": "Calculates arithmetic expressions including addition, subtraction, multiplication, division, powers, and modulo.",
        "icon": "calculator",
        "category": "Math & Logic",
        "parameters": {
            "expression": {
                "type": "string",
                "description": "The math expression to evaluate, e.g. '25 * 18 + 4' or '2 ** 8'",
                "required": True,
                "default": "12 * 15",
            }
        },
        "examples": [
            "Calculate 25 * 18",
            "What is 1024 / 16 + 50?",
            "Compute 2 ** 10",
        ],
    },
    "password_generator": {
        "name": "password_generator",
        "displayName": "Password Generator",
        "description": "Generates cryptographically secure random passwords containing letters, numbers, and special symbols.",
        "icon": "shield-check",
        "category": "Security",
        "parameters": {
            "length": {
                "type": "integer",
                "description": "The length of the password (minimum 8 characters)",
                "required": False,
                "default": 16,
            }
        },
        "examples": [
            "Generate a secure password",
            "Create a 24 character secure password",
            "Generate password with length 32",
        ],
    },
    "current_time": {
        "name": "current_time",
        "displayName": "Clock & Timezone",
        "description": "Retrieves the current local date, time, and timezone information.",
        "icon": "clock",
        "category": "Utilities",
        "parameters": {},
        "examples": [
            "What time is it?",
            "What is today's date and current time?",
            "Tell me the current time with timezone",
        ],
    },
}

