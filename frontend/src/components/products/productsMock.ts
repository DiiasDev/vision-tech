export type ProductStatus = "active" | "inactive" | "out_of_stock"

export const productCategoryOptions = [
  "Hardware",
  "Software",
  "Serviços",
  "Periféricos",
  "Licenças",
  "Infraestrutura",
  "Outros",
] as const

export type Product = {
  id: string
  code: string
  name: string
  description: string
  category: string
  price: number
  cost: number
  stock: number
  minStock: number
  unitOfMeasure: string
  location: string
  percentage: number
  status: ProductStatus
  createdAt: string
  updatedAt: string
  createdBy: string
  brand: string
  supplier: string
  monthlySales: number
  imageUrl?: string
}

export const productsMock: Product[] = [
  {
    id: "1",
    code: "PROD-001",
    name: "Notebook Dell Inspiron 15",
    description: "Notebook para uso corporativo com excelente desempenho.",
    category: "Hardware",
    price: 4200,
    cost: 3150,
    stock: 12,
    minStock: 8,
    unitOfMeasure: "un",
    location: "A1-02",
    percentage: 31,
    status: "active",
    createdAt: "2026-02-01",
    updatedAt: "2026-03-02",
    createdBy: "Nicolas Ramos",
    brand: "Dell",
    supplier: "TechDistribuidora",
    monthlySales: 14,
    imageUrl: "/product.png"
  },
  {
    id: "2",
    code: "PROD-002",
    name: "SSD Kingston 1TB",
    description: "Armazenamento rápido para upgrades de máquinas.",
    category: "Hardware",
    price: 520,
    cost: 360,
    stock: 35,
    minStock: 15,
    unitOfMeasure: "un",
    location: "B2-07",
    percentage: 24,
    status: "active",
    createdAt: "2026-02-10",
    updatedAt: "2026-03-01",
    createdBy: "Larissa Prado",
    brand: "Kingston",
    supplier: "Byte Supply",
    monthlySales: 41,
    imageUrl: "/product.png"
  },
  {
    id: "3",
    code: "PROD-003",
    name: "Memória RAM DDR4 16GB",
    description: "Memória para upgrades e manutenção de computadores.",
    category: "Hardware",
    price: 320,
    cost: 210,
    stock: 20,
    minStock: 12,
    unitOfMeasure: "un",
    location: "B1-03",
    percentage: 22,
    status: "active",
    createdAt: "2026-02-12",
    updatedAt: "2026-03-03",
    createdBy: "Nicolas Ramos",
    brand: "Kingston",
    supplier: "Infomax",
    monthlySales: 33,
    imageUrl: "/product.png"
  },
  {
    id: "4",
    code: "PROD-004",
    name: "Formatação de Sistema",
    description: "Serviço de formatação e instalação de sistema operacional.",
    category: "Serviços",
    price: 150,
    cost: 70,
    stock: 999,
    minStock: 100,
    unitOfMeasure: "serviço",
    location: "Operação Técnica",
    percentage: 58,
    status: "active",
    createdAt: "2026-02-15",
    updatedAt: "2026-02-28",
    createdBy: "Camila Soares",
    brand: "Byncode",
    supplier: "Equipe Interna",
    monthlySales: 52,
    imageUrl: "/product.png"
  },
  {
    id: "5",
    code: "PROD-005",
    name: "Limpeza Interna de Notebook",
    description: "Serviço de limpeza e troca de pasta térmica.",
    category: "Serviços",
    price: 120,
    cost: 55,
    stock: 0,
    minStock: 100,
    unitOfMeasure: "serviço",
    location: "Operação Técnica",
    percentage: 49,
    status: "out_of_stock",
    createdAt: "2026-02-18",
    updatedAt: "2026-02-25",
    createdBy: "Camila Soares",
    brand: "Byncode",
    supplier: "Equipe Interna",
    monthlySales: 9
  }
]
