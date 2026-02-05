import { useState } from "react";
import { API_BASE_URL } from "../../config/api";

export function useSignup() {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

    const API = API_BASE_URL;
    
  const signupRequest = async (username: string, password: string) => {
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch(`${API}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Signup failed");
        return null;
      }

      return data.user; // return the user to the screen

    } catch (err) {
      console.error("Signup error:", err);
      setErrorMsg("Network error");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { signupRequest, loading, errorMsg };
}