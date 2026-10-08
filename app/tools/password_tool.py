import secrets
import string

def generate_password(length: int = 16) -> str:
    if length < 8:
        raise ValueError("Password length must be at least 8.")

    alphabet = string.ascii_letters + string.digits + "!@#$%^&*"
    return "".join(secrets.choice(alphabet) for _ in range(length))
