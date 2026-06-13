type Item = {
  nome: string;
  quantidade: number;
  valor: number;
};

type Props = {
  numero: number;
  itens: Item[];
  total: number;
  observacao: string;
};

export function PedidoPrint({
  numero,
  itens,
  observacao,
}: Props) {

  return (
    <div
      className="mx-auto w-[280px] bg-white p-4 text-black"
      style={{
        fontFamily: "Arial, sans-serif",
      }}
    >

      <div className="text-center">

        <h1
          style={{
            fontSize: "28px",
            fontWeight: "bold",
            marginBottom: "8px",
          }}
        >
          BC BISTRO
        </h1>

        <div
          style={{
            borderTop: "2px dashed black",
            margin: "10px 0",
          }}
        />

        <h2
          style={{
            fontSize: "24px",
            fontWeight: "bold",
            marginBottom: "10px",
          }}
        >
          PEDIDO #{numero}
        </h2>

      </div>

      <div
        style={{
          borderTop: "2px dashed black",
          margin: "10px 0 20px 0",
        }}
      />

      <div>

        {itens.map((item, index) => (

          <div
            key={index}
            style={{
              marginBottom: "16px",
            }}
          >

            <div
              style={{
                fontSize: "24px",
                fontWeight: "bold",
                wordBreak: "break-word",
              }}
            >
              {item.quantidade}x {item.nome}
            </div>

          </div>

        ))}

      </div>

      {observacao && (
        <>
          <div
            style={{
              borderTop: "2px dashed black",
              marginTop: "10px",
              paddingTop: "10px",
            }}
          >
            <div
              style={{
                fontSize: "20px",
                fontWeight: "bold",
                textAlign: "center",
                marginBottom: "8px",
              }}
            >
              ⚠️ OBSERVAÇÕES
            </div>

            <div
              style={{
                fontSize: "16px",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              {observacao}
            </div>
          </div>
        </>
      )}

      <div
        style={{
          borderTop: "2px dashed black",
          marginTop: "20px",
          paddingTop: "10px",
          textAlign: "center",
          fontSize: "12px",
        }}
      >
        {new Date().toLocaleString("pt-BR")}
      </div>

    </div>
  );
}