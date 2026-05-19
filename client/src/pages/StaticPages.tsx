import PublicLayout from "@/components/PublicLayout";
import SectionHeader from "@/components/SectionHeader";
import NewsletterCapture from "@/components/NewsletterCapture";
import { Link } from "wouter";

/* ── MAGAZINE ─────────────────────────────────────────────── */
export function Magazine() {
  return (
    <PublicLayout
      title="Magazine"
      description="The Impact Magazine — long-form features, profiles, and analysis for health and wellness leaders."
    >
      <section style={{ padding: "var(--section-pad) 0" }}>
        <div className="shell">
          <SectionHeader
            tag="Magazine"
            headline="Long-form journalism for health &amp; wellness leaders"
            description="Deep features, profiles, and investigative analysis. Published quarterly."
          />
          <div
            style={{
              background: "var(--paper-soft)",
              border: "1px dashed var(--paper-deep, var(--paper-darker))",
              borderRadius: "var(--radius-xl)",
              height: "400px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--ink-mute)",
              fontSize: "14px",
            }}
          >
            First issue coming soon
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}

/* ── PROGRAMS ─────────────────────────────────────────────── */
export function Programs() {
  return (
    <PublicLayout
      title="Programs"
      description="Impact Programs — structured growth pathways for health and wellness leaders."
    >
      <section
        className="section-dark"
        style={{ padding: "var(--section-pad) 0" }}
      >
        <div className="shell" style={{ position: "relative", zIndex: 1 }}>
          <div style={{ maxWidth: "680px" }}>
            <span className="tag tag--dark" style={{ marginBottom: "28px" }}>
              Programs
            </span>
            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 800,
                fontSize: "clamp(32px, 4vw, 52px)",
                letterSpacing: "-0.03em",
                lineHeight: 1.0,
                color: "var(--paper)",
                marginBottom: "24px",
              }}
            >
              Grow with Impact
            </h1>
            <p
              style={{
                fontSize: "18px",
                color: "rgba(254,253,251,0.65)",
                lineHeight: 1.6,
                marginBottom: "40px",
              }}
            >
              Structured programs designed to accelerate growth for health and
              wellness leaders. Cohort-based. Data-driven. Community-powered.
            </p>
            <button className="btn btn--gold">Apply for a Program</button>
          </div>
        </div>
      </section>
      <section style={{ padding: "var(--section-pad) 0" }}>
        <div className="shell">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "24px",
            }}
            className="programs-grid"
          >
            {["Accelerator", "Mastermind", "Advisory"].map((name) => (
              <div key={name} className="card-impact">
                <span className="subtag" style={{ marginBottom: "16px", display: "block" }}>
                  Program
                </span>
                <h3
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 700,
                    fontSize: "22px",
                    letterSpacing: "-0.01em",
                    marginBottom: "12px",
                  }}
                >
                  {name}
                </h3>
                <p style={{ color: "var(--ink-soft)", fontSize: "15px", lineHeight: 1.6 }}>
                  Program details coming soon.
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <style>{`
        @media (max-width: 768px) {
          .programs-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </PublicLayout>
  );
}

/* ── ROADMAP ──────────────────────────────────────────────── */
export function Roadmap() {
  return (
    <PublicLayout
      title="Roadmap"
      description="The Impact platform roadmap — what we're building and what's coming next."
    >
      <section style={{ padding: "var(--section-pad) 0" }}>
        <div className="shell">
          <SectionHeader
            tag="Roadmap"
            headline="What we're building"
            description="A transparent look at the Impact platform roadmap. Updated regularly."
          />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              maxWidth: "680px",
            }}
          >
            {[
              { phase: "Foundation", status: "In Progress", label: "Platform foundation, design system, core routes" },
              { phase: "Content Engine", status: "Upcoming", label: "Insights, Reports, Podcast, Events publishing" },
              { phase: "Impact 100", status: "Upcoming", label: "First edition rankings and leader profiles" },
              { phase: "Community", status: "Planned", label: "Member profiles, forums, and networking" },
              { phase: "HubSpot Integration", status: "Planned", label: "Newsletter sync and CRM automation" },
            ].map((item) => (
              <div
                key={item.phase}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "24px",
                  padding: "24px",
                  background: "var(--paper-soft)",
                  border: "1px solid var(--paper-darker)",
                  borderRadius: "var(--radius-lg)",
                }}
              >
                <div
                  style={{
                    width: "10px",
                    height: "10px",
                    borderRadius: "50%",
                    background:
                      item.status === "In Progress"
                        ? "var(--gold)"
                        : item.status === "Upcoming"
                        ? "var(--ink-mute)"
                        : "var(--paper-deep, var(--paper-darker))",
                    marginTop: "5px",
                    flexShrink: 0,
                  }}
                />
                <div>
                  <div
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 700,
                      fontSize: "18px",
                      marginBottom: "4px",
                    }}
                  >
                    {item.phase}
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      fontWeight: 600,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color:
                        item.status === "In Progress"
                          ? "var(--gold)"
                          : "var(--ink-mute)",
                      marginBottom: "8px",
                    }}
                  >
                    {item.status}
                  </div>
                  <p style={{ fontSize: "15px", color: "var(--ink-soft)" }}>
                    {item.label}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}

/* ── ABOUT ────────────────────────────────────────────────── */
export function About() {
  return (
    <PublicLayout
      title="About Impact"
      description="About Impact — who we are, what we do, and why we exist."
    >
      <section style={{ padding: "var(--section-pad) 0" }}>
        <div className="shell">
          <div style={{ maxWidth: "680px" }}>
            <span className="tag" style={{ marginBottom: "28px" }}>
              About
            </span>
            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 800,
                fontSize: "clamp(32px, 4vw, 48px)",
                letterSpacing: "-0.03em",
                lineHeight: 1.0,
                marginBottom: "28px",
              }}
            >
              We exist to amplify the people building a healthier world.
            </h1>
            <p
              style={{
                fontSize: "18px",
                color: "var(--ink-soft)",
                lineHeight: 1.7,
                marginBottom: "24px",
              }}
            >
              Impact is the content and community platform for health and
              wellness leaders. We publish insights, rank the most influential
              voices, and build programs that accelerate growth.
            </p>
            <p
              style={{
                fontSize: "18px",
                color: "var(--ink-soft)",
                lineHeight: 1.7,
              }}
            >
              Our mission is simple: give the people doing the most important
              work in health and wellness the platform, data, and community they
              deserve.
            </p>
          </div>
        </div>
      </section>
      <section
        style={{
          padding: "var(--section-pad) 0",
          background: "var(--paper-soft)",
        }}
      >
        <div className="shell">
          <NewsletterCapture
            headline="Join the Impact community"
            description="Strategy, data, and frameworks for health and wellness leaders."
          />
        </div>
      </section>
    </PublicLayout>
  );
}

/* ── CONTACT ──────────────────────────────────────────────── */
export function Contact() {
  return (
    <PublicLayout
      title="Contact"
      description="Get in touch with the Impact team."
    >
      <section style={{ padding: "var(--section-pad) 0" }}>
        <div className="shell">
          <div style={{ maxWidth: "560px" }}>
            <span className="tag" style={{ marginBottom: "28px" }}>
              Contact
            </span>
            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 800,
                fontSize: "clamp(28px, 3.5vw, 44px)",
                letterSpacing: "-0.025em",
                lineHeight: 1.05,
                marginBottom: "24px",
              }}
            >
              Get in touch
            </h1>
            <p style={{ fontSize: "18px", color: "var(--ink-soft)", lineHeight: 1.6, marginBottom: "40px" }}>
              For editorial inquiries, partnership opportunities, or general
              questions, reach us at{" "}
              <a
                href="mailto:hello@impact.me"
                style={{ color: "var(--gold)", fontWeight: 600 }}
              >
                hello@impact.me
              </a>
            </p>
            <div
              style={{
                background: "var(--paper-soft)",
                border: "1px dashed var(--paper-darker)",
                borderRadius: "var(--radius-xl)",
                padding: "40px",
                textAlign: "center",
                color: "var(--ink-mute)",
                fontSize: "14px",
              }}
            >
              Contact form coming soon
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}

/* ── PRESS ────────────────────────────────────────────────── */
export function Press() {
  return (
    <PublicLayout
      title="Press"
      description="Impact press resources, media kit, and press inquiries."
    >
      <section style={{ padding: "var(--section-pad) 0" }}>
        <div className="shell">
          <div style={{ maxWidth: "680px" }}>
            <span className="tag" style={{ marginBottom: "28px" }}>
              Press
            </span>
            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 800,
                fontSize: "clamp(28px, 3.5vw, 44px)",
                letterSpacing: "-0.025em",
                lineHeight: 1.05,
                marginBottom: "24px",
              }}
            >
              Press &amp; Media
            </h1>
            <p style={{ fontSize: "18px", color: "var(--ink-soft)", lineHeight: 1.6, marginBottom: "40px" }}>
              For press inquiries, media kit requests, or interview requests,
              contact{" "}
              <a
                href="mailto:press@impact.me"
                style={{ color: "var(--gold)", fontWeight: 600 }}
              >
                press@impact.me
              </a>
            </p>
            <div
              style={{
                background: "var(--paper-soft)",
                border: "1px dashed var(--paper-darker)",
                borderRadius: "var(--radius-xl)",
                padding: "40px",
                textAlign: "center",
                color: "var(--ink-mute)",
                fontSize: "14px",
              }}
            >
              Media kit and press releases coming soon
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}

/* ── PRIVACY ──────────────────────────────────────────────── */
export function Privacy() {
  return (
    <PublicLayout
      title="Privacy Policy"
      description="Impact privacy policy — how we collect, use, and protect your data."
    >
      <section style={{ padding: "var(--section-pad) 0" }}>
        <div className="shell--narrow">
          <span className="tag" style={{ marginBottom: "28px" }}>
            Legal
          </span>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: "clamp(28px, 3.5vw, 40px)",
              letterSpacing: "-0.025em",
              marginBottom: "16px",
            }}
          >
            Privacy Policy
          </h1>
          <p style={{ color: "var(--ink-mute)", fontSize: "14px", marginBottom: "48px" }}>
            Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
          </p>
          <div
            style={{
              background: "var(--paper-soft)",
              border: "1px dashed var(--paper-darker)",
              borderRadius: "var(--radius-xl)",
              padding: "48px",
              color: "var(--ink-mute)",
              fontSize: "15px",
              lineHeight: 1.7,
            }}
          >
            Privacy policy content will be published here. For questions about
            your data, contact{" "}
            <a href="mailto:privacy@impact.me" style={{ color: "var(--gold)" }}>
              privacy@impact.me
            </a>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}

/* ── TERMS ────────────────────────────────────────────────── */
export function Terms() {
  return (
    <PublicLayout
      title="Terms of Service"
      description="Impact terms of service — the rules governing your use of impact.me."
    >
      <section style={{ padding: "var(--section-pad) 0" }}>
        <div className="shell--narrow">
          <span className="tag" style={{ marginBottom: "28px" }}>
            Legal
          </span>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: "clamp(28px, 3.5vw, 40px)",
              letterSpacing: "-0.025em",
              marginBottom: "16px",
            }}
          >
            Terms of Service
          </h1>
          <p style={{ color: "var(--ink-mute)", fontSize: "14px", marginBottom: "48px" }}>
            Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
          </p>
          <div
            style={{
              background: "var(--paper-soft)",
              border: "1px dashed var(--paper-darker)",
              borderRadius: "var(--radius-xl)",
              padding: "48px",
              color: "var(--ink-mute)",
              fontSize: "15px",
              lineHeight: 1.7,
            }}
          >
            Terms of service content will be published here. For questions,
            contact{" "}
            <a href="mailto:legal@impact.me" style={{ color: "var(--gold)" }}>
              legal@impact.me
            </a>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
