import { useState } from "react";
import { Eye, EyeOff, Lock, User } from "lucide-react";
import { LoginHeader } from "./LoginHeader";
import { LoginFooter } from "./LoginFooter";
import { useAuth } from "../../hooks/useAuth";

export function LoginCard() {
  const { login, loading, error } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const success = await login(username, password);
    if (success) {
      window.location.href = "/Home";
    }
  }

  return (
    <div className="w-full max-w-md bg-white dark:bg-neutralDark rounded-2xl shadow-xl p-8">
      <LoginHeader />

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium">Usuário</label>
          <div className="flex items-center gap-2 mt-1 px-3 py-2 border rounded-lg dark:border-neutralDark">
            <User size={18} className="text-gray-400" />
            <input
              type="text"
              className="w-full bg-transparent outline-none text-sm"
              placeholder="Digite seu usuário"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium">Senha</label>
          <div className="flex items-center gap-2 mt-1 px-3 py-2 border rounded-lg dark:border-neutralDark">
            <Lock size={18} className="text-gray-400" />
            <input
              type={showPassword ? "text" : "password"}
              className="w-full bg-transparent outline-none text-sm"
              placeholder="Digite sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-gray-400"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {error && (
          <div className="text-sm text-red-500 bg-red-50 dark:bg-red-950 p-2 rounded">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary hover:bg-primary/90 text-white py-2 rounded-lg font-medium transition"
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>

      <LoginFooter />
    </div>
  );
}
