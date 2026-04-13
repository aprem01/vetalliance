import { MUNICIPALITIES } from "@/lib/seed/municipal";
import { MunicipalClient } from "./client";

export default function MunicipalPage() {
  const total = MUNICIPALITIES.reduce((s, m) => s + m.annualProcurementSpend, 0);
  const withPreference = MUNICIPALITIES.filter((m) => m.hasVeteranPreference).length;
  return (
    <MunicipalClient
      cities={MUNICIPALITIES}
      summary={{
        totalSpend: total,
        withPreference,
        totalCities: MUNICIPALITIES.length,
      }}
    />
  );
}
