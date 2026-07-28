import bcrypt


def hash_password(password: str) -> str:
    hashed = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt(rounds=12))
    return hashed.decode("utf-8")


def is_valid_bcrypt_hash(hashed_password: str) -> bool:
    """Return True when the stored value looks like a bcrypt hash."""
    if not hashed_password or not isinstance(hashed_password, str):
        return False

    return hashed_password.startswith("$2") and len(hashed_password) >= 59


def verify_password(plain_password: str, hashed_password: str) -> bool:
    if not is_valid_bcrypt_hash(hashed_password):
        return False

    try:
        return bcrypt.checkpw(
            plain_password.encode("utf-8"),
            hashed_password.encode("utf-8"),
        )
    except Exception:
        return False
