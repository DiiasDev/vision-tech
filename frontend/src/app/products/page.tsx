"use client"

import { Search } from "lucide-react"
import { useEffect, useMemo, useState } from "react"

import { AlertComponent, ComponentAlert, type ComponentAlertState } from "@/components/layout/AlertComponent"
import { type Product } from "@/components/products/productsMock"
import { deleteProduct, getProductCodes, getProducts, type ProductsListItem } from "@/services/products.service"

import { CatalogHeader } from "@/components/products/CatalogHeader"
import { CatalogStats } from "@/components/products/CatalogStats"
import { FormProducts } from "@/components/products/FormProducts"
import { ProductsTable } from "@/components/products/ProductsTable"
import { Input } from "@/components/ui/input"

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
  const [products, setProducts] = useState<Product[]>([])
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(new Set())
  const [showProductForm, setShowProductForm] = useState(false)
  const [feedback, setFeedback] = useState<ComponentAlertState | null>(null)
  const [productCodes, setProductCodes] = useState<string[]>([])
  const [deletingProductIds, setDeletingProductIds] = useState<Set<string>>(new Set())

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
    void refreshProducts()
  }, [])

  const filteredProducts = useMemo(() => {
    const searchValue = search.trim().toLowerCase()
    if (!searchValue) return products

    return products.filter((product) => {
      return (
        product.name.toLowerCase().includes(searchValue) ||
        product.code.toLowerCase().includes(searchValue) ||
        product.supplier.toLowerCase().includes(searchValue) ||
        product.category.toLowerCase().includes(searchValue)
      )
    })
  }, [products, search])

  function removeProductFromState(productId: string) {
    setProducts((prev) => prev.filter((product) => product.id !== productId))
    setSelectedProductIds((prev) => {
      const next = new Set(prev)
      next.delete(productId)
      return next
    })
  }

  async function handleDeleteProductRequest(productId: string) {
    setFeedback(ComponentAlert.Info("Excluindo produto..."))

    setDeletingProductIds((prev) => {
      const next = new Set(prev)
      next.add(productId)
      return next
    })

    try {
      const result = await deleteProduct(productId)
      removeProductFromState(productId)
      setFeedback(ComponentAlert.Success(result.message || "Produto excluido com sucesso."))
    } catch (error) {
      const message = error instanceof Error ? error.message : "Nao foi possivel excluir o produto."
      setFeedback(ComponentAlert.Error(message))
    } finally {
      setDeletingProductIds((prev) => {
        const next = new Set(prev)
        next.delete(productId)
        return next
      })
    }
  }

  function handleDeleteProduct(productId: string) {
    if (deletingProductIds.has(productId)) return
    void handleDeleteProductRequest(productId)
  }

  function handleToggleSelection(productId: string, checked: boolean) {
    setSelectedProductIds((prev) => {
      const next = new Set(prev)
      if (checked) next.add(productId)
      else next.delete(productId)
      return next
    })
  }

  function handleToggleAllVisible(checked: boolean) {
    setSelectedProductIds((prev) => {
      const next = new Set(prev)

      filteredProducts.forEach((product) => {
        if (checked) next.add(product.id)
        else next.delete(product.id)
      })

      return next
    })
  }

  function handleOpenProductForm() {
    setFeedback(null)
    void refreshProductCodes()
    setShowProductForm(true)
  }

  return (
    <div className="relative space-y-6 overflow-hidden pb-4">
      <div className="relative">
        <CatalogHeader onAddProduct={handleOpenProductForm} />
      </div>

      <AlertComponent alert={feedback} onClose={() => setFeedback(null)} />

      <div className="relative">
        <CatalogStats products={products} />
      </div>

      <section className="overflow-hidden rounded-2xl border border-border/70 bg-card/95 shadow-sm">
        <div className="border-b border-border/70 p-5">
          <div className="relative max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar produtos..."
              className="h-10 rounded-xl border-border/70 bg-background pl-10"
            />
          </div>
        </div>

        <ProductsTable
          products={filteredProducts}
          selectedProductIds={selectedProductIds}
          onToggleSelection={handleToggleSelection}
          onToggleAll={handleToggleAllVisible}
          onDelete={handleDeleteProduct}
          deletingProductIds={deletingProductIds}
        />
      </section>

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
