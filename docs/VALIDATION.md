# Validation — 29 September 2026

## Automated checks

- **10 backend integration tests passed** with Python 3.10 and an isolated temporary SQLite database. Coverage: expired kit and missing photo rejection; retry idempotency and content conflict; record tampering; signed custody links and export truncation; independent lab outcome without overwriting the field reading; malformed bundles and missing IDs; inconclusive scenario; preventing a synthetic prediction on an uploaded photo; capture-time ordering; valid foreign-key bundle remaining untrusted.
- **TypeScript and Vite production build passed.** No frontend unit-test suite is claimed.
- The built frontend and API were served from the same local Uvicorn address, `http://127.0.0.1:8778/`, and the persisted records loaded successfully after restart.

## Browser checks

Tested through Microsoft Edge UI on this machine:

- Dashboard to intake, sample capture, low-light review, acknowledgement and seal.
- New persisted record opened with an inconclusive reason and record hash.
- Custody form appended a handover without changing the original record.
- Signed original bundle passed; bag-ID modification in a copy failed; original subsequently still passed.
- Offline demonstration queue survived a page reload, then synchronized into one server record.
- Desktop dashboard, capture and evidence layout inspected. Mobile dashboard, capture controls and evidence metadata inspected at effective 390 CSS-pixel width (browser retained its inherited zoom). No horizontal document overflow in the checked mobile capture/evidence states; tables scroll inside their own containers.
- Screen and capture-step navigation now reset position and focus a heading. Record section controls use ordinary pressed buttons.

## Mobile UI update

- TypeScript checking and the Vite production build passed again after adding the dedicated mobile navigation and evidence list components. Backend code was unchanged; the integration-test result above belongs to the original prototype validation.
- In Edge at effective 390 CSS pixels: home, capture intake, sample capture, low-light inconclusive review, records search and filtering, evidence detail, and the More drawer to Kit register were exercised. The mobile verification screen accepted an intact signed demo record and rejected a modified copy.
- A narrow 320 CSS-pixel verification layout had no horizontal document overflow. The inspected 390px home and evidence states also stayed within the viewport. This is browser viewport testing, not physical-device certification.
- The desktop overview was checked after clearing the viewport override. Its rail, evidence table and capture entry remained available.
- Three screen-only mobile screenshots are committed in `docs/screenshots` and embedded in the README: sample capture, low-light review (`LOW_LIGHT` / Inconclusive), and a successful backend check of an existing signed demo record. These states were exercised through the live UI. Captures use a 390 × 844 phone-style presentation with illustrative system bars, without a hardware frame; they are browser captures rather than physical-device screenshots. The updated TypeScript/Vite build passed. This release remains a responsive browser application; no native Android package was built.

## Scope of the evidence

Synthetic scenarios validate workflow behavior, not analytical accuracy. No independently labelled chemical dataset, model benchmark, real kit experiment, laboratory integration or operational field trial has been performed. Camera permissions and physical phone-camera capture were not tested. The API upload path was checked with fixtures; no malware scanning or image-authenticity claim is made.

Manual interface review resolved the evidence-detail hierarchy, screen/step scroll and focus behavior, and record-section button semantics. This is a scoped review of the prototype, not an accessibility certification or a claim of pixel-exact visual fidelity.

The optional GitHub Actions template in `docs/ci/checks.yml` runs backend tests and the frontend build. It is not activated in this initial publication because the publishing login lacks workflow scope; no remote CI run is claimed. The Windows launcher is supplied and syntax checked; the prototype was started with its documented equivalent commands. Public hosting of the application, authentication, encrypted storage and PostgreSQL migration remain future work.
