// src/services/apiClient.ts

import { API_BASE_URL } from "../config/api";


/* =====================================================
   Types
===================================================== */

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: any;
  headers?: Record<string, string>;
};

/* =====================================================
   Core Request Function
===================================================== */

export async function request<T>(
  endpoint: string,
  token: string | null,
  options: RequestOptions = {}
): Promise<T> {
  const { method = "GET", body, headers = {} } = options;

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json().catch(() => null);

  if (response.status === 401) {
    throw new Error("Session expired");
  }

  if (!response.ok) {
    const message =
      data?.error ||
      data?.message ||
      "Unexpected server error";
    throw new Error(message);
  }


  return data as T;
}

