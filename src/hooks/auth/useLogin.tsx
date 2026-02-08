// src/hooks/auth/useLogin.ts
import { useState } from "react";
import { API_BASE_URL } from "../../config/api";

export function useLogin() {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const API = API_BASE_URL;

  const loginRequest = async (username: string, password: string) => {
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Invalid login");
        return null;
      }

      return data.user; // caller handles storing user in context
    } catch (err) {
      console.error(err);
      setErrorMsg("Network error");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { loginRequest, loading, errorMsg };
}