export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-60 rounded bg-muted/30" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 rounded-lg border border-border bg-muted/20" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-36 rounded-lg border border-border bg-muted/20" />
          ))}
        </div>
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-28 rounded-lg border border-border bg-muted/20" />
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-40 rounded-lg border border-border bg-muted/20" />
        <div className="h-40 rounded-lg border border-border bg-muted/20" />
      </div>
    </div>
  );
}
