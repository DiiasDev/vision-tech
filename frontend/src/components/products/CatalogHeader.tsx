import { Package, Plus, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"

type CatalogHeaderProps = {
  onAddProduct?: () => void
}

export function CatalogHeader({ onAddProduct }: CatalogHeaderProps) {
  return (
    <section className="relative w-full overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/12 via-card to-accent/10 p-6 shadow-sm md:p-7">
      <div className="pointer-events-none absolute right-0 top-0 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/3 h-44 w-44 rounded-full bg-accent/20 blur-3xl" />

      <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-4">
          <div className="rounded-2xl border border-primary/25 bg-background/80 p-3 shadow-sm">
            <Package className="h-6 w-6 text-primary" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              vitrine comercial
            </div>

            <div>
              <h1 className="text-3xl font-semibold tracking-tight">Catálogo de Produtos</h1>
              <p className="text-sm text-muted-foreground md:text-base">
                Gerencie produtos e serviços com contexto de estoque, giro e margem para vender com confiança.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden rounded-xl border bg-background/70 px-3 py-2 text-xs text-muted-foreground sm:block">
            <p className="font-medium text-foreground">Pipeline de vendas</p>
            <p>Atualizado em tempo real</p>
          </div>

          <Button type="button" className="h-11 rounded-xl px-5 text-sm shadow-sm" onClick={onAddProduct}>
            <Plus className="h-4 w-4" />
            Adicionar Produto
          </Button>
        </div>
      </div>

      <div className="relative z-10 mt-5 grid grid-cols-1 gap-3 text-sm text-muted-foreground sm:grid-cols-3">
        <div className="rounded-xl border bg-background/55 px-3 py-2">
          <span className="font-medium text-foreground">Tempo médio de cadastro</span>: 2min 14s
        </div>
        <div className="rounded-xl border bg-background/55 px-3 py-2">
          <span className="font-medium text-foreground">Precisão de estoque</span>: 98.2%
        </div>
        <div className="rounded-xl border bg-background/55 px-3 py-2">
          <span className="font-medium text-foreground">Itens com foto</span>: 100%
        </div>
      </div>
    </section>
  )
}
