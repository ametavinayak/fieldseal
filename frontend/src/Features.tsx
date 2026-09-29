import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  Check,
  Download,
  FileCheck2,
  FlaskConical,
  LockKeyhole,
  Save,
  Search,
  ShieldAlert,
  ShieldCheck,
  Upload,
  WifiOff,
} from "lucide-react";
import { api, download } from "./api";
import { read, write } from "./storage";
import { SampleCard } from "./SampleCard";
import { Badge, when, lab } from "./App";
import type { Evidence, Intake, Kit, Scenario, Verification } from "./types";
const outcomes: Record<Scenario, [string, string, string]> = {
  clear: [
    "Presumptive indication",
    "DEMO_REFERENCE_MATCH",
    "Synthetic colour response matches the demonstration reference. Substance identity is not established.",
  ],
  negative: [
    "No indication",
    "DEMO_NO_RESPONSE",
    "No reaction in this synthetic example. This does not rule out a substance.",
  ],
  low_light: [
    "Inconclusive",
    "LOW_LIGHT",
    "The demonstration capture is too dark to compare reliably. Retake with even lighting.",
  ],
  missing_card: [
    "Inconclusive",
    "REFERENCE_MISSING",
    "The calibration reference is missing. Include the card in the frame.",
  ],
  uploaded: [
    "Inconclusive",
    "MODEL_NOT_VALIDATED",
    "Photo recorded. Automatic classification is unavailable until a kit-specific model is independently validated.",
  ],
};
const fresh = (): Intake => ({
  client_id: crypto.randomUUID(),
  case_ref: "",
  bag_id: "",
  officer: "A. Sharma",
  location: "Delhi field unit",
  kit_id: "FS-DEMO-24",
  scenario: "clear",
  notes: "",
  image: null,
  captured_at: new Date().toISOString(),
});
export function Capture({
  kits,
  online,
  onSaved,
  onQueued,
}: {
  kits: Kit[];
  online: boolean;
  onSaved: (r: Evidence) => void;
  onQueued: (d: Intake) => Promise<void>;
}) {
  const [data, setData] = useState<Intake>(fresh),
    [step, setStep] = useState(0),
    [ready, setReady] = useState(false),
    [error, setError] = useState(""),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false),
    [offline, setOffline] = useState(false),
    [ack, setAck] = useState(false);
  useEffect(() => {
    window.scrollTo(0, 0);
    const heading = document.querySelector<HTMLElement>(".flow-grid h2");
    if (heading) {
      heading.tabIndex = -1;
      heading.focus({ preventScroll: true });
    }
  }, [step]);
  useEffect(() => {
    read<Intake | null>("draft", null).then((d) => {
      if (d) setData(d);
      setReady(true);
    });
  }, []);
  useEffect(() => {
    if (ready)
      write("draft", data).catch(() =>
        setError("Draft storage unavailable. Keep this page open."),
      );
  }, [data, ready]);
  const result = outcomes[data.scenario],
    kit = kits.find((k) => k.id === data.kit_id),
    expired = !!kit && kit.expires < new Date().toISOString().slice(0, 10);
  function update(key: keyof Intake, value: string) {
    setData((d) => ({ ...d, [key]: value }));
    setError("");
  }
  function next() {
    setError("");
    if (step === 0) {
      if (
        !data.case_ref.trim() ||
        !data.bag_id.trim() ||
        !data.officer.trim() ||
        !data.location.trim()
      ) {
        setError("Enter the case reference, bag ID, operator and field unit.");
        return;
      }
      if (!kit || expired) {
        setError(
          expired
            ? "This lot is expired. Choose an in-date kit."
            : "Select a registered kit.",
        );
        return;
      }
    }
    if (step === 1 && data.scenario === "uploaded" && !data.image) {
      setError("Upload a capture first.");
      return;
    }
    setStep(step + 1);
  }
  function upload(file?: File) {
    if (!file) return;
    if (
      !["image/png", "image/jpeg", "image/webp"].includes(file.type) ||
      file.size > 3 * 1024 * 1024
    ) {
      setError("Choose a PNG, JPEG or WebP smaller than 3 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => setError("Could not read this photo.");
    reader.onload = () => {
      setData((d) => ({
        ...d,
        scenario: "uploaded",
        image: String(reader.result),
        captured_at: new Date().toISOString(),
      }));
      setError("");
    };
    reader.readAsDataURL(file);
  }
  async function seal() {
    setBusy(true);
    setError("");
    try {
      if (!online || offline) {
        await onQueued(data);
        await write("draft", null);
        setMessage(
          "Saved to the offline queue. It will be signed and sealed when you synchronize.",
        );
        setData(fresh());
        setStep(0);
        setAck(false);
      } else {
        const r = await api<Evidence>("/records", "POST", data);
        await write("draft", null);
        onSaved(r);
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <div className="page-head">
        <div>
          <h1>New field test</h1>
          <p>Record the observation. Preserve the context.</p>
        </div>
        <button
          className="secondary"
          onClick={async () => {
            await write("draft", data);
            setMessage("Draft saved on this browser.");
          }}
        >
          <Save size={17} /> Save draft
        </button>
      </div>
      {message && (
        <div role="status" className="notice">
          {message}
        </div>
      )}
      <ol className="stepper">
        {["Case details", "Capture", "Review", "Seal"].map((s, i) => (
          <li
            key={s}
            className={i === step ? "current" : i < step ? "done" : ""}
          >
            <button
              disabled={i > step}
              onClick={() => setStep(i)}
              aria-current={i === step ? "step" : undefined}
            >
              <span>{i < step ? <Check size={17} /> : i + 1}</span>
              {s}
            </button>
          </li>
        ))}
      </ol>
      {error && (
        <div role="alert" className="alert danger">
          {error}
        </div>
      )}
      {step === 0 && (
        <div className="flow-grid">
          <section className="panel padded">
            <h2>Case and kit details</h2>
            <p className="section-copy">
              Use fictional case references for this submission workspace.
            </p>
            <div className="form-grid">
              <Field
                label="Case reference"
                value={data.case_ref}
                placeholder="DEMO/2026/0143"
                onChange={(v) => update("case_ref", v)}
              />
              <Field
                label="Evidence bag ID"
                value={data.bag_id}
                placeholder="BAG-DEMO-143"
                onChange={(v) => update("bag_id", v)}
              />
              <Field
                label="Recording officer"
                value={data.officer}
                onChange={(v) => update("officer", v)}
              />
              <Field
                label="Field unit / location label"
                value={data.location}
                onChange={(v) => update("location", v)}
              />
              <label className="wide">
                Kit lot
                <select
                  value={data.kit_id}
                  onChange={(e) => update("kit_id", e.target.value)}
                >
                  {kits.map((k) => (
                    <option value={k.id} key={k.id}>
                      {k.name} · {k.lot}
                    </option>
                  ))}
                </select>
              </label>
              {kit && (
                <div className={"kit-check wide " + (expired ? "bad" : "")}>
                  <FileCheck2 size={23} />
                  <span>
                    <strong>
                      {expired
                        ? "Expired lot — cannot proceed"
                        : "Lot is in date"}
                    </strong>
                    <small>
                      Expiry {kit.expires} · {kit.lot}
                    </small>
                  </span>
                </div>
              )}
              <label className="wide">
                Field notes (optional)
                <textarea
                  rows={3}
                  value={data.notes}
                  maxLength={2000}
                  onChange={(e) => update("notes", e.target.value)}
                  placeholder="Capture context; do not enter personal details."
                />
              </label>
            </div>
            <div className="actions">
              <button
                className="link"
                onClick={() =>
                  setData((d) => ({
                    ...d,
                    case_ref: "DEMO/2026/" + Date.now().toString().slice(-5),
                    bag_id: "BAG-DEMO-" + Date.now().toString().slice(-5),
                  }))
                }
              >
                Fill example details
              </button>
              <button className="primary" onClick={next}>
                Continue to capture <ArrowRight size={18} />
              </button>
            </div>
          </section>
          <aside className="guidance">
            <FileCheck2 size={28} />
            <h2>One record, one trail</h2>
            <p>
              The case reference and bag ID stay with the capture, custody
              transfers and laboratory outcome.
            </p>
            <hr />
            <h3>Before you start</h3>
            <ul>
              <li>Confirm the kit lot and expiry.</li>
              <li>Keep the reference card visible.</li>
              <li>Follow the kit’s approved instructions.</li>
            </ul>
            <div className="alert">
              A location label is not verified GPS. This prototype does not
              attest a device or operator identity.
            </div>
          </aside>
        </div>
      )}
      {step === 1 && (
        <div className="flow-grid">
          <section className="panel padded">
            <div className="section-title">
              <div>
                <h2>{data.image ? "Uploaded capture" : "Sample capture"}</h2>
                <p>Keep the reference card and test well in clear view.</p>
              </div>
              <Badge
                value={data.image ? "Manual review" : "Synthetic sample"}
              />
            </div>
            {data.image ? (
              <img
                className="capture-photo"
                src={data.image}
                alt="Uploaded field capture awaiting manual review"
              />
            ) : (
              <SampleCard scenario={data.scenario} />
            )}
            <div className="capture-tools">
              <label className="secondary file-button">
                <Upload size={17} /> Upload photo
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={(e) => upload(e.target.files?.[0])}
                />
              </label>
              <label className="secondary file-button">
                <Camera size={17} /> Camera
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={(e) => upload(e.target.files?.[0])}
                />
              </label>
              <button
                className="secondary"
                onClick={() =>
                  setData((d) => ({ ...d, scenario: "clear", image: null }))
                }
              >
                Use sample
              </button>
            </div>
            <div className="alert subtle">
              Avoid glare and harsh shadows. Uploaded photos are stored for
              review; no unvalidated substance prediction is generated.
            </div>
          </section>
          <section className="panel padded">
            <h2>Capture checks</h2>
            <p className="section-copy">
              {data.image
                ? "Automatic checks are not validated for uploads."
                : "Illustrative states from the selected scenario."}
            </p>
            {["Reference card", "Lighting", "Alignment"].map((label, i) => {
              const bad =
                (data.scenario === "low_light" && i === 1) ||
                (data.scenario === "missing_card" && i !== 1);
              return (
                <div className="quality" key={label}>
                  <span className="quality-icon">
                    <FileCheck2 size={21} />
                  </span>
                  <div>
                    <strong>{label}</strong>
                    <small>
                      {data.image
                        ? "Manual review needed"
                        : bad
                          ? "Retake required"
                          : "Ready · illustrative"}
                    </small>
                  </div>
                  <span className={bad ? "quality-warn" : "quality-pass"}>
                    {data.image ? "—" : bad ? "Check" : <Check size={20} />}
                  </span>
                </div>
              );
            })}
            <label className="scenario">
              Demo scenario
              <select
                value={data.scenario}
                onChange={(e) =>
                  setData((d) => ({
                    ...d,
                    scenario: e.target.value as Scenario,
                    image: e.target.value === "uploaded" ? d.image : null,
                  }))
                }
              >
                <option value="clear">Clear reference response</option>
                <option value="negative">No response</option>
                <option value="low_light">Low light — inconclusive</option>
                <option value="missing_card">
                  Missing reference — inconclusive
                </option>
                {data.image && (
                  <option value="uploaded">Uploaded photograph</option>
                )}
              </select>
            </label>
            <div className="alert">
              Synthetic outcomes demonstrate the workflow. They are not evidence
              of classification accuracy.
            </div>
            <div className="actions">
              <button className="secondary" onClick={() => setStep(0)}>
                Back
              </button>
              <button className="primary" onClick={next}>
                Review reading <ArrowRight size={17} />
              </button>
            </div>
          </section>
        </div>
      )}
      {step === 2 && (
        <div className="flow-grid">
          <section className="panel padded">
            <div className="result-icon">
              {result[0] === "Inconclusive" ? (
                <ShieldAlert />
              ) : (
                <FlaskConical />
              )}
            </div>
            <h2 className="result-title">{result[0]}</h2>
            <p className="result-copy">{result[2]}</p>
            <div className="reason">
              <span>Reason code</span>
              <code>{result[1]}</code>
            </div>
            {data.image ? (
              <img
                className="capture-photo"
                src={data.image}
                alt="Capture for review"
              />
            ) : (
              <SampleCard scenario={data.scenario} />
            )}
            <div className="actions">
              <button className="secondary" onClick={() => setStep(1)}>
                <ArrowLeft size={16} /> Retake / change capture
              </button>
              <button className="primary" onClick={next}>
                Continue to record <ArrowRight size={17} />
              </button>
            </div>
          </section>
          <aside className="guidance">
            <h2>What this means</h2>
            <p>
              The reading is a field observation. It does not establish
              identity, purity or quantity of a substance.
            </p>
            <hr />
            <h3>Next step</h3>
            <p>
              {result[0] === "Inconclusive"
                ? "Retake if possible, or preserve the inconclusive record and refer it for review."
                : "Preserve the observation and arrange independent laboratory confirmation."}
            </p>
            <div className="alert">
              Do not use this demonstration to make operational, medical or
              legal decisions.
            </div>
          </aside>
        </div>
      )}
      {step === 3 && (
        <div className="flow-grid">
          <section className="panel padded">
            <h2>Seal the field record</h2>
            <p className="section-copy">
              Review these details. Sealed records are not edited in place.
            </p>
            <dl className="detail-grid">
              <dt>Case</dt>
              <dd>{data.case_ref}</dd>
              <dt>Evidence bag</dt>
              <dd>{data.bag_id}</dd>
              <dt>Operator</dt>
              <dd>{data.officer}</dd>
              <dt>Field unit</dt>
              <dd>{data.location}</dd>
              <dt>Kit lot</dt>
              <dd>{kit?.lot}</dd>
              <dt>Reading</dt>
              <dd>
                <Badge value={result[0]} />
              </dd>
              <dt>Capture time</dt>
              <dd>{when(data.captured_at)}</dd>
            </dl>
            <label className="check-label">
              <input
                type="checkbox"
                checked={ack}
                onChange={(e) => setAck(e.target.checked)}
              />{" "}
              I have reviewed the record and understand that this is a
              demonstration, not a confirmed identification.
            </label>
            <label className="check-label">
              <input
                type="checkbox"
                checked={offline}
                onChange={(e) => setOffline(e.target.checked)}
              />
              <WifiOff size={16} /> Demonstrate offline queue
            </label>
            <div className="actions">
              <button className="secondary" onClick={() => setStep(2)}>
                Back
              </button>
              <button
                className="primary"
                disabled={!ack || busy}
                onClick={seal}
              >
                <LockKeyhole size={17} />
                {busy
                  ? "Saving…"
                  : !online || offline
                    ? "Save to offline queue"
                    : "Seal record"}
              </button>
            </div>
          </section>
          <aside className="guidance">
            <ShieldCheck size={28} />
            <h2>Integrity you can inspect</h2>
            <p>
              When connected, the server hashes and signs the record using this
              installation’s demonstration key.
            </p>
            <hr />
            <p>
              Offline records remain queued and unsigned until synchronization.
              A signature detects changes; it does not prove the real-world
              capture is authentic.
            </p>
          </aside>
        </div>
      )}
    </>
  );
}
function Field({
  label,
  value,
  onChange,
  placeholder = "",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label>
      {label}
      <input
        required
        value={value}
        maxLength={80}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

export function Records({
  records,
  open,
}: {
  records: Evidence[];
  open: (r: Evidence) => void;
}) {
  const [q, setQ] = useState(""),
    [status, setStatus] = useState("All readings");
  const filtered = records.filter(
    (r) =>
      (status === "All readings" || r.payload.result.outcome === status) &&
      (
        r.id +
        " " +
        r.payload.intake.case_ref +
        " " +
        r.payload.intake.bag_id +
        " " +
        r.payload.intake.officer
      )
        .toLowerCase()
        .includes(q.toLowerCase()),
  );
  return (
    <>
      <div className="page-head">
        <div>
          <h1>Evidence records</h1>
          <p>Every observation, with its original context.</p>
        </div>
        <button
          className="secondary"
          onClick={() => download(filtered, "fieldseal-records.json")}
        >
          <Download size={17} /> Export records
        </button>
      </div>
      <div className="filters">
        <label className="search">
          <Search size={18} />
          <input
            aria-label="Search records"
            placeholder="Search case, record, bag or officer"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </label>
        <select
          aria-label="Filter by reading"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          {[
            "All readings",
            "Presumptive indication",
            "No indication",
            "Inconclusive",
          ].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <span>{filtered.length} records</span>
      </div>
      <section className="panel">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Record / Case</th>
                <th>Reading</th>
                <th>Operator</th>
                <th>Lab status</th>
                <th>Captured</th>
                <th>Review</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id}>
                  <td>
                    <button className="link" onClick={() => open(r)}>
                      {r.id}
                    </button>
                    <small>{r.payload.intake.case_ref}</small>
                  </td>
                  <td>
                    <Badge value={r.payload.result.outcome} />
                  </td>
                  <td>{r.payload.intake.officer}</td>
                  <td>{lab(r)?.payload.details.outcome || "Pending"}</td>
                  <td>{when(r.payload.intake.captured_at)}</td>
                  <td>
                    <button className="link" onClick={() => open(r)}>
                      Open <ArrowRight size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!filtered.length && (
            <div className="empty">
              No records match. Try another case reference or reading filter.
            </div>
          )}
        </div>
      </section>
    </>
  );
}

export function Detail({
  record,
  onUpdate,
  onBack,
}: {
  record: Evidence;
  onUpdate: (r: Evidence) => void;
  onBack: () => void;
}) {
  const [tab, setTab] = useState("Reading"),
    [error, setError] = useState(""),
    [check, setCheck] = useState<Verification | null>(null),
    [busy, setBusy] = useState(false);
  const p = record.payload,
    latestLab = lab(record);
  async function action(path: string, form: HTMLFormElement) {
    setError("");
    setBusy(true);
    try {
      onUpdate(
        await api<Evidence>(
          "/records/" + record.id + path,
          "POST",
          Object.fromEntries(new FormData(form)),
        ),
      );
      form.reset();
      setCheck(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function verify() {
    setBusy(true);
    try {
      setCheck(
        await api<Verification>(
          "/verify",
          "POST",
          await api("/records/" + record.id + "/bundle"),
        ),
      );
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <button className="link back" onClick={onBack}>
        <ArrowLeft size={16} /> Evidence records
      </button>
      <div className="page-head">
        <div>
          <h1 className="detail-heading">Evidence record {record.id}</h1>
          <p>
            {p.intake.case_ref} · {p.intake.bag_id}
          </p>
        </div>
        <button
          className="secondary"
          onClick={async () => {
            try {
              download(
                await api("/records/" + record.id + "/bundle"),
                record.id + "-bundle.json",
              );
            } catch (e) {
              setError((e as Error).message);
            }
          }}
        >
          <Download size={17} /> Download bundle
        </button>
      </div>
      {error && (
        <div className="alert danger" role="alert">
          {error}
        </div>
      )}
      <div className="flow-grid">
        <section className="panel">
          <div className="tabs" role="group" aria-label="Record sections">
            {["Reading", "Chain of custody", "Lab outcome"].map((t) => (
              <button
                key={t}
                aria-pressed={tab === t}
                className={tab === t ? "selected" : ""}
                onClick={() => setTab(t)}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="padded">
            {tab === "Reading" && (
              <>
                <div className="section-title">
                  <h2>Field capture</h2>
                  <Badge value={p.result.outcome} />
                </div>
                <div className="reading-layout">
                  <div>
                    {p.intake.image ? (
                      <img
                        className="capture-photo"
                        src={p.intake.image}
                        alt="Recorded capture"
                      />
                    ) : (
                      <SampleCard scenario={p.intake.scenario} />
                    )}
                    <p className="result-copy">{p.result.note}</p>
                  </div>
                  <dl className="detail-grid">
                    <dt>Kit lot</dt>
                    <dd>{p.kit.lot}</dd>
                    <dt>Operator</dt>
                    <dd>{p.intake.officer}</dd>
                    <dt>Field unit</dt>
                    <dd>{p.intake.location}</dd>
                    <dt>Capture time</dt>
                    <dd>{when(p.intake.captured_at)}</dd>
                    <dt>Reason</dt>
                    <dd>
                      <code>{p.result.reason}</code>
                    </dd>
                  </dl>
                </div>
                <div className="record-hash">
                  <span>Record hash · SHA-256</span>
                  <code>{record.hash}</code>
                </div>
                {p.intake.notes && (
                  <div className="remarks">
                    <h3>Operator remarks</h3>
                    <p>{p.intake.notes}</p>
                  </div>
                )}
              </>
            )}
            {tab === "Chain of custody" && (
              <>
                <h2>Record a handover</h2>
                <p className="section-copy">
                  Append a custody event. Previous events remain intact.
                </p>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    action("/custody", e.currentTarget);
                  }}
                >
                  <div className="form-grid">
                    <label>
                      Handed over by
                      <input
                        name="actor"
                        required
                        minLength={2}
                        defaultValue={p.intake.officer}
                      />
                    </label>
                    <label>
                      Recipient / unit
                      <input
                        name="recipient"
                        required
                        minLength={2}
                        placeholder="Demonstration laboratory"
                      />
                    </label>
                    <label className="wide">
                      Handover notes
                      <textarea name="note" required minLength={3} rows={3} />
                    </label>
                  </div>
                  <button className="primary" disabled={busy}>
                    Append custody event
                  </button>
                </form>
              </>
            )}
            {tab === "Lab outcome" &&
              (latestLab ? (
                <>
                  <h2>Laboratory outcome linked</h2>
                  <div className="alert subtle">
                    {latestLab.payload.details.source}
                  </div>
                  <dl className="detail-grid">
                    <dt>Reference</dt>
                    <dd>{latestLab.payload.details.reference}</dd>
                    <dt>Outcome</dt>
                    <dd>{latestLab.payload.details.outcome}</dd>
                    <dt>Recorded by</dt>
                    <dd>{latestLab.payload.actor}</dd>
                    <dt>Notes</dt>
                    <dd>{latestLab.payload.details.note}</dd>
                  </dl>
                  <p>The original field reading remains unchanged.</p>
                </>
              ) : (
                <>
                  <h2>Link a laboratory outcome</h2>
                  <p className="section-copy">
                    Manually entered demonstration outcome. No laboratory system
                    integration is connected.
                  </p>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      action("/lab", e.currentTarget);
                    }}
                  >
                    <div className="form-grid">
                      <label>
                        Lab reference
                        <input
                          name="reference"
                          required
                          minLength={3}
                          placeholder="LAB-DEMO-084"
                        />
                      </label>
                      <label>
                        Recorded by
                        <input
                          name="actor"
                          required
                          minLength={2}
                          placeholder="Demo lab operator"
                        />
                      </label>
                      <label className="wide">
                        Outcome
                        <select name="outcome">
                          <option>Confirmed</option>
                          <option>Not confirmed</option>
                          <option>Inconclusive</option>
                        </select>
                      </label>
                      <label className="wide">
                        Outcome notes
                        <textarea name="note" required minLength={3} rows={3} />
                      </label>
                    </div>
                    <button className="primary" disabled={busy}>
                      <FlaskConical size={17} /> Link lab outcome
                    </button>
                  </form>
                </>
              ))}
          </div>
        </section>
        <aside>
          <section className="panel padded">
            <h2>Chain of custody</h2>
            <ol className="timeline">
              {record.events.map((e) => (
                <li key={e.hash}>
                  <strong>{e.payload.action}</strong>
                  <small>{when(e.payload.timestamp)}</small>
                  <p>{e.payload.actor}</p>
                  {e.payload.details.recipient && (
                    <p>To {e.payload.details.recipient}</p>
                  )}
                  {e.payload.details.outcome && (
                    <p>{e.payload.details.outcome}</p>
                  )}
                </li>
              ))}
            </ol>
            <hr />
            <h3>Integrity summary</h3>
            <p className="section-copy">
              SHA-256 · ECDSA P-256
              <br />
              Signed with the installation’s demo key.
            </p>
            {check && <VerifyResult value={check} />}
            <button className="primary full" onClick={verify} disabled={busy}>
              <ShieldCheck size={17} /> Verify bundle
            </button>
          </section>
          <div className="alert">
            Synthetic example. Substance identity is not established by the
            field reading.
          </div>
        </aside>
      </div>
    </>
  );
}
export function VerifyResult({ value }: { value: Verification }) {
  return (
    <div
      role="status"
      className={"verification " + (value.valid ? "valid" : "invalid")}
    >
      {value.valid ? <ShieldCheck size={28} /> : <ShieldAlert size={28} />}
      <div>
        <h3>
          {value.valid ? "Integrity checks passed" : "Verification failed"}
        </h3>
        <p>
          {value.valid
            ? value.trusted_key
              ? "Signed by this installation’s demo key."
              : "Signature is internally valid, but the key is not trusted by this installation."
            : value.errors.join(". ")}
        </p>
      </div>
    </div>
  );
}
export function Verifier({ records }: { records: Evidence[] }) {
  const [chosen, setChosen] = useState(""),
    [bundle, setBundle] = useState<unknown>(null),
    [name, setName] = useState(""),
    [tamper, setTamper] = useState(false),
    [result, setResult] = useState<Verification | null>(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  async function run() {
    setBusy(true);
    setError("");
    setResult(null);
    try {
      let b: any =
        bundle ||
        (await api("/records/" + (chosen || records[0]?.id) + "/bundle"));
      b = structuredClone(b);
      if (tamper) b.body.record.payload.intake.bag_id = "ALTERED-BAG-DEMO";
      setResult(await api<Verification>("/verify", "POST", b));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <div className="page-head">
        <div>
          <h1>Verify a record</h1>
          <p>Check the bundle. Detect the difference.</p>
        </div>
      </div>
      <div className="flow-grid">
        <section className="panel padded">
          <h2>Choose an evidence bundle</h2>
          <p className="section-copy">
            Verify a workspace record or import an exported JSON bundle.
          </p>
          <label>
            Workspace record
            <select
              value={chosen || records[0]?.id || ""}
              onChange={(e) => {
                setChosen(e.target.value);
                setBundle(null);
                setName("");
                setResult(null);
              }}
            >
              {records.map((r) => (
                <option value={r.id} key={r.id}>
                  {r.id} · {r.payload.intake.case_ref}
                </option>
              ))}
            </select>
          </label>
          <div className="upload-zone">
            <Upload size={27} />
            <h3>Import a signed bundle</h3>
            <p>FieldSeal JSON export · maximum 8 MB</p>
            <label className="secondary file-button">
              Choose bundle
              <input
                type="file"
                accept=".json,application/json"
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  try {
                    if (f.size > 8 * 1024 * 1024)
                      throw new Error("Bundle must be smaller than 8 MB");
                    setBundle(JSON.parse(await f.text()));
                    setName(f.name);
                    setResult(null);
                    setError("");
                  } catch (e) {
                    setError((e as Error).message);
                  }
                }}
              />
            </label>
            {name && <small>{name}</small>}
          </div>
          <label className="check-label">
            <input
              type="checkbox"
              checked={tamper}
              onChange={(e) => {
                setTamper(e.target.checked);
                setResult(null);
              }}
            />{" "}
            Tamper demonstration: change a copy’s bag ID before verification
          </label>
          <small>The original record is never changed.</small>
          <div className="actions">
            <button
              className="primary"
              disabled={busy || (!bundle && !records.length)}
              onClick={run}
            >
              <ShieldCheck size={18} />
              {busy ? "Verifying…" : "Verify integrity"}
            </button>
          </div>
          {error && (
            <div role="alert" className="alert danger">
              {error}
            </div>
          )}
          {result && <VerifyResult value={result} />}
        </section>
        <aside className="guidance">
          <h2>What is checked</h2>
          <ul className="check-list">
            {[
              "Export signature",
              "Original payload hash and signature",
              "Custody event order and links",
              "Signing-key match",
            ].map((x) => (
              <li key={x}>
                <Check />
                {x}
              </li>
            ))}
          </ul>
          <hr />
          <h3>What it does not prove</h3>
          <p>
            A valid signature does not prove the photo, operator, location or
            chemical finding is genuine. This is a demonstration key, not an
            accredited forensic authority.
          </p>
        </aside>
      </div>
    </>
  );
}
export function Kits({ kits }: { kits: Kit[] }) {
  return (
    <>
      <div className="page-head">
        <div>
          <h1>Kit register</h1>
          <p>Know the lot before recording the reading.</p>
        </div>
      </div>
      <div className="alert subtle">
        Demonstration kit inventory. Expiry is enforced by the API as well as
        the capture flow.
      </div>
      <section className="panel table-wrap">
        <table>
          <thead>
            <tr>
              <th>Kit</th>
              <th>Lot number</th>
              <th>Expiry date</th>
              <th>Demo stock</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {kits.map((k) => (
              <tr key={k.id}>
                <td>
                  <strong>{k.name}</strong>
                  <small>{k.id}</small>
                </td>
                <td>{k.lot}</td>
                <td>{k.expires}</td>
                <td>{k.stock}</td>
                <td>
                  <Badge
                    value={
                      k.expires < new Date().toISOString().slice(0, 10)
                        ? "Expired — blocked"
                        : "In date"
                    }
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}
export function About({ queued }: { queued: number }) {
  return (
    <>
      <div className="page-head">
        <div>
          <h1>Prototype scope</h1>
          <p>A working foundation, with clear boundaries.</p>
        </div>
      </div>
      <div className="scope-grid">
        <section className="panel padded">
          <h2>Implemented</h2>
          <ul>
            <li>Persistent field records and expiry validation</li>
            <li>SHA-256 and ECDSA P-256 server demo signatures</li>
            <li>Append-only custody events through the API</li>
            <li>Signed bundle export and integrity verification</li>
            <li>Laboratory outcome linking</li>
            <li>Browser drafts and offline queue ({queued} pending)</li>
          </ul>
          <a href="/docs" target="_blank" rel="noreferrer">
            Explore local API documentation
          </a>
        </section>
        <section className="panel padded">
          <h2>Demonstrated, not validated</h2>
          <ul>
            <li>
              Reference, light and alignment indicators for synthetic samples
            </li>
            <li>Presumptive and inconclusive outcome flows</li>
            <li>Manually entered lab results</li>
          </ul>
          <p>
            Real photographs remain inconclusive pending manual review. No trial
            AI services or external AI APIs are used.
          </p>
        </section>
        <section className="panel padded">
          <h2>Production milestones</h2>
          <ul>
            <li>Independent kit and device validation</li>
            <li>Authorized login and role-based access</li>
            <li>Hardware-backed signing and device attestation</li>
            <li>Encryption and managed key custody</li>
            <li>Trusted time, location verification and legal review</li>
            <li>Agency/laboratory integration and PostgreSQL deployment</li>
          </ul>
        </section>
      </div>
      <div className="alert">
        Keep only fictional cases in this local demonstration. There is no
        production authentication or encrypted database.
      </div>
    </>
  );
}
