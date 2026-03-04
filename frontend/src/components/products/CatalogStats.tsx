import { AlertTriangle, Boxes, ChartNoAxesColumnIncreasing, FilePenLine } from "lucide-react"

import { Product } from "@/components/products/productsMock"
import { formatPriceOrCostBR } from "@/utils/Formatter"

type Props = {
  products: Product[]
}

export function CatalogStats({ products }: Props) {
  const total = products.length
  const active = products.filter((product) => product.status === "active").length
  const inactive = products.filter((product) => product.status === "inactive").length
  const outOfStock = products.filter((product) => product.status === "out_of_stock").length
  const lowStock = products.filter((product) => product.stock <= product.minStock).length
  const inventoryValue = products.reduce((acc, product) => acc + product.price * product.stock, 0)

  const cards = [
    {
      title: "Total de Produtos",
      value: total.toString(),
      hint: `${active} ativos em operação`,
      icon: Boxes,
      color: "text-primary",
      bg: "from-primary/15 to-primary/5",
    },
    {
      title: "Valor em Estoque",
      value: formatPriceOrCostBR(inventoryValue),
      hint: "Capital disponível para venda",
      icon: ChartNoAxesColumnIncreasing,
      color: "text-emerald-600",
      bg: "from-emerald-500/15 to-emerald-500/5",
    },
    {
      title: "Inativos",
      value: inactive.toString(),
      hint: "Itens fora da vitrine",
      icon: FilePenLine,
      color: "text-amber-600",
      bg: "from-amber-500/15 to-amber-500/5",
    },
    {
      title: "Sem Estoque",
      value: outOfStock.toString(),
      hint: `${lowStock} no limite mínimo`,
      icon: AlertTriangle,
      color: "text-red-600",
      bg: "from-red-500/15 to-red-500/5",
    },
  ]

  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <article
          key={card.title}
          className="rounded-2xl border border-border/70 bg-card/90 p-4 shadow-sm transition-colors hover:border-primary/25"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm text-muted-foreground">{card.title}</p>
              <p className="mt-2 text-2xl font-semibold tracking-tight">{card.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{card.hint}</p>
            </div>

            <div className={`rounded-xl bg-gradient-to-br p-2.5 ${card.bg}`}>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </div>
          </div>
        </article>
      ))}
    </section>
  )
}
