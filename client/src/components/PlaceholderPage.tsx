import PublicLayout from "./PublicLayout";
import SectionHeader from "./SectionHeader";

interface PlaceholderPageProps {
  tag: string;
  title: string;
  description: string;
  note?: string;
}

/**
 * PlaceholderPage — used for all foundation-phase content index pages.
 * Renders a proper page with nav, footer, and a clear "coming soon" state.
 */
export default function PlaceholderPage({
  tag,
  title,
  description,
  note,
}: PlaceholderPageProps) {
  return (
    <PublicLayout title={title} description={description}>
      <section style={{ padding: "var(--section-pad) 0" }}>
        <div className="shell">
          <SectionHeader tag={tag} headline={title} description={description} />

          {/* Placeholder grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "24px",
              marginBottom: "48px",
            }}
            className="placeholder-grid"
          >
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="placeholder-label"
                style={{
                  borderRadius: "var(--radius-xl)",
                  height: "220px",
                }}
              >
                {note || "Content coming soon"}
              </div>
            ))}
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 900px) {
          .placeholder-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 560px) {
          .placeholder-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </PublicLayout>
  );
}
