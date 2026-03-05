import { Product } from "@/components/products/productsMock"
import { ProductCard } from "./ProductCard"

type Props = {
  products: Product[]
  onDelete: (productId: string) => void
  deletingProductIds: Set<string>
  selectedProductIds: Set<string>
  onToggleSelection: (productId: string, checked: boolean) => void
}

export function ProductGrid({ products, onDelete, deletingProductIds, selectedProductIds, onToggleSelection }: Props) {
  if (!products.length) {
    return (
      <section className="rounded-3xl border border-dashed border-border/80 bg-card/60 px-6 py-16 text-center">
        <p className="text-lg font-medium">Nenhum produto encontrado</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Ajuste os filtros de busca ou adicione um novo produto para começar.
        </p>
      </section>
    )
  }

  return (
    <section className="grid grid-cols-1 gap-6 md:grid-cols-2 2xl:grid-cols-3">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onDelete={onDelete}
          isDeleting={deletingProductIds.has(product.id)}
          isSelected={selectedProductIds.has(product.id)}
          onToggleSelection={onToggleSelection}
        />
      ))}
    </section>
  )
}
