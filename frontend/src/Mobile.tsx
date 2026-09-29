import {
  Camera,
  ChevronRight,
  FileText,
  Home,
  Menu,
  ShieldCheck,
  X,
} from "lucide-react";
import type { Evidence } from "./types";
import { Badge, when, lab } from "./presentation";

/** The mobile navigation controls the same persisted workflows as the desktop rail. */
export function MobileNavigation({
  view,
  menu,
  navigate,
  toggleMenu,
}: {
  view: string;
  menu: boolean;
  navigate: (view: string) => void;
  toggleMenu: () => void;
}) {
  const items = [
    { key: "overview", label: "Home", icon: Home },
    { key: "capture", label: "Capture", icon: Camera },
    { key: "records", label: "Records", icon: FileText },
    { key: "verify", label: "Verify", icon: ShieldCheck },
  ];
  return (
    <nav className="mobile-navigation" aria-label="Mobile navigation">
      {items.map(({ key, label, icon: Icon }) => {
        const active =
          !menu && (view === key || (key === "records" && view === "detail"));
        return (
          <button
            key={key}
            className={active ? "selected" : ""}
            aria-current={active ? "page" : undefined}
            onClick={() => navigate(key)}
          >
            <Icon size={22} />
            <span>{label}</span>
          </button>
        );
      })}
      <button
        className={
          menu || view === "kits" || view === "about" ? "selected" : ""
        }
        aria-expanded={menu}
        aria-controls="main-navigation"
        onClick={toggleMenu}
      >
        {menu ? <X size={22} /> : <Menu size={22} />}
        <span>{menu ? "Close" : "More"}</span>
      </button>
    </nav>
  );
}

/** Compact case entries avoid a horizontally scrolling evidence table on phones. */
export function MobileRecordList({
  records,
  open,
  loading = false,
  empty = "No records yet. Start a field test to create one.",
}: {
  records: Evidence[];
  open: (record: Evidence) => void;
  loading?: boolean;
  empty?: string;
}) {
  return (
    <div className="mobile-records">
      {records.map((record) => (
        <button
          className="mobile-record"
          key={record.id}
          onClick={() => open(record)}
          aria-label={`Open ${record.id}, ${record.payload.result.outcome}`}
        >
          <div className="mobile-record-title">
            <strong>{record.id}</strong>
            <ChevronRight size={18} />
          </div>
          <div className="mobile-case">
            {record.payload.intake.case_ref} · {record.payload.intake.location}
          </div>
          <div className="mobile-record-meta">
            <Badge value={record.payload.result.outcome} />
            <time dateTime={record.payload.intake.captured_at}>
              {when(record.payload.intake.captured_at)}
            </time>
          </div>
          {lab(record) && (
            <small className="mobile-lab">
              Lab outcome: {lab(record)?.payload.details.outcome}
            </small>
          )}
        </button>
      ))}
      {!records.length && (
        <p className="empty">{loading ? "Loading evidence records…" : empty}</p>
      )}
    </div>
  );
}
