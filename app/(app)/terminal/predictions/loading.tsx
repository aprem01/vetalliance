export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-56 rounded bg-muted/30" />
      <div className="h-4 w-3/4 rounded bg-muted/30" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-72 rounded-lg border border-border bg-muted/20" />
        ))}
      </div>
    </div>
  );
}
