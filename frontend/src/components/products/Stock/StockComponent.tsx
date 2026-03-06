"use client"

import { useEffect, useMemo, useState } from "react"
import { AlertCircle, Boxes, RefreshCw } from "lucide-react"

import { StockCategoryDistribution } from "@/components/products/Stock/StockCategoryDistribution"
import { StockHealthPanel } from "@/components/products/Stock/StockHealthPanel"
import { StockHero } from "@/components/products/Stock/StockHero"
import { StockKpiCards } from "@/components/products/Stock/StockKpiCards"
import { StockMovementsTimeline } from "@/components/products/Stock/StockMovementsTimeline"
import { StockReplenishmentPanel } from "@/components/products/Stock/StockReplenishmentPanel"
import { createMockStockMovements } from "@/components/products/Stock/stock-mock-data"
import {
  buildReplenishmentSuggestions,
  calculateInventoryOverview,
  mapApiProductToStockProduct,
  summarizeByCategory,
  type StockProduct,
} from "@/components/products/Stock/stock-models"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { getProducts } from "@/services/products.service"

export function StockComponent() {
  const [products, setProducts] = useState<StockProduct[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  async function loadProducts() {
    setIsLoading(true)

    try {
      const response = await getProducts()
      setProducts(response.data.map(mapApiProductToStockProduct))
      setErrorMessage(null)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Nao foi possivel carregar os produtos para o estoque."
      setErrorMessage(message)
      setProducts([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadProducts()
  }, [])

  const overview = useMemo(() => calculateInventoryOverview(products), [products])

  const categories = useMemo(() => summarizeByCategory(products).slice(0, 6), [products])

  const replenishmentSuggestions = useMemo(() => buildReplenishmentSuggestions(products), [products])

  const movements = useMemo(() => {
    return createMockStockMovements(products)
      .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
      .slice(0, 7)
  }, [products])

  return (
    <div className="space-y-5 pb-4 md:space-y-6">
      <StockHero overview={overview} />

      {errorMessage ? (
        <Card className="border-red-300/60 bg-red-100/50 py-0">
          <CardContent className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-2 text-red-800">
              <AlertCircle className="mt-0.5 h-4 w-4" />
              <p className="text-sm">{errorMessage}</p>
            </div>

            <Button type="button" size="sm" variant="outline" className="border-red-300/60 bg-red-50 text-red-700" onClick={() => void loadProducts()}>
              <RefreshCw className="h-3.5 w-3.5" /> Tentar novamente
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <StockKpiCards overview={overview} />

      {isLoading ? (
        <StockPageSkeleton />
      ) : products.length === 0 ? (
        <Card className="border-border/70 bg-card/85 py-0">
          <CardContent className="flex flex-col items-center justify-center gap-2 px-6 py-10 text-center">
            <div className="rounded-xl border border-primary/20 bg-primary/10 p-3 text-primary">
              <Boxes className="h-5 w-5" />
            </div>
            <p className="text-base font-medium">Nenhum produto em estoque</p>
            <p className="max-w-md text-sm text-muted-foreground">
              Cadastre produtos no catalogo para liberar os indicadores de estoque e movimentacoes operacionais.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <section className="grid gap-4 xl:grid-cols-3">
            <div className="xl:col-span-2">
              <StockHealthPanel products={products} />
            </div>
            <StockCategoryDistribution categories={categories} />
          </section>

          <section className="grid gap-4 xl:grid-cols-3">
            <StockMovementsTimeline movements={movements} />
            <StockReplenishmentPanel suggestions={replenishmentSuggestions} />
          </section>
        </>
      )}
    </div>
  )
}

export default StockComponent

function StockPageSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((item) => (
          <div key={item} className="h-28 animate-pulse rounded-xl border border-border/60 bg-muted/40" />
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-3">
        <div className="h-72 animate-pulse rounded-xl border border-border/60 bg-muted/40 xl:col-span-2" />
        <div className="h-72 animate-pulse rounded-xl border border-border/60 bg-muted/40" />
      </div>
      <div className="grid gap-4 xl:grid-cols-3">
        <div className="h-72 animate-pulse rounded-xl border border-border/60 bg-muted/40 xl:col-span-2" />
        <div className="h-72 animate-pulse rounded-xl border border-border/60 bg-muted/40" />
      </div>
    </div>
  )
}
