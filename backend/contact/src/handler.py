"""Lambda del formulario de contacto.

Flujo: API Gateway (HTTP API, payload 2.0) → origen permitido → validación → Amazon SES.

- Al cliente solo se le responden errores genéricos ("forbidden", "invalid_request", "server_error").
- En CloudWatch se registra el motivo, pero nunca el contenido del mensaje ni datos personales
  (nombre, correo): solo longitudes, el resultado y el id de la petición.
- El visitante va en `Reply-To`; el remitente (`From`) siempre es la identidad verificada en SES.
"""

from __future__ import annotations

import json
import logging
import os
from dataclasses import dataclass
from typing import Any
from urllib.parse import urlsplit

from validation import ContactMessage, ValidationError, decode_body, validate_payload

logger = logging.getLogger()
logger.setLevel(logging.INFO)


@dataclass(frozen=True, slots=True)
class Config:
    sender: str
    recipient: str
    allowed_origins: frozenset[str]

    @classmethod
    def from_env(cls) -> Config:
        """Configuración desde variables de entorno (las define la infraestructura, no el código)."""
        sender = os.environ["SENDER_EMAIL"]
        recipient = os.environ["RECIPIENT_EMAIL"]
        origins = frozenset(o.strip() for o in os.environ["ALLOWED_ORIGINS"].split(",") if o.strip())
        if not origins:
            raise RuntimeError("ALLOWED_ORIGINS está vacío")
        return cls(sender=sender, recipient=recipient, allowed_origins=origins)


_ses_client: Any = None


def _ses() -> Any:
    """Cliente de SES v2, creado una vez por contenedor (se reutiliza entre invocaciones)."""
    global _ses_client
    if _ses_client is None:
        import boto3  # incluido en el runtime de Lambda

        _ses_client = boto3.client("sesv2")
    return _ses_client


def _response(status: int, body: dict[str, object]) -> dict[str, object]:
    return {
        "statusCode": status,
        "headers": {"Content-Type": "application/json", "Cache-Control": "no-store"},
        "body": json.dumps(body),
    }


def _log(outcome: str, request_id: str, **fields: object) -> None:
    logger.info(json.dumps({"event": "contact", "outcome": outcome, "request_id": request_id, **fields}))


def _send(message: ContactMessage, config: Config, origin: str, request_id: str) -> None:
    site = urlsplit(origin).hostname or "sitio"
    body = (
        f"Nombre: {message.name}\n"
        f"Correo: {message.email}\n"
        "\n"
        f"{message.message}\n"
        "\n"
        "--\n"
        f"Enviado desde el formulario de {origin} · id {request_id}\n"
    )
    _ses().send_email(
        FromEmailAddress=config.sender,
        Destination={"ToAddresses": [config.recipient]},
        ReplyToAddresses=[message.email],
        Content={
            "Simple": {
                "Subject": {"Data": f"[{site}] Nuevo mensaje de contacto", "Charset": "UTF-8"},
                "Body": {"Text": {"Data": body, "Charset": "UTF-8"}},
            }
        },
    )


def handler(event: dict[str, Any], context: Any) -> dict[str, object]:
    request_id = getattr(context, "aws_request_id", "local")
    config = Config.from_env()
    headers = {k.lower(): v for k, v in (event.get("headers") or {}).items()}

    origin = headers.get("origin", "")
    if origin not in config.allowed_origins:
        _log("rejected", request_id, reason="origin")
        return _response(403, {"ok": False, "error": "forbidden"})

    content_type = headers.get("content-type", "").split(";", 1)[0].strip().lower()
    if content_type != "application/json":
        _log("rejected", request_id, reason="content_type")
        return _response(415, {"ok": False, "error": "invalid_request"})

    try:
        data = decode_body(event.get("body"), bool(event.get("isBase64Encoded")))
        message = validate_payload(data)
    except ValidationError as exc:
        _log("rejected", request_id, reason=exc.code)
        return _response(400, {"ok": False, "error": "invalid_request"})

    if message is None:
        # Honeypot lleno: se responde igual que a una persona para no darle pistas al bot.
        _log("rejected", request_id, reason="honeypot")
        return _response(200, {"ok": True})

    try:
        _send(message, config, origin, request_id)
    except Exception as exc:  # cualquier fallo de SES: detalle a logs, mensaje genérico al cliente
        error_code = getattr(exc, "response", {}).get("Error", {}).get("Code", "")
        _log("error", request_id, reason=type(exc).__name__, aws_error=error_code)
        return _response(500, {"ok": False, "error": "server_error"})

    _log("sent", request_id, name_len=len(message.name), message_len=len(message.message))
    return _response(200, {"ok": True})
