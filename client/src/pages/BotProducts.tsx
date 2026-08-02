import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useParams, useLocation } from "wouter";
import { toast } from "sonner";

export default function BotProducts() {
  const { botId } = useParams<{ botId: string }>();
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const utils = trpc.useUtils();
  const bid = Number(botId);
  const { data: products } = trpc.products.list.useQuery({ botId: bid }, { enabled: isAuthenticated });
  const { data: categories } = trpc.categories.list.useQuery({ botId: bid }, { enabled: isAuthenticated });
  const createProduct = trpc.products.create.useMutation({ onSuccess: () => { utils.products.list.invalidate(); toast.success("Product created"); } });
  const deleteProduct = trpc.products.delete.useMutation({ onSuccess: () => { utils.products.list.invalidate(); toast.success("Deleted"); } });
  const [form, setForm] = useState({ name: "", price: "", categoryId: "" });

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <button onClick={() => navigate(`/bots/${botId}`)} className="text-muted-foreground font-condensed uppercase text-xs tracking-widest mb-4 hover:text-foreground transition-colors block">← Back</button>
        <h1 className="text-5xl font-condensed font-black uppercase text-foreground mb-2">Products</h1>
        <span className="red-line mb-8 block" />
        {/* Add form */}
        <div className="border border-border p-6 mb-8">
          <h2 className="text-xl font-condensed font-black uppercase text-foreground mb-4">Add Product</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input placeholder="Product name" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="bg-secondary border-border text-foreground" />
            <Input placeholder="Price (KZT)" type="number" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} className="bg-secondary border-border text-foreground" />
            <select value={form.categoryId} onChange={e => setForm(p => ({ ...p, categoryId: e.target.value }))} className="bg-secondary border border-border text-foreground px-3 font-condensed uppercase text-sm">
              <option value="">No Category</option>
              {(categories ?? []).map((c: any) => <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>)}
            </select>
          </div>
          <Button className="btn-brutal-red mt-4" onClick={() => {
            if (!form.name || !form.price) return;
            createProduct.mutate({ botId: bid, name: form.name, price: form.price, categoryId: form.categoryId ? Number(form.categoryId) : undefined });
            setForm({ name: "", price: "", categoryId: "" });
          }}>Add Product</Button>
        </div>
        {/* List */}
        <div className="border border-border">
          <div className="grid grid-cols-4 gap-4 p-4 border-b border-border bg-secondary">
            {["Name", "Category", "Price", "Actions"].map(h => <div key={h} className="text-xs font-condensed uppercase text-muted-foreground">{h}</div>)}
          </div>
          {(products ?? []).length === 0 ? (
            <div className="p-8 text-center text-muted-foreground font-condensed uppercase">No products yet</div>
          ) : (products ?? []).map((p: any) => (
            <div key={p.id} className="grid grid-cols-4 gap-4 p-4 border-b border-border items-center">
              <div className="font-condensed uppercase text-foreground text-sm">{p.name}</div>
              <div className="text-muted-foreground text-sm font-condensed">{(categories ?? []).find((c: any) => c.id === p.categoryId)?.name ?? "—"}</div>
              <div className="font-condensed text-foreground text-sm">{p.price} KZT</div>
              <Button size="sm" variant="destructive" className="btn-brutal w-fit" onClick={() => deleteProduct.mutate({ productId: p.id, botId: bid })}>Delete</Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
