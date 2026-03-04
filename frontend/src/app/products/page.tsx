"use client"

import { useState } from "react"

import { productsMock, type Product } from "@/components/products/productsMock"

import { CatalogHeader } from "@/components/products/CatalogHeader"
import { ProductSpreadsheetActions } from "@/components/products/ProductSpreadsheetActions"
import { CatalogStats } from "@/components/products/CatalogStats"
import { ProductGrid } from "@/components/products/ProductGrid"
import { ProductSearch } from "@/components/products/ProductSearch"

export default function ProductsCatalogPage() {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive" | "out_of_stock">("all")
  const [products, setProducts] = useState(productsMock)
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(new Set())

  const filteredProducts = products.filter((product) => {
    const searchValue = search.toLowerCase()
    const matchesSearch =
      product.name.toLowerCase().includes(searchValue) ||
      product.code.toLowerCase().includes(searchValue) ||
      product.supplier.toLowerCase().includes(searchValue)

    if (statusFilter === "all") return matchesSearch

    return matchesSearch && product.status === statusFilter
  })

  function handleDeleteProduct(productId: string) {
    setProducts((prev) => prev.filter((product) => product.id !== productId))
    setSelectedProductIds((prev) => {
      const next = new Set(prev)
      next.delete(productId)
      return next
    })
  }

  function handleToggleSelection(productId: string, checked: boolean) {
    setSelectedProductIds((prev) => {
      const next = new Set(prev)
      if (checked) next.add(productId)
      else next.delete(productId)
      return next
    })
  }

  function handleSelectAll() {
    setSelectedProductIds(new Set(products.map((product) => product.id)))
  }

  function handleClearSelection() {
    setSelectedProductIds(new Set())
  }

  function handleImportProducts(importedProducts: Product[]) {
    setProducts((prev) => [...importedProducts, ...prev])
  }

  return (
    <div className="relative space-y-8 overflow-hidden pb-4">
      <div className="relative">
        <CatalogHeader />
      </div>

      <div className="relative">
        <CatalogStats products={products} />
      </div>

      <ProductSpreadsheetActions
        products={products}
        selectedProductIds={selectedProductIds}
        onSelectAll={handleSelectAll}
        onClearSelection={handleClearSelection}
        onImportProducts={handleImportProducts}
      />

      <div className="relative rounded-2xl border border-border/70 bg-card/80 p-4 shadow-sm md:p-5">
        <ProductSearch
          onSearch={setSearch}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          resultCount={filteredProducts.length}
        />
      </div>

      <div className="relative">
        <ProductGrid
          products={filteredProducts}
          onDelete={handleDeleteProduct}
          selectedProductIds={selectedProductIds}
          onToggleSelection={handleToggleSelection}
        />
      </div>
    </div>
  )
}
