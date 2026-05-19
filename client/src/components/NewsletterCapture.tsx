import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface NewsletterCaptureProps {
  dark?: boolean;
  headline?: string;
  description?: string;
  compact?: boolean;
}

/**
 * NewsletterCapture — Impact newsletter signup form.
 * Stores leads in the database with HubSpot-ready fields.
 * No live HubSpot sync is wired at this stage.
 */
export default function NewsletterCapture({
  dark = false,
  headline = "Stay in the loop",
  description = "Strategy, data, and frameworks for health and wellness leaders. No noise.",
  compact = false,
}: NewsletterCaptureProps) {
  const [email, setEmail] = useState("");

  const subscribe = trpc.newsletter.subscribe.useMutation({
    onSuccess: () => {
      toast.success("You're in! Check your inbox.");
      setEmail("");
    },
    onError: (err) => {
      toast.error(err.message || "Something went wrong. Please try again.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    subscribe.mutate({ email: email.trim() });
  };

  const textColor = dark ? "var(--paper)" : "var(--ink)";
  const descColor = dark ? "rgba(254,253,251,0.6)" : "var(--ink-soft)";

  if (compact) {
    return (
      <form onSubmit={handleSubmit} style={{ display: "flex", gap: "8px" }}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          disabled={subscribe.isPending}
          style={{
            flex: 1,
            background: dark ? "rgba(254,253,251,0.08)" : "var(--paper-soft)",
            border: `1px solid ${dark ? "rgba(254,253,251,0.15)" : "var(--paper-darker)"}`,
            borderRadius: "var(--radius-full)",
            padding: "12px 20px",
            fontFamily: "var(--font-sans)",
            fontSize: "14px",
            color: dark ? "var(--paper)" : "var(--ink)",
            outline: "none",
            minWidth: 0,
          }}
        />
        <button
          type="submit"
          disabled={subscribe.isPending}
          className="btn btn--gold btn--sm"
          style={{ flexShrink: 0 }}
        >
          {subscribe.isPending ? "..." : "Subscribe"}
        </button>
      </form>
    );
  }

  return (
    <div>
      {headline && (
        <h3
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontSize: "clamp(24px, 3vw, 36px)",
            letterSpacing: "-0.025em",
            lineHeight: 1.05,
            color: textColor,
            marginBottom: "16px",
          }}
        >
          {headline}
        </h3>
      )}
      {description && (
        <p
          style={{
            fontSize: "18px",
            color: descColor,
            lineHeight: 1.6,
            marginBottom: "32px",
            maxWidth: "52ch",
          }}
        >
          {description}
        </p>
      )}
      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          gap: "12px",
          maxWidth: "480px",
          flexWrap: "wrap",
        }}
      >
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          disabled={subscribe.isPending}
          style={{
            flex: 1,
            minWidth: "200px",
            background: dark ? "var(--white)" : "var(--paper-soft)",
            border: `1px solid ${dark ? "var(--paper-darker)" : "var(--paper-darker)"}`,
            borderRadius: "var(--radius-full)",
            padding: "14px 24px",
            fontFamily: "var(--font-sans)",
            fontSize: "14px",
            color: "var(--ink)",
            outline: "none",
            transition: "border-color 180ms",
          }}
          onFocus={(e) => (e.target.style.borderColor = "var(--gold)")}
          onBlur={(e) => (e.target.style.borderColor = "var(--paper-darker)")}
        />
        <button
          type="submit"
          disabled={subscribe.isPending}
          className="btn btn--gold"
        >
          {subscribe.isPending ? "Subscribing…" : "Subscribe"}
        </button>
      </form>
    </div>
  );
}
