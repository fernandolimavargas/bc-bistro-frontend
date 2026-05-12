import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { BistroHeader } from "../components/BistroHeader";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import {
  addVenda,
  formatBRL,
  mostrarCatalogo,
  type Categoria,
  type ItemVenda,
  type Produto,
} from "../lib/bistro-store";
import { Minus, Plus, ShoppingBag, Trash2, Check } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "BC Bistro — Bistrô da Igreja" },
      { name: "description", content: "Sistema de vendas do BC Bistro." },
    ],
  }),
  component: Loja,
});

const CATEGORIAS: Categoria[] = [
  "Almoços",
  "Hambúrgueres",
  "Bebidas",
  "Outros",
];

function Loja() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [carrinho, setCarrinho] = useState<Record<number, number>>({});
  const [filtro, setFiltro] = useState<Categoria | "Todos">("Todos");
  const [loadingVenda, setLoadingVenda] = useState(false);

  const filtrosCategoria: Record<string, number> = {
    Todos: 0,
    Almoços: 1,
    Hambúrgueres: 2,
    Bebidas: 3,
    Outros: 4,
  };

  useEffect(() => {
    loadCatalogo();
  }, [filtro]);

  async function loadCatalogo() {
    try {
      const filtroId = filtrosCategoria[filtro];

      const dados = await mostrarCatalogo(filtroId);

      setProdutos(dados);
    } catch {
      toast.error("Erro ao carregar catálogo");
    }
  }

  const itens: ItemVenda[] = useMemo(
    () =>
      Object.entries(carrinho)
        .map(([id, qtd]) => {
          const p = produtos.find((x) => x.id === Number(id));

          if (!p || qtd <= 0) return null;

          return {
            produtoId: p.id,
            produto: p.produto,
            valorUnidade: p.preco,
            valorCalculado: p.preco * qtd,
            valorTotal: p.preco * qtd,
            quantidade: qtd,
          };
        })
        .filter(Boolean) as ItemVenda[],
    [carrinho, produtos]
  );

  const total = itens.reduce(
    (s, i) => s + i.valorCalculado,
    0
  );

  const add = (id: number) =>
    setCarrinho((c) => ({
      ...c,
      [id]: (c[id] ?? 0) + 1,
    }));

  const sub = (id: number) =>
    setCarrinho((c) => {
      const n = (c[id] ?? 0) - 1;

      const next = { ...c };

      if (n <= 0) delete next[id];
      else next[id] = n;

      return next;
    });

  const remove = (id: number) =>
    setCarrinho((c) => {
      const next = { ...c };

      delete next[id];

      return next;
    });

  const finalizar = async () => {
    if (itens.length === 0 || loadingVenda) return;

    try {
      setLoadingVenda(true);

      await addVenda(itens);

      setCarrinho({});

      toast.success("Venda finalizada!", {
        description: `Total: ${formatBRL(total)}`,
      });

      await loadCatalogo();
    } catch {
      toast.error("Erro ao finalizar venda");
    } finally {
      setLoadingVenda(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <BistroHeader />

      {loadingVenda && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4 rounded-2xl bg-card px-8 py-6 shadow-2xl">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-[color:var(--gold)] border-t-transparent" />

            <div className="text-center">
              <h2 className="font-display text-xl font-semibold">
                Finalizando venda
              </h2>

              <p className="text-sm text-muted-foreground">
                Aguarde alguns segundos...
              </p>
            </div>
          </div>
        </div>
      )}

      <main className="mx-auto grid max-w-6xl gap-6 px-4 py-8 lg:grid-cols-[1fr_360px]">
        <section>
          <div className="mb-6">
            <h1 className="font-display text-4xl font-bold">
              Cardápio
            </h1>

            <p className="text-muted-foreground">
              Toque em um produto para adicionar ao carrinho.
            </p>
          </div>

          <div className="mb-5 flex flex-wrap gap-2">
            {(["Todos", ...CATEGORIAS] as const).map((c) => (
              <button
                key={c}
                onClick={() => setFiltro(c)}
                className={`rounded-full border px-4 py-1.5 text-sm transition ${
                  filtro === c
                    ? "border-foreground bg-foreground text-primary-foreground"
                    : "border-border bg-card hover:border-foreground/40"
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {produtos.map((p) => {
              const qtd = carrinho[p.id] ?? 0;

              return (
                <Card
                  key={p.id}
                  className="group flex flex-col justify-between p-5 transition hover:border-[color:var(--gold)] hover:shadow-md"
                >
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-widest text-[color:var(--gold)]">
                      {p.categoria}
                    </div>

                    <h3 className="mt-1 font-display text-lg font-semibold leading-snug">
                      {p.produto}
                    </h3>

                    <div className="mt-2 text-2xl font-bold">
                      {formatBRL(p.preco)}
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    {qtd > 0 ? (
                      <div className="flex items-center gap-2">
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => sub(p.id)}
                          disabled={loadingVenda}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>

                        <span className="w-6 text-center font-semibold">
                          {qtd}
                        </span>

                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => add(p.id)}
                          disabled={loadingVenda}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        Disponível
                      </span>
                    )}

                    <Button
                      onClick={() => add(p.id)}
                      size="sm"
                      disabled={loadingVenda}
                    >
                      <Plus className="mr-1 h-4 w-4" />
                      Adicionar
                    </Button>
                  </div>
                </Card>
              );
            })}

            {produtos.length === 0 && (
              <p className="text-muted-foreground">
                Nenhum produto nesta categoria.
              </p>
            )}
          </div>
        </section>

        <aside className="lg:sticky lg:top-6 lg:h-fit">
          <Card className="overflow-hidden">
            <div className="flex items-center gap-2 border-b border-border bg-foreground px-5 py-4 text-primary-foreground">
              <ShoppingBag className="h-5 w-5 text-[color:var(--gold)]" />

              <h2 className="font-display text-xl">
                Carrinho
              </h2>

              <span className="ml-auto text-sm text-[color:var(--gold-soft)]">
                {itens.length}{" "}
                {itens.length === 1 ? "item" : "itens"}
              </span>
            </div>

            <div className="max-h-[50vh] divide-y divide-border overflow-y-auto">
              {itens.length === 0 && (
                <p className="px-5 py-10 text-center text-sm text-muted-foreground">
                  Seu carrinho está vazio.
                </p>
              )}

              {itens.map((i) => (
                <div
                  key={i.produtoId}
                  className="flex items-center gap-3 px-5 py-3"
                >
                  <div className="flex-1">
                    <div className="text-sm font-medium leading-tight">
                      {i.produto}
                    </div>

                    <div className="text-xs text-muted-foreground">
                      {i.quantidade} × {formatBRL(i.valorUnidade)}
                    </div>
                  </div>

                  <div className="font-semibold">
                    {formatBRL(i.valorCalculado)}
                  </div>

                  <button
                    onClick={() => remove(i.produtoId)}
                    className="text-muted-foreground hover:text-destructive"
                    aria-label="Remover"
                    disabled={loadingVenda}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="border-t border-border bg-card px-5 py-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Total
                </span>

                <span className="font-display text-2xl font-bold">
                  {formatBRL(total)}
                </span>
              </div>

              <Button
                className="w-full bg-[color:var(--gold)] text-foreground hover:bg-[color:var(--gold)]/90"
                size="lg"
                disabled={itens.length === 0 || loadingVenda}
                onClick={finalizar}
              >
                <Check className="mr-2 h-4 w-4" />
                {loadingVenda ? "Finalizando..." : "Finalizar venda"}
              </Button>
            </div>
          </Card>
        </aside>
      </main>
    </div>
  );
}