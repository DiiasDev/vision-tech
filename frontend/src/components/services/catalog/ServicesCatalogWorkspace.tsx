"use client"

import { useEffect, useMemo, useState } from "react"

import { AlertComponent, ComponentAlert, type ComponentAlertState } from "@/components/layout/AlertComponent"
import { FormServices } from "@/components/services/catalog/FormServices"
import { mapApiServiceToCatalogItem } from "@/components/services/catalog/catalog-mappers"
import type { ServiceCatalogItem, ServiceCatalogStatus } from "@/components/services/catalog/catalog-types"
import { ServicesCatalogFilters } from "@/components/services/catalog/ServicesCatalogFilters"
import { ServicesCatalogHero } from "@/components/services/catalog/ServicesCatalogHero"
import { ServicesCatalogStats } from "@/components/services/catalog/ServicesCatalogStats"
import { ServicesCatalogTable } from "@/components/services/catalog/ServicesCatalogTable"
import { getServices } from "@/services/services.service"

type ServiceCatalogStatusFilter = "all" | ServiceCatalogStatus

type ServicesCatalogWorkspaceProps = {
  detailsBasePath?: string
}

export function ServicesCatalogWorkspace({ detailsBasePath = "/services/catalog/id" }: ServicesCatalogWorkspaceProps) {
  const [searchValue, setSearchValue] = useState("")
  const [statusFilter, setStatusFilter] = useState<ServiceCatalogStatusFilter>("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [services, setServices] = useState<ServiceCatalogItem[]>([])
  const [selectedServiceIds, setSelectedServiceIds] = useState<Set<string>>(new Set())
  const [deletingServiceIds, setDeletingServiceIds] = useState<Set<string>>(new Set())
  const [isLoadingServices, setIsLoadingServices] = useState(true)
  const [showServiceForm, setShowServiceForm] = useState(false)
  const [feedback, setFeedback] = useState<ComponentAlertState | null>(null)

  useEffect(() => {
    let isActive = true

    async function loadServicesCatalog() {
      setIsLoadingServices(true)

      try {
        const response = await getServices()
        if (!isActive) return

        const mappedServices = response.data.map(mapApiServiceToCatalogItem)
        setServices(mappedServices)
      } catch (error) {
        if (!isActive) return

        const message = error instanceof Error ? error.message : "Nao foi possivel carregar os servicos do catalogo."
        setServices([])
        setFeedback(ComponentAlert.Error(message))
      } finally {
        if (isActive) {
          setIsLoadingServices(false)
        }
      }
    }

    void loadServicesCatalog()

    return () => {
      isActive = false
    }
  }, [])

  const categories = useMemo(() => {
    const uniqueCategories = new Set<string>()
    for (const service of services) {
      const category = service.category?.trim()
      if (!category) continue
      uniqueCategories.add(category)
    }
    return Array.from(uniqueCategories).sort((a, b) => a.localeCompare(b, "pt-BR"))
  }, [services])

  const filteredServices = useMemo(() => {
    const normalizedSearch = searchValue.trim().toLowerCase()

    return services.filter((service) => {
      const matchesStatus = statusFilter === "all" || service.status === statusFilter
      const matchesCategory = categoryFilter === "all" || service.category === categoryFilter
      const matchesSearch =
        normalizedSearch.length === 0 ||
        service.name.toLowerCase().includes(normalizedSearch) ||
        service.code.toLowerCase().includes(normalizedSearch) ||
        service.category.toLowerCase().includes(normalizedSearch) ||
        service.responsible.toLowerCase().includes(normalizedSearch)

      return matchesStatus && matchesCategory && matchesSearch
    })
  }, [categoryFilter, searchValue, services, statusFilter])

  function handleOpenServiceForm() {
    setFeedback(null)
    setShowServiceForm(true)
  }

  function removeServiceFromState(serviceId: string) {
    setServices((prev) => prev.filter((service) => service.id !== serviceId))
    setSelectedServiceIds((prev) => {
      const next = new Set(prev)
      next.delete(serviceId)
      return next
    })
  }

  async function handleDeleteServiceRequest(serviceId: string) {
    setFeedback(ComponentAlert.Info("Removendo serviço..."))
    setDeletingServiceIds((prev) => {
      const next = new Set(prev)
      next.add(serviceId)
      return next
    })

    try {
      removeServiceFromState(serviceId)
      setFeedback(ComponentAlert.Success("Serviço removido da listagem."))
    } catch {
      setFeedback(ComponentAlert.Error("Não foi possível remover o serviço."))
    } finally {
      setDeletingServiceIds((prev) => {
        const next = new Set(prev)
        next.delete(serviceId)
        return next
      })
    }
  }

  function handleDeleteService(serviceId: string) {
    if (deletingServiceIds.has(serviceId)) return
    void handleDeleteServiceRequest(serviceId)
  }

  function handleToggleSelection(serviceId: string, checked: boolean) {
    setSelectedServiceIds((prev) => {
      const next = new Set(prev)
      if (checked) next.add(serviceId)
      else next.delete(serviceId)
      return next
    })
  }

  function handleToggleAllVisible(checked: boolean) {
    setSelectedServiceIds((prev) => {
      const next = new Set(prev)
      filteredServices.forEach((service) => {
        if (checked) next.add(service.id)
        else next.delete(service.id)
      })
      return next
    })
  }

  return (
    <div className="relative space-y-6 overflow-hidden pb-4">
      <div className="relative">
        <ServicesCatalogHero onAddService={handleOpenServiceForm} />
      </div>

      <AlertComponent alert={feedback} onClose={() => setFeedback(null)} />

      <div className="relative">
        <ServicesCatalogStats services={services} />
      </div>

      <section className="relative overflow-hidden rounded-2xl border border-border/70 bg-card/95 shadow-sm">
        <div className="border-b border-border/70 p-5">
          <ServicesCatalogFilters
            searchValue={searchValue}
            onSearchChange={setSearchValue}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            categoryFilter={categoryFilter}
            onCategoryFilterChange={setCategoryFilter}
            categories={categories}
            resultCount={filteredServices.length}
          />
        </div>

        {isLoadingServices ? (
          <div className="px-6 py-10 text-center text-sm text-muted-foreground">
            Carregando servicos do catalogo...
          </div>
        ) : (
          <ServicesCatalogTable
            services={filteredServices}
            detailsBasePath={detailsBasePath}
            selectedServiceIds={selectedServiceIds}
            deletingServiceIds={deletingServiceIds}
            onToggleSelection={handleToggleSelection}
            onToggleAll={handleToggleAllVisible}
            onDeleteService={handleDeleteService}
          />
        )}
      </section>

      <FormServices
        open={showServiceForm}
        onClose={() => setShowServiceForm(false)}
        onCreated={(service) => {
          setServices((prev) => [service, ...prev])
        }}
        onFeedback={setFeedback}
      />
    </div>
  )
}
