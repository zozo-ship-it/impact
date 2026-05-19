import AdminLayout from "@/components/AdminLayout";
import StatCard from "@/components/StatCard";

export default function AdminDashboard() {
  return (
    <AdminLayout title="Dashboard">
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "20px",
          marginBottom: "40px",
        }}
        className="admin-stats-grid"
      >
        <StatCard label="Newsletter leads" value="—" />
        <StatCard label="Content items" value="—" />
        <StatCard label="Impact 100 leaders" value="—" />
        <StatCard label="Registered users" value="—" />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "24px",
        }}
        className="admin-panels-grid"
      >
        <div
          style={{
            background: "var(--white)",
            border: "1px solid var(--paper-darker)",
            borderRadius: "var(--radius-xl)",
            padding: "28px",
          }}
        >
          <h3
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: "18px",
              marginBottom: "20px",
            }}
          >
            Recent newsletter signups
          </h3>
          <div
            style={{
              color: "var(--ink-mute)",
              fontSize: "14px",
              padding: "32px",
              textAlign: "center",
              background: "var(--paper-soft)",
              borderRadius: "var(--radius-lg)",
            }}
          >
            No signups yet
          </div>
        </div>

        <div
          style={{
            background: "var(--white)",
            border: "1px solid var(--paper-darker)",
            borderRadius: "var(--radius-xl)",
            padding: "28px",
          }}
        >
          <h3
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: "18px",
              marginBottom: "20px",
            }}
          >
            Quick actions
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {[
              "Publish new Insight",
              "Add Impact 100 leader",
              "Create new Event",
              "View newsletter leads",
            ].map((action) => (
              <button
                key={action}
                style={{
                  background: "var(--paper-soft)",
                  border: "1px solid var(--paper-darker)",
                  borderRadius: "var(--radius-md)",
                  padding: "12px 16px",
                  textAlign: "left",
                  fontSize: "14px",
                  color: "var(--ink-soft)",
                  cursor: "pointer",
                  transition: "all 180ms",
                  fontFamily: "var(--font-sans)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--paper-darker)";
                  e.currentTarget.style.color = "var(--ink)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "var(--paper-soft)";
                  e.currentTarget.style.color = "var(--ink-soft)";
                }}
                onClick={() => {
                  const { toast } = require("sonner");
                  toast.info("Feature coming soon");
                }}
              >
                {action}
              </button>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .admin-stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .admin-panels-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </AdminLayout>
  );
}
