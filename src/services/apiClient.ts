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
   API Errors
===================================================== */
export class ApiError extends Error {
  status: number;
  data?: any;

  constructor(status: number, message: string, data?: any) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

/* =====================================================
   Core Request Function
===================================================== */
export async function request<T>(
  endpoint: string,
  token: string | null,
  options: RequestOptions = {}
): Promise<T> {

  const { method = "GET", body, headers = {} } = options;
  const isFormData =
    typeof FormData !== "undefined" && body instanceof FormData;

  let response;

  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(!isFormData ? { "Content-Type": "application/json" } : {}),
        ...headers,
      },
      body: body && !isFormData ? JSON.stringify(body) : body,
    });
  } catch (networkError) {
    throw new ApiError(
      0,
      "Network error. Please check your connection."
    );
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(
      response.status,
      data?.error || data?.message || "Unexpected server error",
      data
    );
  }

  return data as T;
}