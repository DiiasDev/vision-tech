"use client"

import { useState } from "react"
import { AlertTriangle, Boxes, ChartNoAxesColumnIncreasing, CircleHelp, FilePenLine } from "lucide-react"

import { ModalInfo } from "@/components/products/Modals/ModalInfo"
import { Product } from "@/components/products/productsMock"
import { Button } from "@/components/ui/button"
import { formatPriceOrCostBR } from "@/utils/Formatter"

type Props = {
  products: Product[]
}

export function CatalogStats({ products }: Props) {
  const [activeInfoCard, setActiveInfoCard] = useState<string | null>(null)

  const total = products.length
  const active = products.filter((product) => product.status === "active").length
  const inactive = products.filter((product) => product.status === "inactive").length
  const outOfStock = products.filter((product) => product.status === "out_of_stock").length
  const lowStock = products.filter((product) => product.stock <= product.minStock).length
  const inventoryValue = products.reduce((acc, product) => acc + product.price * product.stock, 0)

  const cards = [
    {
      id: "total-products",
      title: "Total de Produtos",
      value: total.toString(),
      hint: `${active} ativos em operação`,
      icon: Boxes,
      color: "text-primary",
      bg: "from-primary/15 to-primary/5",
      modalDescription: "Mostra o volume total de itens cadastrados no catálogo.",
      modalDetails: [
        "Conta todos os produtos registrados, independentemente do status.",
        "Ajuda a medir o tamanho atual do portfólio de venda.",
        "Use junto com os cards de status para identificar distribuição dos itens.",
      ],
    },
    {
      id: "inventory-value",
      title: "Valor em Estoque",
      value: formatPriceOrCostBR(inventoryValue),
      hint: "Capital disponível para venda",
      icon: ChartNoAxesColumnIncreasing,
      color: "text-emerald-600",
      bg: "from-emerald-500/15 to-emerald-500/5",
      modalDescription: "Representa o valor financeiro dos itens disponíveis no estoque.",
      modalDetails: [
        "Cálculo: soma de preço de venda x quantidade em estoque para cada produto.",
        "Indica o capital imobilizado em produtos para venda.",
        "Acompanhe para ajustar compras e evitar excesso de estoque.",
      ],
    },
    {
      id: "inactive-products",
      title: "Inativos",
      value: inactive.toString(),
      hint: "Itens fora da vitrine",
      icon: FilePenLine,
      color: "text-amber-600",
      bg: "from-amber-500/15 to-amber-500/5",
      modalDescription: "Exibe quantos produtos estão desativados no momento.",
      modalDetails: [
        "Itens inativos não devem aparecer como disponíveis para venda.",
        "Pode indicar produtos descontinuados ou em revisão comercial.",
        "Revise periodicamente para reativar ou arquivar definitivamente.",
      ],
    },
    {
      id: "out-of-stock",
      title: "Sem Estoque",
      value: outOfStock.toString(),
      hint: `${lowStock} no limite mínimo`,
      icon: AlertTriangle,
      color: "text-red-600",
      bg: "from-red-500/15 to-red-500/5",
      modalDescription: "Monitora produtos zerados e itens próximos do limite mínimo.",
      modalDetails: [
        "Valor principal: quantidade de produtos com status sem estoque.",
        "Hint: itens com estoque menor ou igual ao estoque mínimo cadastrado.",
        "Use para priorizar reposição e reduzir ruptura de vendas.",
      ],
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

            <div className="flex items-center gap-1.5">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="rounded-xl"
                aria-label={`Entender card ${card.title}`}
                onClick={() => setActiveInfoCard(card.id)}
              >
                <CircleHelp className="h-4 w-4 text-muted-foreground" />
              </Button>

              <div className={`rounded-xl bg-gradient-to-br p-2.5 ${card.bg}`}>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </div>
          </div>

          <ModalInfo
            open={activeInfoCard === card.id}
            onClose={() => setActiveInfoCard(null)}
            title={card.title}
            description={card.modalDescription}
            details={card.modalDetails}
          />
        </article>
      ))}
    </section>
  )
}
