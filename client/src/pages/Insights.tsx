import PlaceholderPage from "@/components/PlaceholderPage";

export function InsightsIndex() {
  return (
    <PlaceholderPage
      tag="Insights"
      title="Insights"
      description="Analysis, strategy, and perspective for health and wellness leaders navigating what's next."
    />
  );
}

export function InsightDetail({ params }: { params: { slug: string } }) {
  return (
    <PlaceholderPage
      tag="Insight"
      title={`Insight: ${params.slug}`}
      description="This insight article will be available once content is published."
      note={`Slug: ${params.slug}`}
    />
  );
}
