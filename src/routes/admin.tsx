import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { BistroHeader } from "../components/BistroHeader";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  addProduto,
  ativarInativarProduto,
  formatBRL,
  getProdutos,
  updateProduto,
  type Categoria,
  type Produto,
} from "../lib/bistro-store";
import { Pencil, Trash2, Save, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { Switch } from "../components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "Produtos — BC Bistro" }],
  }),
  component: Admin,
});

const CATEGORIAS: Categoria[] = ["Almoços", "Hambúrgueres", "Bebidas", "Outros"];

function Admin() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [nome, setNome] = useState("");
  const [preco, setPreco] = useState("");
  const [categoria, setCategoria] = useState<Categoria>("Almoços");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState<Partial<Produto>>({});
  const [openConfirmacao, setOpenConfirmacao] = useState(false);
  const [produtoSelecionado, setProdutoSelecionado] = useState<Produto | null>(null);

  const categoriaIdMap: Record<Categoria, number> = {
    "Almoços": 1,
    "Hambúrgueres": 2,
    "Bebidas": 3,
    "Outros": 4,
  };

  useEffect(() =>  { 
    loadProdutos();
  }, [])

  const loadProdutos = async () => {
    try { 
      const dados = await getProdutos(); 
      setProdutos(dados); 
    } catch { 
      toast.error("Erro ao carregar produtos");
    }
  }

  const criar = async (e:React.FormEvent) => { 
    e.preventDefault(); 
    const p = parseFloat(preco.replace(",",".")); 

    if(!nome.trim() || !Number.isFinite(p) || p <= 0) { 
      toast.error("preencha nome e preço válidos");
      return; 
    }
    try { 
      await addProduto({
        produto: nome.trim(),
        preco: p,
        categoria,
        idCategoria: categoriaIdMap[categoria],
        ativo: true
      });

        setNome(""); 
        setPreco("");

        await loadProdutos(); 
        toast.success("Produto Cadastrado");
    } catch { 
      toast.error("Erro ao cadastrar produto"); 
    }
    
  }

  const startEdit = (p: Produto) => {
    setEditingId(p.id);
    setEditDraft({ produto: p.produto, preco: p.preco, categoria: p.categoria, ativo: p.ativo });
  };

const saveEdit = async (id: number) => {
    try {
        await updateProduto({
            id,
            produto: editDraft.produto ?? "",
            preco: editDraft.preco ?? 0,
            categoria: editDraft.categoria ?? "",
            idCategoria: categoriaIdMap[editDraft.categoria as Categoria],
            ativo: editDraft.ativo ?? true
        });

        setEditingId(null);
        setEditDraft({});

        await loadProdutos();

        toast.success("Produto atualizado");
    } catch {
        toast.error("Erro ao atualizar produto");
    }
};

const AtivarInativarProduto = async (id: number, ativo : boolean) => {
  try { 
      await ativarInativarProduto(id, ativo);
    await loadProdutos();
    toast.success("Produto atualizado");
  } catch { 
    toast.error("Erro ao mudar status")
  }
}

const confirmarInativacao = async () => {
  if (!produtoSelecionado) return;

  try {
    await ativarInativarProduto(
      produtoSelecionado.id,
      false
    );

    await loadProdutos();

    toast.success("Produto inativado");

    setOpenConfirmacao(false);
    setProdutoSelecionado(null);
  } catch {
    toast.error("Erro ao inativar produto");
  }
};

  return (
    <div className="min-h-screen bg-background">
      <BistroHeader />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="mb-6 font-display text-4xl font-bold">Produtos</h1>

        <Card className="mb-8 p-6">
          <h2 className="mb-4 font-display text-xl">Cadastrar novo produto</h2>
          <form onSubmit={criar} className="grid gap-4 md:grid-cols-[2fr_1fr_1fr_auto] md:items-end">
            <div>
              <Label htmlFor="nome">Nome</Label>
              <Input id="nome" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex.: Suco de laranja" />
            </div>
            <div>
              <Label htmlFor="preco">Preço (R$)</Label>
              <Input id="preco" inputMode="decimal" value={preco} onChange={(e) => setPreco(e.target.value)} placeholder="0,00" />
            </div>
            <div>
              <Label>Categoria</Label>
              <Select value={categoria} onValueChange={(v) => setCategoria(v as Categoria)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIAS.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="bg-[color:var(--gold)] text-foreground hover:bg-[color:var(--gold)]/90">
              <Plus className="mr-1 h-4 w-4" /> Adicionar
            </Button>
          </form>
        </Card>

        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary text-left">
                <tr>
                  <th className="px-4 py-3 font-semibold">Nome</th>
                  <th className="px-4 py-3 font-semibold">Categoria</th>
                  <th className="px-4 py-3 font-semibold">Preço</th>
                  <th className="px-4 py-3 font-semibold">Disponível</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {produtos.map((p) => {
                  const editing = editingId === p.id;
                  return (
                    <tr key={p.id}>
                      <td className="px-4 py-3">
                        {editing ? (
                          <Input value={editDraft.produto ?? ""} onChange={(e) => setEditDraft((d) => ({ ...d, produto: e.target.value }))} />
                        ) : (
                          p.produto
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {editing ? (
                          <Select value={editDraft.categoria} onValueChange={(v) => setEditDraft((d) => ({ ...d, categoria: v as Categoria }))}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {CATEGORIAS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        ) : (
                          <span className="text-[color:var(--gold)]">{p.categoria}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-semibold">
                        {editing ? (
                          <Input
                            inputMode="decimal"
                            value={editDraft.preco ?? ""}
                            onChange={(e) => setEditDraft((d) => ({ ...d, preco: parseFloat(e.target.value.replace(",", ".")) || 0 }))}
                          />
                        ) : (
                          formatBRL(p.preco)
                        )}
                      </td>
                      <td className="px-4 py-3 font-semibold">
                        <Switch
                          checked={p.ativo}
                          onCheckedChange={async (checked) => {

                            if (!checked) {
                              setProdutoSelecionado(p);
                              setOpenConfirmacao(true);
                              return;
                            }

                            try {
                              await ativarInativarProduto(
                                p.id,
                                true
                              );

                              await loadProdutos();

                              toast.success("Produto ativado");
                            } catch {
                              toast.error("Erro ao ativar produto");
                            }
                          }}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          {editing ? (
                            <>
                              <Button size="sm" onClick={() => saveEdit(p.id)}><Save className="h-4 w-4" /></Button>
                              <Button size="sm" variant="outline" onClick={() => setEditingId(null)}><X className="h-4 w-4" /></Button>
                            </>
                          ) : (
                            <>
                              <Button size="sm" variant="outline" onClick={() => startEdit(p)}><Pencil className="h-4 w-4" /></Button>
                              <Button size="sm" variant="outline" /*onClick={() => remove(p.id)}*/ className="text-destructive hover:text-destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </main>
      <AlertDialog
        open={openConfirmacao}
        onOpenChange={setOpenConfirmacao}
      >
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>
              Deseja inativar este produto?
            </AlertDialogTitle>

            <AlertDialogDescription>
              O produto deixará de aparecer no cardápio.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>
              Cancelar
            </AlertDialogCancel>

            <AlertDialogAction
              onClick={confirmarInativacao}
              className="bg-red-500 hover:bg-red-600"
            >
              Inativar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
