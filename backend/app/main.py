"""FieldSeal demonstration API. Synthetic outcomes; no operational drug classifier."""

from __future__ import annotations
import base64
import hashlib
import json
import os
import sqlite3
import uuid
from contextlib import contextmanager
from datetime import datetime, timezone, date, timedelta
from pathlib import Path
from typing import Literal
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import ec
from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field, ConfigDict

DATA = Path(os.getenv("FIELDSEAL_DATA", Path(__file__).parent.parent / "data"))
DATA.mkdir(parents=True, exist_ok=True)
DB = DATA / "fieldseal.sqlite"
KEY = DATA / "demo-signing-key.pem"
if not KEY.exists():
    key = ec.generate_private_key(ec.SECP256R1())
    KEY.write_bytes(
        key.private_bytes(
            serialization.Encoding.PEM,
            serialization.PrivateFormat.PKCS8,
            serialization.NoEncryption(),
        )
    )
PRIVATE = serialization.load_pem_private_key(KEY.read_bytes(), password=None)
PUBLIC = (
    PRIVATE.public_key()
    .public_bytes(
        serialization.Encoding.PEM, serialization.PublicFormat.SubjectPublicKeyInfo
    )
    .decode()
)
FINGERPRINT = hashlib.sha256(PUBLIC.encode()).hexdigest()


def now():
    return datetime.now(timezone.utc).isoformat()


def canonical(value):
    return json.dumps(
        value, sort_keys=True, separators=(",", ":"), ensure_ascii=False
    ).encode()


def digest(value):
    return hashlib.sha256(canonical(value)).hexdigest()


def sign(value):
    return base64.b64encode(
        PRIVATE.sign(canonical(value), ec.ECDSA(hashes.SHA256()))
    ).decode()


@contextmanager
def db():
    connection = sqlite3.connect(DB, timeout=15)
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA foreign_keys=ON")
    try:
        yield connection
        connection.commit()
    except Exception:
        connection.rollback()
        raise
    finally:
        connection.close()


with db() as conn:
    conn.executescript(
        """
    CREATE TABLE IF NOT EXISTS records(id TEXT PRIMARY KEY, client_id TEXT UNIQUE NOT NULL, payload TEXT NOT NULL, hash TEXT NOT NULL, signature TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS events(record_id TEXT NOT NULL REFERENCES records(id), sequence INTEGER NOT NULL, payload TEXT NOT NULL, hash TEXT NOT NULL, signature TEXT NOT NULL, PRIMARY KEY(record_id,sequence));
    """
    )

app = FastAPI(
    title="FieldSeal",
    version="0.1.0",
    description="SIH 26231 demo. Local synthetic cases; no operational forensic classification or legal certification.",
)
KITS = [
    {
        "id": "FS-DEMO-24",
        "name": "Field reagent kit A",
        "lot": "DM-2409-A",
        "expires": str(date.today() + timedelta(days=120)),
        "stock": 18,
    },
    {
        "id": "FS-DEMO-25",
        "name": "Field reagent kit B",
        "lot": "DM-2501-B",
        "expires": str(date.today() + timedelta(days=240)),
        "stock": 12,
    },
    {
        "id": "FS-EXPIRED",
        "name": "Expired training kit",
        "lot": "DM-EXPIRED",
        "expires": "2025-01-01",
        "stock": 2,
    },
]
SCENARIOS = {
    "clear": {
        "outcome": "Presumptive indication",
        "reason": "DEMO_REFERENCE_MATCH",
        "quality": "Acceptable",
        "light": 88,
        "alignment": 96,
        "reference": 92,
        "note": "Synthetic colour response matches the demonstration reference. Substance identity is not established.",
    },
    "negative": {
        "outcome": "No indication",
        "reason": "DEMO_NO_RESPONSE",
        "quality": "Acceptable",
        "light": 91,
        "alignment": 94,
        "reference": 93,
        "note": "No reaction in this synthetic example. This does not rule out a substance.",
    },
    "low_light": {
        "outcome": "Inconclusive",
        "reason": "LOW_LIGHT",
        "quality": "Retake required",
        "light": 24,
        "alignment": 91,
        "reference": 40,
        "note": "The demonstration capture is too dark to compare reliably. Retake with even lighting.",
    },
    "missing_card": {
        "outcome": "Inconclusive",
        "reason": "REFERENCE_MISSING",
        "quality": "Retake required",
        "light": 85,
        "alignment": 0,
        "reference": 0,
        "note": "The calibration reference is missing in this demonstration. Include the card in the frame.",
    },
    "uploaded": {
        "outcome": "Inconclusive",
        "reason": "MODEL_NOT_VALIDATED",
        "quality": "Manual review",
        "light": None,
        "alignment": None,
        "reference": None,
        "note": "Photo recorded. Automatic classification is unavailable until a kit-specific model is independently validated.",
    },
}


class Intake(BaseModel):
    model_config = ConfigDict(extra="forbid")
    client_id: str = Field(min_length=8, max_length=80)
    case_ref: str = Field(min_length=3, max_length=80)
    bag_id: str = Field(min_length=3, max_length=80)
    officer: str = Field(min_length=2, max_length=80)
    location: str = Field(min_length=2, max_length=120)
    kit_id: str
    scenario: Literal["clear", "negative", "low_light", "missing_card", "uploaded"]
    notes: str = Field(default="", max_length=2000)
    image: str | None = Field(default=None, max_length=4200000)
    captured_at: datetime


class Custody(BaseModel):
    actor: str = Field(min_length=2, max_length=80)
    recipient: str = Field(min_length=2, max_length=80)
    note: str = Field(min_length=3, max_length=1000)


class Lab(BaseModel):
    actor: str = Field(min_length=2, max_length=80)
    reference: str = Field(min_length=3, max_length=80)
    outcome: Literal["Confirmed", "Not confirmed", "Inconclusive"]
    note: str = Field(min_length=3, max_length=1000)


def add_event(conn, record_id, action, actor, details):
    previous = conn.execute(
        "SELECT sequence,hash FROM events WHERE record_id=? ORDER BY sequence DESC LIMIT 1",
        (record_id,),
    ).fetchone()
    item = {
        "record_id": record_id,
        "sequence": previous["sequence"] + 1 if previous else 1,
        "previous_hash": previous["hash"] if previous else None,
        "action": action,
        "actor": actor,
        "details": details,
        "timestamp": now(),
    }
    conn.execute(
        "INSERT INTO events VALUES(?,?,?,?,?)",
        (record_id, item["sequence"], json.dumps(item), digest(item), sign(item)),
    )


def load_record(conn, record_id):
    row = conn.execute("SELECT * FROM records WHERE id=?", (record_id,)).fetchone()
    if not row:
        raise HTTPException(404, "Record not found")
    record = {
        "id": row["id"],
        "payload": json.loads(row["payload"]),
        "hash": row["hash"],
        "signature": row["signature"],
    }
    record["events"] = [
        {
            "payload": json.loads(e["payload"]),
            "hash": e["hash"],
            "signature": e["signature"],
        }
        for e in conn.execute(
            "SELECT * FROM events WHERE record_id=? ORDER BY sequence", (record_id,)
        )
    ]
    return record


@app.get("/api/health")
def health():
    return {
        "ok": True,
        "mode": "demonstration",
        "signing_fingerprint": FINGERPRINT,
        "classification": "synthetic scenarios only",
    }


@app.get("/api/kits")
def kits():
    return KITS


@app.get("/api/records")
def records():
    with db() as conn:
        items = [
            load_record(conn, r["id"]) for r in conn.execute("SELECT id FROM records")
        ]
        return sorted(
            items,
            key=lambda r: datetime.fromisoformat(
                r["payload"]["intake"]["captured_at"].replace("Z", "+00:00")
            ).timestamp(),
            reverse=True,
        )


@app.get("/api/records/{record_id}")
def record(record_id: str):
    with db() as conn:
        return load_record(conn, record_id)


@app.post("/api/records", status_code=201)
def create_record(data: Intake):
    kit = next((k for k in KITS if k["id"] == data.kit_id), None)
    if not kit:
        raise HTTPException(422, "Select a registered kit")
    if date.fromisoformat(kit["expires"]) < date.today():
        raise HTTPException(
            422, "Kit expired. Select an in-date lot before capturing a reading."
        )
    values = data.model_dump(mode="json")
    for name in ["case_ref", "bag_id", "officer", "location"]:
        values[name] = values[name].strip()
        if len(values[name]) < 2:
            raise HTTPException(422, f"{name} cannot be blank")
    if data.scenario == "uploaded" and not data.image:
        raise HTTPException(422, "Attach the capture before sealing")
    if data.image and data.scenario != "uploaded":
        raise HTTPException(
            422,
            "Uploaded photos require manual review; synthetic outcomes cannot be applied to a photo",
        )
    image_hash = None
    if data.image:
        try:
            prefix, encoded = data.image.split(",", 1)
            if prefix not in {
                "data:image/jpeg;base64",
                "data:image/png;base64",
                "data:image/webp;base64",
            }:
                raise ValueError()
            raw = base64.b64decode(encoded, validate=True)
            if not raw or len(raw) > 3 * 1024 * 1024:
                raise ValueError()
            image_hash = hashlib.sha256(raw).hexdigest()
        except Exception:
            raise HTTPException(422, "Use a JPEG, PNG or WebP image smaller than 3 MB")
    with db() as conn:
        conn.execute("BEGIN IMMEDIATE")
        existing = conn.execute(
            "SELECT id FROM records WHERE client_id=?", (data.client_id,)
        ).fetchone()
        if existing:
            old = load_record(conn, existing["id"])
            if old["payload"]["intake"] != values:
                raise HTTPException(
                    409, "This sync identifier already belongs to different content"
                )
            return old
        record_id = "FS-" + uuid.uuid4().hex[:8].upper()
        payload = {
            "record_id": record_id,
            "intake": values,
            "kit": kit,
            "result": SCENARIOS[data.scenario],
            "image_sha256": image_hash,
            "sealed_at": now(),
            "demo": True,
            "notice": "Presumptive workflow demonstration. Laboratory confirmation required; not a legal certificate.",
        }
        conn.execute(
            "INSERT INTO records VALUES(?,?,?,?,?)",
            (
                record_id,
                data.client_id,
                json.dumps(payload),
                digest(payload),
                sign(payload),
            ),
        )
        add_event(
            conn,
            record_id,
            "Record sealed",
            data.officer,
            {"bag_id": data.bag_id, "record_hash": digest(payload)},
        )
        return load_record(conn, record_id)


@app.post("/api/records/{record_id}/custody")
def custody(record_id: str, data: Custody):
    with db() as conn:
        conn.execute("BEGIN IMMEDIATE")
        load_record(conn, record_id)
        add_event(
            conn,
            record_id,
            "Custody transferred",
            data.actor,
            {"recipient": data.recipient, "note": data.note},
        )
        return load_record(conn, record_id)


@app.post("/api/records/{record_id}/lab")
def laboratory(record_id: str, data: Lab):
    with db() as conn:
        conn.execute("BEGIN IMMEDIATE")
        load_record(conn, record_id)
        if any(
            json.loads(r["payload"])["action"] == "Lab outcome linked"
            for r in conn.execute(
                "SELECT payload FROM events WHERE record_id=?", (record_id,)
            )
        ):
            raise HTTPException(
                409, "A lab outcome is already linked; the original record is immutable"
            )
        add_event(
            conn,
            record_id,
            "Lab outcome linked",
            data.actor,
            {
                "reference": data.reference,
                "outcome": data.outcome,
                "note": data.note,
                "source": "Manually entered demonstration outcome",
            },
        )
        return load_record(conn, record_id)


@app.get("/api/records/{record_id}/bundle")
def bundle(record_id: str):
    body = {
        "format": "fieldseal-bundle-v1",
        "record": record(record_id),
        "exported_at": now(),
        "demo": True,
    }
    return {
        "body": body,
        "signature": sign(body),
        "public_key": PUBLIC,
        "key_fingerprint": FINGERPRINT,
    }


@app.post("/api/verify")
def verify(document: dict):
    errors = []
    trusted = False
    try:
        body = document["body"]
        if len(canonical(document)) > 8 * 1024 * 1024:
            raise ValueError("Bundle exceeds size limit")
        public = document["public_key"]
        key = serialization.load_pem_public_key(public.encode())
        trusted = public == PUBLIC
        key.verify(
            base64.b64decode(document["signature"]),
            canonical(body),
            ec.ECDSA(hashes.SHA256()),
        )
        record = body["record"]
        if digest(record["payload"]) != record["hash"]:
            errors.append("Record hash mismatch")
        key.verify(
            base64.b64decode(record["signature"]),
            canonical(record["payload"]),
            ec.ECDSA(hashes.SHA256()),
        )
        previous = None
        for i, event in enumerate(record["events"], 1):
            p = event["payload"]
            if (
                p["sequence"] != i
                or p["record_id"] != record["id"]
                or p["previous_hash"] != previous
                or digest(p) != event["hash"]
            ):
                errors.append("Custody chain mismatch")
            key.verify(
                base64.b64decode(event["signature"]),
                canonical(p),
                ec.ECDSA(hashes.SHA256()),
            )
            previous = event["hash"]
        if not record["events"]:
            errors.append("Missing sealing event")
        if record["payload"]["record_id"] != record["id"]:
            errors.append("Record identifier mismatch")
    except Exception:
        errors.append(
            "Signature or bundle structure invalid; content may have been altered"
        )
    return {
        "valid": not errors,
        "trusted_key": trusted,
        "errors": errors,
        "notice": "Integrity checks establish consistency with this demonstration key, not real-world authenticity or legal admissibility.",
    }


def seed():
    with db() as conn:
        if conn.execute("SELECT COUNT(*) FROM records").fetchone()[0]:
            return
    for i, (case, scenario, place, officer) in enumerate(
        [
            ("DEMO/2026/0142", "clear", "Delhi field unit", "A. Sharma"),
            ("DEMO/2026/0141", "low_light", "Jaipur field unit", "R. Mehta"),
            ("DEMO/2026/0140", "negative", "Delhi field unit", "A. Sharma"),
            ("DEMO/2026/0139", "clear", "Lucknow field unit", "S. Verma"),
            ("DEMO/2026/0138", "missing_card", "Jaipur field unit", "R. Mehta"),
            ("DEMO/2026/0137", "negative", "Lucknow field unit", "S. Verma"),
        ]
    ):
        r = create_record(
            Intake(
                client_id=f"seed-demo-{i}",
                case_ref=case,
                bag_id=f"BAG-DEMO-{142-i}",
                officer=officer,
                location=place,
                kit_id="FS-DEMO-24",
                scenario=scenario,
                captured_at=datetime.now(timezone.utc) - timedelta(hours=i + 1),
                notes="Synthetic submission example; no actual seizure or individual.",
            )
        )
        if i in [0, 3]:
            custody(
                r["id"],
                Custody(
                    actor=officer,
                    recipient="Demonstration laboratory",
                    note="Evidence bag received for demonstration review.",
                ),
            )
        if i == 3:
            laboratory(
                r["id"],
                Lab(
                    actor="Demo laboratory",
                    reference="LAB-DEMO-083",
                    outcome="Not confirmed",
                    note="Illustrates why a presumptive result requires independent confirmation.",
                ),
            )


seed()

DIST = Path(__file__).parent.parent.parent / "frontend" / "dist"
if DIST.exists():
    from fastapi.staticfiles import StaticFiles

    app.mount("/assets", StaticFiles(directory=DIST / "assets"), name="assets")

    @app.get("/")
    def index():
        return FileResponse(DIST / "index.html")
