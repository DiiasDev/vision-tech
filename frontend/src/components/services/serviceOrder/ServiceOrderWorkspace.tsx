"use client"

import { useMemo, useState } from "react"

import { AlertComponent, ComponentAlert, type ComponentAlertState } from "@/components/layout/AlertComponent"
import { FormServiceOrder } from "@/components/services/serviceOrder/FormServiceOrder"
import { ServiceOrderFilters } from "@/components/services/serviceOrder/ServiceOrderFilters"
import { ServiceOrderHeader } from "@/components/services/serviceOrder/ServiceOrderHeader"
import { ServiceOrderStats } from "@/components/services/serviceOrder/ServiceOrderStats"
import { ServiceOrderTable } from "@/components/services/serviceOrder/ServiceOrderTable"
import {
  type ServiceOrder,
  type ServiceOrderPriority,
  type ServiceOrderServiceItem,
  type ServiceOrderStatus,
  serviceOrderMockData,
} from "@/components/services/serviceOrder/service-order-mock-data"

type ServiceOrderStatusFilter = "all" | ServiceOrderStatus

type ServiceOrderPriorityFilter = "all" | ServiceOrderPriority

type ServiceOrderWorkspaceProps = {
  detailsBasePath?: string
}

function formatDateOnly(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function formatDateTimeOffset(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  const hours = String(date.getHours()).padStart(2, "0")
  const minutes = String(date.getMinutes()).padStart(2, "0")
  return `${year}-${month}-${day}T${hours}:${minutes}:00-03:00`
}

function dateInDays(daysToAdd: number, hour = 9, minute = 0) {
  const date = new Date()
  date.setDate(date.getDate() + daysToAdd)
  date.setHours(hour, minute, 0, 0)
  return date
}

function buildNextOrderCode(orders: ServiceOrder[]) {
  const maxCounter = orders.reduce((acc, order) => {
    const match = /-(\d+)$/.exec(order.code)
    if (!match) return acc
    const value = Number.parseInt(match[1], 10)
    if (!Number.isFinite(value)) return acc
    return Math.max(acc, value)
  }, 0)

  return `OS-${String(maxCounter + 1).padStart(4, "0")}`
}

function buildStatusFeedback(status: ServiceOrderStatus, code: string) {
  if (status === "scheduled") return ComponentAlert.Info(`OS ${code} voltou para o status agendada.`)
  if (status === "in_progress") return ComponentAlert.Info(`Execucao iniciada para a OS ${code}.`)
  if (status === "awaiting_parts") return ComponentAlert.Warning(`OS ${code} movida para aguardando pecas.`)
  if (status === "completed") return ComponentAlert.Success(`OS ${code} marcada como concluida.`)
  return ComponentAlert.Warning(`OS ${code} foi cancelada.`)
}

function complexityByPriority(priority: ServiceOrderPriority) {
  if (priority === "critical") return "alta"
  if (priority === "high") return "alta"
  if (priority === "medium") return "media"
  return "baixa"
}

function defaultDoneCountByStatus(status: ServiceOrderStatus) {
  if (status === "completed") return 3
  if (status === "awaiting_parts") return 2
  if (status === "in_progress") return 1
  return 0
}

function buildDefaultServiceItems(order: ServiceOrder): ServiceOrderServiceItem[] {
  const doneCount = defaultDoneCountByStatus(order.status)
  const complexity = complexityByPriority(order.priority)
  const baseCode = order.code.replace("OS-", "")
  const defaultCatalogStatus = order.status === "cancelled" ? "inactive" : "active"

  const templates = [
    {
      suffix: "01",
      name: `Diagnostico - ${order.serviceName}`,
      serviceType: "diagnostico",
      billingModel: "hourly",
      billingUnit: "hora",
      estimatedDuration: "2h",
    },
    {
      suffix: "02",
      name: `Execucao tecnica - ${order.serviceName}`,
      serviceType: "implantacao",
      billingModel: "project",
      billingUnit: "projeto",
      estimatedDuration: "4h",
    },
    {
      suffix: "03",
      name: `Validacao final - ${order.serviceName}`,
      serviceType: "validacao",
      billingModel: "hourly",
      billingUnit: "hora",
      estimatedDuration: "1h",
    },
  ] as const

  return templates.map((template, index) => ({
    id: `svc-${order.id}-${template.suffix}`,
    code: `SVC-${baseCode}-${template.suffix}`,
    name: template.name,
    category: order.serviceName,
    serviceType: template.serviceType,
    billingModel: template.billingModel,
    billingUnit: template.billingUnit,
    estimatedDuration: template.estimatedDuration,
    complexityLevel: complexity,
    responsible: order.technician,
    catalogStatus: defaultCatalogStatus,
    checkStatus: index < doneCount ? "done" : "pending",
  }))
}

function ensureOrderServiceItems(order: ServiceOrder): ServiceOrder {
  if (order.serviceItems && order.serviceItems.length > 0) return order
  return {
    ...order,
    serviceItems: buildDefaultServiceItems(order),
  }
}

export function ServiceOrderWorkspace({ detailsBasePath = "/services/serviceOrder/id" }: ServiceOrderWorkspaceProps) {
  const [orders, setOrders] = useState<ServiceOrder[]>(() => serviceOrderMockData.map(ensureOrderServiceItems))
  const [searchValue, setSearchValue] = useState("")
  const [statusFilter, setStatusFilter] = useState<ServiceOrderStatusFilter>("all")
  const [priorityFilter, setPriorityFilter] = useState<ServiceOrderPriorityFilter>("all")
  const [technicianFilter, setTechnicianFilter] = useState("all")
  const [selectedOrderIds, setSelectedOrderIds] = useState<Set<string>>(new Set())
  const [feedback, setFeedback] = useState<ComponentAlertState | null>(null)
  const [showServiceOrderForm, setShowServiceOrderForm] = useState(false)

  const technicians = useMemo(() => {
    const uniqueTechnicians = new Set<string>()
    orders.forEach((order) => uniqueTechnicians.add(order.technician))
    return Array.from(uniqueTechnicians).sort((a, b) => a.localeCompare(b, "pt-BR"))
  }, [orders])

  const filteredOrders = useMemo(() => {
    const normalizedSearch = searchValue.trim().toLowerCase()

    return orders.filter((order) => {
      const matchesStatus = statusFilter === "all" || order.status === statusFilter
      const matchesPriority = priorityFilter === "all" || order.priority === priorityFilter
      const matchesTechnician = technicianFilter === "all" || order.technician === technicianFilter
      const matchesSearch =
        normalizedSearch.length === 0 ||
        order.code.toLowerCase().includes(normalizedSearch) ||
        order.title.toLowerCase().includes(normalizedSearch) ||
        order.client.name.toLowerCase().includes(normalizedSearch) ||
        order.serviceName.toLowerCase().includes(normalizedSearch) ||
        order.technician.toLowerCase().includes(normalizedSearch)

      return matchesStatus && matchesPriority && matchesTechnician && matchesSearch
    })
  }, [orders, priorityFilter, searchValue, statusFilter, technicianFilter])

  function removeOrders(orderIds: string[]) {
    const idSet = new Set(orderIds)

    setOrders((prev) => prev.filter((order) => !idSet.has(order.id)))
    setSelectedOrderIds((prev) => {
      const next = new Set(prev)
      orderIds.forEach((orderId) => next.delete(orderId))
      return next
    })
  }

  function handleOpenNewOrder() {
    setFeedback(null)
    setShowServiceOrderForm(true)
  }

  function handleDeleteOrder(order: ServiceOrder) {
    const confirmed = globalThis.confirm(`Deseja realmente excluir a ordem ${order.code}?`)
    if (!confirmed) return

    removeOrders([order.id])
    setFeedback(ComponentAlert.Success(`Ordem ${order.code} excluida com sucesso.`))
  }

  function handleDeleteOrders(ordersToDelete: ServiceOrder[]) {
    if (ordersToDelete.length === 0) return

    const confirmed = globalThis.confirm(
      ordersToDelete.length === 1
        ? `Deseja realmente excluir a ordem ${ordersToDelete[0].code}?`
        : `Deseja realmente excluir ${ordersToDelete.length} ordens selecionadas?`
    )
    if (!confirmed) return

    removeOrders(ordersToDelete.map((order) => order.id))
    setFeedback(
      ComponentAlert.Success(
        ordersToDelete.length === 1
          ? "1 ordem excluida com sucesso."
          : `${ordersToDelete.length} ordens excluidas com sucesso.`
      )
    )
  }

  function handleUpdateStatus(order: ServiceOrder, nextStatus: ServiceOrderStatus) {
    const nowDateOnly = formatDateOnly()
    const nowDateTime = formatDateTimeOffset(new Date())

    setOrders((prev) =>
      prev.map((currentOrder) => {
        if (currentOrder.id !== order.id) return currentOrder

        const normalizedOrder = ensureOrderServiceItems(currentOrder)
        const updatedServiceItems =
          nextStatus === "completed"
            ? normalizedOrder.serviceItems?.map((item) => ({ ...item, checkStatus: "done" as const }))
            : normalizedOrder.serviceItems

        return {
          ...normalizedOrder,
          status: nextStatus,
          updatedAt: nowDateOnly,
          concludedAt: nextStatus === "completed" ? nowDateOnly : null,
          serviceItems: updatedServiceItems,
          timeline: [
            ...normalizedOrder.timeline,
            {
              id: `timeline-${normalizedOrder.id}-${Date.now()}`,
              at: nowDateTime,
              author: "Sistema",
              event: "Atualizacao de status",
              notes: `Status alterado para ${nextStatus}.`,
            },
          ],
        }
      })
    )

    setFeedback(buildStatusFeedback(nextStatus, order.code))
  }

  function handleDuplicateOrder(order: ServiceOrder) {
    const nowDateOnly = formatDateOnly()
    const nowDateTime = formatDateTimeOffset(new Date())
    const nextOrderCode = buildNextOrderCode(orders)
    const suffix = Date.now()
    const normalizedOrder = ensureOrderServiceItems(order)

    const duplicatedOrder: ServiceOrder = {
      ...normalizedOrder,
      id: `so-copy-${suffix}`,
      code: nextOrderCode,
      status: "scheduled",
      createdAt: nowDateOnly,
      updatedAt: nowDateOnly,
      scheduledAt: formatDateTimeOffset(dateInDays(1, 9, 0)),
      deadlineDate: formatDateOnly(dateInDays(5, 12, 0)),
      concludedAt: null,
      notes: [...normalizedOrder.notes, `OS gerada como copia da ${normalizedOrder.code}.`],
      serviceItems: normalizedOrder.serviceItems?.map((item, index) => ({
        ...item,
        id: `${item.id}-copy-${suffix}-${index}`,
        code: `SVC-${nextOrderCode.replace("OS-", "")}-${String(index + 1).padStart(2, "0")}`,
        checkStatus: "pending",
      })),
      laborItems: normalizedOrder.laborItems.map((item, index) => ({
        ...item,
        id: `${item.id}-copy-${suffix}-${index}`,
        workedHours: 0,
        status: "pending",
      })),
      partItems: normalizedOrder.partItems.map((item, index) => ({
        ...item,
        id: `${item.id}-copy-${suffix}-${index}`,
        status: "planned",
      })),
      timeline: [
        {
          id: `timeline-copy-${suffix}`,
          at: nowDateTime,
          author: "Sistema",
          event: "OS duplicada",
          notes: `Duplicada a partir da ordem ${normalizedOrder.code}.`,
        },
      ],
    }

    setOrders((prev) => [duplicatedOrder, ...prev])
    setFeedback(ComponentAlert.Success(`Nova ordem criada: ${duplicatedOrder.code}.`))
  }

  function handleToggleServiceChecklistItem(orderId: string, serviceItemId: string, checked: boolean) {
    const nowDateOnly = formatDateOnly()
    const nowDateTime = formatDateTimeOffset(new Date())

    setOrders((prev) =>
      prev.map((currentOrder) => {
        if (currentOrder.id !== orderId) return currentOrder

        const normalizedOrder = ensureOrderServiceItems(currentOrder)
        const updatedServiceItems =
          normalizedOrder.serviceItems?.map((item) =>
            item.id === serviceItemId ? { ...item, checkStatus: checked ? "done" : "pending" } : item
          ) ?? []

        const doneCount = updatedServiceItems.filter((item) => item.checkStatus === "done").length
        const totalCount = updatedServiceItems.length

        let nextStatus = normalizedOrder.status
        let nextConcludedAt = normalizedOrder.concludedAt ?? null

        if (totalCount > 0 && doneCount === totalCount) {
          nextStatus = "completed"
          nextConcludedAt = nowDateOnly
        } else if (doneCount > 0 && normalizedOrder.status === "scheduled") {
          nextStatus = "in_progress"
          nextConcludedAt = null
        } else if (doneCount < totalCount && normalizedOrder.status === "completed") {
          nextStatus = "in_progress"
          nextConcludedAt = null
        }

        return {
          ...normalizedOrder,
          serviceItems: updatedServiceItems,
          status: nextStatus,
          concludedAt: nextConcludedAt,
          updatedAt: nowDateOnly,
          timeline: [
            ...normalizedOrder.timeline,
            {
              id: `timeline-check-${normalizedOrder.id}-${Date.now()}`,
              at: nowDateTime,
              author: "Sistema",
              event: "Checklist de servicos atualizado",
              notes: `${doneCount}/${totalCount} servico(s) marcado(s) como realizados.`,
            },
          ],
        }
      })
    )
  }

  function handleToggleSelection(orderId: string, checked: boolean) {
    setSelectedOrderIds((prev) => {
      const next = new Set(prev)
      if (checked) next.add(orderId)
      else next.delete(orderId)
      return next
    })
  }

  function handleToggleAllVisible(checked: boolean) {
    setSelectedOrderIds((prev) => {
      const next = new Set(prev)
      filteredOrders.forEach((order) => {
        if (checked) next.add(order.id)
        else next.delete(order.id)
      })
      return next
    })
  }

  return (
    <div className="relative space-y-6 overflow-hidden pb-4">
      <FormServiceOrder
        open={showServiceOrderForm}
        onClose={() => setShowServiceOrderForm(false)}
        existingCodes={orders.map((order) => order.code)}
        onCreated={(newOrder) => {
          setOrders((prev) => [ensureOrderServiceItems(newOrder), ...prev])
          setShowServiceOrderForm(false)
        }}
        onFeedback={setFeedback}
      />

      <ServiceOrderHeader onAddOrder={handleOpenNewOrder} />

      <AlertComponent alert={feedback} onClose={() => setFeedback(null)} />

      <ServiceOrderStats orders={orders} />

      <section className="overflow-hidden rounded-2xl border border-border/70 bg-card/95 shadow-sm">
        <div className="border-b border-border/70 p-5">
          <ServiceOrderFilters
            searchValue={searchValue}
            onSearchChange={setSearchValue}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            priorityFilter={priorityFilter}
            onPriorityFilterChange={setPriorityFilter}
            technicianFilter={technicianFilter}
            onTechnicianFilterChange={setTechnicianFilter}
            technicians={technicians}
            resultCount={filteredOrders.length}
          />
        </div>

        <ServiceOrderTable
          orders={filteredOrders}
          detailsBasePath={detailsBasePath}
          selectedOrderIds={selectedOrderIds}
          onToggleSelection={handleToggleSelection}
          onToggleAll={handleToggleAllVisible}
          onDeleteOrder={handleDeleteOrder}
          onDeleteOrders={handleDeleteOrders}
          onDuplicateOrder={handleDuplicateOrder}
          onUpdateStatus={handleUpdateStatus}
          onToggleServiceChecklistItem={handleToggleServiceChecklistItem}
        />
      </section>
    </div>
  )
}
