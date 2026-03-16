"use client"

import { useMemo, useState } from "react"

import {
  serviceCatalogMockCategories,
  serviceCatalogMockData,
} from "@/components/services/catalog/catalog-mock-data"
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

  const filteredServices = useMemo(() => {
    const normalizedSearch = searchValue.trim().toLowerCase()

    return serviceCatalogMockData.filter((service) => {
      const matchesStatus = statusFilter === "all" || service.status === statusFilter
      const matchesCategory = categoryFilter === "all" || service.category === categoryFilter
      const matchesSearch =
        normalizedSearch.length === 0 ||
        service.name.toLowerCase().includes(normalizedSearch) ||
        service.code.toLowerCase().includes(normalizedSearch) ||
        service.category.toLowerCase().includes(normalizedSearch) ||
        service.ownerTeam.toLowerCase().includes(normalizedSearch)

      return matchesStatus && matchesCategory && matchesSearch
    })
  }, [categoryFilter, searchValue, statusFilter])

  return (
    <div className="relative space-y-8 overflow-hidden pb-4">
      <div className="relative">
        <ServicesCatalogHero />
      </div>

      <div className="relative">
        <ServicesCatalogStats />
      </div>

      <div className="relative rounded-2xl border border-border/70 bg-card/80 p-4 shadow-sm md:p-5">
        <ServicesCatalogFilters
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          categoryFilter={categoryFilter}
          onCategoryFilterChange={setCategoryFilter}
          categories={[...serviceCatalogMockCategories]}
          resultCount={filteredServices.length}
        />
      </div>

      <div className="relative">
        <ServicesCatalogTable services={filteredServices} detailsBasePath={detailsBasePath} />
      </div>
    </div>
  )
}
