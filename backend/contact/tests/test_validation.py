import base64
import json

import pytest

from validation import (
    MAX_BODY_BYTES,
    MAX_MESSAGE,
    MAX_NAME,
    ContactMessage,
    ValidationError,
    decode_body,
    validate_payload,
)

VALID = {"name": "Ana López", "email": "ana@example.com", "message": "Hola, me interesa tu perfil.", "website": ""}


def code_of(data):
    with pytest.raises(ValidationError) as exc:
        validate_payload(data)
    return exc.value.code


# ---------- decode_body ----------


def test_json_body():
    assert decode_body(json.dumps(VALID), False) == VALID


def test_base64_body():
    raw = base64.b64encode(json.dumps(VALID).encode()).decode()
    assert decode_body(raw, True) == VALID


@pytest.mark.parametrize(
    ("body", "is_b64", "code"),
    [
        (None, False, "empty_body"),
        ("", False, "empty_body"),
        ("no es json", False, "bad_json"),
        ("[1, 2]", False, "bad_json"),
        ('"texto"', False, "bad_json"),
        ("%%%no-base64%%%", True, "bad_encoding"),
    ],
)
def test_bad_bodies(body, is_b64, code):
    with pytest.raises(ValidationError) as exc:
        decode_body(body, is_b64)
    assert exc.value.code == code


def test_body_too_large():
    big = json.dumps({**VALID, "message": "x" * MAX_BODY_BYTES})
    with pytest.raises(ValidationError) as exc:
        decode_body(big, False)
    assert exc.value.code == "body_too_large"


# ---------- validate_payload ----------


def test_valid_message_is_normalized():
    result = validate_payload({**VALID, "name": "  Ana López  ", "message": "línea 1\r\nlínea 2\r"})
    assert result == ContactMessage(name="Ana López", email="ana@example.com", message="línea 1\nlínea 2")


def test_honeypot_returns_none():
    assert validate_payload({**VALID, "website": "https://spam.example"}) is None


def test_honeypot_missing_is_ok():
    data = {k: v for k, v in VALID.items() if k != "website"}
    assert validate_payload(data) is not None


@pytest.mark.parametrize("field", ["name", "email", "message"])
def test_required_fields(field):
    assert code_of({**VALID, field: "   "}) == f"{field}_required"
    missing = {k: v for k, v in VALID.items() if k != field}
    assert code_of(missing) == f"{field}_required"


@pytest.mark.parametrize("field", ["name", "email", "message", "website"])
def test_wrong_types(field):
    assert code_of({**VALID, field: 123}) == f"{field}_type"


def test_unknown_field_is_rejected():
    assert code_of({**VALID, "admin": True}) == "unknown_field"


def test_max_lengths():
    assert validate_payload({**VALID, "name": "a" * MAX_NAME}) is not None
    assert code_of({**VALID, "name": "a" * (MAX_NAME + 1)}) == "name_too_long"
    assert validate_payload({**VALID, "message": "m" * MAX_MESSAGE}) is not None
    assert code_of({**VALID, "message": "m" * (MAX_MESSAGE + 1)}) == "message_too_long"


@pytest.mark.parametrize(
    "email",
    ["sin-arroba", "a@b", "a@b.c", "a b@example.com", "a@-example.com", "a@example..com", f"{'x' * 65}@example.com"],
)
def test_invalid_emails(email):
    assert code_of({**VALID, "email": email}) == "email_invalid"


@pytest.mark.parametrize("email", ["ana@example.com", "ana.lopez+cv@sub.example.mx", "o'brien@example.co.uk"])
def test_valid_emails(email):
    assert validate_payload({**VALID, "email": email}).email == email


@pytest.mark.parametrize(
    ("field", "value"),
    [
        # Inyección de encabezados: un salto de línea en el correo o el nombre podría agregar "Bcc:".
        ("email", "ana@example.com\r\nBcc: victima@example.com"),
        ("email", "ana@example.com\nBcc: victima@example.com"),
        ("name", "Ana\r\nBcc: victima@example.com"),
        ("name", "Ana\x00"),
        ("name", "Ana ‮moc.live"),  # override bidireccional (disfraza texto)
        ("message", "hola\x07"),
        ("message", "hola mundo"),
    ],
)
def test_forbidden_characters(field, value):
    assert code_of({**VALID, field: value}) in {f"{field}_invalid_chars", "email_invalid"}


def test_message_keeps_newlines_tabs_and_emoji():
    text = "Hola\n\tcon tabulador 👩‍💻 y acentos: ñ, é"
    assert validate_payload({**VALID, "message": text}).message == text
