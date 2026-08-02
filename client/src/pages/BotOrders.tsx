import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useParams, useLocation } from "wouter";

export default function BotOrders() {
  const { botId } = useParams<{ botId: string }>();
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const { data: orders } = trpc.orders.list.useQuery({ botId: Number(botId) }, { enabled: isAuthenticated });

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <button onClick={() => navigate(`/bots/${botId}`)} className="text-muted-foreground font-condensed uppercase text-xs tracking-widest mb-4 hover:text-foreground transition-colors block">← Back</button>
        <h1 className="text-5xl font-condensed font-black uppercase text-foreground mb-2">Orders</h1>
        <span className="red-line mb-8 block" />
        <div className="border border-border">
          <div className="grid grid-cols-5 gap-4 p-4 border-b border-border bg-secondary">
            {["ID", "Telegram ID", "Amount", "Status", "Date"].map(h => <div key={h} className="text-xs font-condensed uppercase text-muted-foreground">{h}</div>)}
          </div>
          {(orders ?? []).length === 0 ? (
            <div className="p-8 text-center text-muted-foreground font-condensed uppercase">No orders yet</div>
          ) : (orders ?? []).map((o: any) => (
            <div key={o.id} className="grid grid-cols-5 gap-4 p-4 border-b border-border items-center">
              <div className="font-condensed text-foreground text-sm">#{o.id}</div>
              <div className="font-mono text-muted-foreground text-sm">{o.telegramId ?? "—"}</div>
              <div className="font-condensed text-foreground text-sm">{o.totalAmount} {o.currency}</div>
              <span className={`text-xs font-condensed uppercase px-2 py-0.5 border w-fit ${o.status === "completed" ? "border-accent text-accent" : o.status === "cancelled" ? "border-destructive text-destructive" : "border-border text-muted-foreground"}`}>{o.status}</span>
              <div className="text-muted-foreground text-xs font-condensed">{new Date(o.createdAt).toLocaleDateString()}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
