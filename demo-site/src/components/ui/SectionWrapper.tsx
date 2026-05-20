interface SectionWrapperProps {
  id?: string;
  className?: string;
  children: React.ReactNode;
  dark?: boolean;
}

export function SectionWrapper({
  id,
  className = "",
  children,
  dark = false,
}: SectionWrapperProps) {
  return (
    <section
      id={id}
      className={`py-24 min-h-screen flex flex-col justify-center ${dark ? "bg-charcoal text-white" : "bg-background"} ${className}`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">{children}</div>
    </section>
  );
}
