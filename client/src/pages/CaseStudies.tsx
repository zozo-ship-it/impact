import PlaceholderPage from "@/components/PlaceholderPage";

export function CaseStudiesIndex() {
  return (
    <PlaceholderPage
      tag="Case Studies"
      title="Case Studies"
      description="Real-world stories of growth, transformation, and impact from leaders in health and wellness."
    />
  );
}

export function CaseStudyDetail({ params }: { params: { slug: string } }) {
  return (
    <PlaceholderPage
      tag="Case Study"
      title={`Case Study: ${params.slug}`}
      description="This case study will be available once published."
      note={`Slug: ${params.slug}`}
    />
  );
}
