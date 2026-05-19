import { Link } from "wouter";
import PublicLayout from "@/components/PublicLayout";
import SectionHeader from "@/components/SectionHeader";
import ContentCard from "@/components/ContentCard";
import StatCard from "@/components/StatCard";
import NewsletterCapture from "@/components/NewsletterCapture";

export default function Home() {
  return (
    <PublicLayout
      title="Impact"
      description="The content and community hub for health and wellness leaders."
    >
      {/* ── HERO ──────────────────────────────────────────────── */}
      <section
        className="section-dark"
        style={{ padding: "120px 0 100px", position: "relative" }}
      >
        <div className="shell" style={{ position: "relative", zIndex: 1 }}>
          <div style={{ maxWidth: "780px" }}>
            <span className="tag tag--dark" style={{ marginBottom: "32px" }}>
              The Platform for Leaders
            </span>
            <h1
              className="display-xl"
              style={{ color: "var(--paper)", marginBottom: "28px" }}
            >
              Where health &amp; wellness leaders grow.
            </h1>
            <p
              className="body-lg"
              style={{
                color: "rgba(254,253,251,0.65)",
                maxWidth: "52ch",
                marginBottom: "48px",
              }}
            >
              Insights, rankings, and community for the people building the
              future of health and wellness. Powered by data. Built for impact.
            </p>
            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
              <Link href="/programs">
                <button className="btn btn--gold">Grow with Impact</button>
              </Link>
              <Link href="/insights">
                <button className="btn btn--ghost-dark">
                  Explore Insights
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ─────────────────────────────────────────── */}
      <section
        style={{
          background: "var(--paper-soft)",
          borderBottom: "1px solid var(--paper-darker)",
          padding: "48px 0",
        }}
      >
        <div className="shell">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "24px",
            }}
            className="stats-grid"
          >
            <StatCard label="Leaders ranked" value="100" gold />
            <StatCard label="Insights published" value="—" />
            <StatCard label="Programs active" value="—" />
            <StatCard label="Community members" value="—" />
          </div>
        </div>
      </section>

      {/* ── LATEST INSIGHTS ───────────────────────────────────── */}
      <section style={{ padding: "var(--section-pad) 0" }}>
        <div className="shell">
          <SectionHeader
            tag="Insights"
            headline="Ideas shaping the industry"
            description="Analysis, strategy, and perspective for health and wellness leaders navigating what's next."
            viewAllHref="/insights"
          />
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "24px",
            }}
            className="cards-grid"
          >
            {[1, 2, 3].map((i) => (
              <ContentCard
                key={i}
                subtag="Insight"
                title="Coming soon — first insight"
                excerpt="This section will populate with the latest insights from the Impact editorial team."
                meta="Impact Editorial · Coming soon"
                href="/insights"
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── IMPACT 100 TEASER ─────────────────────────────────── */}
      <section
        className="section-dark"
        style={{ padding: "var(--section-pad) 0" }}
      >
        <div className="shell" style={{ position: "relative", zIndex: 1 }}>
          <SectionHeader
            tag="Impact 100"
            headline="The definitive ranking of health &amp; wellness leaders"
            description="Monthly rankings powered by reach, influence, and real-world impact data."
            viewAllHref="/100"
            dark
          />
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "24px",
            }}
            className="cards-grid"
          >
            {[1, 2, 3].map((i) => (
              <ContentCard
                key={i}
                subtag={`#${i}`}
                title="Leader name coming soon"
                excerpt="Rankings will populate once the first Impact 100 edition is published."
                dark
              />
            ))}
          </div>
          <div style={{ marginTop: "40px" }}>
            <Link href="/100">
              <button className="btn btn--gold">View Impact 100 →</button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── NEWSLETTER ────────────────────────────────────────── */}
      <section
        style={{
          padding: "var(--section-pad) 0",
          background: "var(--paper-soft)",
        }}
      >
        <div className="shell">
          <NewsletterCapture
            headline="The Impact Brief"
            description="Strategy, data, and frameworks for health and wellness leaders. Delivered weekly. No noise."
          />
        </div>
      </section>

      <style>{`
        @media (max-width: 900px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .cards-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 560px) {
          .stats-grid { grid-template-columns: 1fr !important; }
          .cards-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </PublicLayout>
  );
}
