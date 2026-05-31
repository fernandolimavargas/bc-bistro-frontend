import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";

import { isAuthenticated, login } from "../lib/bistro-auth";

import { LogIn } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  component: Login,
});

function Login() {

  const navigate = useNavigate();

  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated()) {
      navigate({
        to: "/",
        replace: true
      });
    }

  }, [navigate]);

  const submit = async (e: React.FormEvent) => {

    e.preventDefault();

    setErro(null);
    setLoading(true);

    try {

      const session = await login(
        usuario,
        senha
      );

      toast.success(
        `Bem-vindo(a), ${session.user.nome}!`
      );

      navigate({
        to: "/",
        replace: true
      });

    } catch (err) {

      setErro(
        err instanceof Error
          ? err.message
          : "Erro ao entrar"
      );

    } finally {

      setLoading(false);

    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">

      <div className="w-full max-w-md">

        <div className="mb-8 flex flex-col items-center text-center">

          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-black text-yellow-400 text-2xl font-bold">
            BC
          </div>

          <h1 className="text-3xl font-bold">
            BC Bistro
          </h1>

          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            Bistrô da Brasa Church
          </p>

        </div>

        <Card className="p-6 sm:p-8">

          <h2 className="mb-1 text-2xl font-bold">
            Entrar
          </h2>

          <p className="mb-6 text-sm text-muted-foreground">
            Acesse sua conta para gerenciar as vendas.
          </p>

          <form
            onSubmit={submit}
            className="space-y-4"
          >

            <div>

              <Label htmlFor="usuario">
                Usuário
              </Label>

              <Input
                id="usuario"
                autoFocus
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
              />

            </div>

            <div>

              <Label htmlFor="senha">
                Senha
              </Label>

              <Input
                id="senha"
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
              />

            </div>

            {erro && (
              <div className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-500">
                {erro}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-yellow-400 text-black hover:bg-yellow-300"
            >
              <LogIn className="mr-2 h-4 w-4" />

              {loading
                ? "Entrando..."
                : "Entrar"}
            </Button>

          </form>

        </Card>

      </div>

    </div>
  );
}

export default Login;