interface StatCardProps {
  label: string;
  value: string | number;
  delta?: string;
  deltaDirection?: "up" | "down" | "neutral";
  context?: string;
  gold?: boolean;
  dark?: boolean;
}

/**
 * StatCard — Impact design system stat callout component.
 * Light and dark variants. Gold for the primary metric.
 */
export default function StatCard({
  label,
  value,
  delta,
  deltaDirection = "neutral",
  context,
  gold = false,
  dark = false,
}: StatCardProps) {
  const deltaColor =
    deltaDirection === "up"
      ? "var(--success)"
      : deltaDirection === "down"
      ? "var(--error)"
      : "var(--ink-mute)";

  const deltaPrefix =
    deltaDirection === "up" ? "↑ " : deltaDirection === "down" ? "↓ " : "";

  return (
    <div className={`stat-card${dark ? " stat-card--dark" : ""}`}>
      <div
        style={{
          fontSize: "14px",
          color: dark ? "rgba(254,253,251,0.45)" : "var(--ink-mute)",
          marginBottom: "8px",
        }}
      >
        {label}
      </div>

      <div
        className={`stat-num${gold ? " stat-num--gold" : ""}`}
        style={dark && !gold ? { color: "var(--paper)" } : {}}
      >
        {value}
      </div>

      {delta && (
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
            marginTop: "10px",
            fontSize: "14px",
            fontWeight: 600,
            color: deltaColor,
          }}
        >
          {deltaPrefix}{delta}
        </div>
      )}

      {context && (
        <div
          style={{
            fontSize: "14px",
            color: dark ? "rgba(254,253,251,0.4)" : "var(--ink-mute)",
            marginTop: "8px",
          }}
        >
          {context}
        </div>
      )}
    </div>
  );
}
