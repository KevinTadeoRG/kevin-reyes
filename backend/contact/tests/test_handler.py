import json
import logging
from types import SimpleNamespace

import pytest

import handler

ORIGIN = "https://kevin-reyes.pages.dev"
SENDER = "remitente@example.com"
VISITOR = {"name": "Ana López", "email": "ana@example.com", "message": "Mensaje privado 12345", "website": ""}


class FakeSes:
    def __init__(self, error: Exception | None = None):
        self.calls: list[dict] = []
        self.error = error

    def send_email(self, **kwargs):
        if self.error:
            raise self.error
        self.calls.append(kwargs)
        return {"MessageId": "fake"}


@pytest.fixture(autouse=True)
def env(monkeypatch):
    monkeypatch.setenv("SENDER_EMAIL", SENDER)
    monkeypatch.setenv("RECIPIENT_EMAIL", SENDER)
    monkeypatch.setenv("ALLOWED_ORIGINS", f"{ORIGIN}, http://localhost:4321")


@pytest.fixture
def ses(monkeypatch):
    fake = FakeSes()
    monkeypatch.setattr(handler, "_ses_client", fake)
    return fake


def event(body=VISITOR, origin=ORIGIN, content_type="application/json"):
    headers = {"Content-Type": content_type}
    if origin is not None:
        headers["Origin"] = origin
    return {"headers": headers, "body": json.dumps(body) if not isinstance(body, str) else body, "isBase64Encoded": False}


CTX = SimpleNamespace(aws_request_id="req-1")


def call(evt):
    res = handler.handler(evt, CTX)
    return res["statusCode"], json.loads(res["body"])


def test_sends_email_with_visitor_in_reply_to(ses):
    assert call(event()) == (200, {"ok": True})
    (sent,) = ses.calls
    assert sent["FromEmailAddress"] == SENDER  # nunca el correo del visitante
    assert sent["ReplyToAddresses"] == ["ana@example.com"]
    assert sent["Destination"] == {"ToAddresses": [SENDER]}
    assert sent["Content"]["Simple"]["Subject"]["Data"] == "[kevin-reyes.pages.dev] Nuevo mensaje de contacto"
    body = sent["Content"]["Simple"]["Body"]["Text"]["Data"]
    assert "Mensaje privado 12345" in body and "Ana López" in body


@pytest.mark.parametrize("origin", [None, "", "https://evil.example", "https://kevin-reyes.pages.dev.evil.example"])
def test_rejects_other_origins(ses, origin):
    assert call(event(origin=origin)) == (403, {"ok": False, "error": "forbidden"})
    assert ses.calls == []


def test_rejects_non_json_content_type(ses):
    assert call(event(content_type="text/plain")) == (415, {"ok": False, "error": "invalid_request"})
    assert ses.calls == []


def test_invalid_input_gets_generic_error(ses):
    status, body = call(event(body={**VISITOR, "email": "no-es-correo"}))
    assert (status, body) == (400, {"ok": False, "error": "invalid_request"})
    assert ses.calls == []


def test_honeypot_looks_successful_but_sends_nothing(ses):
    assert call(event(body={**VISITOR, "website": "http://spam"})) == (200, {"ok": True})
    assert ses.calls == []


def test_ses_failure_returns_generic_error(monkeypatch):
    err = Exception("boom")
    err.response = {"Error": {"Code": "MessageRejected"}}
    monkeypatch.setattr(handler, "_ses_client", FakeSes(error=err))
    assert call(event()) == (500, {"ok": False, "error": "server_error"})


def test_logs_never_contain_personal_data(ses, caplog):
    caplog.set_level(logging.INFO)
    call(event())
    call(event(body={**VISITOR, "email": "malo"}))
    call(event(origin="https://evil.example"))
    logs = "\n".join(r.getMessage() for r in caplog.records)
    for secret in ("Ana", "ana@example.com", "Mensaje privado", "12345"):
        assert secret not in logs
    outcomes = [json.loads(r.getMessage())["outcome"] for r in caplog.records]
    assert outcomes == ["sent", "rejected", "rejected"]


def test_ses_error_detail_goes_to_logs_only(monkeypatch, caplog):
    caplog.set_level(logging.INFO)
    err = Exception("detalle interno")
    err.response = {"Error": {"Code": "MessageRejected"}}
    monkeypatch.setattr(handler, "_ses_client", FakeSes(error=err))
    _, body = call(event())
    assert "MessageRejected" not in json.dumps(body)
    assert "MessageRejected" in caplog.text


def test_missing_config_fails_loudly(monkeypatch, ses):
    monkeypatch.delenv("SENDER_EMAIL")
    with pytest.raises(KeyError):
        handler.handler(event(), CTX)
