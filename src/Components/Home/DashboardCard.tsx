// src/components/dashboard/DashboardCard.tsx
import React from "react";

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color?: "primary" | "secondary" | "accent" | "dark";
}

export default function DashboardCard({
  title,
  value,
  icon,
  color = "primary",
}: DashboardCardProps) {
  const bgColor =
    color === "primary"
      ? "bg-primary"
      : color === "secondary"
      ? "bg-secondary"
      : color === "accent"
      ? "bg-accent text-black"
      : "bg-primaryDark";

  return (
    <div
      className="rounded-xl p-5 flex items-center justify-between shadow 
      bg-white dark:bg-neutralDark border border-gray-200 dark:border-neutral-700"
    >
      <div className="flex flex-col">
        <span className="text-gray-500 dark:text-gray-400 text-sm">
          {title}
        </span>
        <span className="text-2xl font-semibold dark:text-white">{value}</span>
      </div>

      <div className={`p-3 rounded-lg text-white ${bgColor}`}>
        {icon}
      </div>
    </div>
  );
}
