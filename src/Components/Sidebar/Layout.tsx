import { Sidebar } from "./Sidebar";
import { useSidebar } from "../../contexts/SidebarContext";

export function Layout({ children }: { children: React.ReactNode }) {
  const { isOpen } = useSidebar();

  return (
    <div className="flex bg-[var(--page-bg)] min-h-screen">
      <Sidebar />

      {/* Conteúdo da Página */}
      <main 
        className={`
          flex-1 transition-all duration-300
          ${isOpen ? 'ml-72' : 'ml-20'}
        `}
      >
        {children}
      </main>
    </div>
  );
}
