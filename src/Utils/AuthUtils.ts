import type { LoggedUser } from "../hooks/useAuth";

const STORAGE_KEYS = {
  AUTH: "visiontech_auth",
  USER: "visiontech_user",
};

/**
 * Retorna os dados do usuário logado do localStorage
 * Útil para uso em componentes ou funções que não têm acesso ao hook useAuth
 */
export function getLoggedUserData(): LoggedUser | null {
  const userStr = localStorage.getItem(STORAGE_KEYS.USER);
  if (!userStr) return null;

  try {
    return JSON.parse(userStr) as LoggedUser;
  } catch {
    return null;
  }
}

/**
 * Retorna o nome completo do usuário logado
 * Útil para preencher campos "Criado por" automaticamente
 */
export function getLoggedUserFullName(): string {
  const user = getLoggedUserData();
  return user?.fullName || "";
}

/**
 * Retorna o username do usuário logado
 */
export function getLoggedUserUsername(): string {
  const user = getLoggedUserData();
  return user?.username || "";
}

/**
 * Retorna o email do usuário logado
 */
export function getLoggedUserEmail(): string {
  const user = getLoggedUserData();
  return user?.email || "";
}

/**
 * Verifica se há um usuário logado
 */
export function hasLoggedUser(): boolean {
  return getLoggedUserData() !== null;
}
