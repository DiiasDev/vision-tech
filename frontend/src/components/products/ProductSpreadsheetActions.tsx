"use client"

import { useMemo, useState } from "react"
import * as XLSX from "xlsx"
import { CheckCircle2, Download, FileSpreadsheet, Loader2, Upload, XCircle } from "lucide-react"

import { Product, ProductStatus } from "@/components/products/productsMock"
import { Button } from "@/components/ui/button"

type Props = {
  products: Product[]
  selectedProductIds: Set<string>
  onSelectAll: () => void
  onClearSelection: () => void
  onImportProducts: (products: Product[]) => void
}

type ImportStep = 1 | 2 | 3 | 4

type AnalysisState = {
  errors: string[]
  warnings: string[]
  parsedProducts: Product[]
  totalRows: number
}

const IMPORT_HEADERS = [
  "code",
  "name",
  "description",
  "category",
  "price",
  "stock",
  "minStock",
  "unitOfMeasure",
  "location",
  "percentage",
  "status",
  "createdBy",
  "createdAt",
  "updatedAt",
  "brand",
  "supplier",
  "monthlySales",
  "imageUrl",
] as const

type ImportHeader = (typeof IMPORT_HEADERS)[number]

const headerLabels: Record<ImportHeader, string> = {
  code: "Código",
  name: "Nome",
  description: "Descrição",
  category: "Categoria",
  price: "Preço",
  stock: "Estoque",
  minStock: "Estoque mínimo",
  unitOfMeasure: "Unidade de medida",
  location: "Localização",
  percentage: "Percentual",
  status: "Status",
  createdBy: "Criado por",
  createdAt: "Data de criação",
  updatedAt: "Data de edição",
  brand: "Marca",
  supplier: "Fornecedor",
  monthlySales: "Vendas/mês",
  imageUrl: "Imagem (URL opcional)",
}

function statusFromSheet(value: string): ProductStatus | null {
  const normalized = value.trim().toLowerCase()
  if (["ativo", "active"].includes(normalized)) return "active"
  if (["inativo", "inactive"].includes(normalized)) return "inactive"
  if (["sem estoque", "sem_estoque", "out_of_stock", "out of stock"].includes(normalized)) return "out_of_stock"
  return null
}

function statusToSheet(value: ProductStatus) {
  if (value === "active") return "Ativo"
  if (value === "inactive") return "Inativo"
  return "Sem estoque"
}

function toIsoDate(value: unknown): string {
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10)
  }

  if (typeof value === "number") {
    const parsed = XLSX.SSF.parse_date_code(value)
    if (!parsed) return ""
    const month = String(parsed.m).padStart(2, "0")
    const day = String(parsed.d).padStart(2, "0")
    return `${parsed.y}-${month}-${day}`
  }

  if (typeof value === "string" && value.trim()) {
    const date = new Date(value)
    if (!Number.isNaN(date.getTime())) return date.toISOString().slice(0, 10)
  }

  return ""
}

export function ProductSpreadsheetActions({
  products,
  selectedProductIds,
  onSelectAll,
  onClearSelection,
  onImportProducts,
}: Props) {
  const [isImportOpen, setIsImportOpen] = useState(false)
  const [importStep, setImportStep] = useState<ImportStep>(1)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [analysis, setAnalysis] = useState<AnalysisState | null>(null)

  const selectedProducts = useMemo(
    () => products.filter((product) => selectedProductIds.has(product.id)),
    [products, selectedProductIds]
  )

  function resetImport() {
    setIsImportOpen(false)
    setImportStep(1)
    setSelectedFile(null)
    setAnalysis(null)
    setIsAnalyzing(false)
    setIsImporting(false)
  }

  function downloadImportTemplate() {
    const sample = [
      {
        code: "PROD-101",
        name: "Monitor Ultrawide 34",
        description: "Monitor para setup profissional com alta produtividade.",
        category: "Monitores",
        price: 2890,
        stock: 18,
        minStock: 6,
        unitOfMeasure: "un",
        location: "C1-05",
        percentage: 34,
        status: "Ativo",
        createdBy: "Equipe Comercial",
        createdAt: "2026-03-04",
        updatedAt: "2026-03-04",
        brand: "Vision Display",
        supplier: "TechDistribuidora",
        monthlySales: 22,
        imageUrl: "/product.png",
      },
      {
        code: "PROD-102",
        name: "Teclado Mecânico",
        description: "Teclado para escritório com switches silenciosos.",
        category: "Periféricos",
        price: 490,
        stock: 42,
        minStock: 10,
        unitOfMeasure: "un",
        location: "D3-02",
        percentage: 27,
        status: "Inativo",
        createdBy: "Equipe Comercial",
        createdAt: "2026-03-04",
        updatedAt: "2026-03-04",
        brand: "Keyworks",
        supplier: "Byte Supply",
        monthlySales: 16,
        imageUrl: "/product.png",
      },
    ]

    const workbook = XLSX.utils.book_new()
    const modelSheet = XLSX.utils.json_to_sheet(sample, { header: [...IMPORT_HEADERS] })
    modelSheet["!autofilter"] = { ref: "A1:R1" }
    modelSheet["!cols"] = [
      { wch: 14 },
      { wch: 28 },
      { wch: 52 },
      { wch: 16 },
      { wch: 12 },
      { wch: 10 },
      { wch: 14 },
      { wch: 18 },
      { wch: 20 },
      { wch: 12 },
      { wch: 14 },
      { wch: 18 },
      { wch: 14 },
      { wch: 14 },
      { wch: 18 },
      { wch: 18 },
      { wch: 12 },
      { wch: 24 },
    ]

    const instructions = XLSX.utils.aoa_to_sheet([
      ["Guia de Importação de Produtos"],
      [""],
      ["1. Mantenha os nomes das colunas exatamente iguais ao modelo."],
      ["2. Status permitido: Ativo, Inativo, Sem estoque."],
      ["3. Datas devem estar no formato YYYY-MM-DD."],
      ["4. price, stock, minStock, percentage e monthlySales devem ser numéricos."],
      ["5. imageUrl é opcional. Se vazio, será usado /product.png."],
      ["6. Cada linha representa um produto."],
      [""],
      ["Campos obrigatórios:"],
      [...IMPORT_HEADERS],
    ])
    instructions["!cols"] = [{ wch: 80 }]

    XLSX.utils.book_append_sheet(workbook, modelSheet, "modelo_produtos")
    XLSX.utils.book_append_sheet(workbook, instructions, "instrucoes")
    XLSX.writeFile(workbook, "modelo_importacao_produtos.xlsx")
  }

  async function analyzeSpreadsheet() {
    if (!selectedFile) return

    setIsAnalyzing(true)
    setAnalysis(null)

    try {
      const buffer = await selectedFile.arrayBuffer()
      const workbook = XLSX.read(buffer, { type: "array" })
      const firstSheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[firstSheetName]
      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, { defval: "" })

      if (!rows.length) {
        setAnalysis({
          errors: ["A planilha está vazia. Adicione pelo menos um produto."],
          warnings: [],
          parsedProducts: [],
          totalRows: 0,
        })
        setImportStep(4)
        return
      }

      const headers = Object.keys(rows[0] ?? {})
      const missingHeaders = IMPORT_HEADERS.filter((header) => !headers.includes(header))
      const errors: string[] = []
      const warnings: string[] = []
      const parsedProducts: Product[] = []
      const existingCodes = new Set(products.map((product) => product.code.toLowerCase()))

      if (missingHeaders.length) {
        errors.push(
          `Colunas obrigatórias ausentes: ${missingHeaders.map((header) => `'${header}'`).join(", ")}.`
        )
      }

      rows.forEach((row, index) => {
        const line = index + 2
        const rawStatus = String(row.status ?? "")
        const status = statusFromSheet(rawStatus)

        const requiredFields: Array<{ key: ImportHeader; value: unknown }> = IMPORT_HEADERS
          .filter((header) => header !== "imageUrl")
          .map((key) => ({ key, value: row[key] }))

        const missingInRow = requiredFields
          .filter((item) => String(item.value ?? "").trim() === "")
          .map((item) => item.key)

        if (missingInRow.length) {
          errors.push(`Linha ${line}: campos vazios -> ${missingInRow.join(", ")}.`)
          return
        }

        if (!status) {
          errors.push(`Linha ${line}: status inválido '${rawStatus}'. Use Ativo, Inativo ou Sem estoque.`)
          return
        }

        const code = String(row.code).trim()
        const normalizedCode = code.toLowerCase()
        if (existingCodes.has(normalizedCode) || parsedProducts.some((item) => item.code.toLowerCase() === normalizedCode)) {
          errors.push(`Linha ${line}: código '${code}' já existe.`)
          return
        }

        const price = Number(row.price)
        const stock = Number(row.stock)
        const minStock = Number(row.minStock)
        const percentage = Number(row.percentage)
        const monthlySales = Number(row.monthlySales)

        if ([price, stock, minStock, percentage, monthlySales].some((value) => Number.isNaN(value))) {
          errors.push(`Linha ${line}: campos numéricos inválidos (price/stock/minStock/percentage/monthlySales).`)
          return
        }

        const createdAt = toIsoDate(row.createdAt)
        const updatedAt = toIsoDate(row.updatedAt)
        if (!createdAt || !updatedAt) {
          errors.push(`Linha ${line}: createdAt ou updatedAt inválido. Use YYYY-MM-DD.`)
          return
        }

        if (percentage < 0 || percentage > 100) {
          warnings.push(`Linha ${line}: percentual fora do padrão (0-100).`)
        }

        parsedProducts.push({
          id: crypto.randomUUID(),
          code,
          name: String(row.name).trim(),
          description: String(row.description).trim(),
          category: String(row.category).trim(),
          price,
          stock,
          minStock,
          unitOfMeasure: String(row.unitOfMeasure).trim(),
          location: String(row.location).trim(),
          percentage,
          status,
          createdAt,
          updatedAt,
          createdBy: String(row.createdBy).trim(),
          brand: String(row.brand).trim(),
          supplier: String(row.supplier).trim(),
          monthlySales,
          imageUrl: String(row.imageUrl ?? "").trim() || "/product.png",
        })
      })

      setAnalysis({
        errors,
        warnings,
        parsedProducts,
        totalRows: rows.length,
      })
      setImportStep(4)
    } finally {
      setTimeout(() => setIsAnalyzing(false), 500)
    }
  }

  function applyImport() {
    if (!analysis || analysis.errors.length > 0 || analysis.parsedProducts.length === 0) return

    setIsImporting(true)
    setTimeout(() => {
      onImportProducts(analysis.parsedProducts)
      setIsImporting(false)
      resetImport()
    }, 1200)
  }

  function exportSelectedProducts() {
    if (!selectedProducts.length) return

    setIsExporting(true)

    setTimeout(() => {
      const rows = selectedProducts.map((product) => ({
        codigo: product.code,
        nome: product.name,
        categoria: product.category,
        status: statusToSheet(product.status),
        preco: product.price,
        estoque: product.stock,
        unidade: product.unitOfMeasure,
        estoque_minimo: product.minStock,
        localizacao: product.location,
        percentual: `${product.percentage}%`,
        fornecedor: product.supplier,
        marca: product.brand,
        vendas_mes: product.monthlySales,
        criado_por: product.createdBy,
        criado_em: product.createdAt,
        editado_em: product.updatedAt,
      }))

      const workbook = XLSX.utils.book_new()
      const sheet = XLSX.utils.json_to_sheet(rows)
      sheet["!autofilter"] = { ref: "A1:P1" }
      sheet["!cols"] = [
        { wch: 14 },
        { wch: 28 },
        { wch: 16 },
        { wch: 14 },
        { wch: 12 },
        { wch: 10 },
        { wch: 12 },
        { wch: 16 },
        { wch: 20 },
        { wch: 12 },
        { wch: 18 },
        { wch: 18 },
        { wch: 12 },
        { wch: 16 },
        { wch: 14 },
        { wch: 14 },
      ]

      const summary = XLSX.utils.aoa_to_sheet([
        ["Exportação de Produtos"],
        [""],
        ["Total exportado", selectedProducts.length],
        ["Data", new Date().toISOString().slice(0, 10)],
      ])
      summary["!cols"] = [{ wch: 24 }, { wch: 20 }]

      XLSX.utils.book_append_sheet(workbook, sheet, "produtos_exportados")
      XLSX.utils.book_append_sheet(workbook, summary, "resumo")
      XLSX.writeFile(workbook, "produtos_exportados.xlsx")

      setIsExporting(false)
    }, 1000)
  }

  return (
    <>
      <section className="rounded-2xl border border-border/70 bg-card/80 p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-base font-semibold">Importação e Exportação</h3>
            <p className="text-sm text-muted-foreground">
              Importe em lote via planilha e exporte os produtos selecionados com filtros.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button type="button" variant="outline" className="h-10 rounded-xl" onClick={() => setIsImportOpen(true)}>
              <Upload className="h-4 w-4" />
              Importar Produtos
            </Button>

            <Button
              type="button"
              className="h-10 rounded-xl"
              onClick={exportSelectedProducts}
              disabled={selectedProducts.length === 0 || isExporting}
            >
              {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              Exportar Produtos
            </Button>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <span>{selectedProducts.length} selecionado(s) para exportação</span>
          <Button type="button" variant="ghost" size="sm" onClick={onSelectAll}>
            Selecionar todos
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={onClearSelection}>
            Limpar seleção
          </Button>
        </div>
      </section>

      {isImportOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/45 p-4">
          <div className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border bg-background shadow-2xl">
            <div className="border-b p-5 md:p-6">
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-semibold">Importar Produtos por Planilha</h3>
                  <p className="text-sm text-muted-foreground">
                    Siga os passos para validar e importar múltiplos produtos com segurança.
                  </p>
                </div>

                <Button type="button" variant="outline" size="icon-sm" onClick={resetImport}>
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>

              <div className="mb-0 grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map((step) => (
                  <div
                    key={step}
                    className={`h-1.5 rounded-full transition-colors ${
                      step <= importStep ? "bg-primary" : "bg-muted"
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-5 md:p-6">
              <div className="min-h-72">
                {importStep === 1 ? (
                  <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-4">
                    <h4 className="text-lg font-semibold">Passo 1: Baixar modelo oficial</h4>
                    <p className="text-sm text-muted-foreground">
                      Faça download do modelo com todas as colunas obrigatórias, exemplo preenchido e aba de instruções.
                    </p>

                    <div className="rounded-xl border bg-card p-4">
                      <p className="text-sm font-medium">Colunas incluídas no modelo</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {IMPORT_HEADERS.map((header) => (
                          <span key={header} className="rounded-full border bg-background px-2.5 py-1 text-xs">
                            {headerLabels[header]}
                          </span>
                        ))}
                      </div>
                    </div>

                    <Button type="button" onClick={downloadImportTemplate}>
                      <FileSpreadsheet className="h-4 w-4" />
                      Baixar modelo .xlsx
                    </Button>
                  </div>
                ) : null}

                {importStep === 2 ? (
                  <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-4">
                    <h4 className="text-lg font-semibold">Passo 2: Enviar planilha preenchida</h4>
                    <p className="text-sm text-muted-foreground">
                      Envie um arquivo `.xlsx` ou `.csv` com os campos no padrão do modelo.
                    </p>

                    <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center">
                      <Upload className="mb-3 h-7 w-7 text-primary" />
                      <span className="font-medium">Clique para selecionar a planilha</span>
                      <span className="text-sm text-muted-foreground">Formatos aceitos: .xlsx e .csv</span>
                      <input
                        type="file"
                        accept=".xlsx,.csv"
                        className="hidden"
                        onChange={(event) => {
                          const file = event.target.files?.[0] ?? null
                          setSelectedFile(file)
                        }}
                      />
                    </label>

                    {selectedFile ? (
                      <p className="text-sm text-foreground">
                        Arquivo selecionado: <span className="font-medium">{selectedFile.name}</span>
                      </p>
                    ) : null}
                  </div>
                ) : null}

                {importStep === 3 ? (
                  <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-4">
                    <h4 className="text-lg font-semibold">Passo 3: Analisar dados importados</h4>
                    <p className="text-sm text-muted-foreground">
                      Verificamos colunas obrigatórias, tipos de dados, status aceitos e duplicidade de código.
                    </p>

                    <div className="rounded-xl border bg-card p-4 text-sm text-muted-foreground">
                      {selectedFile ? (
                        <span>
                          Planilha pronta para análise: <strong className="text-foreground">{selectedFile.name}</strong>
                        </span>
                      ) : (
                        <span>Nenhuma planilha selecionada.</span>
                      )}
                    </div>

                    <Button type="button" onClick={analyzeSpreadsheet} disabled={!selectedFile || isAnalyzing}>
                      {isAnalyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                      {isAnalyzing ? "Analisando planilha..." : "Iniciar análise"}
                    </Button>
                  </div>
                ) : null}

                {importStep === 4 ? (
                  <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-4">
                    <h4 className="text-lg font-semibold">Passo 4: Resultado da análise</h4>

                    <div className="grid gap-3 md:grid-cols-3">
                      <div className="rounded-xl border bg-card p-3">
                        <p className="text-xs text-muted-foreground">Linhas analisadas</p>
                        <p className="mt-1 text-xl font-semibold">{analysis?.totalRows ?? 0}</p>
                      </div>
                      <div className="rounded-xl border bg-card p-3">
                        <p className="text-xs text-muted-foreground">Produtos válidos</p>
                        <p className="mt-1 text-xl font-semibold text-emerald-600">{analysis?.parsedProducts.length ?? 0}</p>
                      </div>
                      <div className="rounded-xl border bg-card p-3">
                        <p className="text-xs text-muted-foreground">Erros encontrados</p>
                        <p className="mt-1 text-xl font-semibold text-rose-600">{analysis?.errors.length ?? 0}</p>
                      </div>
                    </div>

                    {analysis?.errors.length ? (
                      <div className="rounded-xl border border-rose-200 bg-rose-50/60 p-4 text-sm">
                        <p className="font-semibold text-rose-700">Corrija os erros antes de importar:</p>
                        <ul className="mt-2 max-h-64 list-disc space-y-1 overflow-y-auto pl-5 text-rose-700">
                          {analysis.errors.map((error) => (
                            <li key={error} className="break-words">{error}</li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 text-sm text-emerald-700">
                        Análise concluída sem erros críticos. Os dados estão prontos para importação.
                      </div>
                    )}

                    {analysis?.warnings.length ? (
                      <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 text-sm">
                        <p className="font-semibold text-amber-700">Avisos:</p>
                        <ul className="mt-2 max-h-56 list-disc space-y-1 overflow-y-auto pl-5 text-amber-700">
                          {analysis.warnings.map((warning) => (
                            <li key={warning} className="break-words">{warning}</li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </div>

            <div className="border-t p-4 md:px-6 md:py-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={importStep === 1}
                  onClick={() => setImportStep((prev) => Math.max(1, (prev - 1) as ImportStep))}
                >
                  Voltar
                </Button>

                <div className="flex items-center gap-2">
                  {importStep < 3 ? (
                    <Button
                      type="button"
                      onClick={() => setImportStep((prev) => Math.min(4, (prev + 1) as ImportStep))}
                      disabled={importStep === 2 && !selectedFile}
                    >
                      Próximo passo
                    </Button>
                  ) : null}

                  {importStep === 3 ? (
                    <Button type="button" onClick={analyzeSpreadsheet} disabled={!selectedFile || isAnalyzing}>
                      {isAnalyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                      {isAnalyzing ? "Analisando..." : "Analisar e continuar"}
                    </Button>
                  ) : null}

                  {importStep === 4 ? (
                    <Button
                      type="button"
                      disabled={!analysis || analysis.errors.length > 0 || isImporting || analysis.parsedProducts.length === 0}
                      onClick={applyImport}
                    >
                      {isImporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                      {isImporting ? "Importando produtos..." : "Confirmar importação"}
                    </Button>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
