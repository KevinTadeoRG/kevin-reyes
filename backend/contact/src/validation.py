"""Validación del formulario de contacto.

Todo lo que llega del cliente se trata como no confiable: tipos, longitudes, caracteres y
formato del correo se revisan aquí aunque el formulario también los revise en el navegador.
Los códigos de error son internos (van a CloudWatch); al cliente solo se le dice "invalid_request".
"""

from __future__ import annotations

import base64
import binascii
import json
import re
import unicodedata
from dataclasses import dataclass

MAX_BODY_BYTES = 10_000
MAX_NAME = 100
MAX_EMAIL = 254
MAX_EMAIL_LOCAL = 64
MAX_MESSAGE = 5_000

HONEYPOT_FIELD = "website"
ALLOWED_FIELDS = frozenset({"name", "email", "message", HONEYPOT_FIELD})

# Correo ASCII razonable: parte local con los caracteres permitidos y dominio con etiquetas válidas.
_EMAIL_RE = re.compile(
    r"[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+"
    r"@(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+[A-Za-z]{2,63}"
)

# Controles bidireccionales (permiten disfrazar texto) y separadores de línea/párrafo Unicode.
_FORBIDDEN_CHARS = frozenset(
    {chr(c) for c in range(0x202A, 0x202F)}
    | {chr(c) for c in range(0x2066, 0x206A)}
    | {" ", " "}
)


class ValidationError(ValueError):
    """Entrada rechazada. `code` explica el motivo (solo para logs)."""

    def __init__(self, code: str) -> None:
        super().__init__(code)
        self.code = code


@dataclass(frozen=True, slots=True)
class ContactMessage:
    name: str
    email: str
    message: str


def decode_body(body: str | None, is_base64: bool) -> dict[str, object]:
    """Cuerpo de la petición (HTTP API payload 2.0) → objeto JSON, con límite de tamaño."""
    if not body:
        raise ValidationError("empty_body")
    # Corte barato antes de decodificar: base64 ocupa ~4/3 del tamaño original.
    if len(body) > MAX_BODY_BYTES * 2:
        raise ValidationError("body_too_large")
    if is_base64:
        try:
            raw = base64.b64decode(body, validate=True)
        except (binascii.Error, ValueError):
            raise ValidationError("bad_encoding") from None
    else:
        raw = body.encode("utf-8")
    if len(raw) > MAX_BODY_BYTES:
        raise ValidationError("body_too_large")
    try:
        data = json.loads(raw.decode("utf-8"))
    except (UnicodeDecodeError, json.JSONDecodeError):
        raise ValidationError("bad_json") from None
    if not isinstance(data, dict):
        raise ValidationError("bad_json")
    return data


def _is_forbidden(ch: str) -> bool:
    return unicodedata.category(ch) == "Cc" or ch in _FORBIDDEN_CHARS


def _clean_text(value: object, field: str, max_len: int, *, multiline: bool) -> str:
    if value is None:
        raise ValidationError(f"{field}_required")
    if not isinstance(value, str):
        raise ValidationError(f"{field}_type")
    text = unicodedata.normalize("NFC", value)
    if multiline:
        text = text.replace("\r\n", "\n").replace("\r", "\n")
    text = text.strip()
    if not text:
        raise ValidationError(f"{field}_required")
    if len(text) > max_len:
        raise ValidationError(f"{field}_too_long")
    allowed = {"\n", "\t"} if multiline else set()
    if any(_is_forbidden(ch) and ch not in allowed for ch in text):
        raise ValidationError(f"{field}_invalid_chars")
    return text


def validate_payload(data: dict[str, object]) -> ContactMessage | None:
    """Valida el formulario. Devuelve `None` si cayó en el honeypot (es un bot)."""
    if set(data) - ALLOWED_FIELDS:
        raise ValidationError("unknown_field")

    honeypot = data.get(HONEYPOT_FIELD, "")
    if not isinstance(honeypot, str):
        raise ValidationError("website_type")
    if honeypot.strip():
        return None

    name = _clean_text(data.get("name"), "name", MAX_NAME, multiline=False)
    email = _clean_text(data.get("email"), "email", MAX_EMAIL, multiline=False)
    local_part = email.split("@", 1)[0]
    if not _EMAIL_RE.fullmatch(email) or len(local_part) > MAX_EMAIL_LOCAL:
        raise ValidationError("email_invalid")
    message = _clean_text(data.get("message"), "message", MAX_MESSAGE, multiline=True)
    return ContactMessage(name=name, email=email, message=message)
