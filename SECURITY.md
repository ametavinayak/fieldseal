# Demonstration security boundary

This prototype is for fictional submission examples on a local machine. Do not expose its API to a public interface or store real evidence in it.

- No authentication or role authorization: names in forms are user-entered labels.
- SQLite, browser IndexedDB and the server's private demonstration key are not encrypted at rest.
- ECDSA P-256 signatures and SHA-256 hashes detect changes relative to a signing key. They do not establish capture authenticity, operator identity, trusted capture time, verified location or chemical identity.
- The verifier reports both cryptographic consistency and whether the supplied public key matches this installation. An attacker can create a different self-signed bundle; a valid signature alone is not authority.
- The signed export detects modification, deletion and reordering within that export. A previously valid export can still be replayed; there is no independent transparency log or latest-version registry.
- Uploads are size bounded and limited to JPEG/PNG/WebP data-URL media types. The prototype does not provide malware scanning or a forensic image-authenticity pipeline.
- No automatic laboratory integration exists; lab outcomes are manually entered demonstration events.

Before production: independent scientific validation, authenticated roles, encrypted object storage and database, managed hardware-backed keys, key rotation/revocation, trusted clock/device attestation, audited custody procedures, backup recovery, request limits, secure reverse proxy and a jurisdiction-specific evidentiary review are required. Report prototype issues privately to the repository owner; do not include real evidence in issue reports.
