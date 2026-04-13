import { fetchActiveOpportunities } from "@/lib/external/sam";
import { OpportunitiesClient } from "./opportunities-client";

export const revalidate = 1800;

export default async function OpportunitiesPage() {
  const { opportunities, mocked, source } = await fetchActiveOpportunities({ limit: 100 });
  return (
    <OpportunitiesClient
      opportunities={opportunities}
      mocked={mocked}
      source={source}
    />
  );
}
