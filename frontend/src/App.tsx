import { Capture, Records, Detail, Verifier, Kits, About } from "./Features";
import { useState, useEffect } from "react";
import {
  Home,
  Plus,
  FileText,
  ShieldCheck,
  Package,
  Camera,
  ArrowRight,
  Clock,
  FlaskConical,
  Menu,
  Wifi,
  WifiOff,
  RefreshCw,
  X,
  ChevronRight,
} from "lucide-react";
import { api } from "./api";
import { read, write } from "./storage";
import { SampleCard } from "./SampleCard";
import type { Evidence, Intake, Kit } from "./types";
import { Badge, when, lab } from "./presentation";
import { MobileRecordList, MobileNavigation } from "./Mobile";
export default function App() {
  const [view, setView] = useState("overview"),
    [records, setRecords] = useState<Evidence[]>([]),
    [kits, setKits] = useState<Kit[]>([]),
    [queue, setQueue] = useState<Intake[]>([]),
    [online, setOnline] = useState(false),
    [loading, setLoading] = useState(true),
    [notice, setNotice] = useState(""),
    [menu, setMenu] = useState(false),
    [selected, setSelected] = useState<Evidence | null>(null);
  useEffect(() => {
    window.scrollTo(0, 0);
    const heading = document.querySelector<HTMLElement>("main h1");
    if (heading) {
      heading.tabIndex = -1;
      heading.focus({ preventScroll: true });
    }
  }, [view, selected?.id]);
  useEffect(() => {
    if (!menu) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenu(false);
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [menu]);
  async function refresh() {
    try {
      const [r, k] = await Promise.all([
        api<Evidence[]>("/records"),
        api<Kit[]>("/kits"),
      ]);
      setRecords(r);
      setKits(k);
      setOnline(true);
      await write("records", r);
      await write("kits", k);
    } catch {
      setOnline(false);
      setRecords(await read<Evidence[]>("records", []));
      setKits(await read<Kit[]>("kits", []));
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    refresh();
    read<Intake[]>("queue", []).then(setQueue);
    const wake = () => refresh();
    window.addEventListener("online", wake);
    return () => window.removeEventListener("online", wake);
  }, []);
  function navigate(next: string) {
    setView(next);
    setMenu(false);
    setSelected(null);
  }
  function open(r: Evidence) {
    setSelected(r);
    setView("detail");
  }
  async function sync() {
    if (!queue.length) {
      await refresh();
      setNotice("Connection checked. No queued records.");
      return;
    }
    let remaining = [...queue];
    try {
      for (const d of queue) {
        await api("/records", "POST", d);
        remaining = remaining.filter((x) => x.client_id !== d.client_id);
        await write("queue", remaining);
        setQueue(remaining);
      }
      await refresh();
      setNotice("Queued records synchronized and sealed.");
    } catch (e) {
      setNotice("Sync stopped: " + (e as Error).message);
    }
  }
  const pending = records.filter(
    (r) => r.payload.result.outcome === "Inconclusive",
  );
  return (
    <div className={"app view-" + view}>
      <a className="skip" href="#main">
        Skip to content
      </a>
      {menu && (
        <button
          className="menu-scrim"
          aria-label="Close navigation"
          onClick={() => setMenu(false)}
        />
      )}
      <aside id="main-navigation" className={menu ? "sidebar open" : "sidebar"}>
        <div className="brand">
          FieldSeal<span>by Team BarelyLegal</span>
        </div>
        <p className="rail-description">
          Field drug test
          <br />
          recording companion
        </p>
        <nav aria-label="Main navigation">
          {[
            ["overview", "Overview", Home],
            ["capture", "New field test", Plus],
            ["records", "Evidence records", FileText],
            ["verify", "Verify record", ShieldCheck],
            ["kits", "Kit register", Package],
          ].map(([key, label, Icon]) => {
            const I = Icon as typeof Home;
            return (
              <button
                key={key as string}
                className={
                  view === key || (view === "detail" && key === "records")
                    ? "active"
                    : ""
                }
                onClick={() => navigate(key as string)}
              >
                <I size={21} />
                <span>{label as string}</span>
              </button>
            );
          })}
        </nav>
        <div className="rail-foot">
          <strong>Demonstration workspace</strong>
          <p>
            Synthetic examples only.
            <br />
            Not for operational use.
          </p>
          <button onClick={() => navigate("about")}>
            Prototype scope <ArrowRight size={15} />
          </button>
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <div className="phone-brand">
            <ShieldCheck size={26} />
            <div>
              FieldSeal<small>Demo field companion</small>
            </div>
          </div>
          <button
            className="icon mobile-menu"
            aria-label="Toggle navigation"
            onClick={() => setMenu(!menu)}
          >
            {menu ? <X /> : <Menu />}
          </button>
          <span>Demonstration workspace</span>
          <button
            className={"connection " + (online ? "" : "offline")}
            onClick={sync}
            title="Check connection and synchronize queued records"
          >
            {online ? <Wifi size={16} /> : <WifiOff size={16} />}{" "}
            {online ? "Connected" : "Offline"}
            {queue.length > 0 && ` · ${queue.length} queued`}
            <RefreshCw size={13} />
          </button>
          <div className="user">
            <span className="avatar">AS</span>
            <span>Field User</span>
          </div>
        </header>
        <main id="main">
          {notice && (
            <div role="status" className="notice">
              {notice}
              <button
                className="icon"
                aria-label="Dismiss notification"
                onClick={() => setNotice("")}
              >
                <X size={16} />
              </button>
            </div>
          )}
          {view === "overview" && (
            <>
              <div className="page-head">
                <div>
                  <h1>Field workspace</h1>
                  <p>From first capture to a verifiable record.</p>
                </div>
                <button className="primary" onClick={() => navigate("capture")}>
                  <Plus size={20} /> New field test
                </button>
              </div>
              <div className="summary">
                <div>
                  <FileText />
                  <span>
                    <strong><span className="stat-number">{records.length}</span> <span className="stat-label">records</span></strong>
                    <small>Total in workspace</small>
                  </span>
                </div>
                <div>
                  <Clock />
                  <span>
                    <strong><span className="stat-number">{pending.length}</span> <span className="stat-label">awaiting review</span></strong>
                    <small>Needs attention</small>
                  </span>
                </div>
                <div>
                  <FlaskConical />
                  <span>
                    <strong>
                      <span className="stat-number">{records.filter(lab).length}</span>{" "}
                      <span className="stat-label">lab outcome{records.filter(lab).length === 1 ? "" : "s"}</span>
                    </strong>
                    <small>Laboratory result received</small>
                  </span>
                </div>
              </div>
              <div className="dashboard-grid">
                <section className="panel">
                  <div className="panel-head">
                    <h2>Recent evidence</h2>
                    <button
                      className="link"
                      onClick={() => navigate("records")}
                    >
                      View all records <ArrowRight size={16} />
                    </button>
                  </div>
                  <div className="desktop-records">
                    <RecordTable
                      records={records.slice(0, 6)}
                      open={open}
                      loading={loading}
                    />
                  </div>
                  <MobileRecordList
                    records={records.slice(0, 3)}
                    open={open}
                    loading={loading}
                  />
                </section>
                <div className="dashboard-side">
                  <section className="panel capture-teaser">
                    <h2>Continue a field test</h2>
                    <SampleCard small />
                    <p>
                      Use the calibration reference to capture and record a new
                      field test.
                    </p>
                    <button
                      className="primary full"
                      onClick={() => navigate("capture")}
                    >
                      <Camera size={18} /> Start capture
                    </button>
                    <button className="link" onClick={() => navigate("about")}>
                      View guidance <ArrowRight size={15} />
                    </button>
                  </section>
                  <section className="panel">
                    <div className="panel-head">
                      <h2>Review queue ({pending.length})</h2>
                      <button
                        className="link"
                        onClick={() => navigate("records")}
                      >
                        View all
                      </button>
                    </div>
                    {pending.slice(0, 2).map((r) => (
                      <button
                        className="queue-row"
                        onClick={() => open(r)}
                        key={r.id}
                      >
                        <FileText size={22} />
                        <span>
                          <strong>{r.id}</strong>
                          <small>{r.payload.intake.case_ref}</small>
                          <small>Inconclusive reading</small>
                        </span>
                        <ChevronRight size={18} />
                      </button>
                    ))}
                  </section>
                </div>
              </div>
            </>
          )}
          {view === "capture" && (
            <Capture
              kits={kits}
              online={online}
              onSaved={(r) => {
                refresh();
                open(r);
                setNotice("Record sealed and stored.");
              }}
              onQueued={async (d) => {
                const next = [
                  ...queue.filter((x) => x.client_id !== d.client_id),
                  d,
                ];
                await write("queue", next);
                setQueue(next);
              }}
            />
          )}
          {view === "records" && <Records records={records} open={open} />}
          {view === "detail" && selected && (
            <Detail
              key={selected.id}
              record={selected}
              onUpdate={(r) => {
                setSelected(r);
                refresh();
              }}
              onBack={() => navigate("records")}
            />
          )}
          {view === "verify" && <Verifier records={records} />}
          {view === "kits" && <Kits kits={kits} />}
          {view === "about" && <About queued={queue.length} />}
        </main>
        <footer>
          <span>Presumptive workflow · Laboratory confirmation required</span>
          <span>FieldSeal v0.1.0 · Synthetic demonstration</span>
        </footer>
      </div>
      <MobileNavigation
        view={view}
        menu={menu}
        navigate={navigate}
        toggleMenu={() => setMenu(!menu)}
      />
    </div>
  );
}
function RecordTable({
  records,
  open,
  loading = false,
}: {
  records: Evidence[];
  open: (r: Evidence) => void;
  loading?: boolean;
}) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Record / Case</th>
            <th>Reading</th>
            <th>Lab status</th>
            <th>Captured</th>
            <th>
              <span className="sr-only">Open</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {records.map((r) => (
            <tr key={r.id}>
              <td>
                <button className="link record-link" onClick={() => open(r)}>
                  {r.id}
                </button>
                <small>{r.payload.intake.case_ref}</small>
              </td>
              <td>
                <Badge value={r.payload.result.outcome} />
              </td>
              <td>{lab(r)?.payload.details.outcome || "Pending"}</td>
              <td>{when(r.payload.intake.captured_at)}</td>
              <td>
                <button
                  className="icon"
                  aria-label={"Open " + r.id}
                  onClick={() => open(r)}
                >
                  <ChevronRight size={17} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {!records.length && (
        <div className="empty">
          {loading
            ? "Loading evidence records…"
            : "No records yet. Start a field test to create one."}
        </div>
      )}
    </div>
  );
}
