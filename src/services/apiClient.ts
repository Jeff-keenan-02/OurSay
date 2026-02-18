// src/services/apiClient.ts

import { API_BASE_URL } from "../config/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

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

async function request<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = "GET", body, headers = {} } = options;

  // Get token from storage
  const token = await AsyncStorage.getItem("token");

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
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("user");
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

/* =====================================================
   Public API Methods
===================================================== */

export const apiClient = {
  get: <T>(endpoint: string) =>
    request<T>(endpoint),

  post: <T>(endpoint: string, body?: any) =>
    request<T>(endpoint, {
      method: "POST",
      body,
    }),

  put: <T>(endpoint: string, body?: any) =>
    request<T>(endpoint, {
      method: "PUT",
      body,
    }),

  patch: <T>(endpoint: string, body?: any) =>
    request<T>(endpoint, {
      method: "PATCH",
      body,
    }),

  delete: <T>(endpoint: string) =>
    request<T>(endpoint, {
      method: "DELETE",
    }),
};