import { Link } from "@tanstack/react-router";

export function BistroHeader() {
  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-foreground text-[color:var(--gold)] font-display text-xl font-bold">
            BC
          </div>
          <div className="leading-tight">
            <div className="font-display text-xl font-bold">BC Bistro</div>
            <div className="text-xs text-muted-foreground tracking-widest uppercase">
              Bistrô da Igreja
            </div>
          </div>
        </Link>
        <nav className="flex items-center gap-1 text-sm font-medium">
          <Link
            to="/"
            activeOptions={{ exact: true }}
            className="rounded-md px-3 py-2 hover:bg-secondary"
            activeProps={{ className: "rounded-md px-3 py-2 bg-secondary text-foreground" }}
          >
            Loja
          </Link>
          <Link
            to="/admin"
            className="rounded-md px-3 py-2 hover:bg-secondary"
            activeProps={{ className: "rounded-md px-3 py-2 bg-secondary text-foreground" }}
          >
            Produtos
          </Link>
          <Link
            to="/vendas"
            className="rounded-md px-3 py-2 hover:bg-secondary"
            activeProps={{ className: "rounded-md px-3 py-2 bg-secondary text-foreground" }}
          >
            Vendas
          </Link>
        </nav>
      </div>
    </header>
  );
}
