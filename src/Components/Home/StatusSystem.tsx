// src/components/system/SystemStatusItem.tsx
import React from "react";

interface SystemStatusItemProps {
  label: string;
  value: string;
}

export default function SystemStatusItem({ label, value }: SystemStatusItemProps) {
  return (
    <div className="flex items-center justify-between text-gray-700 dark:text-gray-300">
      <span>{label}</span>

      <span
        className={`font-semibold ${
          value.toLowerCase() === "online"
            ? "text-secondary"
            : "text-red-500"
        }`}
      >
        {value}
      </span>
    </div>
  );
}
