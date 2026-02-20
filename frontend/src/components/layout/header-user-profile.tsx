"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"

import type { HeaderUser } from "@/components/layout/header-mocks"

type HeaderUserProfileProps = {
  user: HeaderUser
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "US"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase()
}

export function HeaderUserProfile({ user }: HeaderUserProfileProps) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border/70 bg-background/60 px-2.5 py-1.5 backdrop-blur-sm">
      <Avatar className="h-8 w-8 border border-border/70">
        <AvatarFallback>{getInitials(user.fullName)}</AvatarFallback>
      </Avatar>

      <div className="hidden min-w-0 md:block">
        <p className="truncate text-sm font-semibold leading-tight">{user.fullName}</p>
        <p className="text-muted-foreground truncate text-xs leading-tight">{user.role}</p>
      </div>
    </div>
  )
}
