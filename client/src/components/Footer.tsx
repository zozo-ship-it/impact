import { Link } from "wouter";

const CONTENT_LINKS = [
  { label: "Insights", href: "/insights" },
  { label: "Reports", href: "/reports" },
  { label: "Podcast", href: "/podcast" },
  { label: "Events", href: "/events" },
  { label: "Case Studies", href: "/case-studies" },
  { label: "Impact 100", href: "/100" },
];

const COMPANY_LINKS = [
  { label: "Programs", href: "/programs" },
  { label: "Magazine", href: "/magazine" },
  { label: "Roadmap", href: "/roadmap" },
  { label: "About", href: "/about" },
  { label: "Press", href: "/press" },
  { label: "Contact", href: "/contact" },
];

const LEGAL_LINKS = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      style={{
        background: "var(--ink)",
        color: "var(--paper)",
        paddingTop: "64px",
        paddingBottom: "40px",
        borderTop: "1px solid rgba(254,253,251,0.08)",
      }}
    >
      <div className="shell">
        {/* Top row: wordmark + columns */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr 1fr",
            gap: "48px",
            marginBottom: "56px",
          }}
          className="footer-grid"
        >
          {/* Brand column */}
          <div>
            <div
              className="wordmark"
              style={{
                fontSize: "28px",
                color: "var(--paper)",
                marginBottom: "16px",
              }}
            >
              Impact
            </div>
            <p
              style={{
                fontSize: "14px",
                color: "rgba(254,253,251,0.55)",
                lineHeight: 1.6,
                maxWidth: "220px",
              }}
            >
              The content and community hub for health and wellness leaders.
            </p>
            <div style={{ marginTop: "24px" }}>
              <Link href="/programs">
                <button className="btn btn--gold btn--sm">
                  Grow with Impact
                </button>
              </Link>
            </div>
          </div>

          {/* Content links */}
          <div>
            <div
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "12px",
                fontWeight: 600,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "rgba(254,253,251,0.4)",
                marginBottom: "20px",
              }}
            >
              Content
            </div>
            <nav
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              {CONTENT_LINKS.map((link) => (
                <Link key={link.href} href={link.href}>
                  <span
                    style={{
                      fontSize: "14px",
                      color: "rgba(254,253,251,0.65)",
                      transition: "color 180ms",
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.color = "var(--paper)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color = "rgba(254,253,251,0.65)")
                    }
                  >
                    {link.label}
                  </span>
                </Link>
              ))}
            </nav>
          </div>

          {/* Company links */}
          <div>
            <div
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "12px",
                fontWeight: 600,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "rgba(254,253,251,0.4)",
                marginBottom: "20px",
              }}
            >
              Company
            </div>
            <nav
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              {COMPANY_LINKS.map((link) => (
                <Link key={link.href} href={link.href}>
                  <span
                    style={{
                      fontSize: "14px",
                      color: "rgba(254,253,251,0.65)",
                      transition: "color 180ms",
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.color = "var(--paper)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color = "rgba(254,253,251,0.65)")
                    }
                  >
                    {link.label}
                  </span>
                </Link>
              ))}
            </nav>
          </div>

          {/* Newsletter teaser */}
          <div>
            <div
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "12px",
                fontWeight: 600,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "rgba(254,253,251,0.4)",
                marginBottom: "20px",
              }}
            >
              Stay in the loop
            </div>
            <p
              style={{
                fontSize: "14px",
                color: "rgba(254,253,251,0.55)",
                lineHeight: 1.6,
                marginBottom: "16px",
              }}
            >
              Strategy, data, and frameworks for health and wellness leaders.
            </p>
            <div style={{ display: "flex", gap: "8px" }}>
              <input
                type="email"
                placeholder="your@email.com"
                style={{
                  flex: 1,
                  background: "rgba(254,253,251,0.08)",
                  border: "1px solid rgba(254,253,251,0.15)",
                  borderRadius: "var(--radius-full)",
                  padding: "10px 16px",
                  fontFamily: "var(--font-sans)",
                  fontSize: "13px",
                  color: "var(--paper)",
                  outline: "none",
                  minWidth: 0,
                }}
              />
              <button className="btn btn--gold btn--sm">→</button>
            </div>
          </div>
        </div>

        {/* Bottom row: legal + copyright */}
        <div
          style={{
            borderTop: "1px solid rgba(254,253,251,0.08)",
            paddingTop: "28px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <p
            style={{
              fontSize: "13px",
              color: "rgba(254,253,251,0.35)",
            }}
          >
            © {year} Impact. All rights reserved. impact.me
          </p>
          <div style={{ display: "flex", gap: "24px" }}>
            {LEGAL_LINKS.map((link) => (
              <Link key={link.href} href={link.href}>
                <span
                  style={{
                    fontSize: "13px",
                    color: "rgba(254,253,251,0.35)",
                    transition: "color 180ms",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = "rgba(254,253,251,0.65)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = "rgba(254,253,251,0.35)")
                  }
                >
                  {link.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr !important;
          }
        }
        @media (max-width: 560px) {
          .footer-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </footer>
  );
}
