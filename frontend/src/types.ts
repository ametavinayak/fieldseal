export type Scenario =
  | "clear"
  | "negative"
  | "low_light"
  | "missing_card"
  | "uploaded";
export type Intake = {
  client_id: string;
  case_ref: string;
  bag_id: string;
  officer: string;
  location: string;
  kit_id: string;
  scenario: Scenario;
  notes: string;
  image: string | null;
  captured_at: string;
};
export type Kit = {
  id: string;
  name: string;
  lot: string;
  expires: string;
  stock: number;
};
export type Result = {
  outcome: string;
  reason: string;
  quality: string;
  light: number | null;
  alignment: number | null;
  reference: number | null;
  note: string;
};
export type AuditEvent = {
  payload: {
    record_id: string;
    sequence: number;
    previous_hash: string | null;
    action: string;
    actor: string;
    details: Record<string, string>;
    timestamp: string;
  };
  hash: string;
  signature: string;
};
export type Evidence = {
  id: string;
  payload: {
    record_id: string;
    intake: Intake;
    kit: Kit;
    result: Result;
    image_sha256: string | null;
    sealed_at: string;
    demo: boolean;
    notice: string;
  };
  hash: string;
  signature: string;
  events: AuditEvent[];
};
export type Verification = {
  valid: boolean;
  trusted_key: boolean;
  errors: string[];
  notice: string;
};
