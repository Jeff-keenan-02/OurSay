import { useState, useCallback } from "react";
import { useApiClient } from "../common/useApiClient";

export function useChangePassword() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const api = useApiClient();

  const changePassword = useCallback(
    async (currentPassword: string, newPassword: string): Promise<boolean> => {
      try {
        setLoading(true);
        setError(null);

        await api.patch<{ message: string }>("/auth/change-password", {
          currentPassword,
          newPassword,
        });

        return true;
      } catch (err: any) {
        setError(err.message || "Failed to change password");
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { changePassword, loading, error };
}
