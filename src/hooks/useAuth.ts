import { useState } from "react";

export interface LoggedUser {
  username: string;
  fullName: string;
  email: string;
  avatar?: string;
}

const DEFAULT_USER = {
  username: "admin",
  password: "123",
  fullName: "Administrator",
  email: "administrator@visiontech.com",
};

const STORAGE_KEYS = {
  AUTH: "visiontech_auth",
  USER: "visiontech_user",
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
      const userData: LoggedUser = {
        username: DEFAULT_USER.username,
        fullName: DEFAULT_USER.fullName,
        email: DEFAULT_USER.email,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(DEFAULT_USER.fullName)}&background=1D4ED8&color=fff`,
      };

      localStorage.setItem(STORAGE_KEYS.AUTH, "true");
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
      setLoading(false);
      return true;
    }

    setError("Usuário ou senha inválidos");
    setLoading(false);
    return false;
  }

  function logout() {
    localStorage.removeItem(STORAGE_KEYS.AUTH);
    localStorage.removeItem(STORAGE_KEYS.USER);
  }

  function isAuthenticated() {
    return localStorage.getItem(STORAGE_KEYS.AUTH) === "true";
  }

  function getLoggedUser(): LoggedUser | null {
    const userStr = localStorage.getItem(STORAGE_KEYS.USER);
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr) as LoggedUser;
    } catch {
      return null;
    }
  }

  return {
    login,
    logout,
    isAuthenticated,
    getLoggedUser,
    loading,
    error,
  };
}
