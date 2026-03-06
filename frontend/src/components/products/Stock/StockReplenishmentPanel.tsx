import { AlertTriangle, ShoppingCart, Truck } from "lucide-react"

import { type ReplenishmentSuggestion } from "@/components/products/Stock/stock-models"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrencyBR } from "@/utils/Formatter"

type StockReplenishmentPanelProps = {
  suggestions: ReplenishmentSuggestion[]
}

export function StockReplenishmentPanel({ suggestions }: StockReplenishmentPanelProps) {
  const estimatedPurchaseTotal = suggestions.reduce((sum, item) => sum + item.estimatedCost, 0)

  return (
    <Card className="border-border/70 bg-card/85 py-0">
      <CardHeader className="border-b border-border/70 py-4">
        <CardTitle className="text-base">Prioridades de reposicao</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4 p-4">
        <div className="rounded-xl border border-border/60 bg-background/75 p-3">
          <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Compra sugerida</p>
          <div className="mt-2 flex items-center justify-between gap-3">
            <p className="text-xl font-semibold">{formatCurrencyBR(estimatedPurchaseTotal)}</p>
            <Badge className="rounded-full bg-primary/15 text-primary hover:bg-primary/15">{suggestions.length} itens</Badge>
          </div>
        </div>

        {suggestions.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border/70 bg-muted/25 px-4 py-6 text-sm text-muted-foreground">
            Nenhum produto requer reposicao imediata.
          </p>
        ) : (
          <div className="space-y-3">
            {suggestions.map((item) => {
              const isCritical = item.currentStock <= 0 || item.coverageDays <= 7

              return (
                <article key={item.productId} className="rounded-xl border border-border/60 bg-background/75 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium leading-tight">{item.productName}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.productCode} • {item.supplier}
                      </p>
                    </div>

                    <Badge
                      className={`rounded-full border px-2.5 py-0.5 text-[11px] ${
                        isCritical
                          ? "border-red-300/60 bg-red-100/60 text-red-700"
                          : "border-amber-300/60 bg-amber-100/60 text-amber-700"
                      }`}
                    >
                      <AlertTriangle className="mr-1 h-3.5 w-3.5" />
                      {isCritical ? "Urgente" : "Planejar"}
                    </Badge>
                  </div>

                  <div className="mt-2 grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                    <div className="rounded-lg border border-border/65 bg-background px-2 py-1.5">
                      <p>Atual</p>
                      <p className="font-semibold text-foreground">{item.currentStock}</p>
                    </div>
                    <div className="rounded-lg border border-border/65 bg-background px-2 py-1.5">
                      <p>Minimo</p>
                      <p className="font-semibold text-foreground">{item.minimumStock}</p>
                    </div>
                    <div className="rounded-lg border border-border/65 bg-background px-2 py-1.5">
                      <p>Sugerido</p>
                      <p className="font-semibold text-foreground">{item.recommendedPurchase}</p>
                    </div>
                  </div>

                  <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                    <span>Cobertura atual: {item.coverageDays.toFixed(1)} dias</span>
                    <span>Custo estimado: {formatCurrencyBR(item.estimatedCost)}</span>
                  </div>
                </article>
              )
            })}
          </div>
        )}

        <div className="flex items-center gap-2">
          <Button type="button" size="sm" className="flex-1 gap-1.5">
            <ShoppingCart className="h-3.5 w-3.5" /> Gerar pedido
          </Button>
          <Button type="button" size="sm" variant="outline" className="flex-1 gap-1.5">
            <Truck className="h-3.5 w-3.5" /> Acionar fornecedor
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
