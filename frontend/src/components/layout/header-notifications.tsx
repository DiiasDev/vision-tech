"use client"

import { Bell, Cake, Boxes, TriangleAlert } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

import type { HeaderNotification } from "@/components/layout/header-mocks"

type HeaderNotificationsProps = {
  notifications: HeaderNotification[]
}

function iconByType(type: HeaderNotification["type"]) {
  if (type === "birthday") return <Cake className="h-4 w-4 text-primary" />
  if (type === "inventory") return <Boxes className="h-4 w-4 text-amber-500" />
  return <TriangleAlert className="h-4 w-4 text-rose-500" />
}

export function HeaderNotifications({ notifications }: HeaderNotificationsProps) {
  const unreadCount = notifications.filter((notification) => notification.unread).length

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="outline" size="icon" className="relative h-10 w-10 rounded-xl border-border/70 bg-background/60 backdrop-blur-sm">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 ? (
            <span className="bg-destructive text-destructive-foreground absolute -top-1 -right-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-semibold">
              {unreadCount}
            </span>
          ) : null}
          <span className="sr-only">Abrir notificacoes</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-[340px] rounded-xl">
        <DropdownMenuLabel className="flex items-center justify-between">
          Notificacoes do sistema
          <span className="text-muted-foreground text-xs font-normal">{notifications.length} itens</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {notifications.length === 0 ? (
          <DropdownMenuItem className="text-muted-foreground">Nenhuma notificacao no momento.</DropdownMenuItem>
        ) : (
          notifications.map((notification) => (
            <DropdownMenuItem key={notification.id} className="items-start gap-3 py-3">
              <span className="mt-0.5">{iconByType(notification.type)}</span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <span className="truncate font-medium">{notification.title}</span>
                  {notification.unread ? <span className="h-2 w-2 rounded-full bg-primary" /> : null}
                </span>
                <span className="text-muted-foreground mt-0.5 line-clamp-2 block text-xs">{notification.description}</span>
                <span className="text-muted-foreground mt-1 block text-[11px]">{notification.timestamp}</span>
              </span>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
