"use client"

import Image from "next/image"
import Link from "next/link"
import { useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import {
  ArrowLeft,
  Box,
  Factory,
  PackageCheck,
  Save,
  Tag,
  TrendingUp,
  User,
} from "lucide-react"

import { productsMock, type ProductStatus } from "@/components/products/productsMock"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(value))
}

export default function ProductDetailsPage() {
  const searchParams = useSearchParams()
  const productId = searchParams.get("productId")

  const selectedProduct = useMemo(
    () => productsMock.find((product) => product.id === productId),
    [productId]
  )

  const [form, setForm] = useState(() => ({
    code: selectedProduct?.code ?? "",
    name: selectedProduct?.name ?? "",
    category: selectedProduct?.category ?? "",
    description: selectedProduct?.description ?? "",
    price: selectedProduct?.price ?? 0,
    stock: selectedProduct?.stock ?? 0,
    minStock: selectedProduct?.minStock ?? 0,
    status: selectedProduct?.status ?? ("inactive" as ProductStatus),
    imageUrl: selectedProduct?.imageUrl ?? "",
    supplier: selectedProduct?.supplier ?? "",
    brand: selectedProduct?.brand ?? "",
    monthlySales: selectedProduct?.monthlySales ?? 0,
    unitOfMeasure: selectedProduct?.unitOfMeasure ?? "",
    location: selectedProduct?.location ?? "",
    percentage: selectedProduct?.percentage ?? 0,
    createdBy: selectedProduct?.createdBy ?? "",
  }))

  if (!selectedProduct) {
    return (
      <div className="rounded-2xl border bg-card p-8">
        <h1 className="text-2xl font-semibold">Produto não encontrado</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Volte ao catálogo e selecione um produto válido para edição.
        </p>
        <Button asChild className="mt-4">
          <Link href="/products">Voltar ao catálogo</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-6">
      <section className="rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-card to-accent/10 p-5 shadow-sm md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Button asChild variant="ghost" size="sm" className="h-7 px-2">
                <Link href="/products">
                  <ArrowLeft className="h-4 w-4" />
                  Catálogo
                </Link>
              </Button>
              <span>/</span>
              <span>Produto</span>
            </div>

            <h1 className="text-3xl font-semibold tracking-tight">{form.name}</h1>
            <p className="text-sm text-muted-foreground">Atualize dados comerciais, estoque e apresentação visual.</p>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="rounded-full px-3 py-1 text-xs">
              {form.code}
            </Badge>
            <Button className="h-10 rounded-xl px-4">
              <Save className="h-4 w-4" />
              Salvar alterações
            </Button>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_1fr]">
        <section className="space-y-6 rounded-3xl border bg-card/90 p-5 shadow-sm md:p-6">
          <header className="space-y-1">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">dados principais</p>
            <h2 className="text-xl font-semibold">Informações do Produto</h2>
          </header>

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Código" id="code">
              <Input
                id="code"
                value={form.code}
                readOnly
                aria-readonly="true"
                className="cursor-not-allowed bg-muted/45 text-muted-foreground"
              />
            </Field>

            <Field label="Nome" id="name">
              <Input id="name" value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} />
            </Field>

            <Field label="Categoria" id="category">
              <Input
                id="category"
                value={form.category}
                onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))}
              />
            </Field>

            <Field label="Marca" id="brand">
              <Input id="brand" value={form.brand} onChange={(event) => setForm((prev) => ({ ...prev, brand: event.target.value }))} />
            </Field>
          </div>

          <Field label="Descrição" id="description">
            <Textarea
              id="description"
              value={form.description}
              onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
              className="min-h-32"
            />
          </Field>

          <header className="space-y-1 pt-2">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">dados operacionais</p>
            <h2 className="text-xl font-semibold">Comercial e Estoque</h2>
          </header>

          <div className="grid gap-4 md:grid-cols-3">
            <Field label="Preço" id="price">
              <Input
                id="price"
                type="number"
                min={0}
                value={form.price}
                onChange={(event) => setForm((prev) => ({ ...prev, price: Number(event.target.value) }))}
              />
            </Field>

            <Field label="Estoque" id="stock">
              <Input
                id="stock"
                type="number"
                min={0}
                value={form.stock}
                onChange={(event) => setForm((prev) => ({ ...prev, stock: Number(event.target.value) }))}
              />
            </Field>

            <Field label="Estoque mínimo" id="minStock">
              <Input
                id="minStock"
                type="number"
                min={0}
                value={form.minStock}
                onChange={(event) => setForm((prev) => ({ ...prev, minStock: Number(event.target.value) }))}
              />
            </Field>

            <Field label="Fornecedor" id="supplier">
              <Input
                id="supplier"
                value={form.supplier}
                onChange={(event) => setForm((prev) => ({ ...prev, supplier: event.target.value }))}
              />
            </Field>

            <Field label="Vendas por mês" id="monthlySales">
              <Input
                id="monthlySales"
                type="number"
                min={0}
                value={form.monthlySales}
                readOnly
                aria-readonly="true"
                className="cursor-not-allowed bg-muted/45 text-muted-foreground"
              />
            </Field>

            <Field label="Unidade de medida" id="unitOfMeasure">
              <Input
                id="unitOfMeasure"
                value={form.unitOfMeasure}
                onChange={(event) => setForm((prev) => ({ ...prev, unitOfMeasure: event.target.value }))}
              />
            </Field>

            <Field label="Localização" id="location">
              <Input
                id="location"
                value={form.location}
                onChange={(event) => setForm((prev) => ({ ...prev, location: event.target.value }))}
              />
            </Field>

            <Field label="Percentual" id="percentage">
              <Input
                id="percentage"
                type="number"
                min={0}
                max={100}
                value={form.percentage}
                readOnly
                aria-readonly="true"
                className="cursor-not-allowed bg-muted/45 text-muted-foreground"
              />
            </Field>

            <Field label="Criado por" id="createdBy">
              <Input
                id="createdBy"
                value={form.createdBy}
                readOnly
                aria-readonly="true"
                className="cursor-not-allowed bg-muted/45 text-muted-foreground"
              />
            </Field>
          </div>
        </section>

        <aside className="space-y-5">
          <section className="rounded-3xl border bg-card/90 p-5 shadow-sm">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">preview visual</p>
            <h2 className="mt-1 text-xl font-semibold">Imagem e Status</h2>

            <div className="mt-4 space-y-3">
              <Field label="Status" id="status">
                <select
                  id="status"
                  value={form.status}
                  onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value as ProductStatus }))}
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                >
                  <option value="active">Ativo</option>
                  <option value="inactive">Inativo</option>
                  <option value="out_of_stock">Sem estoque</option>
                </select>
              </Field>

              <Field label="URL da imagem" id="imageUrl">
                <Input
                  id="imageUrl"
                  placeholder="/product.png"
                  value={form.imageUrl}
                  onChange={(event) => setForm((prev) => ({ ...prev, imageUrl: event.target.value }))}
                />
              </Field>

              <div className="relative overflow-hidden rounded-2xl border bg-muted/20 p-3">
                <div className="relative h-56 overflow-hidden rounded-xl bg-gradient-to-br from-background to-muted/35">
                  <Image
                    src={form.imageUrl || "/product.png"}
                    alt={form.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 40vw"
                    className="object-contain p-3"
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border bg-card/90 p-5 shadow-sm">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">indicadores</p>
            <h2 className="mt-1 text-xl font-semibold">Resumo Rápido</h2>

            <div className="mt-4 grid gap-2 text-sm">
              <Stat icon={Factory} label="Fornecedor" value={form.supplier} />
              <Stat icon={TrendingUp} label="Vendas/mês" value={`${form.monthlySales}`} />
              <Stat icon={PackageCheck} label="Estoque mínimo" value={`${form.minStock} ${form.unitOfMeasure}`} />
              <Stat icon={Factory} label="Localização" value={form.location} />
              <Stat icon={Tag} label="Percentual" value={`${form.percentage}%`} />
              <Stat icon={User} label="Criado por" value={form.createdBy} />
              <Stat icon={Tag} label="Atualizado em" value={formatDate(selectedProduct.updatedAt)} />
              <Stat icon={Box} label="Criado em" value={formatDate(selectedProduct.createdAt)} />
            </div>
          </section>
        </aside>
      </div>
    </div>
  )
}

function Field({
  label,
  id,
  children,
}: {
  label: string
  id: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
    </div>
  )
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border bg-background/70 px-3 py-2.5">
      <span className="inline-flex items-center gap-2 text-muted-foreground">
        <Icon className="h-3.5 w-3.5 text-primary" />
        {label}
      </span>
      <span className="font-medium text-foreground">{value || "-"}</span>
    </div>
  )
}
