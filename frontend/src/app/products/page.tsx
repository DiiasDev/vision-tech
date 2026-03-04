"use client"

import { useState } from "react"

import { productsMock } from "@/components/products/productsMock"

import { CatalogHeader } from "@/components/products/CatalogHeader"
import { CatalogStats } from "@/components/products/CatalogStats"
import { ProductGrid } from "@/components/products/ProductGrid"
import { ProductSearch } from "@/components/products/ProductSearch"

export default function ProductsCatalogPage() {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive" | "out_of_stock">("all")
  const [products, setProducts] = useState(productsMock)

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
  }

  return (
    <div className="relative space-y-8 overflow-hidden pb-4">
      <div className="relative">
        <CatalogHeader />
      </div>

      <div className="relative">
        <CatalogStats products={products} />
      </div>

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
        />
      </div>
    </div>
  )
}
