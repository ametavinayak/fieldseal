# Submission scope

Source: Drug Testing.pdf, supplied by the user. SIH 2026 problem 26231, Digital Companion for Field Drug Testing. Team BarelyLegal, ID 156945.

## Working prototype workflows
- Officer intake: case reference, evidence bag, operator, kit lot and expiry.
- Guided capture: real camera/file input and clearly labelled synthetic capture samples.
- Calibration and capture quality review. Synthetic scenarios demonstrate acceptable, low-light and missing-card outcomes.
- Inconclusive path with explicit reason; no unvalidated substance classification on arbitrary uploads.
- Seal a persistent record, SHA-256 payload digest, append-only chained custody events, downloadable evidence bundle.
- Verify uploaded record integrity; display altered and intact outcomes.
- Search/filter records; link independent lab reference and manually entered confirmation outcome.
- Queue records offline and explicitly synchronize when connected.
- Explain implemented features versus production integrations.

## Claims that must not be copied as facts
The slides describe court-admissibility, hardware attestation, calibration equivalence across devices, 5,000 labelled validation images, 80% savings and pricing. No supporting implementation or dataset is supplied. Do not claim these as achieved. SHA-256 alone does not establish evidence authenticity or admissibility. The source references page includes unrelated SatQuery papers; exclude those from this project.

## Production scope
Native Android hardware-backed signing, device integrity, GPS anti-spoofing, trusted timestamps, validated kit-specific calibration/ML, encryption key management, authorized multi-user deployment, retention policy and agency integrations require separate implementation and validation. Demo outputs are not operational forensic results.
