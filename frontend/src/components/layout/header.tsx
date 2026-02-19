"use client"

import { useMemo } from "react"
import { PanelLeftClose, PanelLeftOpen } from "lucide-react"
import { usePathname } from "next/navigation"

import { ThemeToggle } from "@/components/shared/theme-toggle"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

type HeaderProps = {
  sidebarOpen: boolean
  onToggleSidebar: () => void
}

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

  return (
    <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-border/60 bg-background/80 px-4 backdrop-blur-md md:px-6 lg:px-8">
      <div className="flex items-center gap-3">
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

        <div>
          <h1 className="text-xl font-semibold tracking-tight">{section}</h1>
          <p className="text-xs text-muted-foreground md:text-sm">
            {detail || "Gestao centralizada e acompanhamento em tempo real"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <ThemeToggle />
        <Avatar className="border border-border/70">
          <AvatarFallback>DT</AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}
