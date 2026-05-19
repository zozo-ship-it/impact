import { Link } from "wouter";

interface ContentCardProps {
  subtag?: string;
  title: string;
  excerpt?: string;
  meta?: string;
  href?: string;
  dark?: boolean;
  featuredImageUrl?: string;
}

/**
 * ContentCard — Impact design system card component.
 * Used for Insights, Reports, Podcast episodes, Events, Case Studies.
 */
export default function ContentCard({
  subtag,
  title,
  excerpt,
  meta,
  href,
  dark = false,
  featuredImageUrl,
}: ContentCardProps) {
  const cardContent = (
    <div
      className={`card-impact${dark ? " card-impact--dark" : ""}`}
      style={{ cursor: href ? "pointer" : "default", height: "100%" }}
    >
      {featuredImageUrl && (
        <div
          style={{
            width: "100%",
            height: "180px",
            borderRadius: "var(--radius-lg)",
            overflow: "hidden",
            marginBottom: "20px",
            background: "var(--paper-deeper)",
          }}
        >
          <img
            src={featuredImageUrl}
            alt={title}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            loading="lazy"
          />
        </div>
      )}

      {subtag && (
        <div style={{ marginBottom: "16px" }}>
          <span className={dark ? "subtag" : "subtag"} style={dark ? { color: "var(--gold-bright)" } : {}}>
            {subtag}
          </span>
        </div>
      )}

      <h3
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          fontSize: "20px",
          letterSpacing: "-0.01em",
          lineHeight: 1.2,
          marginBottom: excerpt ? "14px" : "0",
          color: dark ? "var(--paper)" : "var(--ink)",
        }}
      >
        {title}
      </h3>

      {excerpt && (
        <p
          style={{
            fontSize: "16px",
            color: dark ? "rgba(254,253,251,0.6)" : "var(--ink-soft)",
            lineHeight: 1.6,
            marginBottom: meta ? "20px" : "0",
          }}
        >
          {excerpt}
        </p>
      )}

      {meta && (
        <p
          style={{
            fontSize: "14px",
            color: dark ? "rgba(254,253,251,0.4)" : "var(--ink-mute)",
          }}
        >
          {meta}
        </p>
      )}
    </div>
  );

  if (href) {
    return <Link href={href}>{cardContent}</Link>;
  }

  return cardContent;
}
