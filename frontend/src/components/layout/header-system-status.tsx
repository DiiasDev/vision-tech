"use client"

import { Circle } from "lucide-react"

import { Badge } from "@/components/ui/badge"

import type { SystemStatus } from "@/components/layout/header-mocks"

type HeaderSystemStatusProps = {
  status: SystemStatus
}

export function HeaderSystemStatus({ status }: HeaderSystemStatusProps) {
  const isOnline = status === "online"

  return (
    <Badge
      variant="outline"
      className="h-10 rounded-xl border-border/70 bg-background/60 px-3 text-xs font-medium capitalize backdrop-blur-sm"
    >
      <Circle className={isOnline ? "h-3 w-3 fill-emerald-500 text-emerald-500" : "h-3 w-3 fill-red-500 text-red-500"} />
      Sistema {isOnline ? "online" : "offline"}
    </Badge>
  )
}
