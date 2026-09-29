import type { Scenario } from "./types";
export function SampleCard({
  scenario = "clear",
  small = false,
}: {
  scenario?: Scenario;
  small?: boolean;
}) {
  return (
    <div className={"sample " + (small ? "small" : "")}>
      <svg
        viewBox="0 0 660 360"
        role="img"
        aria-label="Synthetic calibration card with grey and colour reference chips; not actual evidence"
      >
        <rect width="660" height="360" rx="10" fill="#e9edf1" />
        <path
          d="M25 60V25H60M600 25H635V60M25 300V335H60M600 335H635V300"
          fill="none"
          stroke="#78909f"
          strokeWidth="2"
        />
        {scenario !== "missing_card" && (
          <g>
            <rect
              x="75"
              y="55"
              width="510"
              height="250"
              rx="8"
              fill="white"
              stroke="#c4cfd7"
            />
            <text x="102" y="91" fontSize="23" fill="#112942" fontWeight="700">
              FieldSeal
            </text>
            <text x="102" y="114" fontSize="12" fill="#526479">
              SYNTHETIC REFERENCE - DEMO ONLY
            </text>
            <line x1="102" y1="132" x2="555" y2="132" stroke="#d7e0e7" />
            {[
              "#f4f4f4",
              "#bdbdbd",
              "#8a8a8a",
              "#535353",
              "#202020",
              "#256db2",
              "#059ca8",
              "#e7c82d",
              "#dd7830",
              "#c44445",
            ].map((color, i) => (
              <rect
                key={color}
                x={102 + i * 45}
                y="149"
                width="37"
                height="35"
                fill={color}
                stroke="#bbc7d0"
                strokeWidth="0.5"
              />
            ))}
            <text x="102" y="210" fill="#526479" fontSize="11">
              Neutral reference
            </text>
            <text x="329" y="210" fill="#526479" fontSize="11">
              Colour reference
            </text>
            <line x1="102" y1="229" x2="555" y2="229" stroke="#d7e0e7" />
            <circle
              cx="125"
              cy="263"
              r="20"
              fill={scenario === "negative" ? "#eef1ee" : "#9cbec8"}
              stroke="#829ca8"
            />
            <text x="162" y="261" fontSize="12" fill="#112942">
              Demonstration response well
            </text>
            <text x="162" y="279" fontSize="10" fill="#526479">
              No substance identity assigned
            </text>
          </g>
        )}
        {scenario === "missing_card" && (
          <text
            x="330"
            y="180"
            textAnchor="middle"
            fontSize="22"
            fill="#536778"
          >
            Reference card outside frame
          </text>
        )}
        {scenario === "low_light" && (
          <rect width="660" height="360" rx="10" fill="#061727" opacity=".66" />
        )}
      </svg>
    </div>
  );
}
