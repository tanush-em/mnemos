import secrets


def new_id(prefix: str = "mem") -> str:
    return f"{prefix}_{secrets.token_hex(6)}"
