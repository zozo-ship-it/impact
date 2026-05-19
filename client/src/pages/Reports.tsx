import PlaceholderPage from "@/components/PlaceholderPage";

export function ReportsIndex() {
  return (
    <PlaceholderPage
      tag="Reports"
      title="Reports"
      description="In-depth research and data reports for health and wellness industry leaders."
    />
  );
}

export function ReportDetail({ params }: { params: { slug: string } }) {
  return (
    <PlaceholderPage
      tag="Report"
      title={`Report: ${params.slug}`}
      description="This report will be available once published."
      note={`Slug: ${params.slug}`}
    />
  );
}
