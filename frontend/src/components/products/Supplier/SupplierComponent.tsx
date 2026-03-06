"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"

import { SupplierDirectoryPanel } from "@/components/products/Supplier/SupplierDirectoryPanel"
import { SupplierFilters } from "@/components/products/Supplier/SupplierFilters"
import { SupplierPageHeader } from "@/components/products/Supplier/SupplierPageHeader"
import { suppliersMock } from "@/components/products/Supplier/supplier-mock-data"
import { calculateSupplierSummary, filterSuppliers, type Supplier, type SupplierFilters as SupplierFiltersType, type SupplierSegment } from "@/components/products/Supplier/supplier-models"

const initialFilters: SupplierFiltersType = {
  search: "",
  segment: "all",
  status: "all",
  risk: "all",
}

export function SupplierComponent() {
  const router = useRouter()
  const [suppliers, setSuppliers] = useState<Supplier[]>(suppliersMock)
  const [filters, setFilters] = useState<SupplierFiltersType>(initialFilters)
  const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(suppliersMock[0]?.id ?? null)

  const segments = useMemo(() => {
    return Array.from(new Set(suppliers.map((supplier) => supplier.segment))).sort() as SupplierSegment[]
  }, [suppliers])

  const filteredSuppliers = useMemo(() => filterSuppliers(suppliers, filters), [suppliers, filters])

  const filteredSummary = useMemo(() => {
    return calculateSupplierSummary(filteredSuppliers)
  }, [filteredSuppliers])

  const selectedSupplier = useMemo(() => suppliers.find((supplier) => supplier.id === selectedSupplierId) ?? null, [suppliers, selectedSupplierId])

  function handleAddSupplier() {
    router.push("/dashboard/produtos/fornecedores/id?supplierId=new")
  }

  function handleConfigureSupplier(supplierId?: string) {
    const targetId = supplierId ?? selectedSupplierId
    if (!targetId) return

    setSelectedSupplierId(targetId)
    router.push(`/dashboard/produtos/fornecedores/id?supplierId=${targetId}`)
  }

  function handleDeleteSupplier(supplierId?: string) {
    const targetId = supplierId ?? selectedSupplierId
    if (!targetId) return

    setSuppliers((currentSuppliers) => {
      const nextSuppliers = currentSuppliers.filter((supplier) => supplier.id !== targetId)
      const keepSelected = selectedSupplierId && nextSuppliers.some((supplier) => supplier.id === selectedSupplierId)
      setSelectedSupplierId(keepSelected ? selectedSupplierId : (nextSuppliers[0]?.id ?? null))

      return nextSuppliers
    })
  }

  return (
    <div className="relative space-y-8 overflow-hidden pb-4">
      <SupplierPageHeader
        totalSuppliers={filteredSummary.totalSuppliers}
        activeSuppliers={filteredSummary.activeSuppliers}
        averageLeadTime={filteredSummary.averageLeadTime}
        averageOnTimeRate={filteredSummary.averageOnTimeRate}
        highRiskSuppliers={filteredSummary.highRiskSuppliers}
        hasSelectedSupplier={Boolean(selectedSupplier)}
        selectedSupplierName={selectedSupplier?.name ?? null}
        onAddSupplier={handleAddSupplier}
      />

      <div className="relative">
        <SupplierFilters
          filters={filters}
          segments={segments}
          totalCount={suppliers.length}
          visibleCount={filteredSuppliers.length}
          onFiltersChange={setFilters}
        />
      </div>

      <div className="relative">
        <SupplierDirectoryPanel
          suppliers={filteredSuppliers}
          selectedSupplierId={selectedSupplierId}
          onSelectSupplier={setSelectedSupplierId}
          onConfigureSupplier={handleConfigureSupplier}
          onDeleteSupplier={handleDeleteSupplier}
        />
      </div>
    </div>
  )
}

export default SupplierComponent
