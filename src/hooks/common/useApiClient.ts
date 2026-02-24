import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { request } from "../../services/apiClient";

export function useApiClient() {
  const { token } = useContext(AuthContext);

  return {
    get: <T>(endpoint: string) =>
      request<T>(endpoint, token),

    post: <T>(endpoint: string, body?: any) =>
      request<T>(endpoint, token, {
        method: "POST",
        body,
      }),

    put: <T>(endpoint: string, body?: any) =>
      request<T>(endpoint, token, {
        method: "PUT",
        body,
      }),

    patch: <T>(endpoint: string, body?: any) =>
      request<T>(endpoint, token, {
        method: "PATCH",
        body,
      }),

    delete: <T>(endpoint: string) =>
      request<T>(endpoint, token, {
        method: "DELETE",
      }),
  };
}