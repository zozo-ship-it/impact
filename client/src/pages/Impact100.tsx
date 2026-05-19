import PublicLayout from "@/components/PublicLayout";
import SectionHeader from "@/components/SectionHeader";
import PlaceholderPage from "@/components/PlaceholderPage";

export function Impact100Index() {
  return (
    <PublicLayout
      title="Impact 100"
      description="The definitive monthly ranking of the top 100 health and wellness leaders."
    >
      <section style={{ padding: "var(--section-pad) 0" }}>
        <div className="shell">
          <SectionHeader
            tag="Impact 100"
            headline="The definitive ranking of health &amp; wellness leaders"
            description="Monthly rankings powered by reach, influence, and real-world impact data. Updated every month."
            viewAllHref="/100"
          />

          {/* Ranking table placeholder */}
          <div
            style={{
              background: "var(--paper-soft)",
              border: "1px solid var(--paper-darker)",
              borderRadius: "var(--radius-xl)",
              overflow: "hidden",
            }}
          >
            {/* Header row */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "64px 1fr 160px 160px",
                padding: "16px 28px",
                borderBottom: "1px solid var(--paper-darker)",
                background: "var(--paper-darker)",
              }}
              className="ranking-row"
            >
              <span className="caption" style={{ color: "var(--ink-mute)" }}>Rank</span>
              <span className="caption" style={{ color: "var(--ink-mute)" }}>Leader</span>
              <span className="caption" style={{ color: "var(--ink-mute)" }}>Category</span>
              <span className="caption" style={{ color: "var(--ink-mute)" }}>Score</span>
            </div>

            {/* Placeholder rows */}
            {Array.from({ length: 10 }, (_, i) => (
              <div
                key={i}
                style={{
                  display: "grid",
                  gridTemplateColumns: "64px 1fr 160px 160px",
                  padding: "20px 28px",
                  borderBottom: i < 9 ? "1px solid var(--paper-darker)" : "none",
                  alignItems: "center",
                }}
                className="ranking-row"
              >
                <span
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 800,
                    fontSize: "20px",
                    color: i === 0 ? "var(--gold)" : "var(--ink-mute)",
                  }}
                >
                  {i + 1}
                </span>
                <div
                  style={{
                    height: "20px",
                    background: "var(--paper-deeper, var(--paper-darker))",
                    borderRadius: "var(--radius-sm)",
                    width: `${60 + Math.random() * 30}%`,
                  }}
                />
                <div
                  style={{
                    height: "16px",
                    background: "var(--paper-deeper, var(--paper-darker))",
                    borderRadius: "var(--radius-sm)",
                    width: "70%",
                  }}
                />
                <div
                  style={{
                    height: "16px",
                    background: "var(--paper-deeper, var(--paper-darker))",
                    borderRadius: "var(--radius-sm)",
                    width: "50%",
                  }}
                />
              </div>
            ))}
          </div>

          <div
            style={{
              marginTop: "24px",
              padding: "20px 28px",
              background: "rgba(196,153,61,0.06)",
              border: "1px solid rgba(196,153,61,0.2)",
              borderRadius: "var(--radius-lg)",
            }}
          >
            <p style={{ fontSize: "14px", color: "var(--ink-mute)" }}>
              <strong style={{ color: "var(--gold)" }}>Impact 100</strong> — Rankings will populate once the first edition is published. Data is sourced from verified platform metrics.
            </p>
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 640px) {
          .ranking-row {
            grid-template-columns: 48px 1fr 100px !important;
          }
          .ranking-row > *:last-child { display: none; }
        }
      `}</style>
    </PublicLayout>
  );
}

export function Impact100Segment({ params }: { params: { segment: string } }) {
  return (
    <PlaceholderPage
      tag="Impact 100"
      title={`Impact 100 — ${params.segment}`}
      description="Archive, leader profile, or methodology page."
      note={`Segment: ${params.segment}`}
    />
  );
}
