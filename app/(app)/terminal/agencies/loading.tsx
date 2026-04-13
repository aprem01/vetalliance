export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-64 rounded bg-muted/30" />
      <div className="h-5 w-40 rounded bg-muted/30" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-28 rounded-lg border border-border bg-muted/20" />
        ))}
      </div>
      <div className="h-5 w-40 rounded bg-muted/30" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 rounded-lg border border-border bg-muted/20" />
        ))}
      </div>
    </div>
  );
}
