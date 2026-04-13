export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-48 rounded bg-muted/30" />
      <div className="h-36 rounded-lg border border-border bg-muted/20" />
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-40 rounded-lg border border-border bg-muted/20" />
        ))}
      </div>
    </div>
  );
}
