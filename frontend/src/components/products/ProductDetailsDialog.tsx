"use client"

import { type ComponentType } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  BadgeCheck,
  Barcode,
  CalendarClock,
  Factory,
  MapPin,
  Package,
  Percent,
  TrendingUp,
  UserRound,
  Wallet,
} from "lucide-react"

import { type Product } from "@/components/products/productsMock"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { formatPriceOrCostBR } from "@/utils/Formatter"

type Props = {
  product: Product | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

function formatDate(value: string) {
  const dateOnlyMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (dateOnlyMatch) {
    const year = Number.parseInt(dateOnlyMatch[1], 10)
    const month = Number.parseInt(dateOnlyMatch[2], 10)
    const day = Number.parseInt(dateOnlyMatch[3], 10)
    const localDate = new Date(year, month - 1, day, 12, 0, 0)

    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(localDate)
  }

  const parsedDate = new Date(value)
  if (Number.isNaN(parsedDate.getTime())) return value

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(parsedDate)
}

function getStatusBadge(product: Product) {
  if (product.status === "out_of_stock" || product.stock <= 0) {
    return {
      label: "Sem estoque",
      className: "border-rose-200 bg-rose-50 text-rose-700",
    }
  }

  if (product.status === "inactive") {
    return {
      label: "Inativo",
      className: "border-zinc-200 bg-zinc-100 text-zinc-700",
    }
  }

  if (product.stock <= product.minStock) {
    return {
      label: "Estoque baixo",
      className: "border-amber-200 bg-amber-50 text-amber-700",
    }
  }

  return {
    label: "Em estoque",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  }
}

function getSafeImageSrc(imageUrl?: string) {
  if (!imageUrl) return "/product.png"
  if (imageUrl.startsWith("/") || imageUrl.startsWith("data:")) return imageUrl
  return "/product.png"
}

function DetailCard({
  title,
  value,
  icon: Icon,
}: {
  title: string
  value: string
  icon: ComponentType<{ className?: string }>
}) {
  return (
    <div className="min-w-0 rounded-2xl border border-border/70 bg-background/70 p-3">
      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.08em] text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        <span>{title}</span>
      </div>
      <p className="mt-2 whitespace-normal break-all text-sm font-semibold text-foreground">{value}</p>
    </div>
  )
}

export function ProductDetailsDialog({ product, open, onOpenChange }: Props) {
  if (!product) return null

  const status = getStatusBadge(product)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[min(calc(100%-1rem),70rem)] max-w-none border-0 bg-transparent p-0 shadow-none">
        <div className="relative overflow-hidden rounded-3xl border border-border/70 bg-card">
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-primary/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 left-8 h-52 w-52 rounded-full bg-accent/35 blur-3xl" />

          <div className="relative space-y-6 p-6 md:p-7">
            <DialogHeader className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="border-primary/30 bg-primary/8 text-primary">
                  Visão completa do produto
                </Badge>
                <Badge variant="outline" className={status.className}>
                  {status.label}
                </Badge>
              </div>

              <DialogTitle className="break-words text-3xl font-semibold tracking-tight">{product.name}</DialogTitle>
              <DialogDescription className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
                {product.description || "Produto sem descrição cadastrada."}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-6 rounded-2xl border border-border/70 bg-muted/25 p-4 md:grid-cols-[220px_1fr] md:p-5">
              <div className="overflow-hidden rounded-2xl border border-border/70 bg-background">
                <Image
                  src={getSafeImageSrc(product.imageUrl)}
                  alt={product.name}
                  width={400}
                  height={400}
                  className="aspect-square h-full w-full object-cover"
                />
              </div>

              <div className="min-w-0 space-y-4">
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  <DetailCard title="Código" value={product.code} icon={Barcode} />
                  <DetailCard title="Categoria" value={product.category} icon={Package} />
                  <DetailCard title="Marca" value={product.brand || "Não informado"} icon={BadgeCheck} />
                </div>

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  <DetailCard title="Preço de venda" value={formatPriceOrCostBR(product.price)} icon={Wallet} />
                  <DetailCard title="Custo" value={formatPriceOrCostBR(product.cost)} icon={Wallet} />
                  <DetailCard title="Margem" value={`${product.percentage}%`} icon={Percent} />
                </div>
              </div>
            </div>

            <Separator />

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <DetailCard title="Estoque atual" value={`${product.stock} ${product.unitOfMeasure || "un"}`} icon={Package} />
              <DetailCard title="Estoque mínimo" value={`${product.minStock} ${product.unitOfMeasure || "un"}`} icon={Package} />
              <DetailCard title="Unidade de medida" value={product.unitOfMeasure || "Não informado"} icon={Package} />
              <DetailCard title="Localização" value={product.location || "Não informado"} icon={MapPin} />
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <DetailCard title="Fornecedor" value={product.supplier || "Não informado"} icon={Factory} />
              <DetailCard title="Vendas mensais" value={`${product.monthlySales}`} icon={TrendingUp} />
              <DetailCard title="Criado por" value={product.createdBy || "Não informado"} icon={UserRound} />
              <DetailCard title="Criado em" value={formatDate(product.createdAt)} icon={CalendarClock} />
              <DetailCard title="Atualizado em" value={formatDate(product.updatedAt)} icon={CalendarClock} />
            </div>
          </div>

          <DialogFooter className="sticky bottom-0 border-t border-border/70 bg-card/95 px-6 py-4 backdrop-blur-sm md:px-7">
            <DialogClose asChild>
              <Button variant="outline">Fechar</Button>
            </DialogClose>
            <Button asChild>
              <Link href={`/products/id?productId=${product.id}&mode=edit`}>Editar produto</Link>
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}
