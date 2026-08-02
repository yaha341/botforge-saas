import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";

export default function Billing() {
  const { isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();
  const { data: bots } = trpc.bots.list.useQuery(undefined, { enabled: isAuthenticated });
  const { data: subscriptions } = trpc.billing.listSubscriptions.useQuery(undefined, { enabled: isAuthenticated });
  const createCheckout = trpc.billing.createCheckout.useMutation({
    onSuccess: (data: any) => { if (data.paymentUrl) window.location.href = data.paymentUrl; },
    onError: (e: any) => toast.error(e.message),
  });
  const [selectedBot, setSelectedBot] = useState("");

  if (loading || !isAuthenticated) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      {!loading && <Button className="btn-frog" onClick={() => startLogin()}>Войти</Button>}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-10">
          <p className="text-accent text-xs uppercase tracking-[0.2em] mb-2">Оплата</p>
          <h1 className="font-display font-700 text-4xl text-foreground">Подписка</h1>
          <span className="green-line mt-4 block" />
        </div>

        {/* Bot selector */}
        <div className="card-frog p-6 mb-8">
          <h2 className="font-display font-600 text-lg text-foreground mb-3">Выберите бота</h2>
          <select value={selectedBot} onChange={e => setSelectedBot(e.target.value)} className="w-full md:w-auto bg-secondary border border-border text-foreground px-4 py-3 rounded-lg font-sans text-sm focus:border-accent focus:outline-none transition-colors">
            <option value="">Выберите бота...</option>
            {(bots ?? []).map((b: any) => <option key={b.id} value={b.id}>{b.botName}</option>)}
          </select>
        </div>

        {/* Trading Plan */}
        <div className="card-frog-active p-8 glow-green mb-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <span className="inline-block text-xs uppercase tracking-[0.2em] text-accent bg-accent/10 px-3 py-1 rounded-full mb-3">
                Trading Plan
              </span>
              <h3 className="font-display font-700 text-2xl text-foreground mb-1">Полная функциональность</h3>
              <p className="text-muted-foreground text-sm mb-4">Все модули включены. Гибкий выбор конфигурации.</p>
              <div className="flex items-baseline gap-1">
                <span className="text-accent text-3xl font-display font-700">49 000</span>
                <span className="text-muted-foreground">₸/год</span>
              </div>
            </div>
            <Button className="btn-frog btn-frog-filled px-8 py-3 glow-green" disabled={!selectedBot || createCheckout.isPending}
              onClick={() => { if (!selectedBot) { toast.error("Выберите бота"); return; } createCheckout.mutate({ botId: Number(selectedBot), plan: "trading" }); }}>
              {createCheckout.isPending ? "Обработка..." : "Оплатить"}
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-6 pt-6 border-t border-border">
            {["Магазин", "Курсы", "Рассылки", "Instagram", "AI Ассистент", "Рефералы", "Купоны", "Мультивалюта", "CRM"].map(m => (
              <div key={m} className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="text-accent">✓</span> {m}
              </div>
            ))}
          </div>
        </div>

        {/* Active subscriptions */}
        {(subscriptions ?? []).length > 0 && (
          <div>
            <h2 className="font-display font-600 text-xl text-foreground mb-4">Активные подписки</h2>
            <span className="green-line mb-6 block" />
            <div className="space-y-3">
              {(subscriptions ?? []).map((sub: any) => (
                <div key={sub.id} className="card-frog p-4 flex items-center justify-between">
                  <div>
                    <span className="font-display font-600 text-accent mr-3">Trading</span>
                    <span className="text-muted-foreground text-sm">Бот #{sub.botId}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-muted-foreground">До: {sub.expiresAt ? new Date(sub.expiresAt).toLocaleDateString("ru") : "—"}</span>
                    <span className={`text-xs px-3 py-1 rounded-full border ${sub.status === "active" ? "border-accent text-accent bg-accent/10" : "border-border text-muted-foreground"}`}>{sub.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Back */}
        <div className="mt-12 text-center">
          <button className="text-muted-foreground text-sm hover:text-accent transition-colors flex items-center gap-2 mx-auto" onClick={() => navigate("/dashboard")}>
            ← Назад в дашборд
          </button>
        </div>
      </div>
    </div>
  );
}
