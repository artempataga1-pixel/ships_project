export function GoldDivider({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <div className="h-px flex-1 bg-border" />
      <div className="w-2 h-2 rotate-45 bg-gold shrink-0" />
      <div className="h-px flex-1 bg-border" />
    </div>
  );
}
