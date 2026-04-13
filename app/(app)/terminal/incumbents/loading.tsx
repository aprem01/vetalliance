export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-52 rounded bg-muted/30" />
      <div className="rounded-lg border border-border">
        <div className="h-10 border-b border-border bg-muted/10" />
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="h-12 border-b border-border bg-muted/20" />
        ))}
      </div>
    </div>
  );
}
