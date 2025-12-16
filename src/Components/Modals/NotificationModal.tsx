import { Close, Settings, Computer } from "@mui/icons-material";
import { useState } from "react";
import { NotificationItem } from "../Notify/NotificationItem";
import { NotificationSettings } from "../Notify/NotificationSettings";
import { type Notification } from "../../types/Notify.types";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function NotificationModal({ open, onClose }: Props) {
  if (!open) return null;

  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      title: "Pedido aprovado",
      description: "O pedido #1023 foi aprovado",
      type: "finance",
      read: false,
      date: "Agora",
    },
    {
      id: "2",
      title: "Estoque baixo",
      description: "SSD Kingston com estoque crítico",
      type: "stock",
      read: false,
      date: "10 min atrás",
    },
    {
      id: "3",
      title: "Serviço finalizado",
      description: "Formatação concluída",
      type: "service",
      read: true,
      date: "Ontem",
    },
  ]);

  const [filter, setFilter] = useState<'all' | 'unread' | 'important'>('all');

  const unreadCount = notifications.filter(n => !n.read).length;

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.read;
    if (filter === 'important') return !n.read; // Poderia ter uma flag 'important' no futuro
    return true;
  });

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAsUnread = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: false } : n)
    );
  };

  const toggleRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: !n.read } : n)
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, read: true }))
    );
  };

  const clearAll = () => {
    if (window.confirm('Tem certeza que deseja limpar todas as notificações?')) {
      setNotifications([]);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop com animação */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />
      
      {/* Modal centralizado */}
      <div 
        className="relative w-full max-w-2xl bg-gradient-to-br from-white to-gray-50 dark:from-neutral-900 dark:to-neutral-950 rounded-3xl shadow-2xl flex flex-col max-h-[90vh] animate-modal-appear overflow-hidden border border-gray-200 dark:border-neutral-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header com gradiente melhorado */}
        <div className="relative bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 dark:from-blue-700 dark:via-blue-600 dark:to-indigo-700 px-6 py-6 overflow-hidden">
          {/* Decoração de fundo */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-300 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
          </div>
          
          <div className="relative flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <Computer className="text-white" fontSize="small" />
                </div>
                <div>
                  <h3 className="font-bold text-2xl text-white">Notificações</h3>
                  <p className="text-sm text-white/90 mt-0.5">
                    Central de avisos e atualizações
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 mt-3">
                <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-1.5 border border-white/30">
                  <span className="text-sm text-white font-semibold">
                    {unreadCount > 0 ? `${unreadCount} não lida${unreadCount > 1 ? 's' : ''}` : '✓ Todas lidas'}
                  </span>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-full px-3 py-1.5">
                  <span className="text-xs text-white/90">
                    {notifications.length} total
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-1">
              <button 
                className="p-2.5 rounded-xl hover:bg-white/20 transition-all text-white backdrop-blur-sm border border-white/20"
                onClick={() => console.log("Settings")}
              >
                <Settings fontSize="small" />
              </button>
              <button 
                className="p-2.5 rounded-xl hover:bg-white/20 transition-all text-white backdrop-blur-sm border border-white/20"
                onClick={onClose}
              >
                <Close fontSize="small" />
              </button>
            </div>
          </div>
        </div>

        {/* Lista de notificações com gradiente de fundo */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3 custom-scrollbar bg-gradient-to-b from-transparent via-blue-50/20 to-transparent dark:via-blue-950/10">
          {notifications.length > 0 ? (
            <>
              {/* Filtros rápidos */}
              <div className="flex gap-2 pb-2 sticky top-0 bg-gradient-to-b from-white via-white to-transparent dark:from-neutral-900 dark:via-neutral-900 z-10 pt-1">
                <button 
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg shadow-sm transition-colors ${
                    filter === 'all' 
                      ? 'bg-blue-600 text-white hover:bg-blue-700' 
                      : 'bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-neutral-700'
                  }`}
                  onClick={() => setFilter('all')}
                >
                  Todas ({notifications.length})
                </button>
                <button 
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg shadow-sm transition-colors ${
                    filter === 'unread' 
                      ? 'bg-blue-600 text-white hover:bg-blue-700' 
                      : 'bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-neutral-700'
                  }`}
                  onClick={() => setFilter('unread')}
                >
                  Não lidas ({unreadCount})
                </button>
                <button 
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg shadow-sm transition-colors ${
                    filter === 'important' 
                      ? 'bg-blue-600 text-white hover:bg-blue-700' 
                      : 'bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-neutral-700'
                  }`}
                  onClick={() => setFilter('important')}
                >
                  Importantes
                </button>
              </div>
              
              {filteredNotifications.length > 0 ? (
                filteredNotifications.map((n) => (
                  <NotificationItem
                    key={n.id}
                    data={n}
                    onToggleRead={toggleRead}
                    onDelete={deleteNotification}
                  />
                ))
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500 dark:text-gray-400">Nenhuma notificação nesta categoria</p>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-600 py-16">
              <div className="w-24 h-24 mb-4 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-neutral-800 dark:to-neutral-900 flex items-center justify-center border border-gray-200 dark:border-neutral-700">
                <Computer className="text-5xl text-blue-500 dark:text-blue-400" />
              </div>
              <p className="text-base font-semibold text-gray-700 dark:text-gray-300">Nenhuma notificação</p>
              <p className="text-sm mt-2 text-gray-500 dark:text-gray-400">Você está em dia! 🎉</p>
            </div>
          )}
        </div>

        {/* Configurações em collapsible */}
        <div className="border-t dark:border-neutral-800">
          <NotificationSettings />
        </div>

        {/* Footer com ações rápidas melhorado */}
        <div className="p-6 border-t dark:border-neutral-800 bg-gradient-to-br from-gray-50 to-blue-50/30 dark:from-neutral-900/80 dark:to-blue-950/20">
          <div className="flex gap-3 mb-3">
            <button 
              className="flex-1 text-sm font-semibold border-2 border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 rounded-xl py-3 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-400 dark:hover:border-red-600 transition-all hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={clearAll}
              disabled={notifications.length === 0}
            >
              🗑️ Limpar todas
            </button>
            <button 
              className="flex-1 text-sm font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl py-3 shadow-lg shadow-blue-500/30 transition-all hover:shadow-blue-500/50 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
            >
              ✓ Marcar como lidas
            </button>
          </div>
          
          <div className="text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Última atualização: Agora • {notifications.length} notificaç{notifications.length === 1 ? 'ão' : 'ões'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
