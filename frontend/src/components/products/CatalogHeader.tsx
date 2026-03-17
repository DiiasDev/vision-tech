import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"

type CatalogHeaderProps = {
  onAddProduct?: () => void
}

export function CatalogHeader({ onAddProduct }: CatalogHeaderProps) {
  return (
    <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <h1 className="text-4xl font-semibold tracking-tight text-foreground">Products</h1>
        <p className="mt-1 text-lg text-muted-foreground">Manage your product catalog</p>
      </div>

      <Button type="button" className="h-11 rounded-xl px-5 text-sm shadow-sm" onClick={onAddProduct}>
        <Plus className="h-4 w-4" />
        Add Product
      </Button>
    </section>
  )
}
