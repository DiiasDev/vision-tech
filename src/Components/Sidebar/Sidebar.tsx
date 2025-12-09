import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { sidebarSections } from "./SidebarData";
import { useSidebar } from "../../contexts/SidebarContext";

import {
  ChevronDown,
  ChevronRight,
  Menu,
} from "lucide-react";

export function Sidebar() {
  const { isOpen, toggleSidebar } = useSidebar();
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const location = useLocation();

  const handleToggle = () => {
    toggleSidebar();
    if (isOpen) {
      setOpenMenu(null); // Close all submenus when closing sidebar
    }
  };

  const handleParentClick = (key: string) => {
    if (!isOpen) return; // Don't open submenus if sidebar is closed
    setOpenMenu(openMenu === key ? null : key);
  };

  return (
    <aside
      className={`
        fixed top-0 left-0 h-screen flex flex-col shadow-xl z-50
        transition-all duration-300 ease-in-out
        bg-[var(--sidebar-bg)] overflow-hidden
        ${isOpen ? "w-72" : "w-20"}
      `}
    >
      {/* ----------- HEADER (LOGO + MENU BUTTON) ----------- */}
      <div
        className="
          flex items-center justify-between
          px-4 py-4 border-b
          border-[var(--sidebar-divider)]
          min-h-[72px]
        "
      >
        {isOpen && (
          <div className="flex items-center gap-3 overflow-hidden flex-1 mr-2">
            {/* Logo estilizada */}
            <div
              className="
                w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
                bg-[var(--brand-blue)]
                text-white font-bold text-lg
              "
            >
              VT
            </div>

            <div className="overflow-hidden">
              <h2
                className="
                  text-[var(--sidebar-text)]
                  font-bold leading-tight
                  whitespace-nowrap overflow-hidden text-ellipsis
                "
              >
                Vision Tech
              </h2>

              <span
                className="
                  text-xs text-[var(--sidebar-text-secondary)]
                  whitespace-nowrap
                "
              >
                v1.0 Dashboard
              </span>
            </div>
          </div>
        )}

        {/* Botão para abrir/fechar */}
        <button
          onClick={handleToggle}
          className="
            p-2 rounded-lg hover:bg-[var(--sidebar-hover)]
            transition flex-shrink-0
          "
        >
          <Menu size={20} className="text-[var(--sidebar-icon)]" />
        </button>
      </div>

      {/* ---------------- MENU SECTIONS ---------------- */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden mt-4">
        {sidebarSections.map((section) => (
          <div key={section.title} className="mb-6">
            {/* Nome da seção */}
            {isOpen && (
              <h3
                className="
                  px-5 mb-2 text-xs font-medium tracking-wide uppercase
                  text-[var(--sidebar-text-secondary)]
                "
              >
                {section.title}
              </h3>
            )}

            {/* LISTA DE ITENS */}
            {section.items.map((item) => {
              const Icon = item.icon;

              // CASO SEJA UM ITEM SEM FILHOS
              if (!("children" in item)) {
                const isActive = location.pathname === item.path;

                return (
                  <Link
                    key={item.key}
                    to={item.path}
                    className={`
                      flex items-center px-5 py-3 rounded-lg mx-2 mb-1
                      cursor-pointer transition-all
                      ${
                        isActive
                          ? "bg-[var(--sidebar-active-bg)] text-[var(--sidebar-active-text)]"
                          : "text-[var(--sidebar-text)] hover:bg-[var(--sidebar-hover)]"
                      }
                    `}
                  >
                    <Icon
                      size={21}
                      className="
                        text-[var(--sidebar-icon)]
                      "
                    />
                    {isOpen && (
                      <span className="ml-3 text-sm font-medium">
                        {item.label}
                      </span>
                    )}
                  </Link>
                );
              }

              // CASO TENHA SUBMENUS
              const isParentActive =
                item.children.some((c) => c.path === location.pathname);

              return (
                <div key={item.key} className="mb-1">
                  <button
                    onClick={() => handleParentClick(item.key)}
                    className={`
                      flex items-center w-full px-5 py-3 rounded-lg mx-2
                      cursor-pointer transition-all
                      ${
                        isParentActive
                          ? "bg-[var(--sidebar-active-bg)] text-[var(--sidebar-active-text)]"
                          : "text-[var(--sidebar-text)] hover:bg-[var(--sidebar-hover)]"
                      }
                    `}
                  >
                    <Icon size={21} className="text-[var(--sidebar-icon)]" />

                    {isOpen && (
                      <>
                        <span className="ml-3 text-sm font-medium flex-1">
                          {item.label}
                        </span>

                        {openMenu === item.key ? (
                          <ChevronDown
                            size={18}
                            className="text-[var(--sidebar-icon)]"
                          />
                        ) : (
                          <ChevronRight
                            size={18}
                            className="text-[var(--sidebar-icon)]"
                          />
                        )}
                      </>
                    )}
                  </button>

                  {/* SUBMENU */}
                  {openMenu === item.key && isOpen && (
                    <div className="ml-10 flex flex-col mt-2 mb-2 mr-2">
                      {item.children.map((child, index) => {
                        const isActive = location.pathname === child.path;
                        const isLast = index === item.children.length - 1;

                        return (
                          <div key={child.path} className="relative flex items-start">
                            {/* Vertical line */}
                            {!isLast && (
                              <div className="absolute left-[3px] top-[8px] w-[2px] h-[calc(100%+8px)] bg-[var(--sidebar-divider)]" />
                            )}
                            
                            {/* Dot and Link container */}
                            <div className="flex items-start w-full gap-3">
                              {/* Dot */}
                              <div className={`
                                w-[8px] h-[8px] rounded-full flex-shrink-0 z-10 mt-[4px]
                                transition-all duration-200
                                ${
                                  isActive
                                    ? "bg-[var(--brand-blue)] ring-4 ring-[var(--brand-blue)]/20"
                                    : "bg-[var(--sidebar-text-secondary)] hover:bg-[var(--brand-blue)]"
                                }
                              `} />
                              
                              <Link
                                to={child.path}
                                className={`
                                  flex-1 px-4 py-2 rounded-lg text-sm mb-1
                                  transition-all duration-200
                                  ${
                                    isActive
                                      ? "bg-[var(--sidebar-active-bg)] text-[var(--sidebar-active-text)] font-medium"
                                      : "text-[var(--sidebar-text-secondary)] hover:bg-[var(--sidebar-hover)] hover:text-[var(--sidebar-text)]"
                                  }
                                `}
                              >
                                {child.label}
                              </Link>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </nav>

      {/* ---------------- FOOTER / USER INFO ---------------- */}
      <div
        className="
          p-4 border-t
          border-[var(--sidebar-divider)]
          flex items-center gap-3 overflow-hidden
        "
      >
        <img
          src="https://i.pravatar.cc/40"
          alt="avatar"
          className="w-9 h-9 rounded-full flex-shrink-0"
        />

        {isOpen && (
          <div className="overflow-hidden flex-1">
            <p className="text-sm text-[var(--sidebar-text)] font-medium whitespace-nowrap overflow-hidden text-ellipsis">
              Gabriel Dias
            </p>
            <p className="text-xs text-[var(--sidebar-text-secondary)] whitespace-nowrap overflow-hidden text-ellipsis">
              visiontech@empresa.com
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}
