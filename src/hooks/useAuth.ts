import { useState } from "react";

const DEFAULT_USER = {
  username: "admin",
  password: "123",
};

export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function login(username: string, password: string) {
    setLoading(true);
    setError(null);

    await new Promise((res) => setTimeout(res, 800)); // simula request

    if (
      username === DEFAULT_USER.username &&
      password === DEFAULT_USER.password
    ) {
      localStorage.setItem("visiontech_auth", "true");
      setLoading(false);
      return true;
    }

    setError("Usuário ou senha inválidos");
    setLoading(false);
    return false;
  }

  function logout() {
    localStorage.removeItem("visiontech_auth");
  }

  function isAuthenticated() {
    return localStorage.getItem("visiontech_auth") === "true";
  }

  return {
    login,
    logout,
    isAuthenticated,
    loading,
    error,
  };
}
