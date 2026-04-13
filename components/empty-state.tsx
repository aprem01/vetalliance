import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className,
  tone = "muted",
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
  tone?: "muted" | "warning";
}) {
  return (
    <div
      className={cn(
        "rounded-lg border border-dashed px-6 py-10 text-center",
        tone === "warning"
          ? "border-amber-500/40 bg-amber-500/5"
          : "border-border bg-navy-950/50",
        className
      )}
    >
      <div
        className={cn(
          "mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full border",
          tone === "warning"
            ? "border-amber-500/40 bg-amber-500/10 text-amber-300"
            : "border-gold-500/30 bg-gold-500/10 text-gold-300"
        )}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div className="text-sm font-semibold text-foreground">{title}</div>
      {description && (
        <p className="mt-1 text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}
