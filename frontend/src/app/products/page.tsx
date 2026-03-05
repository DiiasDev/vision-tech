"use client"

import { useEffect, useState } from "react"

import { AlertComponent, ComponentAlert, type ComponentAlertState } from "@/components/layout/AlertComponent"
import { type Product } from "@/components/products/productsMock"
import { getProductCodes, getProducts, type ProductsListItem } from "@/services/products.service"

import { CatalogHeader } from "@/components/products/CatalogHeader"
import { FormProducts } from "@/components/products/FormProducts"
import { ProductSpreadsheetActions } from "@/components/products/ProductSpreadsheetActions"
import { CatalogStats } from "@/components/products/CatalogStats"
import { ProductGrid } from "@/components/products/ProductGrid"
import { ProductSearch } from "@/components/products/ProductSearch"

function mapApiStatusToUi(status: ProductsListItem["status"]): Product["status"] {
  if (status === "INACTIVE") return "inactive"
  if (status === "OUT_OF_STOCK") return "out_of_stock"
  return "active"
}

function mapApiCategoryToUi(category: ProductsListItem["category"]) {
  const categoryMap: Record<ProductsListItem["category"], string> = {
    HARDWARE: "Hardware",
    SOFTWARE: "Software",
    SERVICES: "Servicos",
    PERIPHERALS: "Perifericos",
    LICENSES: "Licencas",
    INFRASTRUCTURE: "Infraestrutura",
    OTHERS: "Outros",
  }

  return categoryMap[category] ?? category
}

function mapApiProductToUi(product: ProductsListItem): Product {
  return {
    id: product.id,
    code: product.code,
    name: product.name,
    description: product.description ?? "",
    category: mapApiCategoryToUi(product.category),
    price: Number.parseFloat(product.price) || 0,
    cost: Number.parseFloat(product.cost ?? "0") || 0,
    stock: product.stock ?? 0,
    minStock: product.minStock ?? 0,
    unitOfMeasure: product.unitOfMeasure ?? "",
    location: product.location ?? "",
    percentage: Number.parseFloat(product.percentage) || 0,
    status: mapApiStatusToUi(product.status),
    createdAt: product.createdAt?.slice(0, 10) ?? new Date().toISOString().slice(0, 10),
    updatedAt: product.updatedAt?.slice(0, 10) ?? new Date().toISOString().slice(0, 10),
    createdBy: product.createdBy ?? "Usuario",
    brand: product.brand ?? "",
    supplier: product.supplier ?? "",
    monthlySales: product.monthlySales ?? 0,
    imageUrl: product.imageUrl ?? "/product.png",
  }
}

export default function ProductsCatalogPage() {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive" | "out_of_stock">("all")
  const [products, setProducts] = useState<Product[]>([])
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(new Set())
  const [showProductForm, setShowProductForm] = useState(false)
  const [feedback, setFeedback] = useState<ComponentAlertState | null>(null)
  const [productCodes, setProductCodes] = useState<string[]>([])

  async function refreshProducts() {
    try {
      const response = await getProducts()
      const mappedProducts = response.data.map(mapApiProductToUi)
      setProducts(mappedProducts)
      setProductCodes(mappedProducts.map((item) => item.code))
    } catch (error) {
      const message = error instanceof Error ? error.message : "Nao foi possivel carregar os produtos."
      setFeedback(ComponentAlert.Error(message))
      setProducts([])
      setProductCodes([])
    }
  }

  async function refreshProductCodes() {
    try {
      const response = await getProductCodes()
      setProductCodes(response.data)
    } catch {
      setProductCodes((prev) => prev)
    }
  }

  useEffect(() => {
    void getProducts()
      .then((response) => {
        const mappedProducts = response.data.map(mapApiProductToUi)
        setProducts(mappedProducts)
        setProductCodes(mappedProducts.map((item) => item.code))
      })
      .catch((error) => {
        const message = error instanceof Error ? error.message : "Nao foi possivel carregar os produtos."
        setFeedback(ComponentAlert.Error(message))
      })
  }, [])

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

  function handleOpenProductForm() {
    setFeedback(null)
    void refreshProductCodes()
    setShowProductForm(true)
  }

  return (
    <div className="relative space-y-8 overflow-hidden pb-4">
      <div className="relative">
        <CatalogHeader onAddProduct={handleOpenProductForm} />
      </div>

      <AlertComponent alert={feedback} onClose={() => setFeedback(null)} />

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

      <FormProducts
        open={showProductForm}
        onClose={() => setShowProductForm(false)}
        productCodes={productCodes}
        onCreated={(product) => {
          setProducts((prev) => [product, ...prev])
          setProductCodes((prev) => (prev.includes(product.code) ? prev : [...prev, product.code]))
          void refreshProducts()
        }}
        onFeedback={setFeedback}
      />
    </div>
  )
}
