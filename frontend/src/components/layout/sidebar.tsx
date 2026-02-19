"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BarChart3,
  BriefcaseBusiness,
  Building2,
  ChevronDown,
  DollarSign,
  FolderKanban,
  LayoutDashboard,
  Package,
  Settings,
  ShieldCheck,
  Sparkles,
  Wrench,
} from "lucide-react"

import { cn } from "@/lib/utils"

type SubItem = {
  name: string
  href: string
}

type MenuItem = {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  subItems?: SubItem[]
}

type SidebarProps = {
  isOpen: boolean
}

const menu: MenuItem[] = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Comercial",
    href: "/dashboard/comercial",
    icon: BriefcaseBusiness,
    subItems: [
      { name: "Clientes", href: "/dashboard/comercial/clientes" },
      { name: "Orcamentos", href: "/dashboard/comercial/orcamentos" },
      { name: "Propostas", href: "/dashboard/comercial/propostas" },
      { name: "Contratos", href: "/dashboard/comercial/contratos" },
    ],
  },
  {
    name: "Servicos",
    href: "/dashboard/servicos",
    icon: Wrench,
    subItems: [
      { name: "Catalogo", href: "/dashboard/servicos/catalogo" },
      { name: "Ordens de Servico", href: "/dashboard/servicos/ordens" },
      { name: "Agenda Tecnica", href: "/dashboard/servicos/agenda-tecnica" },
    ],
  },
  {
    name: "Produtos",
    href: "/dashboard/produtos",
    icon: Package,
    subItems: [
      { name: "Catalogo de Produtos", href: "/dashboard/produtos/catalogo" },
      { name: "Estoque", href: "/dashboard/produtos/estoque" },
      { name: "Movimentacoes", href: "/dashboard/produtos/movimentacoes" },
      { name: "Fornecedores", href: "/dashboard/produtos/fornecedores" },
    ],
  },
  {
    name: "Financeiro",
    href: "/dashboard/financeiro",
    icon: DollarSign,
    subItems: [
      { name: "Dashboard", href: "/dashboard/financeiro/dashboard" },
      { name: "Movimentacoes", href: "/dashboard/financeiro/movimentacoes" },
    ],
  },
  {
    name: "Relatorios",
    href: "/dashboard/relatorios",
    icon: BarChart3,
    subItems: [
      { name: "Comercial", href: "/dashboard/relatorios/comercial" },
      { name: "Financeiro", href: "/dashboard/relatorios/financeiro" },
      { name: "Operacional", href: "/dashboard/relatorios/operacional" },
    ],
  },
  {
    name: "Usuarios & Permissoes",
    href: "/dashboard/usuarios",
    icon: ShieldCheck,
    subItems: [
      { name: "Usuarios", href: "/dashboard/usuarios/lista" },
      { name: "Perfis de Acesso", href: "/dashboard/usuarios/perfis" },
      { name: "Auditoria", href: "/dashboard/usuarios/auditoria" },
    ],
  },
  {
    name: "Configuracoes",
    href: "/dashboard/configuracoes",
    icon: Settings,
    subItems: [
      { name: "Empresa", href: "/dashboard/configuracoes/empresa" },
      { name: "Integracoes", href: "/dashboard/configuracoes/integracoes" },
      { name: "Preferencias", href: "/dashboard/configuracoes/preferencias" },
    ],
  },
]

export function Sidebar({ isOpen }: SidebarProps) {
  const pathname = usePathname()

  const defaultOpen = useMemo(() => {
    const expanded: Record<string, boolean> = {}

    for (const item of menu) {
      if (!item.subItems?.length) continue

      const activeSub = item.subItems.some((sub) => pathname === sub.href || pathname.startsWith(`${sub.href}/`))
      const activeRoot = pathname === item.href || pathname.startsWith(`${item.href}/`)
      expanded[item.name] = Boolean(activeSub || activeRoot)
    }

    return expanded
  }, [pathname])

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({})

  function toggleSection(name: string, isExpanded: boolean) {
    setOpenSections((prev) => ({
      ...prev,
      [name]: !isExpanded,
    }))
  }

  return (
    <aside
      className={cn(
        "relative hidden shrink-0 overflow-hidden border-r border-sidebar-border/70 transition-[width] duration-300 md:block",
        isOpen ? "w-[22rem]" : "w-0 border-transparent"
      )}
    >
      <div
        className={cn(
          "relative flex h-full flex-col gap-4 bg-gradient-to-b from-sidebar via-background to-muted/35 p-4 text-sidebar-foreground transition-opacity duration-200",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
      >
        <div className="pointer-events-none absolute -left-12 -top-10 h-44 w-44 rounded-full bg-primary/25 blur-3xl" />
        <div className="pointer-events-none absolute -right-10 top-10 h-36 w-36 rounded-full bg-accent/20 blur-3xl" />

        <div className="relative rounded-2xl border border-sidebar-border/70 bg-background/50 p-4 shadow-sm backdrop-blur-sm">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-sidebar-foreground/65">Painel</p>
            <h2 className="mt-2 text-3xl font-bold leading-none tracking-tight text-foreground">
              Vision <span className="text-accent">Tech</span>
            </h2>
          </div>
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto pr-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {menu.map((item) => {
            const hasSubItems = Boolean(item.subItems?.length)
            const isActiveRoot = pathname === item.href || pathname.startsWith(`${item.href}/`)
            const isActiveSub = item.subItems?.some(
              (sub) => pathname === sub.href || pathname.startsWith(`${sub.href}/`)
            )
            const isExpanded = hasSubItems ? openSections[item.name] ?? defaultOpen[item.name] ?? false : false
            const Icon = item.icon

            return (
              <div
                key={item.name}
                className={cn(
                  "overflow-hidden rounded-xl border transition-all",
                  isActiveRoot || isActiveSub
                    ? "border-sidebar-border bg-background/65 shadow-sm"
                    : "border-transparent bg-transparent"
                )}
              >
                <button
                  type="button"
                  onClick={() => {
                    if (!hasSubItems) return
                    toggleSection(item.name, isExpanded)
                  }}
                    className={cn(
                      "group flex w-full items-center justify-between px-4 py-3 text-left transition-colors",
                      isActiveRoot || isActiveSub
                        ? "text-foreground"
                        : "text-sidebar-foreground/75 hover:bg-background/55 hover:text-foreground"
                    )}
                  >
                  <span className="flex items-center gap-3">
                    <span
                      className={cn(
                        "inline-flex h-7 w-7 items-center justify-center rounded-md border border-sidebar-border/60 bg-background/50",
                        (isActiveRoot || isActiveSub) && "border-primary/40 bg-primary/15 text-primary"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="font-medium">{item.name}</span>
                  </span>

                  {hasSubItems ? (
                    <ChevronDown className={cn("h-4 w-4 transition-transform", isExpanded && "rotate-180")} />
                  ) : null}
                </button>

                {hasSubItems && isExpanded ? (
                  <div className="mx-4 mb-3 space-y-1 border-l border-sidebar-border/70 pl-3">
                    {item.subItems?.map((sub) => {
                      const isActive = pathname === sub.href || pathname.startsWith(`${sub.href}/`)

                      return (
                        <Link
                          key={sub.name}
                          href={sub.href}
                          className={cn(
                            "group flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors",
                            isActive
                              ? "bg-primary/15 text-foreground"
                              : "text-sidebar-foreground/70 hover:bg-background/55 hover:text-foreground"
                          )}
                        >
                          <span>{sub.name}</span>
                          {isActive ? <Sparkles className="h-3.5 w-3.5 text-accent" /> : null}
                        </Link>
                      )
                    })}
                  </div>
                ) : null}
              </div>
            )
          })}
        </nav>

        <div className="rounded-2xl border border-sidebar-border/70 bg-background/55 p-4">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <FolderKanban className="h-4 w-4 text-primary" /> Workspace Pro
          </div>
          <p className="mt-2 text-xs leading-relaxed text-sidebar-foreground/70">
            Operacao centralizada com monitoramento por area e controles inteligentes.
          </p>
          <Link
            href="/dashboard/configuracoes/empresa"
            className="mt-3 inline-flex items-center gap-2 rounded-md border border-primary/35 bg-primary/10 px-3 py-2 text-xs font-medium text-primary transition-colors hover:bg-primary/20"
          >
            <Building2 className="h-3.5 w-3.5" /> Personalizar workspace
          </Link>
        </div>
      </div>
    </aside>
  )
}
