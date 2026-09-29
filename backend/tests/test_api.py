import os, tempfile, uuid
from datetime import datetime, timezone

os.environ["FIELDSEAL_DATA"] = tempfile.mkdtemp(prefix="fieldseal-test-")
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def intake(**kw):
    d = dict(
        client_id=str(uuid.uuid4()),
        case_ref="DEMO/TEST/01",
        bag_id="BAG-TEST",
        officer="Test officer",
        location="Demo unit",
        kit_id="FS-DEMO-24",
        scenario="clear",
        captured_at=datetime.now(timezone.utc).isoformat(),
    )
    d.update(kw)
    return d


def create(**kw):
    r = client.post("/api/records", json=intake(**kw))
    assert r.status_code == 201, r.text
    return r.json()


def test_expired_and_missing_photo():
    assert (
        client.post("/api/records", json=intake(kit_id="FS-EXPIRED")).status_code == 422
    )
    assert (
        client.post("/api/records", json=intake(scenario="uploaded")).status_code == 422
    )


def test_idempotent_sync_conflicts():
    d = intake()
    a = client.post("/api/records", json=d)
    b = client.post("/api/records", json=d)
    assert a.json()["id"] == b.json()["id"]
    d["bag_id"] = "DIFFERENT"
    assert client.post("/api/records", json=d).status_code == 409


def test_signatures_detect_tampering():
    r = create()
    b = client.get(f"/api/records/{r['id']}/bundle").json()
    assert client.post("/api/verify", json=b).json()["valid"]
    b["body"]["record"]["payload"]["intake"]["officer"] = "Altered"
    assert not client.post("/api/verify", json=b).json()["valid"]


def test_custody_chain_and_truncation():
    r = create()
    url = f"/api/records/{r['id']}"
    v = client.post(
        url + "/custody",
        json=dict(actor="Officer", recipient="Demo lab", note="Sealed handover"),
    ).json()
    assert v["hash"] == r["hash"] and len(v["events"]) == 2
    assert v["events"][1]["payload"]["previous_hash"] == r["events"][0]["hash"]
    b = client.get(url + "/bundle").json()
    assert client.post("/api/verify", json=b).json()["valid"]
    b["body"]["record"]["events"].pop()
    assert not client.post("/api/verify", json=b).json()["valid"]


def test_lab_does_not_replace_original():
    r = create()
    u = f"/api/records/{r['id']}/lab"
    d = dict(
        actor="Lab operator",
        reference="LAB-123",
        outcome="Not confirmed",
        note="Demonstration outcome",
    )
    v = client.post(u, json=d).json()
    assert v["hash"] == r["hash"]
    assert v["events"][-1]["payload"]["details"]["outcome"] == "Not confirmed"
    assert client.post(u, json=d).status_code == 409


def test_malformed_and_missing():
    assert not client.post("/api/verify", json={}).json()["valid"]
    assert client.get("/api/records/missing").status_code == 404


def test_inconclusive():
    r = create(scenario="low_light")
    assert r["payload"]["result"]["reason"] == "LOW_LIGHT"
    assert r["payload"]["demo"]


def test_photo_cannot_receive_synthetic_classification():
    import base64

    image = (
        "data:image/png;base64," + base64.b64encode(b"synthetic fixture bytes").decode()
    )
    assert client.post("/api/records", json=intake(image=image)).status_code == 422
    r = create(scenario="uploaded", image=image)
    assert r["payload"]["result"]["reason"] == "MODEL_NOT_VALIDATED"
    import hashlib

    assert (
        r["payload"]["image_sha256"]
        == hashlib.sha256(b"synthetic fixture bytes").hexdigest()
    )


def test_records_sorted_by_capture_time():
    create(captured_at="2020-01-01T00:00:00Z")
    rows = client.get("/api/records").json()
    times = [
        datetime.fromisoformat(
            r["payload"]["intake"]["captured_at"].replace("Z", "+00:00")
        )
        for r in rows
    ]
    assert times == sorted(times, reverse=True)


def test_valid_foreign_key_is_not_trusted():
    import base64
    from cryptography.hazmat.primitives import hashes, serialization
    from cryptography.hazmat.primitives.asymmetric import ec
    from app.main import canonical

    foreign = ec.generate_private_key(ec.SECP256R1())

    def foreign_sign(value):
        return base64.b64encode(
            foreign.sign(canonical(value), ec.ECDSA(hashes.SHA256()))
        ).decode()

    r = create()
    document = client.get(f"/api/records/{r['id']}/bundle").json()
    record = document["body"]["record"]
    record["signature"] = foreign_sign(record["payload"])
    for event in record["events"]:
        event["signature"] = foreign_sign(event["payload"])
    document["public_key"] = (
        foreign.public_key()
        .public_bytes(
            serialization.Encoding.PEM, serialization.PublicFormat.SubjectPublicKeyInfo
        )
        .decode()
    )
    document["signature"] = foreign_sign(document["body"])
    result = client.post("/api/verify", json=document).json()
    assert result["valid"] is True
    assert result["trusted_key"] is False
