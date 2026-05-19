import { Link } from "wouter";

interface SectionHeaderProps {
  tag: string;
  headline: string;
  description?: string;
  viewAllHref?: string;
  viewAllLabel?: string;
  dark?: boolean;
}

/**
 * SectionHeader — Impact design system section header pattern.
 * Tag on its own full-width line, then a two-column layout:
 * headline left, description (+ optional view-all link) right.
 */
export default function SectionHeader({
  tag,
  headline,
  description,
  viewAllHref,
  viewAllLabel = "View all",
  dark = false,
}: SectionHeaderProps) {
  const textColor = dark ? "var(--paper)" : "var(--ink)";
  const descColor = dark ? "rgba(254,253,251,0.6)" : "var(--ink-soft)";

  return (
    <div style={{ marginBottom: "48px" }}>
      {/* Tag */}
      <div style={{ marginBottom: "28px" }}>
        <span className={dark ? "tag tag--dark" : "tag"}>{tag}</span>
      </div>

      {/* Two-column: headline left, description right */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1.4fr",
          gap: "64px",
          alignItems: "start",
        }}
        className="section-header-grid"
      >
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontSize: "clamp(24px, 3vw, 36px)",
            letterSpacing: "-0.025em",
            lineHeight: 1.05,
            color: textColor,
          }}
        >
          {headline}
        </h2>

        {(description || viewAllHref) && (
          <div>
            {description && (
              <p
                style={{
                  fontSize: "16px",
                  color: descColor,
                  lineHeight: 1.6,
                  marginBottom: viewAllHref ? "16px" : 0,
                }}
              >
                {description}
              </p>
            )}
            {viewAllHref && (
              <Link href={viewAllHref}>
                <span
                  style={{
                    fontSize: "14px",
                    fontWeight: 600,
                    color: dark ? "var(--gold-bright)" : "var(--gold)",
                    cursor: "pointer",
                    transition: "color 180ms",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = dark
                      ? "var(--paper)"
                      : "var(--gold-dark)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = dark
                      ? "var(--gold-bright)"
                      : "var(--gold)")
                  }
                >
                  {viewAllLabel} →
                </span>
              </Link>
            )}
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .section-header-grid {
            grid-template-columns: 1fr !important;
            gap: 20px !important;
          }
        }
      `}</style>
    </div>
  );
}
