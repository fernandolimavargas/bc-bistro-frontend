import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { BistroHeader } from "../components/BistroHeader";
import { Card } from "../components/ui/card";
import {
  buscarVendas,
  formatBRL,
  type VendasHistoricos,
} from "../lib/bistro-store";
import { toast } from "sonner";
import { api } from "../services/api";

export const Route = createFileRoute("/vendas")({
  head: () => ({
    meta: [{ title: "Vendas — BC Bistro" }],
  }),

  component: Vendas,
});


function Vendas() {
  const [vendas, setVendas] = useState<VendasHistoricos[]>([]);
  const [filtroProduto, setFiltroProduto] = useState("");
  const hoje = new Date().toISOString().split("T")[0];

  const [dataInicial, setDataInicial] = useState(hoje);
  const [dataFinal, setDataFinal] = useState(hoje);
  useEffect(() => {
    loadVendas();
}, [dataInicial, dataFinal]);

  async function loadVendas() {
    try {
      const dados = await buscarVendas(
        dataInicial,
        dataFinal
      );
      setVendas(dados);
    } catch {
      toast.error("Erro ao carregar vendas");
    }
  }

  const vendasFiltradas = useMemo(() => {
    return vendas.filter((venda) => {
      const matchProduto =
        filtroProduto.length === 0 ||
        venda.produtosVendidos.some((p) =>
          p.produto
            .toLowerCase()
            .includes(filtroProduto.toLowerCase())
        );

      return matchProduto;
    });
  }, [vendas, filtroProduto]);

function reimprimirVenda(id: number) {
  window.open(
    `${window.location.origin}/imprimir/reimprimir/${id}`,
    "_blank"
  );
}
  function baixarExcel() {

  const params = new URLSearchParams({
  dataInicial: new Date(dataInicial).toISOString(),
  dataFinal: new Date(dataFinal).toISOString(),
});

  const url = `${
    api.defaults.baseURL
  }/venda/download-excel-vendas?${params.toString()}`;

  window.open(url, "_blank");
}

  const totalHoje =
    vendasFiltradas[0]?.totalDoDia ?? 0;

  return (
    <div className="min-h-screen bg-background">
      <BistroHeader />

      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-4xl font-bold">
              Vendas
            </h1>

            <p className="text-muted-foreground">
              Histórico completo das vendas realizadas
            </p>
          </div>

          <button
            onClick={baixarExcel}
            className="rounded-lg bg-[color:var(--gold)] px-4 py-2 font-semibold text-black transition hover:opacity-90"
          >
            Baixar Excel
          </button>
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <input
            type="date"
            value={dataInicial}
            onChange={(e) =>
              setDataInicial(e.target.value)
            }
            className="rounded-lg border border-border bg-background px-4 py-3 outline-none"
          />
          <input
            type="date"
            value={dataFinal}
            onChange={(e) =>
              setDataFinal(e.target.value)
            }
            className="rounded-lg border border-border bg-background px-4 py-3 outline-none"
          />

          <input
            type="text"
            placeholder="Buscar por produto..."
            value={filtroProduto}
            onChange={(e) =>
              setFiltroProduto(e.target.value)
            }
            className="rounded-lg border border-border bg-background px-4 py-3 outline-none"
          />
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-2">
          <StatCard
            label="Quantidade de vendas"
            value={String(vendasFiltradas.length)}
          />

          <StatCard
            label="Total vendido"
            value={formatBRL(totalHoje)}
            highlight
          />
        </div>

        <Card className="overflow-hidden">
          <div className="border-b border-border bg-foreground px-5 py-3 font-display text-lg text-primary-foreground">
            Histórico de vendas
          </div>

          {vendasFiltradas.length === 0 ? (
            <p className="px-5 py-10 text-center text-muted-foreground">
              Nenhuma venda encontrada.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {vendasFiltradas.map((venda) => {
                const d = new Date(venda.horaVenda);

                return (
                  <li
                    key={venda.id}
                    className="px-5 py-5"
                  >
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground">
                          {d.toLocaleDateString("pt-BR")} às{" "}
                          {d.toLocaleTimeString("pt-BR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>

                        <div className="font-display text-2xl font-bold">
                          Venda #{venda.id}
                        </div>
                        <div>
                          <button onClick={() => reimprimirVenda(venda.id)} className="mt-2 rounded-lg bg-[color:var(--gold)] px-3 py-1 text-sm font-semibold text-black transition hover:opacity-90">
                            Reimprimir
                          </button>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-xs text-muted-foreground">
                          Total da venda
                        </div>

                        <div className="font-display text-2xl font-bold text-[color:var(--gold)]">
                          {formatBRL(venda.totalVenda)}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {venda.produtosVendidos.map(
                        (produto, index) => (
                          <div
                            key={index}
                            className="flex flex-wrap items-center justify-between rounded-lg border border-border p-4"
                          >
                            <div>
                              <div className="font-semibold">
                                {produto.produto}
                              </div>

                              <div className="text-sm text-muted-foreground">
                                {produto.categoria}
                              </div>
                            </div>

                            <div className="flex gap-8 text-sm">
                              <div>
                                <div className="text-muted-foreground">
                                  Quantidade
                                </div>

                                <div>
                                  {produto.quantidade}
                                </div>
                              </div>

                              <div>
                                <div className="text-muted-foreground">
                                  Unitário
                                </div>

                                <div>
                                  {formatBRL(
                                    produto.valorUnidade
                                  )}
                                </div>
                              </div>

                              <div>
                                <div className="text-muted-foreground">
                                  Total
                                </div>

                                <div className="font-bold text-[color:var(--gold)]">
                                  {formatBRL(
                                    produto.valorCalculado
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </main>
    </div>
  );
}

function StatCard({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <Card
      className={`p-5 ${
        highlight
          ? "border-[color:var(--gold)] bg-[color:var(--gold-soft)]/40"
          : ""
      }`}
    >
      <div className="text-xs uppercase tracking-widest text-muted-foreground">
        {label}
      </div>

      <div className="mt-1 font-display text-3xl font-bold">
        {value}
      </div>
    </Card>
  );
}