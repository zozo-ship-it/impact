interface TagProps {
  children: React.ReactNode;
  dark?: boolean;
}

/**
 * Tag — Impact design system pill tag.
 * Gold pill background. Used above section headings (one per section).
 */
export function Tag({ children, dark = false }: TagProps) {
  return (
    <span className={dark ? "tag tag--dark" : "tag"}>{children}</span>
  );
}

/**
 * SubTag — Impact design system text-only label.
 * Gold text, no background. Used inside cards and sub-elements.
 */
export function SubTag({
  children,
  dark = false,
}: {
  children: React.ReactNode;
  dark?: boolean;
}) {
  return (
    <span
      className="subtag"
      style={dark ? { color: "var(--gold-bright)" } : {}}
    >
      {children}
    </span>
  );
}
