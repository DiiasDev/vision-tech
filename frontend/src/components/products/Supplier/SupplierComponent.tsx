"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"

import { AlertComponent, ComponentAlert, type ComponentAlertState } from "@/components/layout/AlertComponent"
import FormSupplier from "@/components/products/Supplier/FormSupplier"
import { SupplierDirectoryPanel } from "@/components/products/Supplier/SupplierDirectoryPanel"
import { SupplierFilters } from "@/components/products/Supplier/SupplierFilters"
import { SupplierPageHeader } from "@/components/products/Supplier/SupplierPageHeader"
import { calculateSupplierSummary, filterSuppliers, type Supplier, type SupplierFilters as SupplierFiltersType } from "@/components/products/Supplier/supplier-models"
import { deleteSupplier, getSuppliers, type ApiSupplier } from "@/services/Supplier.service"
import { formatCurrencyBR, formatPhoneBR } from "@/utils/Formatter"

function parseCurrencyToNumber(value: string) {
  const normalized = value
    .replace(/[^\d,.-]/g, "")
    .replace(/\./g, "")
    .replace(",", ".")
    .trim()

  if (!normalized) return Number.NaN
  return Number(normalized)
}

function formatCurrencyField(value: string) {
  const numericValue = parseCurrencyToNumber(value)
  if (Number.isNaN(numericValue)) return value
  return formatCurrencyBR(numericValue)
}

const initialFilters: SupplierFiltersType = {
  search: "",
  segment: "all",
  status: "all",
  risk: "all",
}

function mapApiSupplierToUi(supplier: ApiSupplier): Supplier {
  return {
    id: supplier.id,
    code: supplier.supplierCode,
    name: supplier.name,
    fantasyName: supplier.fantasyName,
    segment: supplier.segment,
    risk: supplier.risk,
    contact: supplier.contact ?? undefined,
    city: supplier.city,
    state: supplier.state,
    status: supplier.status,
    categories: supplier.categories,
    lead: supplier.lead ?? undefined,
    location: supplier.location,
    phone: formatPhoneBR(supplier.phone),
    email: supplier.email,
    minRequest: formatCurrencyField(supplier.minRequest),
    lastDelivery: supplier.lastDelivery,
  }
}

export function SupplierComponent() {
  const router = useRouter()
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [filters, setFilters] = useState<SupplierFiltersType>(initialFilters)
  const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [feedback, setFeedback] = useState<ComponentAlertState | null>(null)

  useEffect(() => {
    let isMounted = true

    async function loadSuppliers() {
      try {
        const response = await getSuppliers()
        const nextSuppliers = response.data.map(mapApiSupplierToUi)
        if (!isMounted) return

        setSuppliers(nextSuppliers)
        setSelectedSupplierId((currentSelected) => {
          if (currentSelected && nextSuppliers.some((supplier) => supplier.id === currentSelected)) {
            return currentSelected
          }
          return nextSuppliers[0]?.id ?? null
        })
      } catch (error) {
        if (!isMounted) return
        const message = error instanceof Error ? error.message : "Nao foi possivel carregar fornecedores."
        setFeedback(ComponentAlert.Error(message))
      }
    }

    void loadSuppliers()

    return () => {
      isMounted = false
    }
  }, [])

  const segments = useMemo(() => Array.from(new Set(suppliers.map((supplier) => supplier.segment))).sort(), [suppliers])
  const statuses = useMemo(() => Array.from(new Set(suppliers.map((supplier) => supplier.status))).sort(), [suppliers])
  const risks = useMemo(() => Array.from(new Set(suppliers.map((supplier) => supplier.risk))).sort(), [suppliers])

  const filteredSuppliers = useMemo(() => filterSuppliers(suppliers, filters), [suppliers, filters])
  const filteredSummary = useMemo(() => calculateSupplierSummary(filteredSuppliers), [filteredSuppliers])

  const selectedSupplier = useMemo(() => suppliers.find((supplier) => supplier.id === selectedSupplierId) ?? null, [suppliers, selectedSupplierId])

  function handleAddSupplier() {
    setIsFormOpen(true)
  }

  function handleConfigureSupplier(supplierId?: string) {
    const targetId = supplierId ?? selectedSupplierId
    if (!targetId) return

    setSelectedSupplierId(targetId)
    router.push(`/dashboard/produtos/fornecedores/id?supplierId=${targetId}`)
  }

  async function handleDeleteSupplier(supplierId?: string) {
    const targetId = supplierId ?? selectedSupplierId
    if (!targetId) return

    try {
      const response = await deleteSupplier(targetId)
      setSuppliers((currentSuppliers) => {
        const nextSuppliers = currentSuppliers.filter((supplier) => supplier.id !== targetId)
        const keepSelected = selectedSupplierId && nextSuppliers.some((supplier) => supplier.id === selectedSupplierId)
        setSelectedSupplierId(keepSelected ? selectedSupplierId : (nextSuppliers[0]?.id ?? null))
        return nextSuppliers
      })
      setFeedback(ComponentAlert.Success(response.message))
    } catch (error) {
      const message = error instanceof Error ? error.message : "Nao foi possivel excluir fornecedor."
      setFeedback(ComponentAlert.Error(message))
    }
  }

  function handleSupplierCreated(supplier: Supplier) {
    setSuppliers((currentSuppliers) => {
      const nextSuppliers = [supplier, ...currentSuppliers.filter((item) => item.id !== supplier.id)]
      return nextSuppliers
    })
    setSelectedSupplierId(supplier.id)
  }

  return (
    <div className="relative space-y-8 overflow-hidden pb-4">
      <FormSupplier
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onCreated={handleSupplierCreated}
        onFeedback={setFeedback}
      />

      <AlertComponent alert={feedback} onClose={() => setFeedback(null)} />

      <SupplierPageHeader
        totalSuppliers={filteredSummary.totalSuppliers}
        activeSuppliers={filteredSummary.activeSuppliers}
        averageLeadDays={filteredSummary.averageLeadDays}
        highRiskSuppliers={filteredSummary.highRiskSuppliers}
        hasSelectedSupplier={Boolean(selectedSupplier)}
        selectedSupplierName={selectedSupplier?.name ?? null}
        onAddSupplier={handleAddSupplier}
      />

      <div className="relative">
        <SupplierFilters
          filters={filters}
          segments={segments}
          statuses={statuses}
          risks={risks}
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
