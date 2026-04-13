import { STATE_MANDATES, ACTIVE_STATE_MANDATES } from "@/lib/seed/state-mandates";
import { StateMandateTracker } from "./state-mandate-tracker";

export default function StateMarketsPage() {
  const active = ACTIVE_STATE_MANDATES.filter((s) => (s.mandatePercent || 0) > 0);
  const strongest = active.reduce<{ code: string; name: string; pct: number } | null>(
    (best, s) => {
      const pct = s.mandatePercent || 0;
      if (!best || pct > best.pct) return { code: s.code, name: s.name, pct };
      return best;
    },
    null
  );

  // Estimated addressable state-level spend: $100B * (active / 50).
  const estimatedAddressable = Math.round(100_000_000_000 * (ACTIVE_STATE_MANDATES.length / 50));

  return (
    <StateMandateTracker
      states={STATE_MANDATES}
      summary={{
        activeCount: ACTIVE_STATE_MANDATES.length,
        strongest,
        estimatedAddressable,
      }}
    />
  );
}
