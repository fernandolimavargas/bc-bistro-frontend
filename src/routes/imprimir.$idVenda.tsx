import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { api } from "../services/api";
import { PedidoPrint } from "../components/PedidoPrint";

export const Route = createFileRoute("/imprimir/$idVenda")({
  component: Imprimir,
});

type ItemImpressao = {
  id: number;
  horaVenda: string;
  produto: string;
  quantidade: number;
  valorCalculado: number;
  total: number;
  observacao: string; 
};

function Imprimir() {

  const { idVenda } = Route.useParams();

  const [itens, setItens] = useState<ItemImpressao[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarVenda();
  }, []);

  async function carregarVenda() {

    try {

      const response = await api.get(
        `/imprimir/reimprimir/${idVenda}`
      );

      console.log(response.data);

      setItens(response.data.dados);

      setTimeout(() => {
        window.print();
      }, 500);

    } catch {

      alert("Erro ao carregar venda");

    } finally {

      setLoading(false);

    }
  }

  if (loading) {
    return <div>Carregando...</div>;
  }

  if (itens.length === 0) {
    return <div>Venda não encontrada</div>;
  }

  const venda = itens[0];

  return (

    <PedidoPrint
      numero={venda.id}
      total={venda.total}
      itens={itens.map((item) => ({
        nome: item.produto,
        quantidade: item.quantidade,
        valor: item.valorCalculado,
      }))}
      observacao={venda.observacao}
    />

  );
}