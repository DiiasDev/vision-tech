"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { AlertCircle, Box, ClipboardList, Loader2, Search, Users, Wrench } from "lucide-react"
import { useRouter } from "next/navigation"

import { type Budget } from "@/components/budget/budget-mock-data"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { getBudgets } from "@/services/budgets.service"
import { getClients, type ClientsListItem } from "@/services/clients.service"
import { getServiceOrders, type ApiServiceOrder } from "@/services/orderServices.service"
import { getProducts, type ProductsListItem } from "@/services/products.service"
import { getServices, type ApiServiceCatalogItem } from "@/services/services.service"

type HeaderSearchProps = {
  placeholder?: string
}

type SearchDataset = {
  budgets: Budget[]
  clients: ClientsListItem[]
  products: ProductsListItem[]
  serviceOrders: ApiServiceOrder[]
  serviceCatalog: ApiServiceCatalogItem[]
}

type SearchResultKind = "budget" | "client" | "product" | "order" | "service"

type SearchResult = {
  id: string
  kind: SearchResultKind
  title: string
  subtitle: string
  hint: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  toneClassName: string
  score: number
}

const RESULTS_LIMIT = 10

const emptyDataset: SearchDataset = {
  budgets: [],
  clients: [],
  products: [],
  serviceOrders: [],
  serviceCatalog: [],
}

let cachedDataset: SearchDataset | null = null
let cachedDatasetPromise: Promise<SearchDataset> | null = null

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
}

function buildScore(query: string, candidates: string[]) {
  let bestScore = 0

  for (const candidate of candidates) {
    const normalizedCandidate = normalize(candidate)
    if (!normalizedCandidate) continue

    if (normalizedCandidate.startsWith(query)) {
      const score = 130 - Math.min(normalizedCandidate.length, 60)
      bestScore = Math.max(bestScore, score)
      continue
    }

    const index = normalizedCandidate.indexOf(query)
    if (index >= 0) {
      const score = 95 - Math.min(index, 45)
      bestScore = Math.max(bestScore, score)
    }
  }

  return bestScore
}

function toRoute(result: SearchResult) {
  return result.href
}

async function loadSearchDataset() {
  if (cachedDataset) return cachedDataset
  if (cachedDatasetPromise) return cachedDatasetPromise

  cachedDatasetPromise = (async () => {
    const [budgetsResult, clientsResult, productsResult, ordersResult, servicesResult] = await Promise.allSettled([
      getBudgets(),
      getClients(),
      getProducts(),
      getServiceOrders(),
      getServices(),
    ])

    const nextDataset: SearchDataset = {
      budgets: budgetsResult.status === "fulfilled" ? budgetsResult.value.data : [],
      clients: clientsResult.status === "fulfilled" ? clientsResult.value.data : [],
      products: productsResult.status === "fulfilled" ? productsResult.value.data : [],
      serviceOrders: ordersResult.status === "fulfilled" ? ordersResult.value.data : [],
      serviceCatalog: servicesResult.status === "fulfilled" ? servicesResult.value.data : [],
    }

    const failedRequests = [budgetsResult, clientsResult, productsResult, ordersResult, servicesResult].filter(
      (result) => result.status === "rejected"
    )

    if (failedRequests.length === 5) {
      throw new Error("Nao foi possivel carregar os dados da busca global.")
    }

    cachedDataset = nextDataset
    return nextDataset
  })()

  try {
    return await cachedDatasetPromise
  } finally {
    cachedDatasetPromise = null
  }
}

function buildSearchResults(dataset: SearchDataset, query: string) {
  if (!query) return []

  const results: SearchResult[] = []

  for (const budget of dataset.budgets) {
    const score = buildScore(query, [
      budget.code,
      budget.title,
      budget.client.name,
      budget.client.document,
      budget.client.phone,
      budget.owner,
    ])

    if (score <= 0) continue

    results.push({
      id: budget.id,
      kind: "budget",
      title: budget.title,
      subtitle: `${budget.code} • ${budget.client.name}`,
      hint: `${budget.client.document} • ${budget.owner}`,
      href: `/budget/id?budgetId=${encodeURIComponent(budget.id)}&budgetCode=${encodeURIComponent(budget.code)}`,
      icon: ClipboardList,
      toneClassName: "bg-fuchsia-500/12 text-fuchsia-700",
      score,
    })
  }

  for (const client of dataset.clients) {
    const score = buildScore(query, [
      client.code,
      client.name,
      client.document,
      client.responsibleName ?? "",
      client.telephone ?? "",
      client.email ?? "",
      client.city ?? "",
      client.state ?? "",
    ])

    if (score <= 0) continue

    results.push({
      id: client.id,
      kind: "client",
      title: client.name,
      subtitle: `${client.code} • ${client.document}`,
      hint: `${client.city ?? "Cidade nao informada"} • ${client.responsibleName ?? "Sem responsavel"}`,
      href: `/dashboard/comercial/clientes/${encodeURIComponent(client.id)}`,
      icon: Users,
      toneClassName: "bg-sky-500/12 text-sky-700",
      score,
    })
  }

  for (const product of dataset.products) {
    const score = buildScore(query, [
      product.code,
      product.name,
      product.description,
      product.category,
      product.brand,
      product.supplier,
    ])

    if (score <= 0) continue

    results.push({
      id: product.id,
      kind: "product",
      title: product.name,
      subtitle: `${product.code} • ${product.category}`,
      hint: `${product.brand} • ${product.supplier}`,
      href: `/products/id?productId=${encodeURIComponent(product.id)}`,
      icon: Box,
      toneClassName: "bg-amber-500/12 text-amber-700",
      score,
    })
  }

  for (const order of dataset.serviceOrders) {
    const score = buildScore(query, [
      order.code,
      order.title,
      order.client?.name ?? "",
      order.client?.document ?? "",
      order.responsible,
      order.budget?.code ?? "",
    ])

    if (score <= 0) continue

    results.push({
      id: order.id,
      kind: "order",
      title: order.title,
      subtitle: `${order.code} • ${order.client?.name ?? "Cliente nao informado"}`,
      hint: `${order.responsible} • ${order.budget?.code ?? "Sem orçamento"}`,
      href: `/dashboard/servicos/ordens/id?serviceOrderId=${encodeURIComponent(order.id)}`,
      icon: ClipboardList,
      toneClassName: "bg-rose-500/12 text-rose-700",
      score,
    })
  }

  for (const service of dataset.serviceCatalog) {
    const score = buildScore(query, [
      service.code,
      service.name,
      service.description,
      service.category,
      service.responsible ?? "",
    ])

    if (score <= 0) continue

    results.push({
      id: service.id,
      kind: "service",
      title: service.name,
      subtitle: `${service.code} • ${service.category}`,
      hint: `${service.responsible ?? "Sem responsavel"} • ${service.estimated_duration}`,
      href: `/dashboard/servicos/catalogo/id?serviceId=${encodeURIComponent(service.id)}`,
      icon: Wrench,
      toneClassName: "bg-emerald-500/12 text-emerald-700",
      score,
    })
  }

  return results
    .sort((left, right) => right.score - left.score || left.title.localeCompare(right.title, "pt-BR"))
    .slice(0, RESULTS_LIMIT)
}

function kindLabel(kind: SearchResultKind) {
  if (kind === "budget") return "Orcamento"
  if (kind === "client") return "Cliente"
  if (kind === "product") return "Produto"
  if (kind === "order") return "Ordem de servico"
  return "Servico"
}

export function HeaderSearch({ placeholder = "Buscar cliente, produto, ordem, documento..." }: HeaderSearchProps) {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [dataset, setDataset] = useState<SearchDataset>(cachedDataset ?? emptyDataset)
  const [activeIndex, setActiveIndex] = useState(0)

  const containerRef = useRef<HTMLDivElement | null>(null)

  const normalizedQuery = useMemo(() => normalize(query), [query])

  const results = useMemo(
    () => (normalizedQuery ? buildSearchResults(dataset, normalizedQuery) : []),
    [dataset, normalizedQuery]
  )

  const shouldShowPanel = isOpen && (normalizedQuery.length > 0 || isLoading || Boolean(loadError))

  useEffect(() => {
    if (!shouldShowPanel) return

    function handleClickOutside(event: MouseEvent) {
      if (!containerRef.current) return
      if (containerRef.current.contains(event.target as Node)) return
      setIsOpen(false)
      setActiveIndex(0)
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [shouldShowPanel])

  useEffect(() => {
    setActiveIndex(0)
  }, [normalizedQuery])

  useEffect(() => {
    if (!isOpen) return
    if (cachedDataset || dataset.budgets.length || dataset.clients.length || dataset.products.length || dataset.serviceOrders.length || dataset.serviceCatalog.length) {
      return
    }

    let isMounted = true

    const loadData = async () => {
      try {
        setIsLoading(true)
        setLoadError(null)
        const loaded = await loadSearchDataset()
        if (!isMounted) return
        setDataset(loaded)
      } catch (error) {
        if (!isMounted) return
        const message = error instanceof Error ? error.message : "Nao foi possivel carregar os dados da busca global."
        setLoadError(message)
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    void loadData()

    return () => {
      isMounted = false
    }
  }, [dataset, isOpen])

  function handleSelectResult(result: SearchResult) {
    setIsOpen(false)
    setQuery("")
    setActiveIndex(0)
    router.push(toRoute(result))
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (!shouldShowPanel) return

    if (event.key === "ArrowDown") {
      event.preventDefault()
      if (results.length === 0) return
      setActiveIndex((prev) => (prev + 1) % results.length)
      return
    }

    if (event.key === "ArrowUp") {
      event.preventDefault()
      if (results.length === 0) return
      setActiveIndex((prev) => (prev - 1 + results.length) % results.length)
      return
    }

    if (event.key === "Enter") {
      if (results.length === 0) return
      event.preventDefault()
      handleSelectResult(results[Math.min(activeIndex, results.length - 1)])
      return
    }

    if (event.key === "Escape") {
      event.preventDefault()
      setIsOpen(false)
      setActiveIndex(0)
    }
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        aria-label="Pesquisa global do sistema"
        placeholder={placeholder}
        value={query}
        onFocus={() => setIsOpen(true)}
        onChange={(event) => {
          setQuery(event.target.value)
          setIsOpen(true)
        }}
        onKeyDown={handleKeyDown}
        className="h-10 rounded-xl border-border/70 bg-background/60 pl-9 pr-4 shadow-sm backdrop-blur-sm"
      />

      {shouldShowPanel ? (
        <section className="absolute left-0 right-0 top-[calc(100%+0.45rem)] z-50 overflow-hidden rounded-2xl border border-border/70 bg-background/95 shadow-xl backdrop-blur-md">
          {isLoading ? (
            <div className="flex items-center gap-2 px-4 py-3 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Buscando dados para a pesquisa global...
            </div>
          ) : null}

          {!isLoading && loadError ? (
            <div className="flex items-start gap-2 px-4 py-3 text-sm text-amber-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              {loadError}
            </div>
          ) : null}

          {!isLoading && !loadError && normalizedQuery && results.length === 0 ? (
            <div className="flex items-start gap-2 px-4 py-3 text-sm text-muted-foreground">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
              <span>
                Nenhum resultado encontrado para <strong>&quot;{query.trim()}&quot;</strong>.
              </span>
            </div>
          ) : null}

          {!isLoading && results.length > 0 ? (
            <div className="max-h-[360px] overflow-y-auto p-1.5">
              {results.map((result, index) => {
                const Icon = result.icon
                const isActive = index === activeIndex

                return (
                  <button
                    key={`${result.kind}-${result.id}`}
                    type="button"
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
                      isActive ? "bg-primary/10" : "hover:bg-muted/55"
                    )}
                    onMouseDown={(event) => event.preventDefault()}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => handleSelectResult(result)}
                  >
                    <div
                      className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border/60",
                        result.toneClassName
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-foreground">{result.title}</p>
                      <p className="truncate text-xs text-muted-foreground">{result.subtitle}</p>
                      <p className="truncate text-[11px] uppercase tracking-[0.08em] text-muted-foreground/90">{result.hint}</p>
                    </div>

                    <span className="shrink-0 rounded-full border border-border/70 bg-muted/50 px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      {kindLabel(result.kind)}
                    </span>
                  </button>
                )
              })}
            </div>
          ) : null}
        </section>
      ) : null}
    </div>
  )
}
