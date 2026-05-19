import PlaceholderPage from "@/components/PlaceholderPage";

export function PodcastIndex() {
  return (
    <PlaceholderPage
      tag="Podcast"
      title="Podcast"
      description="Conversations with the leaders, founders, and thinkers shaping health and wellness."
    />
  );
}

export function PodcastEpisode({ params }: { params: { slug: string } }) {
  return (
    <PlaceholderPage
      tag="Episode"
      title={`Episode: ${params.slug}`}
      description="This podcast episode will be available once published."
      note={`Slug: ${params.slug}`}
    />
  );
}
