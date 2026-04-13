import * as React from "react";
import { cn } from "@/lib/utils";

export function Progress({ value = 0, max = 100, className, barClassName }: { value?: number; max?: number; className?: string; barClassName?: string }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-navy-700", className)}>
      <div className={cn("h-full bg-gold-500 transition-all", barClassName)} style={{ width: `${pct}%` }} />
    </div>
  );
}
