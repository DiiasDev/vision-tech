import { Boxes, Layers2 } from "lucide-react"

import { type CategoryStockSummary } from "@/components/products/Stock/stock-models"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrencyBR } from "@/utils/Formatter"

type StockCategoryDistributionProps = {
  categories: CategoryStockSummary[]
}

function formatInteger(value: number) {
  return new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 }).format(value)
}

export function StockCategoryDistribution({ categories }: StockCategoryDistributionProps) {
  const maxUnits = Math.max(...categories.map((category) => category.units), 1)
  const leader = categories[0]

  return (
    <Card className="border-border/70 bg-card/85 py-0">
      <CardHeader className="border-b border-border/70 py-4">
        <CardTitle className="text-base">Distribuicao por categoria</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4 p-4">
        {leader ? (
          <div className="rounded-xl border border-border/60 bg-background/70 p-3">
            <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Categoria com maior volume</p>
            <div className="mt-2 flex items-start justify-between gap-3">
              <div>
                <p className="text-base font-semibold">{leader.category}</p>
                <p className="text-xs text-muted-foreground">
                  {formatInteger(leader.productsCount)} produtos • {formatInteger(leader.units)} unidades
                </p>
              </div>
              <div className="rounded-lg border border-primary/20 bg-primary/10 p-2 text-primary">
                <Layers2 className="h-4 w-4" />
              </div>
            </div>
          </div>
        ) : null}

        <div className="space-y-3">
          {categories.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border/70 bg-muted/25 px-4 py-6 text-sm text-muted-foreground">
              Sem produtos para consolidar por categoria.
            </p>
          ) : (
            categories.map((category) => {
              const fillPercentage = (category.units / maxUnits) * 100

              return (
                <div key={category.category} className="space-y-1.5 rounded-xl border border-border/60 bg-background/70 p-3">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="font-medium">{category.category}</span>
                    <span className="text-muted-foreground">
                      {formatInteger(category.units)} un • {formatCurrencyBR(category.valueAtCost)}
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary/80" style={{ width: `${fillPercentage}%` }} />
                  </div>
                </div>
              )
            })
          )}
        </div>

        <div className="rounded-xl border border-dashed border-border/70 bg-muted/30 p-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-2 font-medium text-foreground">
            <Boxes className="h-3.5 w-3.5 text-primary" />
            Leitura rapida
          </div>
          <p className="mt-1.5 leading-relaxed">
            Equilibre compras por categoria para evitar excesso de capital em itens com menor giro.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
