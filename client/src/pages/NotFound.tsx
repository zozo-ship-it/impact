import { Link } from "wouter";
import PublicLayout from "@/components/PublicLayout";

export default function NotFound() {
  return (
    <PublicLayout title="Page Not Found" description="The page you're looking for doesn't exist.">
      <section
        style={{
          padding: "120px 0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center", maxWidth: "480px", padding: "0 24px" }}>
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 900,
              fontStyle: "italic",
              fontSize: "120px",
              lineHeight: 1,
              letterSpacing: "-0.05em",
              color: "var(--paper-darker)",
              marginBottom: "24px",
              userSelect: "none",
            }}
          >
            404
          </div>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: "28px",
              letterSpacing: "-0.02em",
              marginBottom: "16px",
            }}
          >
            Page not found
          </h1>
          <p
            style={{
              fontSize: "16px",
              color: "var(--ink-soft)",
              lineHeight: 1.6,
              marginBottom: "40px",
            }}
          >
            The page you're looking for doesn't exist or has been moved.
          </p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/">
              <button className="btn btn--ink">Back to Impact</button>
            </Link>
            <Link href="/insights">
              <button className="btn btn--outline">Explore Insights</button>
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
