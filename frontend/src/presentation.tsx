import type { Evidence } from "./types";
export const when = (s: string) =>
  new Date(s).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
export function Badge({ value }: { value: string }) {
  return (
    <span
      className={
        "badge " +
        (value === "Inconclusive"
          ? "amber"
          : value === "Presumptive indication"
            ? "teal"
            : "neutral")
      }
    >
      {value}
    </span>
  );
}
export const lab = (r: Evidence) =>
  r.events.find((e) => e.payload.action === "Lab outcome linked");
