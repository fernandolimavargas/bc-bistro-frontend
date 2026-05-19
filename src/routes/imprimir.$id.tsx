import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/imprimir/$id")({
  component: Imprimir,
});

type ItemImpressao = {
  id: number;
  horaVenda: string;
  produto: string;
  quantidade: number;
  valorCalculado: number;
  total: number;
};

function Imprimir() {

  const { id } = Route.useParams();

  const [itens, setItens] = useState<ItemImpressao[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    carregarVenda();

  }, []);

  const carregarVenda = async () => {

    try {

      const response = await fetch(
        `http://localhost:5000/vendas/reimprimir/${id}`
      );

      const data = await response.json();

      setItens(data);

      setTimeout(() => {

        window.print();

      }, 500);

    } catch {

      alert("Erro ao carregar venda");

    } finally {

      setLoading(false);

    }
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  if (itens.length === 0) {
    return <div>Venda não encontrada</div>;
  }

  const venda = itens[0];

  return (

    <div className="print-area">

      <h1>BC Bistro</h1>

      <p>
        Pedido #{venda.id}
      </p>

      <p>
        {new Date(venda.horaVenda).toLocaleString()}
      </p>

      <hr />

      {itens.map((item, index) => (

        <div key={index}>

          <strong>
            {item.quantidade}x {item.produto}
          </strong>

          <div>
            R$ {item.valorCalculado.toFixed(2)}
          </div>

        </div>

      ))}

      <hr />

      <h2>
        Total: R$ {venda.total.toFixed(2)}
      </h2>

    </div>

  );
}