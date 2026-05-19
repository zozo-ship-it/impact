import PlaceholderPage from "@/components/PlaceholderPage";

export function EventsIndex() {
  return (
    <PlaceholderPage
      tag="Events"
      title="Events"
      description="Summits, workshops, and gatherings for health and wellness leaders."
    />
  );
}

export function EventDetail({ params }: { params: { slug: string } }) {
  return (
    <PlaceholderPage
      tag="Event"
      title={`Event: ${params.slug}`}
      description="This event page will be available once published."
      note={`Slug: ${params.slug}`}
    />
  );
}
