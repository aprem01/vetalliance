import { cn } from "@/lib/utils";

export function ScoreGauge({ score, size = "md" }: { score: number; size?: "sm" | "md" | "lg" }) {
  const color =
    score >= 80 ? "text-emerald-400 border-emerald-500/60" :
    score >= 60 ? "text-gold-400 border-gold-500/60" :
    "text-amber-400 border-amber-500/60";
  const sizes = {
    sm: "h-10 w-10 text-xs",
    md: "h-14 w-14 text-base",
    lg: "h-20 w-20 text-2xl",
  };
  return (
    <div className={cn("relative rounded-full border-2 flex items-center justify-center font-bold", sizes[size], color)}>
      {score}
      <span className="absolute -bottom-4 text-[9px] uppercase tracking-wider text-muted-foreground">AI Fit</span>
    </div>
  );
}
