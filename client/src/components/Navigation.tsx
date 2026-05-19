import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X } from "lucide-react";

const NAV_LINKS = [
  { label: "Insights", href: "/insights" },
  { label: "Reports", href: "/reports" },
  { label: "Podcast", href: "/podcast" },
  { label: "Events", href: "/events" },
  { label: "Impact 100", href: "/100" },
  { label: "Programs", href: "/programs" },
];

export default function Navigation() {
  const [location] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  return (
    <>
      <nav
        className="nav-impact"
        style={{
          boxShadow: scrolled ? "var(--shadow-default)" : "none",
          transition: "box-shadow 200ms",
        }}
      >
        <div
          style={{
            maxWidth: "var(--shell-max)",
            margin: "0 auto",
            padding: "0 var(--shell-pad)",
            height: "64px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "32px",
          }}
        >
          {/* Wordmark */}
          <Link href="/">
            <span
              className="wordmark"
              style={{ fontSize: "24px", cursor: "pointer" }}
            >
              Impact
            </span>
          </Link>

          {/* Desktop nav links */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "28px",
              flex: 1,
              justifyContent: "center",
            }}
            className="hidden-mobile"
          >
            {NAV_LINKS.map((link) => {
              const isActive =
                link.href === "/"
                  ? location === "/"
                  : location.startsWith(link.href);
              return (
                <Link key={link.href} href={link.href}>
                  <span
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: "14px",
                      fontWeight: 500,
                      color: isActive ? "var(--ink)" : "var(--ink-mute)",
                      transition: "color 180ms",
                      cursor: "pointer",
                      borderBottom: isActive
                        ? "2px solid var(--gold)"
                        : "2px solid transparent",
                      paddingBottom: "2px",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.color = "var(--ink)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color = isActive
                        ? "var(--ink)"
                        : "var(--ink-mute)")
                    }
                  >
                    {link.label}
                  </span>
                </Link>
              );
            })}
          </div>

          {/* CTA + burger */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <Link href="/programs" className="hidden-mobile">
              <button className="btn btn--gold btn--sm">
                Grow with Impact
              </button>
            </Link>

            {/* Mobile burger */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="show-mobile"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "8px",
                color: "var(--ink)",
                display: "none",
              }}
              aria-label="Toggle menu"
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile overlay menu */}
      {menuOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 99,
            background: "var(--paper)",
            paddingTop: "64px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              padding: "32px var(--shell-pad)",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              flex: 1,
            }}
          >
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href}>
                <span
                  style={{
                    display: "block",
                    fontFamily: "var(--font-display)",
                    fontWeight: 700,
                    fontSize: "24px",
                    letterSpacing: "-0.02em",
                    color: "var(--ink)",
                    padding: "12px 0",
                    borderBottom: "1px solid var(--paper-darker)",
                    cursor: "pointer",
                  }}
                >
                  {link.label}
                </span>
              </Link>
            ))}
            <div style={{ marginTop: "32px" }}>
              <Link href="/programs">
                <button
                  className="btn btn--gold"
                  style={{ width: "100%", justifyContent: "center" }}
                >
                  Grow with Impact
                </button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Spacer to push content below fixed nav */}
      <div style={{ height: "64px" }} />

      <style>{`
        @media (max-width: 768px) {
          .hidden-mobile { display: none !important; }
          .show-mobile { display: flex !important; }
        }
        @media (min-width: 769px) {
          .show-mobile { display: none !important; }
          .hidden-mobile { display: flex !important; }
        }
      `}</style>
    </>
  );
}
