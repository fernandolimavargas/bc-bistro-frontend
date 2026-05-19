type Item = {
  nome: string;
  quantidade: number;
  valor: number;
};

type Props = {
  numero: number;
  itens: Item[];
  total: number;
};

export function PedidoPrint({
  numero,
  itens,
  total,
}: Props) {

  return (
    <div className="print-area">

      <h1>BC Bistro</h1>

      <p>Pedido #{numero}</p>

      <hr />

      {itens.map((item, index) => (

        <div key={index}>

          <strong>
            {item.quantidade}x {item.nome}
          </strong>

          <div>
            R$ {item.valor.toFixed(2)}
          </div>

        </div>

      ))}

      <hr />

      <h2>
        Total: R$ {total.toFixed(2)}
      </h2>

    </div>
  );
}