import {
  HubConnectionBuilder,
  HubConnection,
  LogLevel,
  HttpTransportType,
  HubConnectionState,
} from "@microsoft/signalr";

const connection: HubConnection = new HubConnectionBuilder()
  .withUrl("https://bc-bistro-backend-production.up.railway.app/estoqueHub", {
    transport: HttpTransportType.WebSockets,
  })
  .withAutomaticReconnect()
  .configureLogging(LogLevel.Information)
  .build();

export async function conectarEstoque() {
  if (connection.state === HubConnectionState.Disconnected) {
    try {
      await connection.start();

      console.log("✅ Conectado ao EstoqueHub");
    } catch (error) {
      console.error(
        "❌ Erro ao conectar ao EstoqueHub:",
        error
      );
    }
  }
}

export function desconectarEstoque() {
  if (
    connection.state === HubConnectionState.Connected ||
    connection.state === HubConnectionState.Reconnecting
  ) {
    connection.stop();
  }
}

// =====================================================
// ATUALIZAÇÃO DE ESTOQUE
// =====================================================

export type AtualizacaoEstoque = {
  idProduto: number;
  quantidadeStock: number;
  disponivel: boolean;
};

export function ouvirEstoqueAtualizado(
  callback: (estoque: AtualizacaoEstoque) => void
) {
  connection.on("EstoqueAtualizado", callback);

  // Retorna função para remover o listener
  return () => {
    connection.off("EstoqueAtualizado", callback);
  };
}

// =====================================================
// TESTE DO SIGNALR
// =====================================================

export function ouvirMensagemEstoque(
  callback: (mensagem: string) => void
) {
  connection.on("MensagemEstoque", callback);
}

export async function testarConexao(mensagem: string) {
  await connection.invoke("TestarConexao", mensagem);
}