import { Monitor } from "lucide-react";

export function LoginHeader() {
  return (
    <div className="flex flex-col items-center gap-2 mb-6">
      <div className="flex items-center gap-2 text-primary">
        <Monitor size={32} />
        <h1 className="text-2xl font-bold">Vision Tech</h1>
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
        Acesso ao sistema interno
      </p>
    </div>
  );
}
