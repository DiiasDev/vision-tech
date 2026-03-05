"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import {
  ArrowLeft,
  Box,
  CircleDollarSign,
  Factory,
  ImagePlus,
  PackageCheck,
  Save,
  Tag,
  TrendingUp,
  User,
  X,
} from "lucide-react"

import {
  productCategoryOptions,
  productsMock,
  type Product,
  type ProductStatus,
} from "@/components/products/productsMock"
import { type ProductsListItem, getProducts } from "@/services/products.service"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { formatPriceOrCostBR } from "@/utils/Formatter"

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

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(value))
}

function mapApiStatusToUi(status: ProductsListItem["status"]): Product["status"] {
  if (status === "INACTIVE") return "inactive"
  if (status === "OUT_OF_STOCK") return "out_of_stock"
  return "active"
}

function mapApiCategoryToUi(category: ProductsListItem["category"]) {
  const categoryMap: Record<ProductsListItem["category"], string> = {
    HARDWARE: "Hardware",
    SOFTWARE: "Software",
    SERVICES: "Serviços",
    PERIPHERALS: "Periféricos",
    LICENSES: "Licenças",
    INFRASTRUCTURE: "Infraestrutura",
    OTHERS: "Outros",
  }

  return categoryMap[category] ?? category
}

function mapApiProductToUi(product: ProductsListItem): Product {
  return {
    id: product.id,
    code: product.code,
    name: product.name,
    description: product.description ?? "",
    category: mapApiCategoryToUi(product.category),
    price: Number.parseFloat(product.price) || 0,
    cost: Number.parseFloat(product.cost ?? "0") || 0,
    stock: product.stock ?? 0,
    minStock: product.minStock ?? 0,
    unitOfMeasure: product.unitOfMeasure ?? "",
    location: product.location ?? "",
    percentage: Number.parseFloat(product.percentage) || 0,
    status: mapApiStatusToUi(product.status),
    createdAt: product.createdAt?.slice(0, 10) ?? new Date().toISOString().slice(0, 10),
    updatedAt: product.updatedAt?.slice(0, 10) ?? new Date().toISOString().slice(0, 10),
    createdBy: product.createdBy ?? "Usuario",
    brand: product.brand ?? "",
    supplier: product.supplier ?? "",
    monthlySales: product.monthlySales ?? 0,
    imageUrl: product.imageUrl ?? "/product.png",
  }
}

function toFormState(product: Product) {
  return {
    code: product.code,
    name: product.name,
    category: product.category,
    description: product.description,
    price: product.price,
    cost: product.cost,
    stock: product.stock,
    minStock: product.minStock,
    status: product.status,
    imageUrl: product.imageUrl ?? "",
    supplier: product.supplier,
    brand: product.brand,
    monthlySales: product.monthlySales,
    unitOfMeasure: product.unitOfMeasure,
    location: product.location,
    percentage: product.percentage,
    createdBy: product.createdBy,
  }
}

export default function ProductDetailsPage() {
  const searchParams = useSearchParams()
  const productId = searchParams.get("productId")
  const [isLoading, setIsLoading] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [form, setForm] = useState({
    code: "",
    name: "",
    category: "",
    description: "",
    price: 0,
    cost: 0,
    stock: 0,
    minStock: 0,
    status: "inactive" as ProductStatus,
    imageUrl: "",
    supplier: "",
    brand: "",
    monthlySales: 0,
    unitOfMeasure: "",
    location: "",
    percentage: 0,
    createdBy: "",
  })
  const [showImageUpload, setShowImageUpload] = useState(false)

  function handleImageFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file || !file.type.startsWith("image/")) return

    const reader = new FileReader()
    reader.onload = () => {
      const imageResult = typeof reader.result === "string" ? reader.result : ""
      if (!imageResult) return
      setForm((prev) => ({ ...prev, imageUrl: imageResult }))
    }
    reader.readAsDataURL(file)
  }

  useEffect(() => {
    let mounted = true

    async function loadProduct() {
      if (!productId) {
        if (mounted) {
          setSelectedProduct(null)
          setIsLoading(false)
        }
        return
      }

      setIsLoading(true)

      try {
        const response = await getProducts()
        const productFromApi = response.data.map(mapApiProductToUi).find((product) => product.id === productId)
        if (mounted) {
          setSelectedProduct(productFromApi ?? productsMock.find((product) => product.id === productId) ?? null)
        }
      } catch {
        if (mounted) {
          setSelectedProduct(productsMock.find((product) => product.id === productId) ?? null)
        }
      } finally {
        if (mounted) setIsLoading(false)
      }
    }

    void loadProduct()

    return () => {
      mounted = false
    }
  }, [productId])

  useEffect(() => {
    if (!selectedProduct) return
    setForm(toFormState(selectedProduct))
    setShowImageUpload(false)
  }, [selectedProduct])

  if (isLoading) {
    return (
      <div className="rounded-2xl border bg-card p-8">
        <h1 className="text-2xl font-semibold">Carregando produto...</h1>
        <p className="mt-2 text-sm text-muted-foreground">Buscando os dados detalhados para edição.</p>
      </div>
    )
  }

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
              <select
                id="category"
                value={form.category}
                onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))}
                className="h-10 w-full rounded-md border bg-background px-3 text-sm"
              >
                {productCategoryOptions.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
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

            <Field label="Custo" id="cost">
              <Input
                id="cost"
                type="number"
                min={0}
                value={form.cost}
                onChange={(event) => setForm((prev) => ({ ...prev, cost: Number(event.target.value) }))}
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

              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Imagem atual do produto</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowImageUpload((prev) => !prev)}
                >
                  {showImageUpload ? <X className="h-4 w-4" /> : <ImagePlus className="h-4 w-4" />}
                  {showImageUpload ? "Cancelar troca" : "Trocar imagem"}
                </Button>
              </div>

              {showImageUpload ? (
                <Field label="Anexar imagem" id="imageFile">
                  <Input id="imageFile" type="file" accept="image/*" onChange={handleImageFileChange} />
                </Field>
              ) : null}

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
              <Stat icon={CircleDollarSign} label="Preço" value={formatPriceOrCostBR(form.price)} />
              <Stat icon={CircleDollarSign} label="Custo" value={formatPriceOrCostBR(form.cost)} />
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
