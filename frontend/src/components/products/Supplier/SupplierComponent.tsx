"use client"

import { Search } from "lucide-react"
import { useEffect, useMemo, useState } from "react"

import { AlertComponent, ComponentAlert, type ComponentAlertState } from "@/components/layout/AlertComponent"
import FormSupplier from "@/components/products/Supplier/FormSupplier"
import { SupplierCatalogHeader } from "@/components/products/Supplier/SupplierCatalogHeader"
import { SupplierStats } from "@/components/products/Supplier/SupplierStats"
import { SupplierTable } from "@/components/products/Supplier/SupplierTable"
import { type Supplier } from "@/components/products/Supplier/supplier-models"
import { Input } from "@/components/ui/input"
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
  const [search, setSearch] = useState("")
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [selectedSupplierIds, setSelectedSupplierIds] = useState<Set<string>>(new Set())
  const [deletingSupplierIds, setDeletingSupplierIds] = useState<Set<string>>(new Set())
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

  const filteredSuppliers = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase("pt-BR")
    if (!normalizedSearch) return suppliers

    return suppliers.filter((supplier) => {
      const searchableParts = [
        supplier.code,
        supplier.name,
        supplier.fantasyName,
        supplier.segment,
        supplier.risk,
        supplier.contact ?? "",
        supplier.city,
        supplier.state,
        supplier.status,
        supplier.categories,
        supplier.lead ?? "",
        supplier.location,
        supplier.phone,
        supplier.email,
        supplier.minRequest,
        supplier.lastDelivery,
      ]

      return searchableParts.join(" ").toLocaleLowerCase("pt-BR").includes(normalizedSearch)
    })
  }, [suppliers, search])

  function handleAddSupplier() {
    setIsFormOpen(true)
  }

  async function handleDeleteSupplierRequest(supplierId: string) {
    setFeedback(ComponentAlert.Info("Excluindo fornecedor..."))
    setDeletingSupplierIds((prev) => {
      const next = new Set(prev)
      next.add(supplierId)
      return next
    })

    try {
      const response = await deleteSupplier(supplierId)
      setSuppliers((currentSuppliers) => currentSuppliers.filter((supplier) => supplier.id !== supplierId))
      setSelectedSupplierIds((prev) => {
        const next = new Set(prev)
        next.delete(supplierId)
        return next
      })
      setFeedback(ComponentAlert.Success(response.message))
    } catch (error) {
      const message = error instanceof Error ? error.message : "Nao foi possivel excluir fornecedor."
      setFeedback(ComponentAlert.Error(message))
    } finally {
      setDeletingSupplierIds((prev) => {
        const next = new Set(prev)
        next.delete(supplierId)
        return next
      })
    }
  }

  function handleDeleteSupplier(supplierId: string) {
    if (deletingSupplierIds.has(supplierId)) return
    void handleDeleteSupplierRequest(supplierId)
  }

  function handleToggleSelection(supplierId: string, checked: boolean) {
    setSelectedSupplierIds((prev) => {
      const next = new Set(prev)
      if (checked) next.add(supplierId)
      else next.delete(supplierId)
      return next
    })
  }

  function handleToggleAllVisible(checked: boolean) {
    setSelectedSupplierIds((prev) => {
      const next = new Set(prev)
      filteredSuppliers.forEach((supplier) => {
        if (checked) next.add(supplier.id)
        else next.delete(supplier.id)
      })
      return next
    })
  }

  function handleSupplierCreated(supplier: Supplier) {
    setSuppliers((currentSuppliers) => {
      const nextSuppliers = [supplier, ...currentSuppliers.filter((item) => item.id !== supplier.id)]
      return nextSuppliers
    })
  }

  return (
    <div className="relative space-y-6 overflow-hidden pb-4">
      <FormSupplier
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onCreated={handleSupplierCreated}
        onFeedback={setFeedback}
      />

      <AlertComponent alert={feedback} onClose={() => setFeedback(null)} />

      <SupplierCatalogHeader onAddSupplier={handleAddSupplier} />

      <SupplierStats suppliers={suppliers} />

      <section className="overflow-hidden rounded-2xl border border-border/70 bg-card/95 shadow-sm">
        <div className="border-b border-border/70 p-5">
          <div className="relative max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar fornecedores..."
              className="h-10 rounded-xl border-border/70 bg-background pl-10"
            />
          </div>
        </div>

        <SupplierTable
          suppliers={filteredSuppliers}
          selectedSupplierIds={selectedSupplierIds}
          deletingSupplierIds={deletingSupplierIds}
          onToggleSelection={handleToggleSelection}
          onToggleAll={handleToggleAllVisible}
          onDeleteSupplier={handleDeleteSupplier}
        />
      </section>
    </div>
  )
}

export default SupplierComponent
