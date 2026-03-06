import { type StockMovement, type StockMovementType, type StockProduct } from "@/components/products/Stock/stock-models"

type MovementTemplate = {
  type: StockMovementType
  quantity: number
  minutesAgo: number
  responsible: string
  source: string
  destination: string
  notes: string
}

const movementTemplates: MovementTemplate[] = [
  {
    type: "SAIDA",
    quantity: 6,
    minutesAgo: 22,
    responsible: "Marina Costa",
    source: "Deposito Central",
    destination: "Pedido #2031",
    notes: "Separacao de venda para entrega local.",
  },
  {
    type: "ENTRADA",
    quantity: 30,
    minutesAgo: 95,
    responsible: "Joao Lima",
    source: "Fornecedor",
    destination: "Deposito Central",
    notes: "Recebimento de lote com conferencia concluida.",
  },
  {
    type: "TRANSFERENCIA",
    quantity: 8,
    minutesAgo: 165,
    responsible: "Carla Prado",
    source: "Deposito Central",
    destination: "Assistencia Tecnica",
    notes: "Reposicao para bancada de manutencao.",
  },
  {
    type: "AJUSTE",
    quantity: 2,
    minutesAgo: 355,
    responsible: "Nicolas Ramos",
    source: "Inventario Ciclico",
    destination: "Deposito Central",
    notes: "Correcao apos contagem fisica.",
  },
  {
    type: "SAIDA",
    quantity: 11,
    minutesAgo: 590,
    responsible: "Bianca Souza",
    source: "Deposito Central",
    destination: "Pedido #2028",
    notes: "Atendimento para cliente corporativo.",
  },
  {
    type: "ENTRADA",
    quantity: 14,
    minutesAgo: 915,
    responsible: "Vinicius Teixeira",
    source: "Fornecedor",
    destination: "Deposito Central",
    notes: "Reposicao programada semanal.",
  },
  {
    type: "SAIDA",
    quantity: 4,
    minutesAgo: 1220,
    responsible: "Marina Costa",
    source: "Deposito Central",
    destination: "Pedido #2022",
    notes: "Envio para upgrade de parque de maquinas.",
  },
]

function buildMovementDate(minutesAgo: number) {
  return new Date(Date.now() - minutesAgo * 60 * 1000).toISOString()
}

function buildMovementCode(date: string, index: number) {
  const normalizedDate = new Date(date).toISOString().slice(2, 10).replaceAll("-", "")
  const sequence = String(index + 1).padStart(4, "0")
  return `MOV-${normalizedDate}-${sequence}`
}

export function createMockStockMovements(products: StockProduct[]): StockMovement[] {
  if (products.length === 0) return []

  return movementTemplates.map((template, index) => {
    const product = products[index % products.length]
    const createdAt = buildMovementDate(template.minutesAgo)

    return {
      id: `${template.type}-${product.id}-${index + 1}`,
      movementCode: buildMovementCode(createdAt, index),
      productId: product.id,
      productName: product.name,
      productCode: product.code,
      type: template.type,
      quantity: template.quantity,
      createdAt,
      responsible: template.responsible,
      source: template.source,
      destination: template.destination,
      notes: template.notes,
    }
  })
}
