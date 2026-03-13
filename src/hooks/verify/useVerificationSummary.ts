// hooks/useVerificationSummary.ts
import { useEffect, useState } from "react";
import { useApiClient } from "../common/useApiClient";

export function useVerificationSummary() {
  const api = useApiClient();
  const [data, setData] = useState<{
    currentTier: number;
    expiresAt: string | null;
  } | null>(null);

  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const result = await api.get("/verify/summary");
      setData(result as { currentTier: number; expiresAt: string | null } | null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return { data, loading, reload: load };
}