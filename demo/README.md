# Run the standalone prototype

1. Download **FieldSeal.html** using GitHub's **Download raw file** button. Download the file, rather than saving the GitHub page.
2. Open the downloaded HTML in current Microsoft Edge or Chrome with JavaScript and browser storage enabled.
3. The phone preview opens. Use **Open full workspace** for the desktop layout.

Everything needed by the UI, including React, styles and fonts, is inside this one file. There are no CDN dependencies, API keys, package installs or application-backend requirements.

Try **Capture → Fill example details → Continue to capture → Review reading → Continue to record → acknowledge → Seal record**. The new record is saved in browser storage. In **Verify**, check a record, then select the tamper demonstration and verify again: the altered copy fails. Custody handovers, manual lab outcomes, filters, uploaded-photo manual review and JSON export are also available.

## Storage and demo scope

This version creates its own fictional examples and a browser-local ECDSA P-256 demo key. Nothing from the developer's database or private keys is included. Records and drafts are stored in IndexedDB. Clearing browser data deletes them; moving the HTML or changing browser profiles may use a different storage area. Use one tab at a time. Export bundles to preserve copies, but never use real evidence or personal data here.

The UI is shared with the full project. Its local adapter replaces FastAPI/SQLite only in this standalone build. No network synchronization, production authentication or operational drug classification is provided. All synthetic readings are illustrative; uploaded photos require manual review. Browser bundles use `fieldseal-browser-demo-v1` and are separate from Python backend bundles. A demo signature detects alteration; it does not establish authenticity or chemical identity.

## If your browser restricts local HTML storage

Serve this directory using any static file server. For example, with Python installed:

```text
python -m http.server 8080 --bind 127.0.0.1
```

Then open `http://127.0.0.1:8080/FieldSeal.html`. This serves the file only; it does not run the application's Python backend.

Validation: the standalone HTML was exercised in Edge through a static-only server, including creation, persistence and signature verification. Automated checks cover tampering, expiry, retries, custody and lab updates. Direct `file://` launch could not be tested by the browser automation tool because it blocks that protocol; it is not claimed as a tested device/browser configuration.

## Rebuild from source

```text
cd frontend
npm ci
npm run test:standalone
npm run build:standalone
```

The reproducible build script writes `demo/FieldSeal.html`. To run the full FastAPI/SQLite version instead, follow the repository's main README.
