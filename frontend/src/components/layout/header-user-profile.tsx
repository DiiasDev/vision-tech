"use client"

import { useSyncExternalStore } from "react"
import { LogOut } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import type { HeaderUser } from "@/components/layout/header-mocks"

type HeaderUserProfileProps = {
  user: HeaderUser
  onLogout: () => void
}

function subscribeHydration() {
  return () => undefined
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "US"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase()
}

export function HeaderUserProfile({ user, onLogout }: HeaderUserProfileProps) {
  const mounted = useSyncExternalStore(
    subscribeHydration,
    () => true,
    () => false
  )

  if (!mounted) {
    return (
      <button
        type="button"
        className="flex items-center gap-3 rounded-xl border border-border/70 bg-background/60 px-2.5 py-1.5 backdrop-blur-sm transition-colors dark:border-slate-700 dark:bg-slate-900/80"
        aria-label="Abrir menu do usuário"
      >
        <Avatar className="h-8 w-8 border border-border/70 dark:border-slate-600">
          <AvatarFallback className="dark:bg-slate-950 dark:text-slate-200">
            {getInitials(user.fullName)}
          </AvatarFallback>
        </Avatar>

        <div className="hidden min-w-0 text-left md:block">
          <p className="truncate text-sm font-semibold leading-tight dark:text-slate-100">{user.fullName}</p>
          <p className="text-muted-foreground truncate text-xs leading-tight dark:text-slate-400">{user.role}</p>
        </div>
      </button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-3 rounded-xl border border-border/70 bg-background/60 px-2.5 py-1.5 backdrop-blur-sm transition-colors hover:bg-accent dark:border-slate-700 dark:bg-slate-900/80 dark:hover:bg-slate-800"
          aria-label="Abrir menu do usuário"
        >
          <Avatar className="h-8 w-8 border border-border/70 dark:border-slate-600">
            <AvatarFallback className="dark:bg-slate-950 dark:text-slate-200">
              {getInitials(user.fullName)}
            </AvatarFallback>
          </Avatar>

          <div className="hidden min-w-0 text-left md:block">
            <p className="truncate text-sm font-semibold leading-tight dark:text-slate-100">{user.fullName}</p>
            <p className="text-muted-foreground truncate text-xs leading-tight dark:text-slate-400">{user.role}</p>
          </div>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56 rounded-xl">
        <DropdownMenuLabel>
          <p className="truncate text-sm font-semibold">{user.fullName}</p>
          <p className="text-muted-foreground truncate text-xs font-normal">{user.role}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={onLogout}>
          <LogOut className="h-4 w-4" />
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
