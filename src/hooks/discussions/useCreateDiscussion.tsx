import { useState } from "react";
import { useApiClient } from "../common/useApiClient";

export function useCreateDiscussion() {
  const api = useApiClient();

  const [loading, setLoading] = useState(false);

  const createDiscussion = async (
    title: string,
    body: string
  ): Promise<{ id: number }> => {
    if (!title.trim() || !body.trim()) {
      throw new Error("Title and body are required");
    }

    try {
      setLoading(true);

      const data = await api.post<{ id: number }>(
        "/discussions",
        {
          title: title.trim(),
          body: body.trim(),
        }
      );

      return data;

    } finally {
      setLoading(false);
    }
  };

  return {
    createDiscussion,
    loading,
  };
}