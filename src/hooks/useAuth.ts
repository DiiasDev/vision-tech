import { useState } from "react";
import { validarColaborador } from "../Services/colaboradores.api";

export interface LoggedUser {
  username: string;
  fullName: string;
  email: string;
  avatar?: string;
  cargo?: string;
  codigo?: string;
}

const DEFAULT_USER = {
  username: "Gabriel Dias",
  password: "new@H9e8s3w2",
  fullName: "Gabriel Dias",
  email: "gabriel.dias@visiontech.com",
  cargo: "Diretor",
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

    try {
      // Validação com usuário padrão (Gabriel Dias - Diretor)
      if (
        username === DEFAULT_USER.username &&
        password === DEFAULT_USER.password
      ) {
        const userData: LoggedUser = {
          username: DEFAULT_USER.username,
          fullName: DEFAULT_USER.fullName,
          email: DEFAULT_USER.email,
          cargo: DEFAULT_USER.cargo,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(DEFAULT_USER.fullName)}&background=1D4ED8&color=fff`,
        };

        localStorage.setItem(STORAGE_KEYS.AUTH, "true");
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
        setLoading(false);
        return true;
      }

      // Validação via API de colaboradores
      const resultado = await validarColaborador(username, password);

      if (resultado.success && resultado.colaborador) {
        const userData: LoggedUser = {
          username: resultado.colaborador.username ?? "",
          fullName: resultado.colaborador.fullName ?? "",
          email: resultado.colaborador.email ?? "",
          cargo: resultado.colaborador.cargo,
          codigo: resultado.colaborador.codigo,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(resultado.colaborador.fullName ?? "")}&background=1D4ED8&color=fff`,
        };

        localStorage.setItem(STORAGE_KEYS.AUTH, "true");
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
        setLoading(false);
        return true;
      }

      setError(resultado.message || "Usuário ou senha inválidos");
      setLoading(false);
      return false;
    } catch (error: any) {
      console.error("Erro no login:", error);
      setError("Erro ao realizar login. Tente novamente.");
      setLoading(false);
      return false;
    }
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
