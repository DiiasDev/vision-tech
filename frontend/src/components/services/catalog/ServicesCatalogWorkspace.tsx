"use client"

import { useMemo, useState } from "react"

import { AlertComponent, type ComponentAlertState } from "@/components/layout/AlertComponent"
import { serviceCatalogMockData } from "@/components/services/catalog/catalog-mock-data"
import { FormServices } from "@/components/services/catalog/FormServices"
import type { ServiceCatalogStatus } from "@/components/services/catalog/catalog-types"
import { ServicesCatalogFilters } from "@/components/services/catalog/ServicesCatalogFilters"
import { ServicesCatalogHero } from "@/components/services/catalog/ServicesCatalogHero"
import { ServicesCatalogStats } from "@/components/services/catalog/ServicesCatalogStats"
import { ServicesCatalogTable } from "@/components/services/catalog/ServicesCatalogTable"

type ServiceCatalogStatusFilter = "all" | ServiceCatalogStatus

type ServicesCatalogWorkspaceProps = {
  detailsBasePath?: string
}

export function ServicesCatalogWorkspace({ detailsBasePath = "/services/catalog/id" }: ServicesCatalogWorkspaceProps) {
  const [searchValue, setSearchValue] = useState("")
  const [statusFilter, setStatusFilter] = useState<ServiceCatalogStatusFilter>("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [services, setServices] = useState(serviceCatalogMockData)
  const [showServiceForm, setShowServiceForm] = useState(false)
  const [feedback, setFeedback] = useState<ComponentAlertState | null>(null)

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

  return (
    <div className="relative space-y-8 overflow-hidden pb-4">
      <div className="relative">
        <ServicesCatalogHero onAddService={handleOpenServiceForm} />
      </div>

      <AlertComponent alert={feedback} onClose={() => setFeedback(null)} />

      <div className="relative">
        <ServicesCatalogStats services={services} />
      </div>

      <div className="relative rounded-2xl border border-border/70 bg-card/80 p-4 shadow-sm md:p-5">
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

      <div className="relative">
        <ServicesCatalogTable services={filteredServices} detailsBasePath={detailsBasePath} />
      </div>

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
