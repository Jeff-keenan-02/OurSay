import { useCallback, useEffect, useState } from "react";
import { PollGroup } from "../../types/PollGroup";
import { useApiClient } from "../common/useApiClient";

export function usePollGroups(topicId: number | null) {
  const [data, setData] = useState<PollGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const api = useApiClient();

  const reload = useCallback(async () => {
    if (!topicId) {
      setData([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const json = await api.get<PollGroup[]>(
        `/poll/topics/${topicId}/groups`
      );

      setData(Array.isArray(json) ? json : []);
    } catch (err: any) {
      setError(err.message || "Could not load poll groups");
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [topicId]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { data, loading, error, reload };
}