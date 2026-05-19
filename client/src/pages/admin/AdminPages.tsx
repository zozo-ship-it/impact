import AdminLayout from "@/components/AdminLayout";

function AdminPlaceholder({ title, description }: { title: string; description: string }) {
  return (
    <AdminLayout title={title}>
      <div
        style={{
          background: "var(--white)",
          border: "1px dashed var(--paper-darker)",
          borderRadius: "var(--radius-xl)",
          padding: "64px",
          textAlign: "center",
          color: "var(--ink-mute)",
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: "20px",
            color: "var(--ink-soft)",
            marginBottom: "12px",
          }}
        >
          {title}
        </div>
        <p style={{ fontSize: "15px", lineHeight: 1.6 }}>{description}</p>
      </div>
    </AdminLayout>
  );
}

export function AdminContent() {
  return (
    <AdminPlaceholder
      title="Content Management"
      description="Manage Insights, Reports, Podcast episodes, Events, and Case Studies. Publishing tools coming soon."
    />
  );
}

export function AdminImpact100() {
  return (
    <AdminPlaceholder
      title="Impact 100"
      description="Manage Impact 100 rankings, leader profiles, and monthly editions. Bright Data integration fields are ready in the schema."
    />
  );
}

export function AdminUsers() {
  return (
    <AdminPlaceholder
      title="Users"
      description="View and manage registered users. Promote users to admin via the database panel."
    />
  );
}

export function AdminSettings() {
  return (
    <AdminPlaceholder
      title="Settings"
      description="Site-wide settings, SEO defaults, and integration configuration."
    />
  );
}
