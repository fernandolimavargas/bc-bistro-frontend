// Simple client-side data store using localStorage.
// Replace these functions with real API calls when backend is ready.

import { api } from "../services/api";
import { getCurrentUser } from "./bistro-auth";

export type Categoria = "Almoços" | "Hambúrgueres" | "Bebidas" | "Outros";

export interface Produto {
  id: number;
  produto: string;
  preco: number;
  idCategoria: number;
  categoria: string;
  ativo: boolean
}

export interface ItemVenda {
  produtoId: number;
  produto: string;
  valorUnidade: number; 
  valorCalculado: number;
  valorTotal: number;
  quantidade: number;
}

export interface Venda {
  id: number;
  horaVenda: string; 
  produtos: ItemVenda[];
  total: number;
}

export interface Catalogo { 
    id: number;
    produto: string;
    preco: number;
    idCategoria: number;
    categoria: string;
    ativo: boolean;
}

export interface VendasHistoricos {
  id: number;
  horaVenda: string;
  totalVenda: number;
  totalDoDia: number;
  produtosVendidos: ProdutosVendidos[];
}

export interface ProdutosVendidos {
  produto: string;
  categoria: string;
  valorUnidade: number;
  quantidade: number;
  valorCalculado: number;
}


/*export function getProdutos(): Produto[] {
  if (!isBrowser()) return produtosIniciais;
  const raw = localStorage.getItem(PRODUTOS_KEY);
  if (!raw) {
    localStorage.setItem(PRODUTOS_KEY, JSON.stringify(produtosIniciais));
    return produtosIniciais;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return produtosIniciais;
  }
} */

export async function getProdutos(): Promise<Produto[]> { 
  const response = await api.get("/produto/buscar_produtos")

  return response.data;
}


/*export function addProduto(p: Omit<Produto, "id">): Produto {
  const novo = { ...p, id: uid() };
  const all = [...getProdutos(), novo];
  saveProdutos(all);
  return novo;
} */

export async function addProduto(produto: Omit<Produto, "id">) { 
  const response = await api.post("/produto/adicionar_produto", produto); 
  return response.data; 
} 

/*export function updateProduto(id: string, patch: Partial<Omit<Produto, "id">>) {
  const all = getProdutos().map((p) => (p.id === id ? { ...p, ...patch } : p));
  saveProdutos(all);
}*/

export async function updateProduto(produto: Produto) { 
  const response = await api.post("/produto/alterar_produto", produto); 
  return response.data; 
}

/*xport function getVendas(): Venda[] {
  if (!isBrowser()) return [];
  const raw = localStorage.getItem(VENDAS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
} */

/*export function addVenda(itens: ItemVenda[]): Venda {
  const total = itens.reduce((s, i) => s + i.preco * i.quantidade, 0);
  const venda: Venda = { id: uid(), data: new Date().toISOString(), itens, total };
  const all = [venda, ...getVendas()];
  localStorage.setItem(VENDAS_KEY, JSON.stringify(all));
  return venda;
}*/

export async function addVenda(
  itens: ItemVenda[],
  observacao: string
) {

  const usuario = getCurrentUser();

  if (!usuario) {
    throw new Error("Usuário não autenticado");
  }

  const total = itens.reduce(
    (s, i) => s + i.valorCalculado,
    0
  );

  const venda = {
    idUsuario: usuario.id,
    horaVenda: new Date().toISOString(),
    total,

    produtos: itens.map((i) => ({
      produto: i.produto,
      quantidade: i.quantidade,
      valorUnidade: i.valorUnidade,
      valorCalculado: i.valorCalculado,
      valorTotal: i.valorTotal,
    })),
    observacao: observacao
  };

  const response = await api.post(
    "/venda/finalizar_venda",
    venda
  );

  return response.data;
}

export async function mostrarCatalogo(filtro: number): Promise<Catalogo[]> { 
  const response = await api.get(`/catalogo/mostrar_catalogo/${filtro}`); 

  return response.data
}

export async function buscarVendas(
  dataInicial: string,
  dataFinal: string
): Promise<VendasHistoricos[]> {

  const response = await api.get(
    "/venda/buscar_vendas",
    {
      params: {
        dataInicial: new Date(dataInicial).toISOString(),
        dataFinal: new Date(dataFinal).toISOString(),
      },
    }
  );

  return response.data;
}

export async function ativarInativarProduto(idProduto: number, ativo: boolean) { 
  const response = await api.post(`/produto/ativar_inativar?idProduto=${idProduto}&ativo=${ativo}`)
  return response.data;
}


export const formatBRL = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
