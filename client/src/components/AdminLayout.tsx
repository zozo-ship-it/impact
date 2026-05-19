import { Link, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import {
  LayoutDashboard,
  FileText,
  Trophy,
  Users,
  Settings,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const ADMIN_NAV = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard, exact: true },
  { label: "Content", href: "/admin/content", icon: FileText },
  { label: "Impact 100", href: "/admin/impact100", icon: Trophy },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
}

/**
 * AdminLayout — protected admin shell with sidebar navigation.
 * Only renders for users with role === "admin".
 * Redirects to login if unauthenticated.
 */
export default function AdminLayout({ children, title }: AdminLayoutProps) {
  const { user, loading } = useAuth();
  const [location] = useLocation();

  const logout = trpc.auth.logout.useMutation({
    onSuccess: () => {
      window.location.href = "/";
    },
    onError: () => {
      toast.error("Logout failed. Please try again.");
    },
  });

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--paper-soft)",
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 900,
            fontStyle: "italic",
            fontSize: "24px",
            color: "var(--ink-mute)",
            letterSpacing: "-0.045em",
          }}
        >
          Impact
        </div>
      </div>
    );
  }

  if (!user) {
    window.location.href = getLoginUrl();
    return null;
  }

  if (user.role !== "admin") {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--paper-soft)",
          flexDirection: "column",
          gap: "16px",
          padding: "24px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontSize: "32px",
            letterSpacing: "-0.025em",
            color: "var(--ink)",
          }}
        >
          Access Denied
        </div>
        <p style={{ color: "var(--ink-soft)", fontSize: "16px" }}>
          You need admin privileges to access this area.
        </p>
        <Link href="/">
          <button className="btn btn--ink">Back to Impact</button>
        </Link>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar */}
      <aside className="admin-sidebar">
        {/* Wordmark */}
        <div
          style={{
            padding: "24px 20px",
            borderBottom: "1px solid rgba(254,253,251,0.08)",
          }}
        >
          <Link href="/">
            <span
              className="wordmark"
              style={{
                fontSize: "22px",
                color: "var(--paper)",
                cursor: "pointer",
              }}
            >
              Impact
            </span>
          </Link>
          <div
            style={{
              marginTop: "4px",
              fontSize: "11px",
              fontWeight: 600,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "rgba(254,253,251,0.3)",
            }}
          >
            Admin
          </div>
        </div>

        {/* Nav items */}
        <nav
          style={{
            flex: 1,
            padding: "16px 12px",
            display: "flex",
            flexDirection: "column",
            gap: "4px",
          }}
        >
          {ADMIN_NAV.map((item) => {
            const isActive = item.exact
              ? location === item.href
              : location.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link key={item.href} href={item.href}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "10px 12px",
                    borderRadius: "var(--radius-md)",
                    cursor: "pointer",
                    background: isActive
                      ? "rgba(196,153,61,0.15)"
                      : "transparent",
                    color: isActive ? "var(--gold-bright)" : "rgba(254,253,251,0.6)",
                    transition: "all 180ms",
                    fontSize: "14px",
                    fontWeight: isActive ? 600 : 400,
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive)
                      e.currentTarget.style.background =
                        "rgba(254,253,251,0.06)";
                    if (!isActive)
                      e.currentTarget.style.color = "var(--paper)";
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive)
                      e.currentTarget.style.background = "transparent";
                    if (!isActive)
                      e.currentTarget.style.color = "rgba(254,253,251,0.6)";
                  }}
                >
                  <Icon size={16} />
                  <span style={{ flex: 1 }}>{item.label}</span>
                  {isActive && (
                    <ChevronRight size={14} style={{ opacity: 0.5 }} />
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* User + logout */}
        <div
          style={{
            padding: "16px 12px",
            borderTop: "1px solid rgba(254,253,251,0.08)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "8px 12px",
              marginBottom: "8px",
            }}
          >
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                background: "rgba(196,153,61,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "13px",
                fontWeight: 700,
                color: "var(--gold-bright)",
                flexShrink: 0,
              }}
            >
              {user.name ? user.name.charAt(0).toUpperCase() : "A"}
            </div>
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "var(--paper)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {user.name || "Admin"}
              </div>
              <div
                style={{
                  fontSize: "11px",
                  color: "rgba(254,253,251,0.4)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {user.email || "admin"}
              </div>
            </div>
          </div>

          <button
            onClick={() => logout.mutate()}
            disabled={logout.isPending}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              width: "100%",
              padding: "8px 12px",
              background: "none",
              border: "none",
              borderRadius: "var(--radius-md)",
              cursor: "pointer",
              fontSize: "13px",
              color: "rgba(254,253,251,0.4)",
              transition: "all 180ms",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(184,66,51,0.12)";
              e.currentTarget.style.color = "var(--error)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "none";
              e.currentTarget.style.color = "rgba(254,253,251,0.4)";
            }}
          >
            <LogOut size={14} />
            {logout.isPending ? "Signing out…" : "Sign out"}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="admin-content">
        {title && (
          <div
            style={{
              padding: "32px 40px 0",
              borderBottom: "1px solid var(--paper-darker)",
              paddingBottom: "24px",
              marginBottom: "32px",
            }}
          >
            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 800,
                fontSize: "28px",
                letterSpacing: "-0.02em",
                color: "var(--ink)",
              }}
            >
              {title}
            </h1>
          </div>
        )}
        <div style={{ padding: title ? "0 40px 40px" : "32px 40px" }}>
          {children}
        </div>
      </main>
    </div>
  );
}
