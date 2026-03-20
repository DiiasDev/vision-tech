import { jsPDF } from "jspdf"

import type { Budget } from "@/components/budget/budget-mock-data"
import { formatBudgetDateLong } from "@/components/budget/budget-mock-data"
import { formatCurrencyBR } from "@/utils/Formatter"

type SendBudgetToWhatsappResult = {
  mode: "shared" | "fallback"
  phone: string
}

const PAGE_HEIGHT_MM = 297
const PAGE_WIDTH_MM = 210
const MARGIN_MM = 14
const CONTENT_WIDTH_MM = PAGE_WIDTH_MM - MARGIN_MM * 2
const PAGE_BOTTOM_MM = PAGE_HEIGHT_MM - MARGIN_MM
const PRIMARY_LOGO_PATH = "/logoesticado.png"
const FALLBACK_LOGO_PATH = "/byncodeLogo.png"

let cachedLogoDataUrl: string | null = null

function normalizeWhatsappPhone(phone: string | null | undefined) {
  if (!phone?.trim()) return null

  const digitsOnly = phone.replace(/\D/g, "")
  if (!digitsOnly) return null

  if (digitsOnly.length === 10 || digitsOnly.length === 11) return `55${digitsOnly}`
  if (digitsOnly.length > 11 && digitsOnly.startsWith("55")) return digitsOnly
  if (digitsOnly.length > 11) return digitsOnly

  return null
}

async function blobToDataUrl(blob: Blob) {
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result)
        return
      }
      reject(new Error("Não foi possível ler o arquivo da logo para gerar o PDF."))
    }
    reader.onerror = () => reject(new Error("Não foi possível carregar a logo da empresa."))
    reader.readAsDataURL(blob)
  })
}

async function getBudgetLogoDataUrl() {
  if (cachedLogoDataUrl) return cachedLogoDataUrl

  const primaryResponse = await fetch(PRIMARY_LOGO_PATH)
  const response = primaryResponse.ok ? primaryResponse : await fetch(FALLBACK_LOGO_PATH)
  if (!response.ok) return null

  const imageBlob = await response.blob()
  cachedLogoDataUrl = await blobToDataUrl(imageBlob)
  return cachedLogoDataUrl
}

function addSectionTitle(doc: jsPDF, title: string, y: number) {
  doc.setFont("helvetica", "bold")
  doc.setTextColor(24, 24, 27)
  doc.setFontSize(12)
  doc.text(title, MARGIN_MM, y)
  doc.setDrawColor(226, 232, 240)
  doc.line(MARGIN_MM, y + 2, PAGE_WIDTH_MM - MARGIN_MM, y + 2)
  return y + 8
}

function ensurePageSpace(doc: jsPDF, y: number, neededHeight = 8) {
  if (y + neededHeight <= PAGE_BOTTOM_MM) return y
  doc.addPage()
  doc.setDrawColor(226, 232, 240)
  doc.rect(8, 8, PAGE_WIDTH_MM - 16, PAGE_HEIGHT_MM - 16)
  return MARGIN_MM
}

function drawKeyValue(
  doc: jsPDF,
  params: {
    label: string
    value: string
    labelX: number
    valueX: number
    y: number
    maxWidth: number
  }
) {
  doc.setFont("helvetica", "bold")
  doc.setFontSize(10)
  doc.setTextColor(15, 23, 42)
  doc.text(`${params.label}:`, params.labelX, params.y)

  doc.setFont("helvetica", "normal")
  const normalizedValue = params.value.trim() ? params.value : "Não informado"
  const valueLines = doc.splitTextToSize(normalizedValue, params.maxWidth)
  doc.text(valueLines, params.valueX, params.y)

  return valueLines.length
}

async function generateBudgetCustomerPdf(budget: Budget) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" })
  const logoDataUrl = await getBudgetLogoDataUrl()

  doc.setDrawColor(226, 232, 240)
  doc.rect(8, 8, PAGE_WIDTH_MM - 16, PAGE_HEIGHT_MM - 16)

  let y = MARGIN_MM + 2

  doc.setFillColor(248, 250, 252)
  doc.roundedRect(MARGIN_MM, y - 2, CONTENT_WIDTH_MM, 30, 2, 2, "F")

  if (logoDataUrl) {
    const maxWidth = 58
    const maxHeight = 20
    let logoWidth = maxWidth
    let logoHeight = maxHeight
    try {
      const imageInfo = doc.getImageProperties(logoDataUrl)
      const ratio = imageInfo.width / imageInfo.height
      logoWidth = maxWidth
      logoHeight = logoWidth / ratio
      if (logoHeight > maxHeight) {
        logoHeight = maxHeight
        logoWidth = logoHeight * ratio
      }
    } catch {
      logoWidth = 40
      logoHeight = 12
    }
    doc.addImage(logoDataUrl, "PNG", MARGIN_MM + 4, y + 4, logoWidth, logoHeight)
  }

  doc.setFont("helvetica", "bold")
  doc.setTextColor(15, 23, 42)
  doc.setFontSize(15)
  doc.text("ORÇAMENTO", PAGE_WIDTH_MM - MARGIN_MM - 4, y + 8, { align: "right" })

  doc.setFont("helvetica", "bold")
  doc.setFontSize(12)
  doc.text(`Nº ${budget.code}`, PAGE_WIDTH_MM - MARGIN_MM - 4, y + 14, { align: "right" })

  doc.setFont("helvetica", "normal")
  doc.setTextColor(71, 85, 105)
  doc.setFontSize(9)
  const issuedAt = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date())
  doc.text(`Emitido em ${issuedAt}`, PAGE_WIDTH_MM - MARGIN_MM - 4, y + 20, {
    align: "right",
  })

  y += 38
  y = addSectionTitle(doc, "Dados da proposta", y)

  const leftLabelX = MARGIN_MM
  const leftValueX = leftLabelX + 24
  const rightLabelX = PAGE_WIDTH_MM / 2 + 2
  const rightValueX = rightLabelX + 24
  const leftMaxWidth = rightLabelX - leftValueX - 4
  const rightMaxWidth = PAGE_WIDTH_MM - MARGIN_MM - rightValueX
  const rowUnitHeight = 4.4
  const rowGap = 2

  const infoRows: Array<
    Array<{
      label: string
      value: string
      labelX: number
      valueX: number
      maxWidth: number
    }>
  > = [
    [
      {
        label: "Cliente",
        value: budget.client.name || "Não informado",
        labelX: leftLabelX,
        valueX: leftValueX,
        maxWidth: leftMaxWidth,
      },
      {
        label: "Contato",
        value: budget.client.contactName || "Não informado",
        labelX: rightLabelX,
        valueX: rightValueX,
        maxWidth: rightMaxWidth,
      },
    ],
    [
      {
        label: "Telefone",
        value: budget.client.phone || "Não informado",
        labelX: leftLabelX,
        valueX: leftValueX,
        maxWidth: leftMaxWidth,
      },
      {
        label: "E-mail",
        value: budget.client.email || "Não informado",
        labelX: rightLabelX,
        valueX: rightValueX,
        maxWidth: rightMaxWidth,
      },
    ],
    [
      {
        label: "Documento",
        value: budget.client.document || "Não informado",
        labelX: leftLabelX,
        valueX: leftValueX,
        maxWidth: leftMaxWidth,
      },
      {
        label: "Cidade/UF",
        value: `${budget.client.city || "-"} / ${budget.client.state || "-"}`,
        labelX: rightLabelX,
        valueX: rightValueX,
        maxWidth: rightMaxWidth,
      },
    ],
    [
      {
        label: "Validade",
        value: formatBudgetDateLong(budget.validUntil),
        labelX: leftLabelX,
        valueX: leftValueX,
        maxWidth: leftMaxWidth,
      },
      {
        label: "Pagamento",
        value: budget.paymentTerms || "A definir",
        labelX: rightLabelX,
        valueX: rightValueX,
        maxWidth: rightMaxWidth,
      },
    ],
    [
      {
        label: "Entrega",
        value: budget.deliveryTerm || "A definir",
        labelX: leftLabelX,
        valueX: leftValueX,
        maxWidth: leftMaxWidth,
      },
    ],
  ]

  infoRows.forEach((row) => {
    let maxLines = 1
    row.forEach((cell) => {
      const lines = drawKeyValue(doc, { ...cell, y })
      maxLines = Math.max(maxLines, lines)
    })
    y += maxLines * rowUnitHeight + rowGap
  })

  y += 1.5

  doc.setTextColor(71, 85, 105)
  doc.setFont("helvetica", "normal")
  doc.setFontSize(9)
  const scopeLines = doc.splitTextToSize(`Escopo: ${budget.title || "Não informado"}`, CONTENT_WIDTH_MM)
  doc.text(scopeLines, MARGIN_MM, y)
  y += scopeLines.length * 4 + 3

  y = ensurePageSpace(doc, y, 22)
  y = addSectionTitle(doc, "Itens da proposta", y)

  const itemsSubtotal = budget.items.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0)
  const itemsDiscount = budget.items.reduce((acc, item) => acc + item.discount, 0)
  const productsTotal = budget.productsTotalAmount ?? Math.max(0, itemsSubtotal - itemsDiscount)
  const servicesTotal = budget.serviceTotalAmount ?? 0
  const budgetDiscount = budget.budgetDiscount ?? 0
  const preTotal = productsTotal + servicesTotal
  const budgetTotal = budget.budgetTotalAmount ?? Math.max(0, preTotal - budgetDiscount)

  const tableX = MARGIN_MM
  const tableY = y
  const columns = [
    { title: "Qtd", width: 16, align: "center" as const },
    { title: "Descrição", width: 74, align: "left" as const },
    { title: "Valor unit.", width: 30, align: "right" as const },
    { title: "Código", width: 30, align: "center" as const },
    { title: "Total", width: 32, align: "right" as const },
  ]
  const rows = budget.items.map((item) => ({
    quantity: String(item.quantity),
    description: item.description || "Item sem descrição",
    unitPrice: item.unitPrice,
    code: item.code?.trim() || "-",
    total: Math.max(0, item.quantity * item.unitPrice - item.discount),
  }))

  if (servicesTotal > 0 || budget.serviceName) {
    rows.push({
      quantity: "1",
      description: `Serviço: ${budget.serviceName || "Serviço contratado"}`,
      unitPrice: servicesTotal,
      code: budget.serviceCode?.trim() || "-",
      total: servicesTotal,
    })
  }

  doc.setFillColor(241, 245, 249)
  doc.setDrawColor(203, 213, 225)
  doc.rect(tableX, tableY, CONTENT_WIDTH_MM, 8, "FD")

  let currentX = tableX
  doc.setFont("helvetica", "bold")
  doc.setFontSize(9)
  doc.setTextColor(30, 41, 59)
  columns.forEach((column) => {
    if (column.align === "left") doc.text(column.title, currentX + 2, tableY + 5.3)
    if (column.align === "center") doc.text(column.title, currentX + column.width / 2, tableY + 5.3, { align: "center" })
    if (column.align === "right") doc.text(column.title, currentX + column.width - 2, tableY + 5.3, { align: "right" })
    currentX += column.width
  })

  y = tableY + 8

  if (rows.length === 0) {
    doc.setDrawColor(226, 232, 240)
    doc.rect(tableX, y, CONTENT_WIDTH_MM, 8)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(71, 85, 105)
    doc.text("Nenhum item cadastrado.", tableX + 2, y + 5.3)
    y += 8
  } else {
    rows.forEach((row) => {
      const descriptionLines = doc.splitTextToSize(row.description, columns[1].width - 4)
      const rowHeight = Math.max(8, descriptionLines.length * 4 + 3)

      y = ensurePageSpace(doc, y, rowHeight + 20)
      if (y === MARGIN_MM) {
        doc.setFillColor(241, 245, 249)
        doc.setDrawColor(203, 213, 225)
        doc.rect(tableX, y, CONTENT_WIDTH_MM, 8, "FD")
        let headerX = tableX
        doc.setFont("helvetica", "bold")
        doc.setFontSize(9)
        doc.setTextColor(30, 41, 59)
        columns.forEach((column) => {
          if (column.align === "left") doc.text(column.title, headerX + 2, y + 5.3)
          if (column.align === "center") doc.text(column.title, headerX + column.width / 2, y + 5.3, { align: "center" })
          if (column.align === "right") doc.text(column.title, headerX + column.width - 2, y + 5.3, { align: "right" })
          headerX += column.width
        })
        y += 8
      }

      let rowX = tableX
      doc.setDrawColor(226, 232, 240)
      columns.forEach((column) => {
        doc.rect(rowX, y, column.width, rowHeight)
        rowX += column.width
      })

      doc.setFont("helvetica", "normal")
      doc.setFontSize(9)
      doc.setTextColor(15, 23, 42)
      doc.text(row.quantity, tableX + columns[0].width / 2, y + 5.3, { align: "center" })
      doc.text(descriptionLines, tableX + columns[0].width + 2, y + 5.3)
      doc.text(formatCurrencyBR(row.unitPrice), tableX + columns[0].width + columns[1].width + columns[2].width - 2, y + 5.3, {
        align: "right",
      })
      doc.text(
        row.code,
        tableX + columns[0].width + columns[1].width + columns[2].width + columns[3].width / 2,
        y + 5.3,
        { align: "center" }
      )
      doc.text(
        formatCurrencyBR(row.total),
        tableX + columns[0].width + columns[1].width + columns[2].width + columns[3].width + columns[4].width - 2,
        y + 5.3,
        { align: "right" }
      )

      y += rowHeight
    })
  }

  y += 5
  y = ensurePageSpace(doc, y, 42)

  const totalsBoxWidth = 72
  const totalsX = PAGE_WIDTH_MM - MARGIN_MM - totalsBoxWidth
  const totalsY = y
  doc.setDrawColor(203, 213, 225)
  doc.rect(totalsX, totalsY, totalsBoxWidth, 28)
  doc.setFillColor(248, 250, 252)
  doc.rect(totalsX, totalsY, totalsBoxWidth, 8, "F")
  doc.setFont("helvetica", "bold")
  doc.setFontSize(10)
  doc.setTextColor(15, 23, 42)
  doc.text("Resumo financeiro", totalsX + 2, totalsY + 5.2)

  const summaryRows = [
    { label: "Subtotal:", value: formatCurrencyBR(preTotal) },
    { label: "Desconto:", value: formatCurrencyBR(budgetDiscount) },
    { label: "Total final:", value: formatCurrencyBR(budgetTotal), bold: true },
  ]

  let rowY = totalsY + 12
  summaryRows.forEach((row) => {
    doc.setFont("helvetica", row.bold ? "bold" : "normal")
    doc.setFontSize(row.bold ? 11 : 10)
    doc.text(row.label, totalsX + 2, rowY)
    doc.text(row.value, totalsX + totalsBoxWidth - 2, rowY, { align: "right" })
    rowY += 5.8
  })

  y = Math.max(rowY, totalsY + 30) + 5
  y = ensurePageSpace(doc, y, 24)

  const observationText = budget.scopeSummary || budget.slaSummary || "Documento comercial de proposta para avaliação."
  const observationLines = doc.splitTextToSize(observationText, CONTENT_WIDTH_MM - 8)
  const observationHeight = Math.max(16, observationLines.length * 4 + 8)

  doc.setFillColor(248, 250, 252)
  doc.setDrawColor(226, 232, 240)
  doc.roundedRect(MARGIN_MM, y, CONTENT_WIDTH_MM, observationHeight, 2, 2, "FD")
  doc.setFont("helvetica", "bold")
  doc.setFontSize(10)
  doc.setTextColor(30, 41, 59)
  doc.text("Observações", MARGIN_MM + 3, y + 5)
  doc.setFont("helvetica", "normal")
  doc.setFontSize(9)
  doc.setTextColor(71, 85, 105)
  doc.text(observationLines, MARGIN_MM + 3, y + 10)

  return doc.output("blob")
}

function downloadPdfForManualAttach(blob: Blob, fileName: string) {
  const objectUrl = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = objectUrl
  anchor.download = fileName
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  setTimeout(() => URL.revokeObjectURL(objectUrl), 5000)
}

export async function sendBudgetToWhatsapp(budget: Budget): Promise<SendBudgetToWhatsappResult> {
  if (typeof window === "undefined") {
    throw new Error("Acao disponivel apenas no navegador.")
  }

  const whatsappPhone = normalizeWhatsappPhone(budget.client.phone)
  if (!whatsappPhone) {
    throw new Error("O cliente nao possui telefone valido para WhatsApp.")
  }

  const pdfBlob = await generateBudgetCustomerPdf(budget)
  const fileName = `${budget.code.toLowerCase()}-proposta.pdf`
  const pdfFile = new File([pdfBlob], fileName, { type: "application/pdf" })
  const shareText = `Olá ${budget.client.contactName || budget.client.name}, segue o orçamento ${budget.code} para sua análise.`

  const canShareFiles =
    typeof navigator !== "undefined" &&
    "share" in navigator &&
    "canShare" in navigator &&
    navigator.canShare({ files: [pdfFile] })

  if (canShareFiles) {
    await navigator.share({
      title: `Orçamento ${budget.code}`,
      text: shareText,
      files: [pdfFile],
    })
    return { mode: "shared", phone: whatsappPhone }
  }

  downloadPdfForManualAttach(pdfBlob, fileName)
  const whatsappText = shareText
  const whatsappUrl = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(whatsappText)}`
  window.open(whatsappUrl, "_blank")

  return { mode: "fallback", phone: whatsappPhone }
}
