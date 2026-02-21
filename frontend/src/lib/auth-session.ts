import type { HeaderUser } from "@/components/layout/header-mocks"

type AuthSessionUser = {
  id: string
  name: string
  email: string
  role?: string | null
}

const AUTH_TOKEN_KEY = "visiontech.access_token"
const AUTH_USER_KEY = "visiontech.user"

export function saveAuthSession(accessToken: string, user?: AuthSessionUser | null) {
  if (typeof window === "undefined") return

  window.localStorage.setItem(AUTH_TOKEN_KEY, accessToken)
  if (user) {
    window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user))
  }
}

export function getAccessToken() {
  if (typeof window === "undefined") return null
  return window.localStorage.getItem(AUTH_TOKEN_KEY)
}

export function clearAuthSession() {
  if (typeof window === "undefined") return
  window.localStorage.removeItem(AUTH_TOKEN_KEY)
  window.localStorage.removeItem(AUTH_USER_KEY)
}

export function getStoredHeaderUser(): HeaderUser | null {
  const rawUser = getStoredHeaderUserRaw()
  if (!rawUser) return null

  try {
    const parsed = JSON.parse(rawUser) as Partial<AuthSessionUser>
    if (!parsed.name || typeof parsed.name !== "string") return null

    return {
      fullName: parsed.name,
      role: typeof parsed.role === "string" && parsed.role.trim() ? parsed.role : "Sem cargo",
    }
  } catch {
    return null
  }
}

export function getStoredHeaderUserRaw() {
  if (typeof window === "undefined") return null
  return window.localStorage.getItem(AUTH_USER_KEY)
}

export function saveHeaderUser(user: HeaderUser) {
  if (typeof window === "undefined") return

  const previous = window.localStorage.getItem(AUTH_USER_KEY)
  let previousUser: Partial<AuthSessionUser> = {}
  if (previous) {
    try {
      previousUser = JSON.parse(previous) as Partial<AuthSessionUser>
    } catch {
      previousUser = {}
    }
  }

  const nextUser: Partial<AuthSessionUser> = {
    ...previousUser,
    name: user.fullName,
    role: user.role,
  }

  window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(nextUser))
}
