import re


def normalize_phone(phone: str) -> str:
    """Normalize phone numbers to digits-only for consistent comparison."""
    if phone is None:
        return ""

    digits = re.sub(r"\D", "", phone.strip())

    # Strip common India country code when present (+91 / 91 prefix).
    if len(digits) == 12 and digits.startswith("91"):
        digits = digits[2:]
    elif len(digits) == 11 and digits.startswith("0"):
        digits = digits[1:]

    return digits


def phones_match(stored_phone: str, provided_phone: str) -> bool:
    """Compare phone numbers after normalization."""
    stored = normalize_phone(stored_phone)
    provided = normalize_phone(provided_phone)

    if not stored or not provided:
        return False

    return stored == provided
