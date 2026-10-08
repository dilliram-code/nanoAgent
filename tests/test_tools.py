import pytest
from app.tools.calculator_tool import calculate
from app.tools.password_tool import generate_password
from app.tools.time_tool import get_current_time
from app.tools.registry import TOOLS, TOOL_METADATA, TOOL_DESCRIPTIONS

def test_calculator_basic_operations():
    assert calculate("2 + 2") == 4
    assert calculate("25 * 18") == 450
    assert calculate("100 / 4") == 25.0
    assert calculate("50 - 15") == 35
    assert calculate("2 ** 8") == 256
    assert calculate("17 % 5") == 2

def test_calculator_complex_precedence():
    assert calculate("(10 + 5) * 2") == 30
    assert calculate("-5 + 10") == 5

def test_calculator_disallow_unsafe_code():
    with pytest.raises(ValueError):
        calculate("__import__('os').system('ls')")

def test_password_generator():
    pwd = generate_password(16)
    assert len(pwd) == 16
    assert any(c.isupper() for c in pwd) or any(c.islower() for c in pwd)
    assert any(c.isdigit() for c in pwd) or any(c in "!@#$%^&*" for c in pwd)

def test_password_generator_min_length():
    with pytest.raises(ValueError, match="at least 8"):
        generate_password(5)

def test_time_tool():
    res = get_current_time()
    assert isinstance(res, str)
    assert len(res) > 10

def test_registry_consistency():
    for name in TOOLS:
        assert name in TOOL_DESCRIPTIONS
        assert name in TOOL_METADATA
