import Navigation from "./Navigation";
import Footer from "./Footer";

interface PublicLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  ogImage?: string;
}

/**
 * PublicLayout — wraps every public-facing page with the
 * persistent top nav, footer, and Open Graph meta injection.
 */
export default function PublicLayout({
  children,
  title,
  description,
  ogImage,
}: PublicLayoutProps) {
  const pageTitle = title ? `${title} | Impact` : "Impact";
  const pageDesc =
    description ||
    "Impact — the content and community hub for health and wellness leaders.";

  // Update document meta
  if (typeof document !== "undefined") {
    document.title = pageTitle;
    const setMeta = (name: string, content: string, prop = false) => {
      const selector = prop
        ? `meta[property="${name}"]`
        : `meta[name="${name}"]`;
      let el = document.querySelector(selector) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        if (prop) el.setAttribute("property", name);
        else el.setAttribute("name", name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };
    setMeta("description", pageDesc);
    setMeta("og:title", pageTitle, true);
    setMeta("og:description", pageDesc, true);
    if (ogImage) setMeta("og:image", ogImage, true);
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "var(--paper)",
      }}
    >
      <Navigation />
      <main style={{ flex: 1 }}>{children}</main>
      <Footer />
    </div>
  );
}
