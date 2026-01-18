import { useState } from "react";

export function useSignup(API: string) {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

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