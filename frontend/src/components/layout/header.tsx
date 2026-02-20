"use client"

import { useEffect, useMemo, useState } from "react"
import { PanelLeftClose, PanelLeftOpen } from "lucide-react"
import { usePathname } from "next/navigation"

import { HeaderNotifications } from "@/components/layout/header-notifications"
import { mockHeaderUser, mockNotifications, mockSystemStatus } from "@/components/layout/header-mocks"
import { HeaderSearch } from "@/components/layout/header-search"
import { HeaderSystemStatus } from "@/components/layout/header-system-status"
import { HeaderUserProfile } from "@/components/layout/header-user-profile"
import { ThemeToggle } from "@/components/shared/theme-toggle"
import { Button } from "@/components/ui/button"
import { getAccessToken, getStoredHeaderUser, saveHeaderUser } from "@/lib/auth-session"

type HeaderProps = {
  sidebarOpen: boolean
  onToggleSidebar: () => void
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000"

const labelMap: Record<string, string> = {
  kpis: "KPIs",
  "contas-a-pagar": "Contas a Pagar",
  "contas-a-receber": "Contas a Receber",
  "fluxo-de-caixa": "Fluxo de Caixa",
  "agenda-tecnica": "Agenda Tecnica",
  "perfis": "Perfis de Acesso",
}

function humanizeSegment(segment: string) {
  if (labelMap[segment]) return labelMap[segment]

  return segment
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

export function Header({ sidebarOpen, onToggleSidebar }: HeaderProps) {
  const pathname = usePathname()
  const [headerUser, setHeaderUser] = useState(() => getStoredHeaderUser() ?? mockHeaderUser)

  const { section, detail } = useMemo(() => {
    const segments = pathname.split("/").filter(Boolean)
    const dashboardIndex = segments.indexOf("dashboard")

    if (dashboardIndex === -1) {
      return { section: "Painel", detail: "" }
    }

    const sectionSegment = segments[dashboardIndex + 1]
    const detailSegment = segments[dashboardIndex + 2]

    if (!sectionSegment) {
      return { section: "Dashboard", detail: "Visao geral da operacao" }
    }

    return {
      section: humanizeSegment(sectionSegment),
      detail: detailSegment ? humanizeSegment(detailSegment) : "",
    }
  }, [pathname])

  useEffect(() => {
    const accessToken = getAccessToken()
    if (!accessToken) return

    let isMounted = true

    void fetch(`${API_URL}/users/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    })
      .then(async (response) => {
        if (!response.ok) return null
        return response.json() as Promise<{ name?: string; role?: string }>
      })
      .then((payload) => {
        if (!isMounted || !payload?.name) return

        const user = {
          fullName: payload.name,
          role: payload.role?.trim() ? payload.role : "Sem cargo",
        }

        setHeaderUser(user)
        saveHeaderUser(user)
      })
      .catch(() => null)

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <header className="sticky top-0 z-20 border-b border-border/60 bg-background/80 px-4 py-3 backdrop-blur-md md:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-3 md:flex-row md:items-center md:gap-4">
        <div className="flex min-w-0 items-center gap-3 md:flex-1">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={onToggleSidebar}
            aria-label={sidebarOpen ? "Fechar sidebar" : "Abrir sidebar"}
            className="hidden md:inline-flex"
          >
            {sidebarOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
          </Button>

          <div className="min-w-0 shrink-0">
            <h1 className="truncate text-xl font-semibold tracking-tight">{section}</h1>
            <p className="text-muted-foreground truncate text-xs md:text-sm">
              {detail || "Gestao centralizada e acompanhamento em tempo real"}
            </p>
          </div>

          <div className="hidden min-w-0 flex-1 md:block">
            <HeaderSearch />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 md:ml-auto md:flex-nowrap">
          <HeaderSystemStatus status={mockSystemStatus} />
          <HeaderNotifications notifications={mockNotifications} />
          <ThemeToggle />
          <HeaderUserProfile user={headerUser} />
        </div>

        <div className="md:hidden">
          <HeaderSearch />
        </div>
      </div>
    </header>
  )
}
